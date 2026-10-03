import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const sourceSkill = fileURLToPath(new URL('../skills/aiwf/', import.meta.url));
let temporaryRoot;
let projectRoot;
let installedScript;

function run(action) {
  return spawnSync(process.execPath, [installedScript, action, projectRoot], {
    encoding: 'utf8', timeout: 10000
  });
}

beforeEach(async () => {
  temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aiwf-project-test-'));
  projectRoot = path.join(temporaryRoot, 'project with spaces');
  const installedSkill = path.join(temporaryRoot, 'installed', 'aiwf');
  await fs.mkdir(projectRoot);
  await fs.cp(sourceSkill, installedSkill, { recursive: true });
  installedScript = path.join(installedSkill, 'scripts', 'project.mjs');
});

afterEach(async () => {
  await fs.rm(temporaryRoot, { recursive: true, force: true });
});

test('installed skill initializes a project using only its bundled files', async () => {
  const result = run('init');
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.created).toContain('.aiwf/00_PROJECT_MANIFEST.md');
  expect(report.created).toContain('.aiwf/aiwf-progress.md');
  const manifest = await fs.readFile(path.join(projectRoot, '.aiwf/00_PROJECT_MANIFEST.md'), 'utf8');
  expect(manifest).toContain('project with spaces');
  const template = await fs.readFile(path.join(projectRoot, '.aiwf/99_TEMPLATES/task_template.md'), 'utf8');
  expect(template).toContain('task_id:');
});

test('initialization preserves existing documents and host guidance on rerun', async () => {
  expect(run('init').status).toBe(0);
  const manifestPath = path.join(projectRoot, '.aiwf/00_PROJECT_MANIFEST.md');
  await fs.writeFile(manifestPath, '# Existing project\nCustom content\n');
  await fs.writeFile(path.join(projectRoot, 'AGENTS.md'), 'Existing Codex guidance');
  await fs.writeFile(path.join(projectRoot, 'CLAUDE.md'), 'Existing Claude guidance');
  const report = run('init');
  expect(report.status).toBe(0);
  expect(JSON.parse(report.stdout).created).toEqual([]);
  expect(await fs.readFile(manifestPath, 'utf8')).toBe('# Existing project\nCustom content\n');
  expect(await fs.readFile(path.join(projectRoot, 'AGENTS.md'), 'utf8')).toBe('Existing Codex guidance');
  expect(await fs.readFile(path.join(projectRoot, 'CLAUDE.md'), 'utf8')).toBe('Existing Claude guidance');
});

test('status summarizes task frontmatter without counting body status fields', async () => {
  expect(run('init').status).toBe(0);
  const taskDirectory = path.join(projectRoot, '.aiwf/04_GENERAL_TASKS');
  await fs.writeFile(path.join(taskDirectory, 'T001.md'), '---\ntask_id: T001\nstatus: done\n---\n# Task\nstatus: failed\n');
  const sprint = path.join(projectRoot, '.aiwf/03_SPRINTS/S01');
  await fs.mkdir(sprint);
  await fs.writeFile(path.join(sprint, 'T01_S01.md'), '---\ntask_id: "T01_S01"\nstatus: open # pending\n---\n# Task\n');
  const result = run('status');
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.tasks).toHaveLength(2);
  expect(report.counts.done).toBe(1);
  expect(report.counts.open).toBe(1);
  expect(report.counts.failed).toBe(0);
});

test('status reports an uninitialized project without creating files', async () => {
  const result = run('status');
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout).initialized).toBe(false);
  expect(await fs.readdir(projectRoot)).toEqual([]);
});

test('initialization refuses a linked .aiwf directory', async () => {
  const externalDirectory = path.join(temporaryRoot, 'other-project');
  await fs.mkdir(externalDirectory);
  await fs.symlink(externalDirectory, path.join(projectRoot, '.aiwf'));
  const result = run('init');
  expect(result.status).toBe(1);
  expect(await fs.readdir(externalDirectory)).toEqual([]);
});

test('status reports unsupported task states instead of treating them as done', async () => {
  expect(run('init').status).toBe(0);
  await fs.writeFile(path.join(projectRoot, '.aiwf/04_GENERAL_TASKS/T001.md'), '---\ntask_id: T001\nstatus: nonsense\n---\n');
  const result = run('status');
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.invalidTasks).toHaveLength(1);
  expect(report.counts.done).toBe(0);
});

