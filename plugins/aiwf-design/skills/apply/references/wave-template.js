// Claude Code only: a Workflow script (`meta` + agent()/pipeline() hooks of the Claude Code Workflow tool).
// In Codex, or any host without the Workflow tool, run the same stages by delegating each agent() call
// to a subagent with the same prompt, model and file-ownership rules, or run them yourself in order when
// delegation is unavailable, and report which route ran. Build `args` from design-spec.config.json.
export const meta = {
  name: 'design-spec-wave',
  description: 'One application wave: per file-owning group implement (sonnet), adversarially verify against Figma (opus), fix (sonnet), then integrate shared files (sonnet)',
  whenToUse: 'aiwf-design apply, step 4, once per wave (config apply.waves, e.g. shared icons, L1, L2 shell, L3 chat)',
  phases: [
    { title: 'Implement', detail: 'disjoint file-owning groups (sonnet)' },
    { title: 'Verify', detail: 'adversarial review vs Figma and survey (opus)' },
    { title: 'Fix', detail: 'apply confirmed issues (sonnet)' },
    { title: 'Integrate', detail: 'i18n, story ids, component map, cross-file requests (sonnet)' },
  ],
}

// args = {
//   repo, fileKey, acceptDoc, surveysDir,          // survey JSON per group lives in `${surveysDir}/<survey>.json`
//   specRoot, tokenMap, testPolicy,                // from design-spec.config.json
//   context: 'what earlier waves already landed (tokens, L1 components, ...)',
//   gates: 'commands agents may run, e.g. npx tsc --noEmit -p tsconfig.web.json',
//   sharedEditable: ['locale catalogs, story-id registry, component map: config apply.sharedFiles'],
//   locales: ['ko', 'en'],                          // config apply.locales; [] when the UI has no i18n catalog
//   storyIdsFile: 'story-id registry or omit',      // config apply.storyIds
//   componentMap: 'Figma node -> component map or omit', // config apply.componentMap
//   integrationChecks: 'extra checks for the integrator, e.g. node tools/check-component-map.mjs',
//   laterWaveFiles: ['files the integrator must not edit; carry requests forward'],
//   groups: [{ key, survey, files: [...], task, screens }],
// }
const A = args
if (!A || !A.repo || !Array.isArray(A.groups) || !A.groups.length) throw new Error('args.repo and args.groups are required')
const SPEC = A.specRoot || 'docs/design-spec'
const LOCALES = Array.isArray(A.locales) ? A.locales : []
const TEST_RULE = A.testPolicy === 'acceptance-gates'
  ? 'Do not add unit tests or edit tests/.'
  : 'Follow the repository test policy; add or change tests only where it requires them, inside your files.'

const COMMON = `
Repository ${A.repo}. Uncommitted work is intentional: never revert, stash, reset, commit or push.
Figma file ${A.fileKey} is the source of truth and is READ-ONLY: read-only use_figma scripts only (load skill "figma:figma-use" first, skillNames "figma-use").
Already done: ${A.context || 'see the acceptance doc progress log'}. Follow "적용 결정" in ${A.acceptDoc}. Design decisions: ${SPEC}/decisions.md (read-only).
Specs: ${A.surveysDir}/<group>.json (measured figma[].spec, codeTargets, deltas, featureGaps, mustNotChange) and ${A.surveysDir}/critic.json.
Rules: only implemented features get the new design; never remove implemented features Figma lacks. Change existing components; do not create parallel ones. Code tokens and typography utilities only (mapping: ${A.tokenMap || 'the project token map'}); a Figma value with no token gets a comment naming the Figma node. Keep behavior, events, IPC, permissions, aria, keyboard, focus-visible and class names that smoke drivers query (grep before renaming). ${TEST_RULE} Do not run the app, UI smoke or render tests, or full builds. You may run: ${A.gates || 'the repository typecheck'}; other groups edit other files concurrently, so ignore type errors only in files you do not own.
Edit ONLY your files. Put changes to other files in "requests". Never edit ${(A.sharedEditable || []).join(', ') || 'shared files'} yourself: use "i18n" and "newStories".`

const I18N_ITEM = LOCALES.length
  ? { type: 'object', properties: { key: { type: 'string' }, ...Object.fromEntries(LOCALES.map((l) => [l, { type: 'string' }])) }, required: ['key', ...LOCALES] }
  : { type: 'object', properties: { key: { type: 'string' }, text: { type: 'string' } }, required: ['key', 'text'] }
