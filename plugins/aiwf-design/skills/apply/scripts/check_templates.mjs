#!/usr/bin/env node
// Dry-run the Claude Code Workflow templates with stub hooks: they must parse, reject missing args,
// run every stage, and pass an explicit `model` to every agent() call (never inherit the model).
// Usage: node check_templates.mjs [template.js ...]   (default: both templates in ../references)
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const defaults = ['survey-template.js', 'wave-template.js'].map((f) => join(here, '../references', f))
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor

// Minimal value that satisfies any schema shape the templates read back.
function stubFor(schema) {
  if (!schema) return 'ok'
  const props = schema.properties ?? {}
  return Object.fromEntries(Object.entries(props).map(([k, v]) => [k, v.type === 'array' ? [] : v.type === 'boolean' ? true : v.type === 'number' ? 0 : `stub-${k}`]))
}

async function dryRun(file, args) {
  const source = readFileSync(file, 'utf8')
  const meta = /export const meta = (\{[\s\S]*?\n\})/.exec(source)
  if (!meta) throw new Error('missing `export const meta = {...}` literal')
  const body = source.replace('export const meta', 'const meta')
  const calls = []
  const hooks = {
    agent: async (prompt, opts = {}) => { calls.push({ ...opts, prompt }); return stubFor(opts.schema) },
    pipeline: async (items, ...stages) => Promise.all(items.map(async (item, i) => { let v = item; for (const s of stages) v = await s(v, item, i); return v })),
    parallel: async (thunks) => Promise.all(thunks.map((t) => t())),
    phase: () => {}, log: () => {},
  }
  const run = new AsyncFunction('args', ...Object.keys(hooks), body)
  const result = await run(args, ...Object.values(hooks))
  return { calls, result }
}

const sampleArgs = {
  repo: '/repo', fileKey: 'KEY', acceptDoc: 'tests/acceptance/x/README.md', surveysDir: '/repo/out/surveys',
  specRoot: 'docs/design-spec', tokenMap: 'design-system/figma-token-map.json', testPolicy: 'repository',
  locales: ['ko', 'en'], storyIdsFile: '.storybook/story-ids.json', componentMap: 'design-system/figma-map.json',
  groups: [{ key: 'g1', survey: 'g1', files: ['a.tsx'], task: 't', focus: 'f', screens: '1:2' }, { key: 'g2', survey: 'g2', files: ['b.tsx'], task: 't', focus: 'f' }],
  sharedEditable: ['locales'], laterWaveFiles: ['c.tsx'],
}

// Project values must reach the prompts from args: with custom paths, no default path may remain.
const customArgs = { ...sampleArgs, specRoot: 'custom/spec', tokenMap: 'custom/token-map.json' }
const DEFAULT_PATHS = [/docs\/design-spec/, /figma-token-map\.json/]

let failed = 0
for (const file of process.argv.slice(2).length ? process.argv.slice(2) : defaults) {
  const name = file.split('/').pop()
  try {
    const { calls, result } = await dryRun(file, sampleArgs)
    const missing = calls.filter((o) => !o.model)
    if (!calls.length) throw new Error('no agent() calls ran')
    if (missing.length) throw new Error(`${missing.length} agent() call(s) without an explicit model: ${missing.map((o) => o.label).join(', ')}`)
    if (!result) throw new Error('template returned nothing')
    const { calls: custom } = await dryRun(file, customArgs)
    const leaked = custom.flatMap((o) => DEFAULT_PATHS.filter((re) => re.test(o.prompt)).map((re) => `${o.label} ${re}`))
    if (leaked.length) throw new Error(`built-in project paths ignore args: ${leaked.join(', ')}`)
    if (!custom.some((o) => o.prompt.includes('custom/spec/'))) throw new Error('args.specRoot never reaches a prompt')
    const { calls: noI18n } = await dryRun(file, { ...sampleArgs, locales: [], testPolicy: 'acceptance-gates' })
    if (noI18n.some((o) => !o.model)) throw new Error('an agent() call lost its model without locales')
    let rejected = false
    try { await dryRun(file, {}) } catch { rejected = true }
    if (!rejected) throw new Error('template accepted empty args')
    console.log(`ok ${name}: ${calls.length} agent calls, models ${[...new Set(calls.map((o) => o.model))].join('/')}`)
  } catch (e) {
    failed++
    console.log(`FAIL ${name}: ${e.message}`)
  }
}
process.exitCode = failed ? 1 : 0
