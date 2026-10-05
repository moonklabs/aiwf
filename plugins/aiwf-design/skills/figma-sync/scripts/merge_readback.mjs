#!/usr/bin/env node
// Merge and validate Figma readback outputs into one snapshot.
//
// Usage: node merge_readback.mjs --out <snapshot.json> <part.json>...
//        node merge_readback.mjs --self-test [figma-readback.plugin.js]
// Each part is the raw JSON returned by figma-readback.plugin.js (next to this file)
// (PART = 'all', 'variables' or 'styles'). The merge refuses to write when any part is not valid
// JSON (a truncated tool response), when parts come from different files or schema versions,
// when a section is missing, or when an array length differs from the `counts` Figma reported.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SECTIONS = ['variables', 'textStyles', 'effectStyles', 'paintStyles']
const DEFAULT_PLUGIN = join(dirname(fileURLToPath(import.meta.url)), 'figma-readback.plugin.js')

export function mergeParts(parts) {
  const errors = []
  if (!parts.length) return { errors: ['no input parts'] }
  const [first] = parts
  for (const p of parts) {
    if (p.fileKey !== first.fileKey) errors.push(`fileKey differs: ${p.fileKey} vs ${first.fileKey}`)
    if (p.schemaVersion !== first.schemaVersion) errors.push(`schemaVersion differs: ${p.schemaVersion} vs ${first.schemaVersion}`)
    if (!p.counts) errors.push(`part "${p.part ?? 'unknown'}" has no counts; re-run the current readback script`)
  }
  const merged = { schemaVersion: first.schemaVersion, fileKey: first.fileKey, fileName: first.fileName, readAt: parts.map((p) => p.readAt).sort().at(-1), counts: first.counts, collections: first.collections }
  for (const key of SECTIONS) {
    const holders = parts.filter((p) => Array.isArray(p[key]))
    if (!holders.length) { errors.push(`section ${key} is missing from every part`); continue }
    merged[key] = holders.at(-1)[key]
    const expected = first.counts?.[key]
    if (expected !== undefined && merged[key].length !== expected) errors.push(`${key}: ${merged[key].length} entries but Figma reported ${expected} (cut off?)`)
    const names = merged[key].map((e) => (e.m ? `${e.n}@${e.m}` : e.n ?? e.name))
    if (new Set(names).size !== names.length) errors.push(`${key}: duplicate names`)
  }
  for (const p of parts) for (const key of SECTIONS) {
    if (p.counts && first.counts && p.counts[key] !== first.counts[key]) errors.push(`counts.${key} differs between parts (Figma changed between reads? read again)`)
  }
  return { errors, merged }
}

// ---------- self-test: run the real readback script against a mock Figma API, then merge ----------
const MOCK_KEY = 'MOCKFILEKEY'
const mockColor = (r, g, b, a = 1) => ({ r, g, b, a })
function installMockFigma(fileKey) {
  const vars = [
    { id: 'v1', name: 'white', variableCollectionId: 'c1', resolvedType: 'COLOR', valuesByMode: { m1: mockColor(1, 1, 1) } },
    { id: 'v2', name: 'surface/card', variableCollectionId: 'c2', resolvedType: 'COLOR', valuesByMode: { m2: { type: 'VARIABLE_ALIAS', id: 'v1' } }, codeSyntax: { WEB: 'var(--surface-card)' } },
    { id: 'v3', name: 'radius/sm', variableCollectionId: 'c3', resolvedType: 'FLOAT', valuesByMode: { m3: 6 } },
  ]
  const cols = ['00 · Primitives', '01 · Color', '02 · Scale'].map((name, i) => ({ id: `c${i + 1}`, name, modes: [{ modeId: `m${i + 1}`, name: 'Light' }], defaultModeId: `m${i + 1}`, variableIds: [`v${i + 1}`] }))
  globalThis.figma = {
    fileKey,
    root: { name: 'Document' },
    variables: { getLocalVariableCollectionsAsync: async () => cols, getLocalVariablesAsync: async () => vars },
    getLocalTextStylesAsync: async () => [{ name: 'Text/Body', fontName: { family: 'Pretendard', style: 'Regular' }, fontSize: 14, lineHeight: { unit: 'PIXELS', value: 22 }, letterSpacing: { unit: 'PIXELS', value: 0 } }],
    getLocalEffectStylesAsync: async () => [{ name: 'Effect/Card', effects: [{ type: 'DROP_SHADOW', offset: { x: 0, y: 4 }, radius: 6, spread: 0, color: mockColor(0.235, 0.259, 0.349, 0.1) }] }],
    getLocalPaintStylesAsync: async () => [{ name: 'Surface/Sidebar Gradient', paints: [{ type: 'GRADIENT_LINEAR', gradientStops: [{ position: 0, color: mockColor(0.94, 0.95, 0.96) }, { position: 1, color: mockColor(0.98, 0.98, 0.98) }], gradientTransform: [[1, 0, 0], [0, 1, 0]] }] }],
  }
}

