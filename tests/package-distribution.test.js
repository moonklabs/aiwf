import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const marketplace = JSON.parse(
  fs.readFileSync(path.join(projectRoot, '.claude-plugin/marketplace.json'), 'utf8')
);

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

describe('npm plugin and skills distribution', () => {
  let packagedFiles;

  beforeAll(() => {
    const cacheDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'aiwf-pack-test-'));
    try {
      const output = execFileSync('npm', [
        'pack', '--dry-run', '--ignore-scripts', '--json', '--cache', cacheDirectory
      ], { cwd: projectRoot, encoding: 'utf8', timeout: 15000 });
      const [tarball] = JSON.parse(output);
      packagedFiles = new Set(tarball.files.map(file => file.path));
    } finally {
      fs.rmSync(cacheDirectory, { recursive: true, force: true });
    }
  }, 20000);

  test('includes the marketplace registry', () => {
    expect(packagedFiles.has('.claude-plugin/marketplace.json')).toBe(true);
  });

  test.each(marketplace.plugins)('includes every file of $name', plugin => {
    const pluginRoot = path.resolve(projectRoot, plugin.source);
    const pluginFiles = listFiles(pluginRoot);
    expect(pluginFiles.length).toBeGreaterThan(0);

    const missingFiles = pluginFiles
      .map(file => path.relative(projectRoot, file).split(path.sep).join('/'))
      .filter(file => !packagedFiles.has(file));

    expect(missingFiles).toEqual([]);
  });

  test('includes every skill with its scripts, references, and templates', () => {
    const skillFiles = listFiles(path.join(projectRoot, 'skills'));
    expect(skillFiles.filter(file => path.basename(file) === 'SKILL.md')).toHaveLength(7);
    expect(skillFiles.some(file => file.endsWith('scripts/project.mjs'))).toBe(true);
    const missingFiles = skillFiles
      .map(file => path.relative(projectRoot, file).split(path.sep).join('/'))
      .filter(file => !packagedFiles.has(file));
    expect(missingFiles).toEqual([]);
  });
});
