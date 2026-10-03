/**
 * validate-commands CLI exit-code regression tests.
 *
 * Bug: scripts/validate-commands.js reported result.success=false but still
 * exited 0, and scanCommandsDirectory swallowed readdir errors for missing
 * directories, which produced a false pass.
 */

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPT_PATH = path.resolve(__dirname, '../scripts/validate-commands.js');
const SCRIPT_URL = pathToFileURL(SCRIPT_PATH).href;
const KO_REL = 'claude-code/aiwf/ko/.claude/commands/aiwf';
const EN_REL = 'claude-code/aiwf/en/.claude/commands/aiwf';

const md = (name) => `---\nname: ${name}\ndescription: ${name} command\n---\n\n# ${name}\n\nBody\n`;

const tmpRoots = [];

async function makeRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aiwf-validate-'));
  tmpRoots.push(root);
  return root;
}

async function createDirs(root, { ko = true, en = true } = {}) {
  if (ko) {
    await fs.mkdir(path.join(root, KO_REL), { recursive: true });
  }
  if (en) {
    await fs.mkdir(path.join(root, EN_REL), { recursive: true });
  }
}

async function writeCmd(root, lang, file, content) {
  const rel = lang === 'ko' ? KO_REL : EN_REL;
  await fs.writeFile(path.join(root, rel, file), content ?? md(file.replace(/\.md$/, '')));
}

function runCli(cwd) {
  return spawnSync(process.execPath, [SCRIPT_PATH], { cwd, encoding: 'utf-8', timeout: 10000 });
}

afterAll(async () => {
  await Promise.all(tmpRoots.map((root) => fs.rm(root, { recursive: true, force: true })));
});

describe('validate-commands CLI exit codes', () => {
  test('matching valid markdown commands exit 0', async () => {
    const root = await makeRoot();
    await createDirs(root);
    await writeCmd(root, 'ko', 'aiwf_alpha.md');
    await writeCmd(root, 'en', 'aiwf_alpha.md');

    const result = runCli(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('모든 검증 통과');
  });

  test('asymmetric filenames exit 1', async () => {
    const root = await makeRoot();
    await createDirs(root);
    await writeCmd(root, 'ko', 'aiwf_alpha.md');
    await writeCmd(root, 'en', 'aiwf_beta.md');

    const result = runCli(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('영어 버전 누락: aiwf_alpha.md');
    expect(result.stdout).toContain('한국어 버전 누락: aiwf_beta.md');
  });

  test('both command directories empty exit 1', async () => {
    const root = await makeRoot();
    await createDirs(root);

    const result = runCli(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('명령어 파일을 찾을 수 없습니다');
  });

  test('missing command directory is not swallowed and exits 1', async () => {
    const root = await makeRoot();
    await createDirs(root, { en: false });
    await writeCmd(root, 'ko', 'aiwf_alpha.md');

    const result = runCli(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Error scanning directory');
  });

  test('importing the module does not run the CLI as a side effect', async () => {
    const root = await makeRoot();

    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', `await import(${JSON.stringify(SCRIPT_URL)});`],
      { cwd: root, encoding: 'utf-8', timeout: 10000 }
    );

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('');
  });

  test('exported validation result preserves its public fields', async () => {
    const root = await makeRoot();
    await createDirs(root);
    await writeCmd(root, 'ko', 'aiwf_alpha.md');
    await writeCmd(root, 'en', 'aiwf_alpha.md');

    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      const { validateCommands } = await import(${JSON.stringify(SCRIPT_URL)});
      const result = await validateCommands();
      console.log('VALIDATION_RESULT=' + JSON.stringify(result));
    `], { cwd: root, encoding: 'utf-8', timeout: 10000 });

    expect(result.status).toBe(0);
    const resultLine = result.stdout.split('\n').find(line => line.startsWith('VALIDATION_RESULT='));
    expect(resultLine).toBeDefined();
    const validation = JSON.parse(resultLine.slice('VALIDATION_RESULT='.length));
    expect(Object.keys(validation).sort()).toEqual([
      'issues', 'success', 'totalFiles', 'updateDocsStatus', 'urlIssues'
    ]);
    expect(validation.success).toBe(true);
    expect(validation.issues).toEqual([]);
    expect(validation.urlIssues).toEqual([]);
    expect(validation.totalFiles).toBe(1);
  });
});