async function runPlugin(source, part, fileKey = '') {
  let body = source.replace(/const PART = '[a-z]+';/, `const PART = '${part}';`)
  if (body === source && part !== 'all') throw new Error('readback script has no `const PART = ...;` line')
  const keyed = body.replace(/const FILE_KEY = '[^']*';/, `const FILE_KEY = '${fileKey}';`)
  if (keyed === body && fileKey) throw new Error('readback script has no `const FILE_KEY = ...;` line')
  body = keyed
  return new Function(`return (async () => {${body}})()`)()
}

async function rejects(promise, needle) {
  try { await promise } catch (e) { return e.message.includes(needle) }
  return false
}

async function selfTest(pluginPath) {
  installMockFigma(MOCK_KEY)
  const source = readFileSync(pluginPath, 'utf8')
  const [all, vars, styles] = [await runPlugin(source, 'all'), await runPlugin(source, 'variables'), await runPlugin(source, 'styles')]
  const failures = []
  const expectOk = (label, parts) => { const r = mergeParts(parts); if (r.errors.length) failures.push(`${label} should merge: ${r.errors.join('; ')}`); return r.merged }
  const expectFail = (label, parts, needle) => { const r = mergeParts(parts); if (!r.errors.some((e) => e.includes(needle))) failures.push(`${label} should fail with "${needle}", got: ${r.errors.join('; ') || 'no error'}`) }
  if ('textStyles' in vars || 'variables' in styles) failures.push('PART did not limit the returned sections')
  const merged = expectOk('variables + styles', [vars, styles])
  expectOk('single full read', [all])
  expectFail('variables only', [vars], 'missing from every part')
  expectFail('cut-off array', [vars, { ...styles, textStyles: [] }], 'Figma reported')
  expectFail('other file', [vars, { ...styles, fileKey: 'OTHER' }], 'fileKey differs')
  if (merged && JSON.stringify(merged.variables) !== JSON.stringify(all.variables)) failures.push('split merge differs from a full read')
  if (merged && merged.variables[1].v !== '#ffffffff') failures.push(`alias not resolved: ${JSON.stringify(merged.variables[1])}`)
  // The file key comes from the connected file or from FILE_KEY; it is never assumed.
  if (all.fileKey !== MOCK_KEY) failures.push(`connected file key not used: ${all.fileKey}`)
  if (!(await rejects(runPlugin(source, 'all', 'CONFIGURED'), 'is not the configured SOT file'))) failures.push('a read from a file other than FILE_KEY was accepted')
  installMockFigma(undefined)
  if (!(await rejects(runPlugin(source, 'all'), 'Unknown Figma file key'))) failures.push('a read without any file key was accepted')
  const configured = await runPlugin(source, 'all', 'CONFIGURED')
  if (configured.fileKey !== 'CONFIGURED') failures.push(`FILE_KEY fallback not used: ${configured.fileKey}`)
  for (const f of failures) console.log(`SELF-TEST FAIL: ${f}`)
  if (!failures.length) console.log('self-test passed (split read equals full read; missing section, cut-off array, mixed files and unknown or mismatched file keys are rejected)')
  return failures.length ? 1 : 0
}

async function main(argv) {
  if (argv[0] === '--self-test') return selfTest(argv[1] ?? DEFAULT_PLUGIN)
  const outIdx = argv.indexOf('--out')
  if (outIdx < 0 || !argv[outIdx + 1]) { console.error('usage: merge_readback.mjs --out <snapshot.json> <part.json>...'); return 2 }
  const out = argv[outIdx + 1]
  const inputs = argv.filter((_, i) => i !== outIdx && i !== outIdx + 1)
  const parts = []
  for (const file of inputs) {
    let raw
    try { raw = readFileSync(file, 'utf8') } catch (e) { console.error(`${file}: cannot read (${e.message})`); return 1 }
    if (raw.includes('truncated')) { console.error(`${file}: contains a truncation marker; re-read with a smaller PART`); return 1 }
    try { parts.push(JSON.parse(raw)) } catch (e) { console.error(`${file}: not valid JSON (${e.message}); the tool response was probably cut off`); return 1 }
  }
  const { errors, merged } = mergeParts(parts)
  if (errors.length) { for (const e of errors) console.error(e); console.error('snapshot NOT written'); return 1 }
  writeFileSync(out, `${JSON.stringify(merged, null, 2)}\n`)
  console.log(`wrote ${out}: ${SECTIONS.map((k) => `${k} ${merged[k].length}`).join(', ')} from ${parts.length} part(s), file ${merged.fileKey}`)
  return 0
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) process.exitCode = await main(process.argv.slice(2))
