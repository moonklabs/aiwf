import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const skillsRoot = fileURLToPath(new URL('../skills/', import.meta.url));
const expectedNames = [
  'aiwf',
  'aiwf-backend-dev-guidelines',
  'aiwf-error-tracking',
  'aiwf-frontend-dev-guidelines',
  'aiwf-route-tester',
  'aiwf-skill-developer',
  'aiwf-spec-driven-development'
];

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(target) : entry.name.endsWith('.md') ? [target] : [];
  });
}

describe('portable Agent Skills package', () => {
  test('publishes a core workflow and the six existing specialist skills', () => {
    const names = fs.readdirSync(skillsRoot)
      .filter(name => fs.existsSync(path.join(skillsRoot, name, 'SKILL.md')))
      .sort();
    expect(names).toEqual(expectedNames);
  });

  test.each(expectedNames)('%s has valid metadata and bundled references', name => {
    const directory = path.join(skillsRoot, name);
    const content = fs.readFileSync(path.join(directory, 'SKILL.md'), 'utf8');
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    expect(frontmatter).not.toBeNull();
    const metadata = yaml.load(frontmatter[1]);
    expect(metadata.name).toBe(name);
    expect(metadata.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(metadata.name.length).toBeLessThanOrEqual(64);
    expect(typeof metadata.description).toBe('string');
    expect(metadata.description.length).toBeGreaterThan(0);
    expect(metadata.description.length).toBeLessThanOrEqual(1024);

  });

  test.each(expectedNames)('%s includes working links throughout bundled documents', name => {
    const skillRoot = path.join(skillsRoot, name);
    for (const file of markdownFiles(skillRoot)) {
      // Examples inside fenced blocks describe host-project files rather than skill resources.
      const document = fs.readFileSync(file, 'utf8')
        .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '');
      for (const match of document.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        const target = match[1].split('#')[0];
        if (!target || /^[a-z]+:\/\//i.test(target)) {
          continue;
        }
        const resolved = path.resolve(path.dirname(file), target);
        expect(path.relative(skillRoot, resolved).startsWith('..')).toBe(false);
        expect({ file, target, exists: fs.existsSync(resolved) }).toEqual({ file, target, exists: true });
      }
    }
  });
});
