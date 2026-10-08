import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { installSpecSkills, supportedDelegates, supportedStacks } from '../../scripts/install-spec-skills.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));

function project(t) {
  const root = mkdtempSync(join(tmpdir(), 'aiwf-install-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test('dry run writes nothing, real install retains parser siblings and attribution', t => {
  const root = project(t);
  const dry = installSpecSkills(root, { dryRun: true });
  assert.equal(dry.destinations.length, 10);
  assert.equal(dry.destinations.some(path => /aiwf-delegate-(claude|codex)$/.test(path)), false);
  assert.equal(dry.destinations.some(path => path.endsWith('aiwf-sync-docs')), true);
  assert.equal(existsSync(join(root, '.agents')), false);
  const result = installSpecSkills(root);
  assert.equal(result.installed.length, 10);
  const skills = join(root, '.agents/skills');
  assert.match(readFileSync(join(skills, 'aiwf-workflow/SKILL.md'), 'utf8'), /name: aiwf-workflow/);
  assert.match(readFileSync(join(skills, 'aiwf-docpilot/SKILL.md'), 'utf8'), /name: aiwf-docpilot/);
  assert.match(readFileSync(join(skills, 'aiwf-docpilot/agents/openai.yaml'), 'utf8'), /Use the `aiwf-docpilot` skill/);
  assert.match(readFileSync(join(skills, 'aiwf-spec-review/NOTICE'), 'utf8'), /derived from/);
  const check = spawnSync('python3', [join(skills, 'aiwf-spec-review/scripts/spec_lint.py'), '--self-test'], { encoding: 'utf8' });
  assert.equal(check.status, 0, check.stdout + check.stderr);
});

test('existing skill prevents partial install and preserves user content', t => {
  const root = project(t);
  const existing = join(root, '.agents/skills/aiwf-workflow');
  mkdirSync(existing, { recursive: true });
  writeFileSync(join(existing, 'SKILL.md'), 'user content');
  assert.throws(() => installSpecSkills(root), /already exists/);
  assert.equal(readFileSync(join(existing, 'SKILL.md'), 'utf8'), 'user content');
  assert.equal(existsSync(join(root, '.agents/skills/aiwf-requirements')), false);
});

test('symlinked skill parent and dangling destination are rejected', t => {
  const root = project(t);
  const outside = project(t);
  symlinkSync(outside, join(root, '.agents'));
  assert.throws(() => installSpecSkills(root), /symbolic link/);
  rmSync(join(root, '.agents'));
  mkdirSync(join(root, '.agents/skills'), { recursive: true });
  symlinkSync(join(outside, 'missing'), join(root, '.agents/skills/aiwf-workflow'));
  assert.throws(() => installSpecSkills(root), /already exists/);
});

test('installer CLI rejects unknown flags and missing project', () => {
  const run = args => spawnSync(process.execPath, ['scripts/install-spec-skills.mjs', ...args], { encoding: 'utf8' });
  assert.equal(run(['--unknown']).status, 1);
  assert.equal(run([]).status, 1);
  assert.equal(run(['--help']).status, 0);
});

test('installed workflow and reference documents use the prefixed sibling names', t => {
  const root = project(t);
  installSpecSkills(root);
  const skills = join(root, '.agents/skills');
  for (const [directory, file] of [
    ['aiwf-workflow', 'SKILL.md'],
    ['aiwf-use-case-spec', 'references/clarify-checklist.md'],
    ['aiwf-spec-review', 'references/lint-codes.md'],
    ['aiwf-spec-review', 'references/review-checklist.md'],
    ['aiwf-requirements', 'references/REFERENCE.md']
  ]) {
    const text = readFileSync(join(skills, directory, file), 'utf8');
    assert.doesNotMatch(text, /(?<![.\w-])\/(requirements|use-case-spec|use-case-diagram|entity-model|test-case|spec-review)(?![\w-])/);
    assert.doesNotMatch(text, /`(requirements|use-case-spec|use-case-diagram|entity-model|test-case|spec-review)`/);
  }
  assert.match(readFileSync(join(skills, 'aiwf-workflow/SKILL.md'), 'utf8'), /`aiwf-requirements`/);
});

test('installed sync-docs skill is renamed and rewrites sibling command references', t => {
  const root = project(t);
  installSpecSkills(root);
  const installed = readFileSync(join(root, '.agents/skills/aiwf-sync-docs/SKILL.md'), 'utf8');
  assert.match(installed, /^name: aiwf-sync-docs$/m);
  const source = readFileSync(join(repository, 'plugins/aiwf-spec/skills/sync-docs/SKILL.md'), 'utf8');
  const tick = String.fromCharCode(96);
  const siblings = ['requirements', 'entity-model', 'use-case-diagram', 'use-case-spec', 'test-case', 'spec-review', 'reverse-engineer', 'docpilot', 'workflow', 'sync-docs'];
  const slashRef = new RegExp('(?<![A-Za-z0-9_.-])/(' + siblings.join('|') + ')(?![A-Za-z0-9_-])');
  const namedRef = new RegExp(tick + '(' + siblings.join('|') + ')' + tick);
  assert.doesNotMatch(installed, slashRef);
  assert.doesNotMatch(installed, namedRef);
  for (const name of siblings) {
    const bareSlash = new RegExp('(?<![A-Za-z0-9_.-])/' + name + '(?![A-Za-z0-9_-])').test(source);
    const bareNamed = source.includes(tick + name + tick);
    if (!bareSlash && !bareNamed) { continue; }
    assert.ok(
      installed.includes('/aiwf-' + name) || installed.includes(tick + 'aiwf-' + name + tick),
      'unrewritten sibling reference: ' + name
    );
  }
});

test('pre-existing sync-docs destination blocks installation without overwriting user files', t => {
  const root = project(t);
  const existing = join(root, '.agents/skills/aiwf-sync-docs');
  mkdirSync(existing, { recursive: true });
  writeFileSync(join(existing, 'SKILL.md'), 'user sync-docs content');
  assert.throws(() => installSpecSkills(root), /already exists/);
  assert.equal(readFileSync(join(existing, 'SKILL.md'), 'utf8'), 'user sync-docs content');
  assert.equal(existsSync(join(root, '.agents/skills/aiwf-workflow')), false);
});

test('stack install includes core, isolated stack names and mapped cross-skill references', t => {
  const root = project(t);
  const result = installSpecSkills(root, { stack: 'nestjs-nextjs' });
  assert.equal(result.installed.length, 15);
  const skills = join(root, '.agents/skills');
  const implement = readFileSync(join(skills, 'aiwf-nestjs-nextjs-implement/SKILL.md'), 'utf8');
  assert.match(implement, /^name: aiwf-nestjs-nextjs-implement$/m);
  assert.match(implement, /`aiwf-nestjs-nextjs-nest-test`/);
  assert.match(implement, /\/aiwf-spec-review UC-XXX/);
  assert.doesNotMatch(implement, /(?<![.\w-])\/(spec-review|implement)(?![\w-])/);
  assert.equal(existsSync(join(skills, 'aiwf-nestjs-nextjs-implement/references/project-layout.md')), true);
  assert.equal(existsSync(join(skills, 'aiwf-nestjs-nextjs-implement/rules/mcp-servers.md')), true);
  assert.equal(existsSync(join(skills, 'aiwf-angular-jpa-implement')), false);
});

test('unknown stack is rejected before writing anything', t => {
  const root = project(t);
  assert.throws(() => installSpecSkills(root, { stack: '../../elsewhere' }), /Unknown stack/);
  assert.equal(existsSync(join(root, '.agents')), false);
});

test('each delegation skill is omitted by default and independently opt-in', t => {
  const counts = { claude: 11, codex: 11 };
  for (const target of supportedDelegates) {
    const root = project(t);
    const dry = installSpecSkills(root, { delegates: [target], dryRun: true });
    assert.equal(dry.destinations.length, counts[target]);
    assert.equal(dry.destinations.some(path => path.endsWith(`aiwf-delegate-${target}`)), true);
    assert.equal(dry.destinations.some(path => path.endsWith(`aiwf-delegate-${target === 'claude' ? 'codex' : 'claude'}`)), false);
    assert.equal(existsSync(join(root, '.agents')), false);
    const result = installSpecSkills(root, { delegates: [target] });
    const skill = `aiwf-delegate-${target}`;
    const skills = join(root, '.agents/skills');
    assert.equal(result.installed.length, counts[target]);
    assert.match(readFileSync(join(skills, `${skill}/SKILL.md`), 'utf8'), new RegExp(`^name: ${skill}$`, 'm'));
    assert.match(readFileSync(join(skills, `${skill}/agents/openai.yaml`), 'utf8'), /allow_implicit_invocation: false/);
    assert.equal(existsSync(join(skills, `aiwf-delegate-${target === 'claude' ? 'codex' : 'claude'}`)), false);
  }
});

test('both delegation skills can be selected together and invalid targets fail before writing', t => {
  const root = project(t);
  assert.equal(installSpecSkills(root, { delegates: ['claude', 'codex', 'claude'], dryRun: true }).destinations.length, 12);
  assert.throws(() => installSpecSkills(root, { delegates: ['../../outside'] }), /Unknown delegate/);
  assert.equal(existsSync(join(root, '.agents')), false);
});

test('each optional stack installs its complete isolated bundle', t => {
  const counts = { 'vaadin-jooq': 8, 'angular-jpa': 6, 'blazor-dotnet': 5, 'nestjs-nextjs': 5, 'electron-react': 6 };
  for (const stack of supportedStacks) {
    const root = project(t);
    const dry = installSpecSkills(root, { stack, dryRun: true });
    assert.equal(dry.destinations.length, 10 + counts[stack]);
    assert.equal(existsSync(join(root, '.agents')), false);
    const result = installSpecSkills(root, { stack });
    assert.equal(result.installed.length, dry.destinations.length);
    const implement = join(root, '.agents/skills', `aiwf-${stack}-implement`);
    assert.match(readFileSync(join(implement, 'SKILL.md'), 'utf8'), new RegExp(`^name: aiwf-${stack}-implement$`, 'm'));
    if (stack === 'electron-react') {
      // Authored stack: MIT licensing and its bundled references are copied.
      assert.match(readFileSync(join(implement, 'LICENSE'), 'utf8'), /MIT License/);
      assert.equal(existsSync(join(implement, 'references/architecture.md')), true);
      assert.equal(existsSync(join(root, '.agents/skills/aiwf-electron-react-scaffold/references/stack-profile.md')), true);
    } else {
      assert.match(readFileSync(join(implement, 'NOTICE'), 'utf8'), /AI Unified Process/);
      if (stack === 'angular-jpa' || stack === 'vaadin-jooq') {
        assert.equal(existsSync(join(implement, 'agents/uc-coverage.md')), true);
      }
    }
  }
});

test('authored electron-react stack installs six prefixed skills and rewrites references', t => {
  const root = project(t);
  const skills = join(root, '.agents/skills');
  const result = installSpecSkills(root, { stack: 'electron-react' });
  assert.equal(result.installed.length, 16);
  const authored = ['scaffold', 'implement', 'agent-runtime', 'renderer-test', 'electron-test', 'package'];
  for (const name of authored) {
    const text = readFileSync(join(skills, `aiwf-electron-react-${name}/SKILL.md`), 'utf8');
    assert.match(text, new RegExp(`^name: aiwf-electron-react-${name}$`, 'm'));
    // Sibling command and named-skill references are prefixed like the imported stacks.
    assert.doesNotMatch(text, new RegExp(`(?<![.\\w-])/(${authored.join('|')})(?![\\w-])`));
    assert.doesNotMatch(text, new RegExp('`(' + authored.join('|') + ')`'));
  }
  // Core references keep the shared aiwf- prefix used by installed copies.
  const implement = readFileSync(join(skills, 'aiwf-electron-react-implement/SKILL.md'), 'utf8');
  assert.doesNotMatch(implement, /(?<![.\w-])\/spec-review(?![\w-])/);
});

test('authored electron-react stack refuses to overwrite existing skills', t => {
  const root = project(t);
  const existing = join(root, '.agents/skills/aiwf-electron-react-implement');
  mkdirSync(existing, { recursive: true });
  writeFileSync(join(existing, 'SKILL.md'), 'custom electron-react content');
  assert.throws(() => installSpecSkills(root, { stack: 'electron-react' }), /already exists/);
  assert.equal(readFileSync(join(existing, 'SKILL.md'), 'utf8'), 'custom electron-react content');
  assert.equal(existsSync(join(root, '.agents/skills/aiwf-workflow')), false);
});

test('stack conflict preserves existing files and prevents partial core installation', t => {
  const root = project(t);
  const existing = join(root, '.agents/skills/aiwf-blazor-dotnet-implement');
  mkdirSync(existing, { recursive: true });
  writeFileSync(join(existing, 'SKILL.md'), 'custom stack');
  assert.throws(() => installSpecSkills(root, { stack: 'blazor-dotnet' }), /already exists/);
  assert.equal(readFileSync(join(existing, 'SKILL.md'), 'utf8'), 'custom stack');
  assert.equal(existsSync(join(root, '.agents/skills/aiwf-workflow')), false);
});

test('installer CLI accepts stack and delegate selections and rejects invalid options', t => {
  const root = project(t);
  const run = args => spawnSync(process.execPath, ['scripts/install-spec-skills.mjs', '--project', root, ...args], { encoding: 'utf8' });
  const dry = run(['--stack', 'blazor-dotnet', '--dry-run']);
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(JSON.parse(dry.stdout).destinations.length, 15);
  const authored = run(['--stack', 'electron-react', '--dry-run']);
  assert.equal(authored.status, 0, authored.stderr);
  assert.equal(JSON.parse(authored.stdout).destinations.length, 16);
  assert.equal(run(['--stack']).status, 1);
  assert.equal(run(['--stack', 'invalid']).status, 1);
  assert.equal(run(['--stack', 'blazor-dotnet', '--stack', 'angular-jpa']).status, 1);
  const both = run(['--delegate', 'claude', '--delegate', 'codex', '--dry-run']);
  assert.equal(both.status, 0, both.stderr);
  assert.equal(JSON.parse(both.stdout).destinations.length, 12);
  assert.equal(run(['--delegate']).status, 1);
  assert.equal(run(['--delegate', 'invalid']).status, 1);
  assert.equal(existsSync(join(root, '.agents')), false);
});

test('design skills are opt-in, keep the aiwf-design- prefix and run their bundled checks', t => {
  const root = project(t);
  assert.equal(installSpecSkills(root, { dryRun: true }).destinations.some(path => /aiwf-design-/.test(path)), false);
  const result = installSpecSkills(root, { design: true });
  const design = ['apply', 'figma-sync', 'review', 'trace', 'workflow'].map(name => `aiwf-design-${name}`);
  assert.equal(result.installed.length, 10 + design.length);
  const skills = join(root, '.agents/skills');
  for (const name of design) {
    const text = readFileSync(join(skills, name, 'SKILL.md'), 'utf8');
    assert.match(text, new RegExp(`^name: ${name}$`, 'm'));
    assert.doesNotMatch(text, /aiwf-(design|core|spec):[a-z]/, `qualified reference left in ${name}`);
    assert.match(readFileSync(join(skills, name, 'LICENSE'), 'utf8'), /Apache License/);
  }
  const router = readFileSync(join(skills, 'aiwf-design-workflow/SKILL.md'), 'utf8');
  assert.match(router, /<skills>\/aiwf-design-review\/scripts\/design_spec_lint\.mjs/);
  assert.match(router, /aiwf-design-figma-sync/);
  assert.match(router, /aiwf-sync-docs/);
  // The shared workflow keeps its own name and explanatory Claude Code text.
  const workflow = readFileSync(join(skills, 'aiwf-workflow/SKILL.md'), 'utf8');
  assert.doesNotMatch(workflow, /aiwf-design-workflow/);
  assert.match(workflow, /\/aiwf-core:requirements/);
  assert.match(workflow, /`aiwf-design-trace`/);
  assert.match(readFileSync(join(skills, 'aiwf-sync-docs/SKILL.md'), 'utf8'), /`aiwf-design-trace`/);
  assert.match(readFileSync(join(skills, 'aiwf-design-workflow/references/templates/design-spec/traceability.md'), 'utf8'), /^## 상태 값$/m);
  for (const [skill, script] of [['aiwf-design-review', 'design_spec_lint.mjs'], ['aiwf-design-figma-sync', 'merge_readback.mjs'], ['aiwf-design-figma-sync', 'check_figma_tokens.mjs']]) {
    const check = spawnSync(process.execPath, [join(skills, skill, 'scripts', script), '--self-test'], { encoding: 'utf8' });
    assert.equal(check.status, 0, `${skill}/${script}: ${check.stdout}${check.stderr}`);
  }
});

test('design conflict preserves the existing skill and installs nothing', t => {
  const root = project(t);
  const existing = join(root, '.agents/skills/aiwf-design-trace');
  mkdirSync(existing, { recursive: true });
  writeFileSync(join(existing, 'SKILL.md'), 'custom trace');
  assert.throws(() => installSpecSkills(root, { design: true }), /already exists/);
  assert.equal(readFileSync(join(existing, 'SKILL.md'), 'utf8'), 'custom trace');
  assert.equal(existsSync(join(root, '.agents/skills/aiwf-workflow')), false);
  assert.throws(() => installSpecSkills(root, { design: 'yes' }), /design must be true or false/);
});

test('installer CLI accepts --design once', t => {
  const root = project(t);
  const run = args => spawnSync(process.execPath, ['scripts/install-spec-skills.mjs', '--project', root, ...args], { encoding: 'utf8' });
  const dry = run(['--design', '--dry-run']);
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(JSON.parse(dry.stdout).destinations.filter(path => /aiwf-design-/.test(path)).length, 5);
  assert.equal(run(['--design', '--design']).status, 1);
  assert.equal(existsSync(join(root, '.agents')), false);
});
