#!/usr/bin/env node
// Structural lint for the design-spec workspace and its links to the AIWF planning documents.
// Mechanical rules only; judgment calls live in the skill text. Project paths come from the
// design-spec config (default docs/design-spec/design-spec.config.json; schema in the plugin README).
//
// Usage: node design_spec_lint.mjs [--root <repo>] [--config <file>] [--strict] [--format text|json] [--self-test]
// Output: one line per finding, `path:line: SEVERITY CODE [element]: message` (same shape as
// aiwf-core spec_lint.py). Exit 0 clean, 1 on ERROR (with --strict also on WARN), 2 on usage or config error.
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'

const CONFIG_FILE = 'design-spec.config.json'
const DEFAULT_CONFIG = `docs/design-spec/${CONFIG_FILE}`
const REQUIRED = ['README.md', 'AGENTS.md', 'HANDOFF.md', 'decisions.md', 'traceability.md', 'figma/figma-map.md', 'design-system/README.md']
const ID_PATTERN = /\b(UC|FR|NFR|C)-(\d{3})(?:\s*~\s*(?:(?:UC|FR|NFR|C)-)?(\d{3}))?/g
const DATE = /^\d{4}-\d{2}-\d{2}$/

// ---------- config ----------
export class ConfigError extends Error {}

const TEST_POLICIES = ['repository', 'acceptance-gates']

const DEFAULTS = Object.freeze({
  specRoot: 'docs/design-spec',
  entryDocs: ['README.md', 'AGENTS.md'],
  planning: { requirements: 'docs/requirements.md', useCases: 'docs/use_cases', testCases: 'docs/test_cases' },
  plans: { dir: 'memories/plans', toolDefaultDirs: ['docs/superpowers/plans'] },
  figma: { fileKey: '' },
  tokens: { snapshot: 'design-system/figma-readback.json' },
})

const isRelativePath = (p) => typeof p === 'string' && p.length > 0 && !isAbsolute(p) && !p.split(/[\\/]/).includes('..')

function pathField(errors, value, name) {
  if (!isRelativePath(value)) errors.push(`${name} must be a non-empty repository-relative path without ".." (got ${JSON.stringify(value)})`)
}

function pathList(errors, value, name) {
  if (!Array.isArray(value)) { errors.push(`${name} must be an array of repository-relative paths`); return }
  value.forEach((p, i) => pathField(errors, p, `${name}[${i}]`))
}

// Returns a new, validated settings object; never mutates the parsed file.
export function lintSettings(raw, source) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new ConfigError(`${source}: the config must be a JSON object`)
  if (raw.version !== 1) throw new ConfigError(`${source}: "version" must be 1 (got ${JSON.stringify(raw.version)})`)
  const settings = {
    specRoot: raw.specRoot ?? DEFAULTS.specRoot,
    entryDocs: raw.entryDocs ?? DEFAULTS.entryDocs,
    planning: { ...DEFAULTS.planning, ...(raw.planning ?? {}) },
    plans: { ...DEFAULTS.plans, ...(raw.plans ?? {}) },
    figma: { ...DEFAULTS.figma, ...(raw.figma ?? {}) },
    snapshot: raw.tokens?.snapshot ?? DEFAULTS.tokens.snapshot,
  }
  const errors = []
  pathField(errors, settings.specRoot, 'specRoot')
  pathList(errors, settings.entryDocs, 'entryDocs')
  pathField(errors, settings.planning.requirements, 'planning.requirements')
  pathField(errors, settings.planning.useCases, 'planning.useCases')
  pathField(errors, settings.plans.dir, 'plans.dir')
  pathList(errors, settings.plans.toolDefaultDirs, 'plans.toolDefaultDirs')
  pathField(errors, settings.snapshot, 'tokens.snapshot')
  if (typeof settings.figma.fileKey !== 'string') errors.push('figma.fileKey must be a string')
  // Read by the apply skill rather than this script; reject values it cannot act on.
  if (raw.testPolicy !== undefined && !TEST_POLICIES.includes(raw.testPolicy)) errors.push(`testPolicy must be one of ${TEST_POLICIES.join(', ')}`)
  if (raw.gates !== undefined && (!Array.isArray(raw.gates) || raw.gates.some((g) => typeof g !== 'string' || !g.trim()))) errors.push('gates must be an array of commands')
  if (raw.acceptance?.doc !== undefined && !isRelativePath(raw.acceptance.doc)) errors.push('acceptance.doc must be a repository-relative path')
  if (errors.length) throw new ConfigError(`${source}: ${errors.join('; ')}`)
  return settings
}

