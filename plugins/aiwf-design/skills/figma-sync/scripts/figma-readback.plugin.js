// Figma readback for the design-system sync (read-only).
//
// Run this file's contents through the Figma Plugin API (e.g. the Figma MCP
// `use_figma` tool) against the design SOT file named by `figma.fileKey` in the
// project's design-spec config, then save the returned JSON as the snapshot
// (config `tokens.snapshot`). It never writes to the Figma file.
//
// The file key is read from the connected file (`figma.fileKey`). When the host does not
// expose it, set FILE_KEY below to the config value before running; when both are present
// they must agree, so a read from the wrong file fails instead of producing a snapshot.
//
// Output: every local variable (alias chain resolved per mode), text style,
// effect style and paint style. Colors are #rrggbbaa hex strings and numbers
// are rounded to 4 decimals so the snapshot fits one tool response.
// Variable entries: c = collection, n = name, v = resolved value,
// m = mode (multi-mode only), a = direct alias target, cs = codeSyntax.WEB.
//
// The tool response is capped (about 20KB). If a full read comes back cut off, set PART to
// 'variables' and then 'styles', run each, and merge the two parts with merge_readback.mjs
// next to this file. `counts` is computed inside Figma so the merge can prove that no array
// was cut off.

const FILE_KEY = '';
const PART = 'all'; // 'all' | 'variables' | 'styles'

const connectedKey = typeof figma.fileKey === 'string' && figma.fileKey ? figma.fileKey : '';
if (!connectedKey && !FILE_KEY) throw new Error('Unknown Figma file key: set FILE_KEY to the design-spec config figma.fileKey');
if (connectedKey && FILE_KEY && connectedKey !== FILE_KEY) throw new Error(`Connected file ${connectedKey} is not the configured SOT file ${FILE_KEY}`);
const SOT_FILE_KEY = connectedKey || FILE_KEY;

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
const byId = new Map(variables.map((v) => [v.id, v]));
const collectionById = new Map(collections.map((c) => [c.id, c]));

const isAlias = (value) => value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS';
const byte = (x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0');
const color = (c) => `#${byte(c.r)}${byte(c.g)}${byte(c.b)}${byte(c.a === undefined ? 1 : c.a)}`;
const num = (x) => (typeof x === 'number' ? Math.round(x * 10000) / 10000 : x);

function resolve(variable, modeId, chain = []) {
  if (chain.includes(variable.id)) throw new Error(`Circular alias: ${variable.name}`);
  const value = variable.valuesByMode[modeId];
  if (!isAlias(value)) return value && typeof value === 'object' && 'r' in value ? color(value) : num(value);
  const target = byId.get(value.id);
  if (!target) throw new Error(`Missing alias target for ${variable.name}`);
  const targetCollection = collectionById.get(target.variableCollectionId);
  const targetMode = target.valuesByMode[modeId] !== undefined ? modeId : targetCollection.defaultModeId;
  return resolve(target, targetMode, [...chain, variable.id]);
}

const variableOut = [];
for (const collection of collections) {
  for (const id of collection.variableIds) {
    const variable = byId.get(id);
    if (!variable) continue;
    for (const mode of collection.modes) {
      const raw = variable.valuesByMode[mode.modeId];
      // Null fields and single-mode names are omitted to keep the snapshot compact.
      const entry = { c: collection.name, n: variable.name, v: resolve(variable, mode.modeId) };
      if (collection.modes.length > 1) entry.m = mode.name;
      if (isAlias(raw)) entry.a = (byId.get(raw.id) || {}).name || raw.id;
      if (variable.codeSyntax && variable.codeSyntax.WEB) entry.cs = variable.codeSyntax.WEB;
      variableOut.push(entry);
    }
  }
}

const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => ({
  name: s.name,
  fontFamily: s.fontName.family,
  fontStyle: s.fontName.style,
  fontSize: s.fontSize,
  lineHeight: s.lineHeight.unit === 'AUTO' ? null : { unit: s.lineHeight.unit, value: num(s.lineHeight.value) },
  letterSpacing: { unit: s.letterSpacing.unit, value: num(s.letterSpacing.value) },
}));

const effectStyles = (await figma.getLocalEffectStylesAsync()).map((s) => ({
  name: s.name,
  effects: s.effects.filter((e) => e.visible !== false).map((e) => ({
    type: e.type,
    offsetX: num(e.offset ? e.offset.x : 0),
    offsetY: num(e.offset ? e.offset.y : 0),
    blur: num(e.radius),
    spread: num(e.spread || 0),
    color: e.color ? color(e.color) : null,
  })),
}));

// Gradient handles in node-relative space (0..1). CSS angles depend on the
// element's aspect ratio, so the checker compares stops only.
function handles(transform) {
  const [[a, c, e], [b, d, f]] = transform;
  const det = a * d - b * c;
  const inv = (x, y) => ({ x: num((d * (x - e) - c * (y - f)) / det), y: num((-b * (x - e) + a * (y - f)) / det) });
  return { start: inv(0, 0.5), end: inv(1, 0.5) };
}

const paintStyles = (await figma.getLocalPaintStylesAsync()).map((s) => ({
  name: s.name,
  paints: s.paints.filter((p) => p.visible !== false).map((p) => p.type === 'SOLID'
    ? { type: p.type, color: color({ ...p.color, a: p.opacity === undefined ? 1 : p.opacity }) }
    : {
      type: p.type,
      stops: p.gradientStops.map((g) => ({ position: num(g.position), color: color(g.color) })),
      handles: handles(p.gradientTransform),
    }),
}));

const sections = { variables: variableOut, textStyles, effectStyles, paintStyles };
const wanted = PART === 'variables' ? ['variables'] : PART === 'styles' ? ['textStyles', 'effectStyles', 'paintStyles'] : Object.keys(sections);
return {
  schemaVersion: 1,
  fileKey: SOT_FILE_KEY,
  fileName: figma.root.name,
  readAt: new Date().toISOString(),
  part: PART,
  counts: Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, v.length])),
  collections: collections.map((c) => ({ name: c.name, id: c.id, modes: c.modes.map((m) => m.name) })),
  ...Object.fromEntries(wanted.map((k) => [k, sections[k]])),
};
