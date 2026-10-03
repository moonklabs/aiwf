import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { installSpecSkills, supportedDelegates, supportedStacks } from '../../scripts/install-spec-skills.mjs';

function project(t) {
  const root = mkdtempSync(join(tmpdir(), 'aiwf-install-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test('dry run writes nothing, real install retains parser siblings and attribution', t => {
  const root = project(t);
  const dry = installSpecSkills(root, { dryRun: true });
  assert.equal(dry.destinations.length, 8);
  assert.equal(dry.destinations.some(path => /aiwf-delegate-(claude|codex)$/.test(path)), false);
  assert.equal(existsSync(join(root, '.agents')), false);
  const result = installSpecSkills(root);
  assert.equal(result.installed.length, 8);
  const skills = join(root, '.agents/skills');
  assert.match(readFileSync(join(skills, 'aiwf-workflow/SKILL.md'), 'utf8'), /name: aiwf-workflow/);
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

test('stack install includes core, isolated stack names and mapped cross-skill references', t => {
  const root = project(t);
  const result = installSpecSkills(root, { stack: 'nestjs-nextjs' });
  assert.equal(result.installed.length, 13);
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
  const counts = { claude: 9, codex: 9 };
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
  assert.equal(installSpecSkills(root, { delegates: ['claude', 'codex', 'claude'], dryRun: true }).destinations.length, 10);
  assert.throws(() => installSpecSkills(root, { delegates: ['../../outside'] }), /Unknown delegate/);
  assert.equal(existsSync(join(root, '.agents')), false);
});

test('each optional stack installs its complete isolated bundle', t => {
  const counts = { 'vaadin-jooq': 8, 'angular-jpa': 6, 'blazor-dotnet': 5, 'nestjs-nextjs': 5 };
  for (const stack of supportedStacks) {
    const root = project(t);
    const dry = installSpecSkills(root, { stack, dryRun: true });
    assert.equal(dry.destinations.length, 8 + counts[stack]);
    assert.equal(existsSync(join(root, '.agents')), false);
    const result = installSpecSkills(root, { stack });
    assert.equal(result.installed.length, dry.destinations.length);
    const implement = join(root, '.agents/skills', `aiwf-${stack}-implement`);
    assert.match(readFileSync(join(implement, 'SKILL.md'), 'utf8'), new RegExp(`^name: aiwf-${stack}-implement$`, 'm'));
    assert.match(readFileSync(join(implement, 'NOTICE'), 'utf8'), /AI Unified Process/);
    if (stack === 'angular-jpa' || stack === 'vaadin-jooq') {
      assert.equal(existsSync(join(implement, 'agents/uc-coverage.md')), true);
    }
  }
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
  assert.equal(JSON.parse(dry.stdout).destinations.length, 13);
  assert.equal(run(['--stack']).status, 1);
  assert.equal(run(['--stack', 'invalid']).status, 1);
  assert.equal(run(['--stack', 'blazor-dotnet', '--stack', 'angular-jpa']).status, 1);
  const both = run(['--delegate', 'claude', '--delegate', 'codex', '--dry-run']);
  assert.equal(both.status, 0, both.stderr);
  assert.equal(JSON.parse(both.stdout).destinations.length, 10);
  assert.equal(run(['--delegate']).status, 1);
  assert.equal(run(['--delegate', 'invalid']).status, 1);
  assert.equal(existsSync(join(root, '.agents')), false);
});