export function loadSettings(root, configPath) {
  const file = configPath ? resolve(configPath) : join(root, DEFAULT_CONFIG)
  if (!existsSync(file)) {
    throw new ConfigError(`design-spec config not found: ${file}. Create it from the aiwf-design workflow skill's references/templates/${CONFIG_FILE} (schema in the plugin README), or pass --config <file>.`)
  }
  let raw
  try { raw = JSON.parse(readFileSync(file, 'utf8')) } catch (e) { throw new ConfigError(`${file}: not valid JSON (${e.message})`) }
  return lintSettings(raw, file)
}

// ---------- markdown helpers ----------
function stripFences(text) {
  let inFence = false
  return text.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; return '' }
    return inFence ? '' : line
  })
}

export function slugify(heading) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim().toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')
}

const headingCache = new Map()
function headingsOf(file) {
  if (headingCache.has(file)) return headingCache.get(file)
  const lines = stripFences(readFileSync(file, 'utf8'))
  const titles = []
  const anchors = new Set()
  const seen = new Map()
  const tableKeys = []
  for (const line of lines) {
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)
    if (h) {
      titles.push(h[2])
      const base = slugify(h[2])
      const n = seen.get(base) ?? 0
      anchors.add(n ? `${base}-${n}` : base)
      seen.set(base, n + 1)
    }
    for (const a of line.matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) anchors.add(a[1])
    const cell = /^\|\s*([^|]+?)\s*\|/.exec(line)
    if (cell) tableKeys.push(cell[1])
  }
  const result = { titles, anchors, tableKeys }
  headingCache.set(file, result)
  return result
}

function linksOf(lines) {
  const out = []
  lines.forEach((raw, i) => {
    const line = raw.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length))
    for (const m of line.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) out.push({ target: m[1], line: i + 1 })
  })
  return out
}

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

// ---------- checks ----------
function checkStructure(root, cfg, add) {
  const spec = join(root, cfg.specRoot)
  for (const f of REQUIRED) if (!existsSync(join(spec, f))) add('ERROR', 'DS_FILE_MISSING', `${cfg.specRoot}/${f}`, 0, f, 'required design-spec file is missing')
  for (const legacy of ['superpowers', 'docs']) {
    if (existsSync(join(spec, legacy))) add('ERROR', 'DS_LEGACY_DIR', `${cfg.specRoot}/${legacy}`, 0, legacy, `"${legacy}/" must not exist inside design-spec; plans go to ${cfg.plans.dir}/`)
  }
  for (const toolDir of cfg.plans.toolDefaultDirs) {
    if (existsSync(join(root, toolDir))) add('WARN', 'DS_PLAN_DEFAULT_PATH', toolDir, 0, toolDir.split('/').pop(), `a planning tool wrote to its default path; design plans belong in ${cfg.specRoot}/${cfg.plans.dir}/`)
  }
}

function checkLinks(root, cfg, file, { onlyIntoSpec }, add) {
  const rel = relative(root, file)
  const lines = stripFences(readFileSync(file, 'utf8'))
  for (const { target, line } of linksOf(lines)) {
    if (/^(https?:|mailto:|tel:)/i.test(target)) continue
    if (/^(\/|file:)/i.test(target)) {
      if (!onlyIntoSpec) add('ERROR', 'DS_ABSOLUTE_PATH', rel, line, target, 'links inside design-spec must be relative')
      continue
    }
    const [pathPart, anchor] = target.split('#')
    let decoded
    try { decoded = decodeURIComponent(pathPart) } catch { decoded = pathPart }
    const dest = pathPart ? resolve(dirname(file), decoded) : file
    if (onlyIntoSpec && !relative(root, dest).startsWith(cfg.specRoot)) continue
    if (!existsSync(dest)) { add('ERROR', 'DS_BROKEN_LINK', rel, line, target, 'link target does not exist'); continue }
    if (anchor && dest.endsWith('.md') && !headingsOf(dest).anchors.has(decodeURIComponent(anchor))) {
      add('ERROR', 'DS_BROKEN_ANCHOR', rel, line, target, `no heading with anchor #${anchor} in ${relative(root, dest)}`)
    }
  }
}

