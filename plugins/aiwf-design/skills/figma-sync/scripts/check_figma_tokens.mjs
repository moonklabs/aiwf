#!/usr/bin/env node
// Figma snapshot ↔ code token check. Declared values only; not a render or pixel check.
//
// Inputs (paths from the design-spec config `tokens` section, schema in the plugin README):
//   snapshot    Figma readback JSON (figma-readback.plugin.js, merged by merge_readback.mjs)
//   map         figma-token-map.json: each Figma name → a DTCG token, a typography utility,
//               a spacing step, a framework utility, or a skip reason
//   dtcg        design tokens in the DTCG format; `{group.token}` aliases are resolved
//   typography  CSS with flat `@utility <name> { ... }` or `.<name> { ... }` blocks
//
// Fails when a Figma item is unmapped, a mapping points at nothing, or a mapped value differs.
// Usage: node check_figma_tokens.mjs [--root <repo>] [--config <file>] [--self-test]
// Exit 0 all match, 1 mismatches, 2 usage, config or unreadable input.
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, resolve } from 'node:path'

const CONFIG_FILE = 'design-spec.config.json'
const DEFAULT_CONFIG = `docs/design-spec/${CONFIG_FILE}`
const COLOR_TOLERANCE = 0.5 / 255
const NUMBER_TOLERANCE = 1e-3
const STOP_TOLERANCE = 0.002
const WEIGHTS = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900 }
const SECTIONS = ['variables', 'textStyles', 'effectStyles', 'paintStyles']

export class InputError extends Error {}

// ---------- config ----------
const isRelativePath = (p) => typeof p === 'string' && p.length > 0 && !isAbsolute(p) && !p.split(/[\\/]/).includes('..')

export function tokenSettings(raw, source) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InputError(`${source}: the config must be a JSON object`)
  if (raw.version !== 1) throw new InputError(`${source}: "version" must be 1 (got ${JSON.stringify(raw.version)})`)
  const tokens = raw.tokens ?? {}
  const settings = {
    fileKey: raw.figma?.fileKey ?? '',
    snapshot: tokens.snapshot ?? 'design-system/figma-readback.json',
    map: tokens.map ?? 'design-system/figma-token-map.json',
    dtcg: tokens.dtcg ?? 'design-system/tokens.json',
    typography: tokens.typography ?? null,
    rootGroup: tokens.dtcgRootGroup ?? '',
    remPx: tokens.remPx ?? 16,
  }
  const errors = []
  for (const key of ['snapshot', 'map', 'dtcg']) if (!isRelativePath(settings[key])) errors.push(`tokens.${key} must be a repository-relative path without ".."`)
  if (settings.typography !== null && !isRelativePath(settings.typography)) errors.push('tokens.typography must be null or a repository-relative path without ".."')
  if (typeof settings.rootGroup !== 'string') errors.push('tokens.dtcgRootGroup must be a string')
  if (typeof settings.remPx !== 'number' || !(settings.remPx > 0)) errors.push('tokens.remPx must be a positive number')
  if (typeof settings.fileKey !== 'string') errors.push('figma.fileKey must be a string')
  if (errors.length) throw new InputError(`${source}: ${errors.join('; ')}`)
  return settings
}

function readJson(path, label) {
  if (!existsSync(path)) throw new InputError(`${label} not found: ${path}`)
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch (e) { throw new InputError(`${label} ${path} is not valid JSON (${e.message})`) }
}

export function loadInputs(root, configPath) {
  const file = configPath ? resolve(configPath) : join(root, DEFAULT_CONFIG)
  if (!existsSync(file)) throw new InputError(`design-spec config not found: ${file}. Create it from the aiwf-design workflow skill's references/templates/${CONFIG_FILE} (schema in the plugin README), or pass --config <file>.`)
  const settings = tokenSettings(readJson(file, 'config'), file)
  const typographyPath = settings.typography && join(root, settings.typography)
  if (typographyPath && !existsSync(typographyPath)) throw new InputError(`typography source not found: ${typographyPath}`)
  return {
    settings,
    snapshot: readJson(join(root, settings.snapshot), 'snapshot'),
    map: readJson(join(root, settings.map), 'token map'),
    dtcg: readJson(join(root, settings.dtcg), 'DTCG tokens'),
    typographyCss: typographyPath ? readFileSync(typographyPath, 'utf8') : null,
  }
}

