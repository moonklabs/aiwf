import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const plugin = fileURLToPath(new URL('../../plugins/aiwf-core/', import.meta.url));
const provenance = JSON.parse(readFileSync(`${plugin}UPSTREAM.json`, 'utf8'));

test('all seven upstream core skills retain their exact original bytes', () => {
  const manifests = Object.entries(provenance.upstream_sha256).filter(([path]) => path.endsWith('/SKILL.md'));
  assert.equal(manifests.length, 7);
  for (const [path, expected] of manifests) {
    const hash = createHash('sha256').update(readFileSync(`${plugin}${path}`)).digest('hex');
    assert.equal(hash, expected, path);
    assert.equal(provenance.modified_sha256[path], undefined, path);
  }
});