// `X.md "섹션"` / `X.md`의 "섹션" — prose references to a section by name break silently when it is renamed.
function checkQuotedHeadings(root, cfg, file, add) {
  const rel = relative(root, file)
  const lines = stripFences(readFileSync(file, 'utf8'))
  const planningDir = dirname(cfg.planning.requirements)
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/([\w./-]+\.md)`?(?:의)?\s*["“]([^"”\n]{1,40})["”]/g)) {
      const name = m[1]
      const candidates = [resolve(dirname(file), name), resolve(root, name), resolve(root, planningDir, name), resolve(root, cfg.specRoot, name)]
      const dest = candidates.find((c) => existsSync(c))
      if (!dest) continue
      const { titles, tableKeys } = headingsOf(dest)
      const quoted = m[2].trim()
      if (![...titles, ...tableKeys].some((t) => t.includes(quoted))) {
        add('WARN', 'DS_QUOTED_HEADING', rel, i + 1, name, `"${quoted}" is not a heading or table row in ${relative(root, dest)} (renamed section?)`)
      }
    }
  })
}

function knownIds(root, cfg) {
  const ids = new Set()
  const req = join(root, cfg.planning.requirements)
  if (existsSync(req)) for (const m of readFileSync(req, 'utf8').matchAll(/^\|\s*((?:FR|NFR|C)-\d{3})\s*\|/gm)) ids.add(m[1])
  for (const f of walk(join(root, cfg.planning.useCases))) {
    const m = /(UC-\d{3})-/.exec(f)
    if (m) ids.add(m[1])
  }
  return ids
}

function expandIds(text) {
  const out = []
  for (const m of text.matchAll(ID_PATTERN)) {
    const [, kind, from, to] = m
    const start = Number(from)
    const end = to ? Number(to) : start
    for (let n = start; n <= Math.max(start, end) && n - start < 50; n++) out.push(`${kind}-${String(n).padStart(3, '0')}`)
  }
  return out
}

function parseRow(line) {
  if (!line.trim().startsWith('|')) return null
  const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
  return cells
}

function checkTraceability(root, cfg, add) {
  const file = join(root, cfg.specRoot, 'traceability.md')
  if (!existsSync(file)) return []
  const rel = relative(root, file)
  const lines = readFileSync(file, 'utf8').split('\n')
  const vocab = new Set()
  let section = ''
  for (const line of lines) {
    if (/^##\s/.test(line)) section = line
    const cells = parseRow(line)
    if (/상태 값/.test(section) && cells) for (const m of (cells[0] ?? '').matchAll(/`([^`]+)`/g)) vocab.add(m[1])
  }
  if (!vocab.size) { add('ERROR', 'DS_TRACE_VOCAB', rel, 0, '상태 값', 'status vocabulary table ("## 상태 값") not found'); return [] }
  const ids = knownIds(root, cfg)
  const dates = []
  let header = null
  lines.forEach((line, i) => {
    const cells = parseRow(line)
    if (!cells) { header = null; return }
    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) return
    if (!header) { header = cells; return }
    const statusIdx = header.findIndex((h) => h === '상태')
    const dateIdx = header.findIndex((h) => h === '갱신')
    if (statusIdx < 0) return
    const unit = cells[0]
    const status = cells[statusIdx] ?? ''
    if (![...vocab].some((v) => status.includes(v))) add('ERROR', 'DS_TRACE_STATUS', rel, i + 1, unit, `status "${status.slice(0, 60)}" uses none of: ${[...vocab].join(', ')}`)
    if (status.includes('기획 변경 대기')) add('INFO', 'DS_QUEUE_DESIGN', rel, i + 1, unit, 'planning changed; design review pending (designer queue)')
    if (status.includes('기획 변경 필요')) add('INFO', 'DS_QUEUE_PLANNING', rel, i + 1, unit, 'design decision differs from planning; planner decision pending')
    if (dateIdx >= 0) {
      const d = cells[dateIdx] ?? ''
      if (!DATE.test(d) || Number.isNaN(Date.parse(d))) add('ERROR', 'DS_TRACE_DATE', rel, i + 1, unit, `갱신 "${d}" is not a YYYY-MM-DD date`)
      else dates.push(d)
    }
    for (const id of new Set(expandIds(cells.join(' ')))) {
      if (!ids.has(id)) add('ERROR', 'DS_DANGLING_REF', rel, i + 1, unit, `${id} is not in ${cfg.planning.requirements} or ${cfg.planning.useCases}/`)
    }
  })
  return dates
}