// ---------- DTCG tokens ----------
class TokenError extends Error {}
const ALIAS = /^\{([^{}]+)\}$/

function collectTokens(doc) {
  const tokens = new Map()
  const visit = (node, path, inheritedType) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return
    const type = typeof node.$type === 'string' ? node.$type : inheritedType
    if ('$value' in node) { tokens.set(path.join('.'), { type, value: node.$value }); return }
    for (const [key, child] of Object.entries(node)) if (!key.startsWith('$')) visit(child, [...path, key], type)
  }
  visit(doc, [], undefined)
  return tokens
}

// Resolves `{path}` aliases anywhere in a token value, with cycle and dangling-target errors.
function tokenResolver(tokens) {
  const cache = new Map()
  const resolvePath = (path, chain) => {
    if (chain.includes(path)) throw new TokenError(`Circular alias: ${[...chain, path].join(' -> ')}`)
    if (cache.has(path)) return cache.get(path)
    const token = tokens.get(path)
    if (!token) throw new TokenError(`Missing alias target {${path}}${chain.length ? ` (from ${chain.at(-1)})` : ''}`)
    const next = [...chain, path]
    const deep = (value) => {
      if (typeof value === 'string') { const m = ALIAS.exec(value); return m ? resolvePath(m[1], next).value : value }
      if (Array.isArray(value)) return value.map(deep)
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deep(v)]))
      return value
    }
    const direct = typeof token.value === 'string' && ALIAS.exec(token.value)
    const type = token.type ?? (direct ? resolvePath(direct[1], next).type : undefined)
    const result = { type, value: deep(token.value) }
    cache.set(path, result)
    return result
  }
  return (path) => resolvePath(path, [])
}

export function tokenIndex(doc, rootGroup = '') {
  const tokens = collectTokens(doc)
  const resolveToken = tokenResolver(tokens)
  const byCss = new Map()
  for (const path of tokens.keys()) {
    const local = rootGroup && path.startsWith(`${rootGroup}.`) ? path.slice(rootGroup.length + 1) : path
    byCss.set(`--${local.split('.').join('-')}`, path)
  }
  // A reference is a DTCG path (`color.surface.card`) or a CSS custom property (`--surface-card`).
  return (ref) => {
    const path = typeof ref === 'string' && ref.startsWith('--') ? byCss.get(ref) : ref
    if (!path || !tokens.has(path)) return undefined
    return { path, ...resolveToken(path) }
  }
}

// ---------- value normalization ----------
function hexColor(text) {
  if (!/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(text)) throw new TokenError(`unsupported color ${text}; use hex or an sRGB DTCG color`)
  let hex = text.slice(1)
  if (hex.length < 5) hex = [...hex].map((d) => d + d).join('')
  const [r, g, b, a = 1] = hex.match(/../g).map((pair) => parseInt(pair, 16) / 255)
  return { r, g, b, a }
}

function toColor(value) {
  if (typeof value === 'string') return hexColor(value)
  if (value && typeof value === 'object') {
    if ((value.colorSpace ?? 'srgb') === 'srgb' && Array.isArray(value.components)) {
      const [r, g, b] = value.components.map((c) => (c === 'none' ? 0 : Number(c)))
      return { r, g, b, a: value.alpha ?? 1 }
    }
    if (typeof value.hex === 'string') return hexColor(value.hex)
  }
  throw new TokenError(`unsupported color value ${JSON.stringify(value)}`)
}