test('empty metadata cannot consume the next line or create a completed task', async () => {
  expect(run('init').status).toBe(0);
  await fs.writeFile(path.join(projectRoot, '.aiwf/04_GENERAL_TASKS/T001.md'), '---\ntask_id: T001\nstatus:\nlast_updated: yesterday\n---\n');
  await fs.writeFile(path.join(projectRoot, '.aiwf/04_GENERAL_TASKS/T002.md'), '---\ntask_id:\nstatus: done\n---\n');
  const result = run('status');
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.invalidTasks).toHaveLength(1);
  expect(report.tasks).toHaveLength(1);
  expect(report.invalidTasks[0].status).toBe('');
  expect(Object.values(report.counts).every(count => count === 0)).toBe(true);
});

test('status does not follow linked tasks or modify tracking documents', async () => {
  expect(run('init').status).toBe(0);
  const task = path.join(projectRoot, '.aiwf/04_GENERAL_TASKS/T001.md');
  await fs.writeFile(task, '---\ntask_id: T001\nstatus: open\n---\n');
  const foreignTask = path.join(temporaryRoot, 'foreign.md');
  await fs.writeFile(foreignTask, '---\ntask_id: FOREIGN\nstatus: done\n---\n');
  await fs.symlink(foreignTask, path.join(projectRoot, '.aiwf/04_GENERAL_TASKS/linked.md'));
  const trackedFiles = [task, path.join(projectRoot, '.aiwf/00_PROJECT_MANIFEST.md'), path.join(projectRoot, '.aiwf/aiwf-progress.md')];
  const before = await Promise.all(trackedFiles.map(file => fs.readFile(file, 'utf8')));
  const result = run('status');
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.tasks.map(task => task.task_id)).toEqual(['T001']);
  expect(report.counts.done).toBe(0);
  expect(report.warnings).toHaveLength(1);
  expect(await Promise.all(trackedFiles.map(file => fs.readFile(file, 'utf8')))).toEqual(before);
});

test('status warns about legacy or incomplete tasks instead of silently discarding them', async () => {
  expect(run('init').status).toBe(0);
  const taskDirectory = path.join(projectRoot, '.aiwf/04_GENERAL_TASKS');
  await fs.writeFile(path.join(taskDirectory, 'T501_legacy.md'), '# T501: Existing task\n\n**Status**: completed\n');
  await fs.writeFile(path.join(taskDirectory, 'T502_legacy.md'), '# T502: 기존 작업\n\n**상태**: pending\n');
  await fs.writeFile(path.join(taskDirectory, 'T503_incomplete.md'), '---\nstatus: open\n---\n# Missing task ID\n');
  await fs.writeFile(path.join(taskDirectory, 'README.md'), '# General task notes\n');
  const legacyIndex = path.join(projectRoot, '.aiwf/task-state-index.json');
  await fs.writeFile(legacyIndex, '{"tasks":{"T501":{"status":"completed"}}}\n');
  const result = run('status');
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.tasks).toEqual([]);
  expect(report.warnings).toHaveLength(3);
  for (const name of ['T501_legacy.md', 'T502_legacy.md', 'T503_incomplete.md']) {
    expect(report.warnings.some(warning => warning.includes(name))).toBe(true);
  }
  expect(await fs.readFile(legacyIndex, 'utf8')).toBe('{"tasks":{"T501":{"status":"completed"}}}\n');
});

test('status handles BOM-prefixed task frontmatter', async () => {
  expect(run('init').status).toBe(0);
  await fs.writeFile(path.join(projectRoot, '.aiwf/04_GENERAL_TASKS/T001.md'), '\uFEFF---\ntask_id: T001\nstatus: in_progress\n---\n');
  const result = run('status');
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.tasks).toHaveLength(1);
  expect(report.counts.in_progress).toBe(1);
  expect(report.warnings).toEqual([]);
});

test('initialization treats dollar sequences in the project name literally', async () => {
  const literalName = "project $& $` $'";
  projectRoot = path.join(temporaryRoot, literalName);
  await fs.mkdir(projectRoot);
  const result = run('init');
  expect(result.status).toBe(0);
  const manifest = await fs.readFile(path.join(projectRoot, '.aiwf/00_PROJECT_MANIFEST.md'), 'utf8');
  expect(manifest.split('\n')[0]).toBe(`# ${literalName} — AIWF project manifest`);
  expect(manifest).not.toContain('{{PROJECT_NAME}}');
});