function checkPlans(root, cfg, add) {
  const dir = join(root, cfg.specRoot, cfg.plans.dir)
  const dates = []
  for (const f of walk(dir).filter((p) => p.endsWith('.md'))) {
    const rel = relative(root, f)
    const name = f.split('/').pop()
    const m = /^(\d{4}-\d{2}-\d{2})-[a-z0-9-]+\.md$/.exec(name)
    if (!m) add('WARN', 'DS_PLAN_NAME', rel, 0, name, 'plan files are named YYYY-MM-DD-kebab-name.md')
    else dates.push(m[1])
    if (!headingsOf(f).titles.some((t) => t.includes('진행 기록'))) add('WARN', 'DS_PLAN_NO_LOG', rel, 0, name, 'plan has no "진행 기록" section')
  }
  return dates
}

function checkHandoff(root, cfg, laterDates, add) {
  const file = join(root, cfg.specRoot, 'HANDOFF.md')
  if (!existsSync(file)) return
  const rel = relative(root, file)
  const m = /마지막 갱신:\s*(\d{4}-\d{2}-\d{2})/.exec(readFileSync(file, 'utf8'))
  if (!m) { add('ERROR', 'DS_HANDOFF_DATE', rel, 0, 'HANDOFF', 'missing "마지막 갱신: YYYY-MM-DD"'); return }
  const newest = [...laterDates].sort().at(-1)
  if (newest && newest > m[1]) add('WARN', 'DS_HANDOFF_STALE', rel, 0, 'HANDOFF', `last updated ${m[1]} but traceability/plans changed on ${newest}`)
}

function checkFileKey(root, cfg, add) {
  const snap = join(root, cfg.snapshot)
  const map = join(root, cfg.specRoot, 'figma/figma-map.md')
  if (!existsSync(snap)) return
  let key
  try { key = JSON.parse(readFileSync(snap, 'utf8')).fileKey } catch { add('ERROR', 'DS_SNAPSHOT_INVALID', cfg.snapshot, 0, 'snapshot', 'not valid JSON (truncated readback?)'); return }
  if (key && existsSync(map) && !readFileSync(map, 'utf8').includes(key)) add('WARN', 'DS_FILEKEY', relative(root, map), 0, key, 'the Figma file of the code snapshot is not named in figma-map.md')
  if (key && cfg.figma.fileKey && key !== cfg.figma.fileKey) add('WARN', 'DS_FILEKEY', cfg.snapshot, 0, key, `snapshot was read from ${key} but the config figma.fileKey is ${cfg.figma.fileKey}`)
}

export function lint(root, cfg) {
  headingCache.clear()
  const findings = []
  const add = (severity, code, path, line, element, message) => findings.push({ severity, code, path, line, element, message })
  checkStructure(root, cfg, add)
  const specFiles = walk(join(root, cfg.specRoot)).filter((p) => p.endsWith('.md'))
  for (const f of specFiles) { checkLinks(root, cfg, f, { onlyIntoSpec: false }, add); checkQuotedHeadings(root, cfg, f, add) }
  for (const d of cfg.entryDocs.map((p) => join(root, p)).filter(existsSync)) checkLinks(root, cfg, d, { onlyIntoSpec: true }, add)
  const traceDates = checkTraceability(root, cfg, add)
  const planDates = checkPlans(root, cfg, add)
  checkHandoff(root, cfg, [...traceDates, ...planDates], add)
  checkFileKey(root, cfg, add)
  return findings
}