function toPx(value, remPx) {
  if (typeof value === 'number') return value
  const parsed = typeof value === 'string' ? /^(-?\d*\.?\d+)(px|rem)?$/.exec(value.trim()) : null
  const amount = parsed ? Number(parsed[1]) : value?.value
  const unit = parsed ? parsed[2] ?? 'px' : value?.unit
  if (typeof amount !== 'number' || Number.isNaN(amount) || !['px', 'rem'].includes(unit)) throw new TokenError(`unsupported dimension ${JSON.stringify(value)}`)
  return unit === 'rem' ? amount * remPx : amount
}

const shadowLayers = (value) => (Array.isArray(value) ? value : [value])
const gradientStops = (value) => (Array.isArray(value) ? value : value?.stops ?? [])
const close = (a, b, tolerance) => Math.abs(a - b) <= tolerance
const sameColor = (a, b) => ['r', 'g', 'b', 'a'].every((k) => close(a[k], b[k], COLOR_TOLERANCE))

// ---------- typography source ----------
export function parseTypography(css) {
  const utilities = new Map()
  const source = (css ?? '').replace(/\/\*[\s\S]*?\*\//g, '')
  for (const m of source.matchAll(/(?:@utility\s+([\w-]+)|\.([\w-]+))\s*\{([^{}]*)\}/g)) {
    const decls = Object.fromEntries(m[3].split(';').map((d) => d.split(':')).filter((p) => p.length >= 2)
      .map(([prop, ...rest]) => [prop.trim(), rest.join(':').trim()]))
    utilities.set(m[1] ?? m[2], decls)
  }
  return utilities
}

const familyName = (name) => String(name).trim().replace(/^["']|["']$/g, '').replace(/\s+Variable$/i, '').toLowerCase()

function primaryFamily(decl, token) {
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(decl ?? '')
  if (!ref) return (decl ?? '').split(',')[0]
  const entry = token(ref[1])
  if (!entry || entry.type !== 'fontFamily') throw new TokenError(`${ref[1]} is not a fontFamily token`)
  return (Array.isArray(entry.value) ? entry.value : String(entry.value).split(','))[0]
}

function cssLength(decl, token, remPx) {
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(decl ?? '')
  if (ref) {
    const entry = token(ref[1])
    if (!entry || entry.type !== 'dimension') throw new TokenError(`${ref[1]} is not a dimension token`)
    return toPx(entry.value, remPx)
  }
  if (/^-?0$/.test(decl ?? '')) return 0
  return toPx(decl ?? '', remPx)
}

// Figma line height / letter spacing in PIXELS or PERCENT against CSS px, rem, em, % or unitless.
function sameMetric(figma, decl, fontSize, token, remPx, unitlessIsRatio) {
  const text = (decl ?? '').trim()
  if (figma.unit === 'PERCENT') {
    const ratio = /%$/.test(text) ? Number(text.slice(0, -1)) / 100 : /em$/.test(text) && !/rem$/.test(text) ? Number(text.slice(0, -2))
      : unitlessIsRatio && /^-?\d*\.?\d+$/.test(text) ? Number(text) : cssLength(text, token, remPx) / fontSize
    return close(ratio, figma.value / 100, NUMBER_TOLERANCE)
  }
  const px = /em$/.test(text) && !/rem$/.test(text) ? Number(text.slice(0, -2)) * fontSize
    : unitlessIsRatio && /^-?\d*\.?\d+$/.test(text) && Number(text) !== 0 ? Number(text) * fontSize : cssLength(text, token, remPx)
  return close(px, figma.value, NUMBER_TOLERANCE)
}

// ---------- comparisons ----------
const ruleFor = (map, section, name, mode) => (mode && map[section]?.[`${name}@${mode}`]) || map[section]?.[name]
const tokenRef = (rule) => rule.token ?? rule.css

function checkRules(map, errors) {
  for (const section of SECTIONS) for (const [name, rule] of Object.entries(map[section] ?? {})) {
    if ('skip' in rule && (typeof rule.skip !== 'string' || !rule.skip.trim())) errors.push(`${section} ${name}: skip needs a reason`)
    else if (!['skip', 'token', 'css', 'utility', 'spacing'].some((k) => k in rule)) errors.push(`${section} ${name}: mapping has no token, css, utility, spacing or skip`)
  }
}

function checkCompleteness(snapshot, map, errors) {
  for (const section of SECTIONS) {
    const entries = snapshot[section] ?? []
    const names = new Set(entries.map((e) => e.n ?? e.name))
    const keyed = new Set(entries.filter((e) => e.m).map((e) => `${e.n}@${e.m}`))
    for (const e of entries) if (!ruleFor(map, section, e.n ?? e.name, e.m)) errors.push(`Unmapped Figma ${section}: ${e.n ?? e.name}${e.m ? ` (${e.m})` : ''}`)
    for (const key of Object.keys(map[section] ?? {})) if (!names.has(key) && !keyed.has(key)) errors.push(`Stale mapping (not in Figma snapshot) ${section}: ${key}`)
  }
}

function checkVariable(variable, rule, ctx) {
  const label = `${variable.n}${variable.m ? ` (${variable.m})` : ''}`
  if (rule.spacing !== undefined) {
    const base = ctx.token(ctx.map.spacingBase ?? '--spacing')
    if (!base || base.type !== 'dimension') return [`${label}: spacing base ${ctx.map.spacingBase ?? '--spacing'} is not a dimension token`]
    const step = toPx(base.value, ctx.remPx)
    ctx.counts.spacing++
    return close(step * rule.spacing, variable.v, NUMBER_TOLERANCE) ? [] : [`${label}: ${variable.v}px != ${rule.spacing} x ${ctx.map.spacingBase ?? '--spacing'} (${step}px)`]
  }
  const entry = ctx.token(tokenRef(rule))
  if (!entry) return [`${label}: mapped token ${tokenRef(rule)} does not exist`]
  ctx.counts.variables++
  if (typeof variable.v === 'string') return entry.type === 'color' && sameColor(hexColor(variable.v), toColor(entry.value)) ? [] : [`${label} ${variable.v} != ${tokenRef(rule)}`]
  if (entry.type === 'dimension') { const px = toPx(entry.value, ctx.remPx); return close(px, variable.v, NUMBER_TOLERANCE) ? [] : [`${label} ${variable.v}px != ${tokenRef(rule)} ${px}px`] }
  if (entry.type === 'number') return close(Number(entry.value), variable.v, NUMBER_TOLERANCE) ? [] : [`${label} ${variable.v} != ${tokenRef(rule)} ${entry.value}`]
  return [`${label}: unexpected token type ${entry.type} for ${tokenRef(rule)}`]
}

function checkTextStyle(style, rule, ctx) {
  const utility = String(rule.utility ?? '').replace(/^\./, '')
  const decls = ctx.typography.get(utility)
  if (!decls) return [`${style.name}: utility ${utility} missing in the typography source`]
  ctx.counts.textStyles++
  const problems = []
  const expectedFamily = ctx.map.fontFamilies?.[style.fontFamily] ?? style.fontFamily
  const family = primaryFamily(decls['font-family'], ctx.token)
  if (familyName(family) !== familyName(expectedFamily)) problems.push(`family ${family} != ${expectedFamily}`)
  const size = cssLength(decls['font-size'], ctx.token, ctx.remPx)
  if (!close(size, style.fontSize, NUMBER_TOLERANCE)) problems.push(`size ${decls['font-size']} != ${style.fontSize}px`)
  if (style.lineHeight && !sameMetric(style.lineHeight, decls['line-height'], style.fontSize, ctx.token, ctx.remPx, true)) problems.push(`line-height ${decls['line-height']} != ${style.lineHeight.value}${style.lineHeight.unit === 'PERCENT' ? '%' : 'px'}`)
  const weight = { ...WEIGHTS, ...(ctx.map.fontWeights ?? {}) }[style.fontStyle.replace(/\s*Italic$/i, '') || 'Regular']
  if (weight === undefined) problems.push(`unknown font style ${style.fontStyle}; add it to the map's fontWeights`)
  else if (Number(decls['font-weight']) !== weight) problems.push(`weight ${decls['font-weight']} != ${style.fontStyle}`)
  if (!sameMetric(style.letterSpacing, decls['letter-spacing'], style.fontSize, ctx.token, ctx.remPx, false)) problems.push(`letter-spacing ${decls['letter-spacing']} != ${style.letterSpacing.value}${style.letterSpacing.unit === 'PERCENT' ? '%' : 'px'}`)
  return problems.length ? [`${style.name} (${utility}): ${problems.join('; ')}`] : []
}

function checkEffect(style, rule, ctx) {
  const entry = ctx.token(tokenRef(rule))
  if (!entry || entry.type !== 'shadow') return [`${style.name}: shadow token ${tokenRef(rule)} missing`]
  ctx.counts.effects++
  const layers = shadowLayers(entry.value)
  if (layers.length !== style.effects.length) return [`${style.name}: ${style.effects.length} layers != ${layers.length}`]
  return style.effects.flatMap((effect, i) => {
    const layer = layers[i]
    const ok = Boolean(layer.inset) === (effect.type === 'INNER_SHADOW')
      && [['offsetX', 'offsetX'], ['offsetY', 'offsetY'], ['blur', 'blur'], ['spread', 'spread']].every(([css, fig]) => close(toPx(layer[css] ?? 0, ctx.remPx), effect[fig], NUMBER_TOLERANCE))
      && sameColor(hexColor(effect.color), toColor(layer.color))
    return ok ? [] : [`${style.name} layer ${i} != ${tokenRef(rule)}`]
  })
}

function checkPaint(style, rule, ctx) {
  const paint = style.paints[0]
  const entry = ctx.token(tokenRef(rule))
  ctx.counts.paints++
  if (paint?.type === 'SOLID') {
    if (!entry || entry.type !== 'color') return [`${style.name}: color token ${tokenRef(rule)} missing`]
    return sameColor(hexColor(paint.color), toColor(entry.value)) ? [] : [`${style.name} ${paint.color} != ${tokenRef(rule)}`]
  }
  if (!entry || entry.type !== 'gradient') return [`${style.name}: gradient token ${tokenRef(rule)} missing`]
  const stops = paint?.stops ?? []
  const css = gradientStops(entry.value)
  const ok = stops.length === css.length && stops.every((stop, i) => sameColor(hexColor(stop.color), toColor(css[i].color)) && close(stop.position, Number(css[i].position), STOP_TOLERANCE))
  return ok ? [] : [`${style.name}: gradient stops != ${tokenRef(rule)}`]
}

const CHECKS = { variables: checkVariable, textStyles: checkTextStyle, effectStyles: checkEffect, paintStyles: checkPaint }

export function compareTokens({ snapshot, map, dtcg, typographyCss, settings }) {
  const errors = []
  if (snapshot.fileKey !== map.fileKey) errors.push(`Snapshot file ${snapshot.fileKey} != map file ${map.fileKey}`)
  if (settings.fileKey && snapshot.fileKey !== settings.fileKey) errors.push(`Snapshot file ${snapshot.fileKey} != config figma.fileKey ${settings.fileKey}`)
  checkRules(map, errors)
  checkCompleteness(snapshot, map, errors)
  const counts = { variables: 0, spacing: 0, textStyles: 0, effects: 0, paints: 0 }
  const ctx = { map, counts, remPx: settings.remPx, token: tokenIndex(dtcg, settings.rootGroup), typography: parseTypography(typographyCss) }
  for (const section of SECTIONS) for (const item of snapshot[section] ?? []) {
    const rule = ruleFor(map, section, item.n ?? item.name, item.m)
    if (!rule || 'skip' in rule || (section !== 'textStyles' && rule.utility !== undefined)) continue
    try { errors.push(...CHECKS[section](item, rule, ctx)) } catch (e) {
      if (!(e instanceof TokenError)) throw e
      errors.push(`${item.n ?? item.name}: ${e.message}`)
    }
  }
  return { errors, counts, readAt: snapshot.readAt, fileKey: snapshot.fileKey }
}

// ---------- self-test: a matching fixture passes; each broken input reports its own error ----------
function fixture() {
  return {
    settings: { fileKey: 'FIXTUREKEY', rootGroup: '', remPx: 16 },
    snapshot: { schemaVersion: 1, fileKey: 'FIXTUREKEY', readAt: '2026-10-05T00:00:00.000Z',
      variables: [
        { c: '00 · Primitives', n: 'white', v: '#ffffffff' },
        { c: '01 · Color', n: 'surface/card', v: '#ffffffff', a: 'white' },
        { c: '01 · Color', n: 'text/primary', v: '#1f2937ff' },
        { c: '02 · Scale', n: 'radius/sm', v: 6 },
        { c: '02 · Scale', n: 'space/2', v: 8 },
        { c: '02 · Scale', n: 'opacity/disabled', v: 0.4 },
        { c: '02 · Scale', n: 'radius/pill', v: 9999 },
      ],
      textStyles: [
        { name: 'Text/Body', fontFamily: 'Pretendard', fontStyle: 'Regular', fontSize: 14, lineHeight: { unit: 'PIXELS', value: 22 }, letterSpacing: { unit: 'PIXELS', value: 0 } },
        { name: 'Text/Mono', fontFamily: 'JetBrains Mono', fontStyle: 'Medium', fontSize: 13, lineHeight: { unit: 'PERCENT', value: 150 }, letterSpacing: { unit: 'PERCENT', value: -1 } },
      ],
      effectStyles: [{ name: 'Effect/Card', effects: [{ type: 'DROP_SHADOW', offsetX: 0, offsetY: 4, blur: 6, spread: 0, color: '#3c425a1a' }] }],
      paintStyles: [
        { name: 'Surface/Sidebar Gradient', paints: [{ type: 'GRADIENT_LINEAR', stops: [{ position: 0, color: '#f0f2f5ff' }, { position: 1, color: '#fafafaff' }] }] },
        { name: 'Surface/Ink', paints: [{ type: 'SOLID', color: '#1f2937ff' }] },
      ] },
    map: { fileKey: 'FIXTUREKEY', spacingBase: '--spacing',
      variables: { white: { skip: 'primitive; reached through aliases' }, 'surface/card': { token: 'color.surface.card' }, 'text/primary': { css: '--color-ink' },
        'radius/sm': { css: '--radius-sm' }, 'space/2': { spacing: 2 }, 'opacity/disabled': { token: 'opacity.disabled' }, 'radius/pill': { utility: 'rounded-full' } },
      textStyles: { 'Text/Body': { utility: 'type-body' }, 'Text/Mono': { utility: 'type-mono' } },
      effectStyles: { 'Effect/Card': { css: '--shadow-card' } },
      paintStyles: { 'Surface/Sidebar Gradient': { token: 'gradient.sidebar' }, 'Surface/Ink': { token: 'color.ink' } } },
    dtcg: {
      color: { $type: 'color', white: { $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 } }, ink: { $value: '#1f2937' },
        surface: { card: { $value: '{color.white}' } }, shade: { $value: '#3c425a1a' } },
      radius: { $type: 'dimension', sm: { $value: { value: 6, unit: 'px' } } },
      spacing: { $type: 'dimension', $value: { value: 0.25, unit: 'rem' } },
      opacity: { disabled: { $type: 'number', $value: 0.4 } },
      font: { $type: 'fontFamily', sans: { $value: ['Pretendard Variable', 'Pretendard', 'sans-serif'] }, mono: { $value: 'JetBrains Mono, monospace' } },
      shadow: { card: { $type: 'shadow', $value: [{ color: '{color.shade}', offsetX: { value: 0, unit: 'px' }, offsetY: '4px', blur: { value: 6, unit: 'px' }, spread: { value: 0, unit: 'px' } }] } },
      gradient: { sidebar: { $type: 'gradient', $value: [{ color: '#f0f2f5', position: 0 }, { color: '#fafafa', position: 1 }] } },
    },
    typographyCss: [
      '/* Figma Text/Body */',
      '@utility type-body {\n  font-family: var(--font-sans);\n  font-size: 14px;\n  line-height: 22px;\n  font-weight: 400;\n  letter-spacing: 0;\n}',
      '.type-mono {\n  font-family: var(--font-mono);\n  font-size: 0.8125rem;\n  line-height: 1.5;\n  font-weight: 500;\n  letter-spacing: -0.01em;\n}',
    ].join('\n'),
  }
}

// Each case returns a modified copy of the fixture; the original is never mutated.
const RED_CASES = [
  ['changed color token', (f) => ({ ...f, dtcg: { ...f.dtcg, color: { ...f.dtcg.color, ink: { $value: '#111111' } } } }), 'text/primary #1f2937ff != --color-ink'],
  ['alias cycle', (f) => ({ ...f, dtcg: { ...f.dtcg, color: { ...f.dtcg.color, white: { $value: '{color.surface.card}' } } } }), 'Circular alias'],
  ['dangling alias', (f) => ({ ...f, dtcg: { ...f.dtcg, color: { ...f.dtcg.color, shade: { $value: '{color.missing}' } } } }), 'Missing alias target'],
  ['unmapped Figma item', (f) => ({ ...f, map: { ...f.map, variables: Object.fromEntries(Object.entries(f.map.variables).filter(([k]) => k !== 'radius/sm')) } }), 'Unmapped Figma variables: radius/sm'],
  ['stale mapping', (f) => ({ ...f, map: { ...f.map, variables: { ...f.map.variables, 'gone/x': { css: '--x' } } } }), 'Stale mapping'],
  ['missing token', (f) => ({ ...f, map: { ...f.map, variables: { ...f.map.variables, 'radius/sm': { css: '--nope' } } } }), 'does not exist'],
  ['skip without reason', (f) => ({ ...f, map: { ...f.map, variables: { ...f.map.variables, white: { skip: '' } } } }), 'skip needs a reason'],
  ['spacing step', (f) => ({ ...f, snapshot: { ...f.snapshot, variables: f.snapshot.variables.map((v) => (v.n === 'space/2' ? { ...v, v: 10 } : v)) } }), 'x --spacing'],
  ['font size', (f) => ({ ...f, typographyCss: f.typographyCss.replace('font-size: 14px', 'font-size: 15px') }), 'size 15px != 14px'],
  ['font family', (f) => ({ ...f, typographyCss: f.typographyCss.replace('var(--font-sans)', 'var(--font-mono)') }), 'family JetBrains Mono != Pretendard'],
  ['font weight', (f) => ({ ...f, typographyCss: f.typographyCss.replace('font-weight: 500', 'font-weight: 600') }), 'weight 600 != Medium'],
  ['percent line height', (f) => ({ ...f, typographyCss: f.typographyCss.replace('line-height: 1.5', 'line-height: 1.4') }), 'line-height 1.4 != 150%'],
  ['shadow layer', (f) => ({ ...f, dtcg: { ...f.dtcg, shadow: { card: { ...f.dtcg.shadow.card, $value: [{ ...f.dtcg.shadow.card.$value[0], offsetY: '5px' }] } } } }), 'Effect/Card layer 0'],
  ['gradient stop', (f) => ({ ...f, dtcg: { ...f.dtcg, gradient: { sidebar: { ...f.dtcg.gradient.sidebar, $value: [{ color: '#000000', position: 0 }, { color: '#fafafa', position: 1 }] } } } }), 'gradient stops'],
  ['solid paint', (f) => ({ ...f, map: { ...f.map, paintStyles: { ...f.map.paintStyles, 'Surface/Ink': { token: 'color.white' } } } }), 'Surface/Ink #1f2937ff != color.white'],
  ['other Figma file', (f) => ({ ...f, map: { ...f.map, fileKey: 'OTHER' } }), 'Snapshot file FIXTUREKEY != map file OTHER'],
  ['config file key', (f) => ({ ...f, settings: { ...f.settings, fileKey: 'CONFIGURED' } }), 'config figma.fileKey CONFIGURED'],
]

function selfTest() {
  const failures = []
  const base = fixture()
  const green = compareTokens(base)
  if (green.errors.length) failures.push(`matching fixture reported: ${green.errors.join('; ')}`)
  const expectedCounts = { variables: 4, spacing: 1, textStyles: 2, effects: 1, paints: 2 }
  if (JSON.stringify(green.counts) !== JSON.stringify(expectedCounts)) failures.push(`counts ${JSON.stringify(green.counts)} != ${JSON.stringify(expectedCounts)}`)
  for (const [label, mutate, needle] of RED_CASES) {
    const { errors } = compareTokens(mutate(base))
    if (!errors.some((e) => e.includes(needle))) failures.push(`${label} should report "${needle}", got: ${errors.join('; ') || 'no error'}`)
  }
  if (JSON.stringify(base) !== JSON.stringify(fixture())) failures.push('a case mutated the shared fixture')
  failures.push(...fileRoundTrip(base))
  for (const f of failures) console.log(`SELF-TEST FAIL: ${f}`)
  if (!failures.length) console.log(`self-test passed (matching fixture clean; ${RED_CASES.length} broken inputs each reported, including alias cycles; missing config rejected)`)
  return failures.length ? 1 : 0
}

// The same fixture through real files and the config, plus the missing-config error.
function fileRoundTrip(base) {
  const root = mkdtempSync(join(tmpdir(), 'figma-tokens-'))
  const w = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), typeof s === 'string' ? s : JSON.stringify(s)) }
  try {
    const failures = []
    try { loadInputs(root); failures.push('a missing config was accepted') } catch (e) { if (!(e instanceof InputError) || !e.message.includes('config not found')) failures.push(`missing config gave: ${e.message}`) }
    w(DEFAULT_CONFIG, { version: 1, figma: { fileKey: 'FIXTUREKEY' }, tokens: { snapshot: 'ds/snapshot.json', map: 'ds/map.json', dtcg: 'ds/tokens.json', typography: 'styles/type.css' } })
    w('ds/snapshot.json', base.snapshot); w('ds/map.json', base.map); w('ds/tokens.json', base.dtcg); w('styles/type.css', base.typographyCss)
    const { errors } = compareTokens(loadInputs(root))
    if (errors.length) failures.push(`file round trip reported: ${errors.join('; ')}`)
    return failures
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

function main(argv) {
  const args = { root: process.cwd(), config: undefined, selfTest: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--root' && argv[i + 1]) args.root = resolve(argv[++i])
    else if (a === '--config' && argv[i + 1]) args.config = argv[++i]
    else if (a === '--self-test') args.selfTest = true
    else { console.error(`check_figma_tokens: unknown or incomplete option ${a}`); return 2 }
  }
  if (args.selfTest) return selfTest()
  let result
  try { result = compareTokens(loadInputs(args.root, args.config)) } catch (e) {
    if (!(e instanceof InputError)) throw e
    console.error(`check_figma_tokens: ${e.message}`)
    return 2
  }
  const { errors, counts, readAt, fileKey } = result
  if (errors.length) {
    console.error(errors.join('\n'))
    console.error(`${errors.length} Figma token mismatch(es) against snapshot ${fileKey} @ ${readAt}`)
    return 1
  }
  console.log(`Figma ${fileKey} @ ${readAt}: ${counts.variables} variables, ${counts.spacing} spacing steps, ${counts.textStyles} text styles, ${counts.effects} effects, ${counts.paints} paints match code tokens. Declared values only; not a render or pixel check.`)
  return 0
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) process.exitCode = main(process.argv.slice(2))
