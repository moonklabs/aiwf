import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Provenance guard for the four AIUP stack plugins imported into AIWF.
//
// These plugins are a byte-identical copy of the upstream AI Unified Process
// stack plugins pinned at UPSTREAM.commit. Only README.md, UPSTREAM.json and
// .claude-plugin/plugin.json are AIWF-owned; every other file must hash to the
// recorded upstream value and no source file may be modified.

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const REFERENCE = process.env.AIWF_AIUP_REFERENCE || '/private/tmp/aiwf-aiup-reference-20261002';

const UPSTREAM_REPOSITORY = 'https://github.com/AI-Unified-Process/marketplace';
const UPSTREAM_COMMIT = '065dadda0f696c29ff2bacbda31b38152082e6fa';

// Byte-identical across every AIUP stack plugin and shared with aiwf-spec.
const APACHE_LICENSE_SHA256 = '596288b7c2507b134a18f9f1bfc4d5e415be0f910989d4787b840126a47ba6ac';
const AIUP_NOTICE_SHA256 = 'b61bb9b9d48a9c7d5ebd971d936f406f08656560ea190e35932260ca65b128fd';

const STACKS = [
  {
    plugin: 'aiwf-vaadin-jooq',
    source: 'aiup-vaadin-jooq',
    version: '2.20.0',
    author: 'Simon Martinelli',
    agents: ['uc-coverage.md'],
    skills: [
      'browserless-test',
      'coverage-check',
      'flyway-migration',
      'hilla-test',
      'implement-hilla',
      'implement',
      'karibu-test',
      'playwright-test'
    ]
  },
  {
    plugin: 'aiwf-angular-jpa',
    source: 'aiup-angular-jpa',
    version: '0.7.0',
    author: 'Marc Affolter',
    agents: ['uc-coverage.md'],
    skills: [
      'coverage-check',
      'flyway-migration',
      'implement',
      'playwright-test',
      'spring-boot-test',
      'vitest-test'
    ]
  },
  {
    plugin: 'aiwf-blazor-dotnet',
    source: 'aiup-blazor-dotnet',
    version: '0.7.0',
    author: 'Carl J. Mosca',
    agents: [],
    skills: ['bunit-test', 'dotnet-test', 'ef-migration', 'implement', 'playwright-test']
  },
  {
    plugin: 'aiwf-nestjs-nextjs',
    source: 'aiup-nestjs-nextjs',
    version: '0.4.0',
    author: 'Swift Ugandan',
    agents: [],
    skills: ['drizzle-migration', 'implement', 'nest-test', 'playwright-test', 'react-test']
  }
];

const EXPECTED_SKILL_TOTAL = 24;

// AIWF-owned files; everything else under the plugin must trace to upstream.
const OWN_FILES = new Set(['README.md', 'UPSTREAM.json', '.claude-plugin/plugin.json']);

function pluginDir(stack) {
  return path.join(ROOT, 'plugins', stack.plugin);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

// Relative POSIX paths of every file below dir, measured from the original root.
function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { return walk(full, base); }
    return [path.relative(base, full).split(path.sep).join('/')];
  });
}

// The imported upstream surface: every file except our own README/manifest.
function importedSurface(stack) {
  return walk(pluginDir(stack)).filter(rel => !OWN_FILES.has(rel)).sort();
}