// ---------- self-test: every code must fire on a fixture built to trigger it ----------
function selfTest() {
  const root = mkdtempSync(join(tmpdir(), 'design-spec-lint-'))
  const w = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), s) }
  const SPEC = 'docs/design-spec'
  try {
    const failures = []
    try { loadSettings(root); failures.push('a missing config was accepted') } catch (e) { if (!(e instanceof ConfigError) || !e.message.includes('config not found')) failures.push(`missing config gave: ${e.message}`) }
    w(`${SPEC}/${CONFIG_FILE}`, JSON.stringify({ version: 1, specRoot: SPEC, entryDocs: ['README.md', 'docs/PRODUCT.md'], figma: { fileKey: '' } }))
    w('docs/requirements.md', '| FR-001 | x |\n')
    w('docs/use_cases/UC-001-run.md', '# UC\n')
    w('docs/PRODUCT.md', '# 제품\n## 디자인 기준\n')
    w('README.md', '[spec](docs/design-spec/README.md#없는-제목)\n')
    w(`${SPEC}/README.md`, '# 안내\n[ok](decisions.md#디자인-기준-2026-10-02) [bad](nope.md) [abs](/Users/x/a.md)\n')
    w(`${SPEC}/AGENTS.md`, '진입점은 `docs/PRODUCT.md`의 "새 디자인 스펙"이다.\n')
    w(`${SPEC}/HANDOFF.md`, '> 마지막 갱신: 2026-01-01\n')
    w(`${SPEC}/decisions.md`, '## 디자인 기준 (2026-10-02)\n')
    w(`${SPEC}/traceability.md`, ['## 상태 값', '| 값 | 뜻 |', '|---|---|', '| `디자인 완료` | a |', '| `기획 변경 대기` | b |', '', '## 화면',
      '| 단위 | 기획 | 상태 | 갱신 |', '|---|---|---|---|', '| F1 | UC-001 FR-001 | 디자인 완료 | 2026-10-05 |', '| F2 | UC-009 FR-002~003 | 진행 중 | 어제 |', '| F3 | 없음 | 기획 변경 대기 | 2026-10-04 |'].join('\n'))
    w(`${SPEC}/design-system/README.md`, '# DS\n')
    w(`${SPEC}/memories/plans/Plan.md`, '# p\n')
    w(`${SPEC}/superpowers/plans/x.md`, '# x\n')
    w('design-system/figma-readback.json', '{"fileKey":"ABC"')
    const cfg = loadSettings(root)
    const findings = lint(root, cfg)
    const codes = new Set(findings.map((f) => f.code))
    const expected = ['DS_FILE_MISSING', 'DS_LEGACY_DIR', 'DS_BROKEN_LINK', 'DS_BROKEN_ANCHOR', 'DS_ABSOLUTE_PATH', 'DS_QUOTED_HEADING', 'DS_TRACE_STATUS', 'DS_TRACE_DATE', 'DS_DANGLING_REF', 'DS_QUEUE_DESIGN', 'DS_PLAN_NAME', 'DS_PLAN_NO_LOG', 'DS_HANDOFF_STALE', 'DS_SNAPSHOT_INVALID']
    for (const c of expected.filter((c) => !codes.has(c))) failures.push(`${c} did not fire`)
    // The valid anchor and the in-range IDs must not be reported.
    for (const n of findings.filter((f) => f.message.includes('디자인-기준-2026-10-02') || f.message.startsWith('FR-001 ') || f.message.startsWith('UC-001 '))) failures.push(`false positive ${n.code} ${n.message}`)
    // Config values must be validated before any check runs.
    for (const [label, raw] of [['a specRoot outside the repository', { version: 1, specRoot: '../outside' }], ['an unknown testPolicy', { version: 1, testPolicy: 'tdd' }], ['a missing version', { specRoot: 'docs/design-spec' }]]) {
      try { lintSettings(raw, 'inline'); failures.push(`${label} was accepted`) } catch (e) { if (!(e instanceof ConfigError)) failures.push(`${label} gave: ${e.message}`) }
    }
    if (failures.length) {
      for (const f of failures) console.log(`SELF-TEST FAIL: ${f}`)
      return 1
    }
    console.log(`self-test passed (${expected.length} codes fire, no false positives on valid anchor/IDs, missing or invalid config rejected)`)
    return 0
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

function main(argv) {
  const args = { root: process.cwd(), config: undefined, strict: false, format: 'text', selfTest: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--root' && argv[i + 1]) args.root = resolve(argv[++i])
    else if (a === '--config' && argv[i + 1]) args.config = argv[++i]
    else if (a === '--strict') args.strict = true
    else if (a === '--format' && ['text', 'json'].includes(argv[i + 1])) args.format = argv[++i]
    else if (a === '--self-test') args.selfTest = true
    else { console.error(`design_spec_lint: unknown or incomplete option ${a}`); return 2 }
  }
  if (args.selfTest) return selfTest()
  let cfg
  try { cfg = loadSettings(args.root, args.config) } catch (e) {
    if (!(e instanceof ConfigError)) throw e
    console.error(`design_spec_lint: ${e.message}`)
    return 2
  }
  if (!existsSync(join(args.root, cfg.specRoot))) { console.error(`design_spec_lint: no ${cfg.specRoot} under ${args.root}`); return 2 }
  const findings = lint(args.root, cfg)
  if (args.format === 'json') console.log(JSON.stringify(findings, null, 2))
  else {
    for (const f of findings) console.log(`${f.path}:${f.line}: ${f.severity} ${f.code} [${f.element}]: ${f.message}`)
    const count = (s) => findings.filter((f) => f.severity === s).length
    console.log(`${count('ERROR')} error(s), ${count('WARN')} warning(s), ${count('INFO')} info(s)`)
  }
  const failing = findings.some((f) => f.severity === 'ERROR' || (args.strict && f.severity === 'WARN'))
  return failing ? 1 : 0
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) process.exitCode = main(process.argv.slice(2))
