// Claude Code only: a Workflow script (`meta` + agent()/pipeline() hooks of the Claude Code Workflow tool).
// In Codex, or any host without the Workflow tool, run the same stages by delegating each agent() call
// to a subagent with the same prompt, model and read-only rules, or run them yourself in order when
// delegation is unavailable, and report which route ran. Build `args` from design-spec.config.json.
export const meta = {
  name: 'design-spec-survey',
  description: 'Read-only: extract measured Figma component specs per group and map them to code targets and deltas, then a completeness critic',
  whenToUse: 'Before applying Figma components to code (aiwf-design apply, step 3)',
  phases: [
    { title: 'Survey', detail: 'one read-only agent per component group (opus)' },
    { title: 'Critic', detail: 'completeness and ownership critic (opus)' },
  ],
}

// args = {
//   repo: '/abs/path/to/repo',
//   fileKey: '<config figma.fileKey>',
//   pages: '<config figma.sotPages, e.g. "0:1 main screens, 11:500 Components">',
//   specRoot: '<config specRoot, default docs/design-spec>',
//   tokenMap: '<config tokens.map>',
//   acceptDoc: '<config acceptance.doc with <goal> filled in>',
//   outOfScope: 'features the app does not have, e.g. dashboard, pricing',
//   groups: [{ key: 'L1-button', focus: 'Figma nodes and the code files to compare' }, ...],
// }
const A = args
if (!A || !A.repo || !A.fileKey || !Array.isArray(A.groups) || !A.groups.length) throw new Error('args.repo, args.fileKey and args.groups are required')
const SPEC = A.specRoot || 'docs/design-spec'

const COMMON = `
READ-ONLY SURVEY. Do not edit any repository file and NEVER write to Figma (read-only use_figma scripts only: no create*, no property assignment, no setProperties, no remove).
Repository ${A.repo}. Figma file ${A.fileKey}; source-of-truth pages: ${A.pages || `see ${SPEC}/figma/figma-map.md`}. Acceptance doc: ${A.acceptDoc || 'n/a'}.
Before any use_figma call load the skill "figma:figma-use" (skillNames "figma-use"); load tools with ToolSearch "select:mcp__plugin_figma_figma__use_figma,mcp__plugin_figma_figma__get_screenshot,mcp__plugin_figma_figma__get_metadata". Keep each script's returned JSON under ~15KB (the tool response is capped near 20KB); split by variant when needed.
Per component set collect for every variant: size, layoutMode, padding, itemSpacing, alignment, cornerRadius, fills/strokes with bound variable names, strokeWeight, effect and text style names, short text, instance main-component names. Use get_screenshot when a visual helps.
Code tokens: map Figma variable and style names to code tokens and typography utilities through ${A.tokenMap || 'the project token map'}.
Scope: only currently implemented features get the new design. Search the code for each Figma component/variant; list missing features under featureGaps (${A.outOfScope || 'judge from the code'}). Never propose removing implemented features that Figma lacks; map them to the nearest Figma component.
Output implementation-ready deltas with file, Figma node id and exact change, plus mustNotChange (events, IPC, permissions, contracts) and sharedFiles (files other groups will also need).`

const SURVEY_SCHEMA = {
  type: 'object',
  properties: {
    group: { type: 'string' },
    figma: { type: 'array', items: { type: 'object', properties: { component: { type: 'string' }, nodeId: { type: 'string' }, componentKey: { type: 'string' }, variants: { type: 'array', items: { type: 'string' } }, spec: { type: 'string' } }, required: ['component', 'nodeId', 'spec'] } },
    codeTargets: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, figmaComponent: { type: 'string' }, currentStyling: { type: 'string' }, storyFiles: { type: 'array', items: { type: 'string' } } }, required: ['file', 'figmaComponent', 'currentStyling'] } },
    deltas: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, figmaNode: { type: 'string' }, change: { type: 'string' }, priority: { type: 'string', enum: ['high', 'medium', 'low'] } }, required: ['file', 'figmaNode', 'change', 'priority'] } },
    featureGaps: { type: 'array', items: { type: 'string' } },
    mustNotChange: { type: 'array', items: { type: 'string' } },
    sharedFiles: { type: 'array', items: { type: 'string' } },
    openQuestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['group', 'figma', 'codeTargets', 'deltas', 'featureGaps', 'mustNotChange', 'sharedFiles', 'openQuestions'],
}

const surveys = (await pipeline(
  A.groups,
  (g) => agent(`${COMMON}\nGroup ${g.key}. Focus: ${g.focus}\nReturn the structured survey.`, { label: `survey:${g.key}`, phase: 'Survey', schema: SURVEY_SCHEMA, model: 'opus', effort: 'high' }),
)).filter(Boolean)

const critic = await agent(`${COMMON}
You are the completeness critic. Find: Figma components on the Components page that no survey covered; files claimed by two groups (ownership conflicts, propose one owner and an order); deltas that contradict ${SPEC}/decisions.md (record them, do not resolve them); scope mistakes (UI for missing features, or implemented features skipped). Verify claims against code and Figma where cheap.
Surveys: ${JSON.stringify(surveys.map((s) => ({ group: s.group, figma: s.figma.map((f) => `${f.component} ${f.nodeId}`), targets: s.codeTargets.map((t) => t.file), gaps: s.featureGaps, shared: s.sharedFiles })))}`,
{ label: 'critic', phase: 'Critic', model: 'opus', effort: 'high', schema: {
  type: 'object',
  properties: {
    uncovered: { type: 'array', items: { type: 'string' } },
    conflicts: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, groups: { type: 'array', items: { type: 'string' } }, suggestion: { type: 'string' } }, required: ['file', 'groups', 'suggestion'] } },
    contradictions: { type: 'array', items: { type: 'string' } },
    scopeIssues: { type: 'array', items: { type: 'string' } },
  },
  required: ['uncovered', 'conflicts', 'contradictions', 'scopeIssues'],
} })

if (surveys.length < A.groups.length) log(`${A.groups.length - surveys.length} survey group(s) returned nothing; re-run those keys`)
return { surveys, critic, missing: A.groups.length - surveys.length }