function skillNames(stack) {
  const dir = path.join(pluginDir(stack), 'skills');
  if (!fs.existsSync(dir)) { return []; }
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

test('all four AIUP stack plugins are imported with AIWF-branded manifests', () => {
  for (const stack of STACKS) {
    const dir = pluginDir(stack);
    assert.ok(fs.existsSync(dir), `missing plugin folder: plugins/${stack.plugin}`);
    for (const rel of ['README.md', 'UPSTREAM.json', 'LICENSE', 'NOTICE', '.claude-plugin/plugin.json']) {
      assert.ok(fs.existsSync(path.join(dir, rel)), `plugins/${stack.plugin}/${rel} is missing`);
    }
    const manifest = readJson(path.join(dir, '.claude-plugin/plugin.json'));
    assert.equal(manifest.name, stack.plugin, `${stack.plugin} manifest name`);
    assert.equal(manifest.version, stack.version, `${stack.plugin} keeps the original upstream version`);
    assert.equal(manifest.author?.name, stack.author, `${stack.plugin} credits the original author`);
    assert.equal(manifest.license, 'Apache-2.0');

    const provenance = readJson(path.join(dir, 'UPSTREAM.json'));
    assert.equal(provenance.repository, UPSTREAM_REPOSITORY);
    assert.equal(provenance.commit, UPSTREAM_COMMIT);
    assert.equal(provenance.source, stack.source);
    assert.equal(provenance.upstream_version, stack.version);
    assert.equal(provenance.license, 'Apache-2.0');
  }
});

test('every imported byte matches its recorded upstream hash and no source is modified', () => {
  for (const stack of STACKS) {
    const dir = pluginDir(stack);
    const provenance = readJson(path.join(dir, 'UPSTREAM.json'));

    assert.deepEqual(provenance.modifications, [], `${stack.plugin} must not modify upstream source`);
    assert.deepEqual(provenance.modified_sha256, {}, `${stack.plugin} must have no modified hashes`);

    const recorded = Object.keys(provenance.upstream_sha256).sort();
    assert.deepEqual(importedSurface(stack), recorded, `${stack.plugin} import surface differs from provenance`);

    for (const rel of recorded) {
      const file = path.join(dir, rel);
      assert.ok(fs.existsSync(file), `missing imported file ${stack.plugin}/${rel}`);
      assert.equal(sha256(file), provenance.upstream_sha256[rel], `${stack.plugin}/${rel} is not byte-identical to upstream`);
    }

    const imported = provenance.imported.join(' ');
    assert.match(imported, /skills\//);
    assert.match(imported, /rules\//);
    assert.match(imported, /LICENSE/);
    assert.match(imported, /NOTICE/);
    assert.equal(/agents\//.test(imported), stack.agents.length > 0, `${stack.plugin} agents import intent`);
  }
});

test('the four stacks expose exactly 24 unchanged upstream skills', () => {
  let total = 0;
  for (const stack of STACKS) {
    const names = skillNames(stack);
    assert.deepEqual(names, [...stack.skills].sort(), `${stack.plugin} skill set mismatch`);
    for (const name of names) {
      const file = path.join(pluginDir(stack), 'skills', name, 'SKILL.md');
      assert.ok(fs.existsSync(file), `${stack.plugin}/${name}/SKILL.md is missing`);
      assert.match(fs.readFileSync(file, 'utf8'), new RegExp(`^---\\nname: ${name}\\n`), `skill frontmatter mismatch: ${stack.plugin}/${name}`);
    }
    total += names.length;
  }
  assert.equal(total, EXPECTED_SKILL_TOTAL, 'total stack skill count');
});

test('bundled rules and agents ship with the stack and stay linked to real skills', () => {
  for (const stack of STACKS) {
    const dir = pluginDir(stack);
    const rulesFile = path.join(dir, 'rules/mcp-servers.md');
    assert.ok(fs.existsSync(rulesFile), `${stack.plugin} must bundle rules/mcp-servers.md`);

    // The bundled rules may document a subset of the stack skills, but every skill
    // name they mention must actually ship in the stack.
    const names = new Set(skillNames(stack));
    const ruleText = fs.readFileSync(rulesFile, 'utf8');
    const documented = [...ruleText.matchAll(/`([a-z][a-z0-9-]+)`/g)]
      .map(match => match[1])
      .filter(token => names.has(token));
    assert.ok(documented.length > 0, `${stack.plugin} bundled rules must reference stack skills`);

    const agentsDir = path.join(dir, 'agents');
    if (stack.agents.length > 0) {
      for (const agent of stack.agents) {
        assert.ok(fs.existsSync(path.join(agentsDir, agent)), `${stack.plugin} must bundle agents/${agent}`);
      }
      const skillText = walk(path.join(dir, 'skills'))
        .filter(rel => /SKILL\.md$/.test(rel))
        .map(rel => fs.readFileSync(path.join(dir, 'skills', rel), 'utf8'))
        .join('\n');
      assert.match(skillText, /agents\/uc-coverage\.md/, `${stack.plugin} coverage-check must reference the bundled agent`);
    } else {
      assert.equal(fs.existsSync(agentsDir), false, `${stack.plugin} bundles no host agents`);
    }
  }
});

test('LICENSE and NOTICE are the byte-identical upstream Apache-2.0 artifacts', () => {
  for (const stack of STACKS) {
    const dir = pluginDir(stack);
    assert.ok(fs.existsSync(path.join(dir, 'LICENSE')), `${stack.plugin} LICENSE is missing`);
    assert.ok(fs.existsSync(path.join(dir, 'NOTICE')), `${stack.plugin} NOTICE is missing`);
    assert.equal(sha256(path.join(dir, 'LICENSE')), APACHE_LICENSE_SHA256, `${stack.plugin} LICENSE`);
    assert.equal(sha256(path.join(dir, 'NOTICE')), AIUP_NOTICE_SHA256, `${stack.plugin} NOTICE`);
  }
});

test('imported bytes equal the pinned reference checkout when it is available', t => {
  if (!fs.existsSync(path.join(REFERENCE, '.git'))) {
    t.diagnostic(`pinned reference not present at ${REFERENCE}; skipping byte cross-check`);
    return;
  }
  for (const stack of STACKS) {
    const dir = pluginDir(stack);
    const provenance = readJson(path.join(dir, 'UPSTREAM.json'));
    for (const rel of Object.keys(provenance.upstream_sha256)) {
      const referenceFile = path.join(REFERENCE, stack.source, rel);
      assert.ok(fs.existsSync(referenceFile), `reference missing ${stack.source}/${rel}`);
      assert.deepEqual(
        fs.readFileSync(path.join(dir, rel)),
        fs.readFileSync(referenceFile),
        `${stack.plugin}/${rel} differs from the pinned reference`
      );
    }
  }
});