const IMPL = {
  type: 'object',
  properties: {
    changedFiles: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    figmaCoverage: { type: 'array', items: { type: 'string' } },
    requests: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, change: { type: 'string' } }, required: ['file', 'change'] } },
    i18n: { type: 'array', items: I18N_ITEM },
    newStories: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, metaId: { type: 'string' }, exportName: { type: 'string' } }, required: ['file', 'metaId', 'exportName'] } },
    deviations: { type: 'array', items: { type: 'string' } },
    typecheck: { type: 'string' },
  },
  required: ['changedFiles', 'summary', 'figmaCoverage', 'requests', 'i18n', 'newStories', 'deviations', 'typecheck'],
}
const VERDICT = {
  type: 'object',
  properties: { ok: { type: 'boolean' }, issues: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, line: { type: 'number' }, problem: { type: 'string' }, fix: { type: 'string' }, severity: { type: 'string', enum: ['high', 'medium', 'low'] } }, required: ['file', 'problem', 'fix', 'severity'] } }, checked: { type: 'string' } },
  required: ['ok', 'issues', 'checked'],
}
const FIX = { type: 'object', properties: { applied: { type: 'array', items: { type: 'string' } }, rejected: { type: 'array', items: { type: 'string' } }, typecheck: { type: 'string' } }, required: ['applied', 'rejected', 'typecheck'] }

const results = (await pipeline(
  A.groups,
  (g) => agent(`${COMMON}\nGroup ${g.key}. Your files: ${g.files.join(', ')}.\nTask: ${g.task}\nReference screens: ${g.screens || 'see survey'}.`, { label: `impl:${g.key}`, phase: 'Implement', schema: IMPL, model: 'sonnet', effort: 'high' })
    .then((impl) => ({ g, impl })),
  (s) => !s.impl ? { ...s, verify: null } : agent(`${COMMON}
Adversarial reviewer for ${s.g.key}. Assume mistakes. Owned files: ${s.g.files.join(', ')}. Read ${A.surveysDir}/${s.g.survey}.json, inspect git diff of the owned files, compare against Figma read-only (get_screenshot on ${s.g.screens || 'the component nodes'}).
Report: ${JSON.stringify(s.impl)}
Check measured values per variant/state, the decisions in ${A.acceptDoc}, scope (nothing built for missing features, nothing implemented removed), unchanged behavior/contracts/aria/data-* hooks, no new hard-coded colors or sizes, no edits outside owned files (git diff --stat), stories for implemented states. ok=true only with no high or medium issue.`, { label: `verify:${s.g.key}`, phase: 'Verify', schema: VERDICT, model: 'opus', effort: 'high' }).then((verify) => ({ ...s, verify })),
  async (s) => {
    const issues = s.verify ? s.verify.issues.filter((i) => i.severity !== 'low' || !s.verify.ok) : []
    if (!issues.length) return { ...s, fix: null }
    const fix = await agent(`${COMMON}\nGroup ${s.g.key}. Owned files: ${s.g.files.join(', ')}. Re-check each reviewer issue against code, survey and Figma; apply the correct ones, reject the wrong ones with a reason. Issues: ${JSON.stringify(issues)}`, { label: `fix:${s.g.key}`, phase: 'Fix', schema: FIX, model: 'sonnet', effort: 'high' })
    return { ...s, fix }
  },
)).filter(Boolean)

const integrate = await agent(`${COMMON}
Integrator for this wave. You may edit ${(A.sharedEditable || []).join(', ')} and any file named in a request EXCEPT ${(A.laterWaveFiles || []).join(', ') || 'files of later waves'} (carry those forward in "deferred").
1. Apply i18n entries${LOCALES.length ? ` (${LOCALES.join(', ')})` : ''} through the repo's catalog generator if one exists (check git history of the locale files). 2. ${A.storyIdsFile ? `Register new story ids in ${A.storyIdsFile} (metaId + "--" + kebab-case export; sorted; verify each export).` : 'No story-id registry is configured; report new stories only.'} 3. ${A.componentMap ? `Add ${A.componentMap} entries for implemented Figma components (nodeId, componentKey from the surveys, fileKey, source, an existing story id) replacing old entries of the same role.` : 'No component map is configured; list implemented Figma nodes in "applied".'} 4. Apply remaining requests, re-checking each. 5. Run the allowed checks${A.integrationChecks ? ` and ${A.integrationChecks}` : ''}.
Results: ${JSON.stringify(results.map((r) => ({ group: r.g.key, requests: r.impl?.requests ?? [], i18n: r.impl?.i18n ?? [], newStories: r.impl?.newStories ?? [], coverage: r.impl?.figmaCoverage ?? [] })))}`,
{ label: 'integrate', phase: 'Integrate', model: 'sonnet', effort: 'high', schema: {
  type: 'object',
  properties: { applied: { type: 'array', items: { type: 'string' } }, deferred: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, change: { type: 'string' }, from: { type: 'string' } }, required: ['file', 'change', 'from'] } }, storyIdsAdded: { type: 'array', items: { type: 'string' } }, figmaMapEntries: { type: 'array', items: { type: 'string' } }, typecheck: { type: 'string' } },
  required: ['applied', 'deferred', 'storyIdsAdded', 'figmaMapEntries', 'typecheck'],
} })

if (results.length < A.groups.length) log(`${A.groups.length - results.length} group(s) returned nothing; resume this run to retry them`)
return {
  groups: results.map((r) => ({ group: r.g.key, changed: r.impl?.changedFiles ?? [], deviations: r.impl?.deviations ?? [], verifyOk: r.verify?.ok ?? null, issues: r.verify?.issues ?? [], fix: r.fix })),
  integrate,
}
