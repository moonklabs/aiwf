#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const assetsRoot = fileURLToPath(new URL('../assets/', import.meta.url));
const directories = [
  '01_PROJECT_DOCS', '02_REQUIREMENTS', '03_SPRINTS', '04_GENERAL_TASKS',
  '05_ARCHITECTURAL_DECISIONS', '10_STATE_OF_PROJECT', '98_PROMPTS', '99_TEMPLATES'
];
const statuses = ['open', 'in_progress', 'pending_review', 'done', 'blocked', 'failed'];

async function inspect(target) {
  try {
    return await fs.lstat(target);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function ensureDirectory(target) {
  const existing = await inspect(target);
  if (existing) {
    if (existing.isSymbolicLink() || !existing.isDirectory()) {
      throw new Error(`Expected a directory without a symbolic link: ${target}`);
    }
    return;
  }
  await fs.mkdir(target);
}

async function writeMissing(target, content) {
  try {
    await fs.writeFile(target, content, { flag: 'wx' });
    return true;
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
    const existing = await fs.lstat(target);
    if (existing.isSymbolicLink() || !existing.isFile()) {
      throw new Error(`Expected a regular project file: ${target}`);
    }
    return false;
  }
}

export async function initializeProject(projectDirectory) {
  const root = await fs.realpath(projectDirectory);
  if (!(await fs.stat(root)).isDirectory()) {
    throw new Error(`Project is not a directory: ${root}`);
  }
  const aiwfRoot = path.join(root, '.aiwf');
  await ensureDirectory(aiwfRoot);
  for (const directory of directories) {
    await ensureDirectory(path.join(aiwfRoot, directory));
  }

  const files = [
    ['project-manifest.md', '00_PROJECT_MANIFEST.md'],
    ['progress.md', 'aiwf-progress.md'],
    ['task.md', '99_TEMPLATES/task_template.md'],
    ['milestone.md', '99_TEMPLATES/milestone_template.md'],
    ['sprint.md', '99_TEMPLATES/sprint_template.md']
  ];
  const report = { project: root, created: [], preserved: [] };
  for (const [asset, destination] of files) {
    const content = (await fs.readFile(path.join(assetsRoot, asset), 'utf8'))
      .replaceAll('{{PROJECT_NAME}}', () => path.basename(root))
      .replaceAll('{{TIMESTAMP}}', new Date().toISOString());
    const created = await writeMissing(path.join(aiwfRoot, destination), content);
    report[created ? 'created' : 'preserved'].push(`.aiwf/${destination}`);
  }
  return report;
}

function frontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:[ \\t]*([^\\n\\r]*)`, 'm'));
  if (!match) {
    return null;
  }
  return match[1].split(/\s+#/)[0].trim().replace(/^(['"])(.*)\1$/, '$2');
}

export async function readProjectStatus(projectDirectory) {
  const root = await fs.realpath(projectDirectory);
  const aiwfRoot = path.join(root, '.aiwf');
  const report = {
    project: root, initialized: false, tasks: [],
    counts: Object.fromEntries(statuses.map(status => [status, 0])),
    invalidTasks: [], warnings: []
  };
  const existing = await inspect(aiwfRoot);
  if (!existing) {
    return report;
  }
  if (existing.isSymbolicLink() || !existing.isDirectory()) {
    throw new Error(`Expected a directory without a symbolic link: ${aiwfRoot}`);
  }
  report.initialized = Boolean(await inspect(path.join(aiwfRoot, '00_PROJECT_MANIFEST.md')));

  async function scan(directory) {
    const stat = await inspect(directory);
    if (!stat) {
      return;
    }
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      report.warnings.push(`Skipped non-directory or symbolic link: ${path.relative(root, directory)}`);
      return;
    }
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        report.warnings.push(`Skipped symbolic link: ${path.relative(root, target)}`);
      } else if (entry.isDirectory()) {
        await scan(target);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = (await fs.readFile(target, 'utf8')).replace(/^\uFEFF/, '');
        const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
        const taskId = frontmatter ? frontmatterValue(frontmatter, 'task_id') : null;
        if (!taskId) {
          if (/^T\d/i.test(entry.name) || /\*\*(?:Status|상태)\*\*\s*:|^#+\s*T\d+/im.test(content)) {
            report.warnings.push(`Legacy or incomplete task metadata; inspect this file before resuming: ${path.relative(root, target).split(path.sep).join('/')}`);
          }
          continue;
        }
        const status = frontmatterValue(frontmatter, 'status');
        const task = { task_id: taskId, status, path: path.relative(root, target).split(path.sep).join('/') };
        report.tasks.push(task);
        if (statuses.includes(status)) {
          report.counts[status] += 1;
        } else {
          report.invalidTasks.push(task);
        }
      }
    }
  }

  await scan(path.join(aiwfRoot, '03_SPRINTS'));
  await scan(path.join(aiwfRoot, '04_GENERAL_TASKS'));
  return report;
}

const invokedPath = process.argv[1] ? await fs.realpath(process.argv[1]).catch(() => null) : null;
const isMainModule = invokedPath === fileURLToPath(import.meta.url);
if (isMainModule) {
  const [action, projectDirectory = process.cwd(), ...extra] = process.argv.slice(2);
  try {
    if (extra.length || !['init', 'status'].includes(action)) {
      throw new Error('Usage: node project.mjs <init|status> [project-directory]');
    }
    const result = action === 'init'
      ? await initializeProject(projectDirectory)
      : await readProjectStatus(projectDirectory);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
