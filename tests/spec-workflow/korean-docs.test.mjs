import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { checkKoreanDocs } from '../../scripts/check-korean-docs.mjs';

const hash = text => createHash('sha256').update(text).digest('hex');
const source = '---\nname: one\ndescription: Example.\n---\n\n# One\n\n## Steps\n\n```sh\necho FR-001\n```\n';
const translation = '# 한글 검토본\n\n## 절차\n\n```sh\necho FR-001\n```\n';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'aiwf-korean-docs-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  const entry = {
    source: 'plugins/aiwf-test/skills/one/SKILL.md',
    translation: 'docs/ko-skills/aiwf-test/skills/one/SKILL.ko.md',
    scope: 'repository',
    source_sha256: hash(source),
    translation_sha256: hash(translation),
    review_status: 'awaiting_review'
  };
  const manifest = { schema_version: 1, local_sources: [], documents: [entry] };
  const save = () => put('docs/ko-skills/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  put(entry.source, source);
  put(entry.translation, translation);
  put('docs/ko-skills/README.md', '[전체 목록](CATALOG.md)\n');
  put('docs/ko-skills/CATALOG.md', `[한글 검토본](${entry.translation.slice('docs/ko-skills/'.length)})\n`);
  save();
  return { root, put, save, entry, manifest, check: (options = {}) => checkKoreanDocs(root, { localHome: join(root, 'home'), ...options }) };
}

test('documentation checks preserve pending human review and do not write files', t => {
  const f = fixture(t);
  const before = readFileSync(join(f.root, 'docs/ko-skills/manifest.json'), 'utf8');
  const result = f.check();
  assert.deepEqual(result.errors, []);
  assert.equal(result.awaitingReview, 1);
  assert.equal(result.humanReviewed, 0);
  assert.equal(readFileSync(join(f.root, 'docs/ko-skills/manifest.json'), 'utf8'), before);
});

test('source edits and new supporting documents require translation updates', t => {
  const f = fixture(t);
  f.put(f.entry.source, `${source}\nNew mandatory condition.\n`);
  f.put('plugins/aiwf-test/skills/one/references/checklist.md', '# Required checklist\n');
  const errors = f.check().errors.join('\n');
  assert.match(errors, /원문 변경/);
  assert.match(errors, /목록 누락.*checklist\.md/);
});

test('plugin README files are required in the Korean review catalog', t => {
  const f = fixture(t);
  const sourcePath = 'plugins/aiwf-test/README.md';
  const translationPath = 'docs/ko-skills/aiwf-test/README.ko.md';
  const source = '# Test plugin\n\nInstall `aiwf-test` from the marketplace.\n';
  const translation = '# 테스트 플러그인\n\n마켓플레이스에서 `aiwf-test`를 설치합니다.\n';
  f.put(sourcePath, source);

  assert.match(f.check().errors.join('\n'), /원문 목록 누락.*plugins\/aiwf-test\/README\.md/);

  f.put(translationPath, translation);
  f.manifest.documents.push({
    source: sourcePath,
    translation: translationPath,
    scope: 'repository',
    source_sha256: hash(source),
    translation_sha256: hash(translation),
    review_status: 'awaiting_review'
  });
  f.put('docs/ko-skills/CATALOG.md', `[한글 검토본](${f.entry.translation.slice('docs/ko-skills/'.length)})\n[플러그인 안내](${translationPath.slice('docs/ko-skills/'.length)})\n`);
  f.save();

  assert.deepEqual(f.check().errors, []);
});

test('translation changes, missing files and unlisted translations fail checks', t => {
  const f = fixture(t);
  f.put(f.entry.translation, `${translation}\n추가 설명\n`);
  f.put('docs/ko-skills/aiwf-test/orphan.ko.md', '# 누락\n');
  assert.match(f.check().errors.join('\n'), /번역 변경/);
  assert.match(f.check().errors.join('\n'), /번역 목록 누락.*orphan/);
  rmSync(join(f.root, f.entry.translation));
  assert.match(f.check().errors.join('\n'), /번역 파일 누락/);
});

test('refreshing hashes cannot hide a changed executable example', t => {
  const f = fixture(t);
  const changed = translation.replace('echo FR-001', 'echo FR-002');
  f.put(f.entry.translation, changed);
  f.entry.translation_sha256 = hash(changed);
  f.save();
  assert.match(f.check().errors.join('\n'), /코드 블록 불일치/);
});

test('broken review links and installable review filenames are rejected', t => {
  const f = fixture(t);
  const changed = `${translation}\n[참조](missing.ko.md)\n`;
  f.put(f.entry.translation, changed);
  f.entry.translation_sha256 = hash(changed);
  f.put('docs/ko-skills/unwanted/SKILL.md', '# 설치용 문서\n');
  f.save();
  const errors = f.check().errors.join('\n');
  assert.match(errors, /깨진 문서 링크/);
  assert.match(errors, /설치용 SKILL\.md/);
});

test('human review must name the exact source and translation versions', t => {
  const f = fixture(t);
  f.entry.review_status = 'human_reviewed';
  f.save();
  assert.match(f.check().errors.join('\n'), /휴먼 리뷰 기록/);
  f.entry.human_review = {
    reviewer: 'Fixture reviewer', reviewed_at: '2026-10-03T00:00:00Z',
    source_sha256: f.entry.source_sha256, translation_sha256: '0'.repeat(64)
  };
  f.save();
  assert.match(f.check().errors.join('\n'), /휴먼 리뷰 버전/);
  f.entry.human_review.translation_sha256 = f.entry.translation_sha256;
  f.save();
  assert.deepEqual(f.check().errors, []);
  assert.equal(f.check().humanReviewed, 1);
});

test('malformed upstream Markdown samples allow a recorded display repair without changing payloads', t => {
  const f = fixture(t);
  const original = '---\nname: one\ndescription: Example.\n---\n\n## Sample\n\n```markdown\n# Example\n\n```mermaid\nerDiagram\n```\n\n### Entity\n\n| Name | Type |\n|---|---|\n| Id | Long |\n```\n\n## Following instructions\n';
  const corrected = '# 예제\n\n중첩 예제의 내용은 원문을 보존했습니다.\n\n````markdown\n# Example\n\n```mermaid\nerDiagram\n```\n\n### Entity\n\n| Name | Type |\n|---|---|\n| Id | Long |\n````\n\n## 뒤따르는 절차\n\n한글로 작성한 실행 절차입니다.\n';
  const nestedOriginal = original.replace('---\nname: one\ndescription: Example.\n---\n', '');
  f.put(f.entry.source, nestedOriginal);
  f.put(f.entry.translation, corrected);
  f.entry.source_sha256 = hash(nestedOriginal);
  f.entry.translation_sha256 = hash(corrected);
  f.entry.rendering_adjustments = [{ kind: 'nested_markdown_fence', reason: '중첩된 Markdown 예제가 원문 후속 절차를 삼키지 않도록 바깥 펜스만 늘려 표시함.', source_sha256: hash(nestedOriginal), translation_sha256: hash(corrected) }];
  f.save();
  assert.deepEqual(f.check().errors, []);
  f.put(f.entry.translation, corrected.replace('erDiagram', 'classDiagram'));
  f.entry.translation_sha256 = hash(readFileSync(join(f.root, f.entry.translation)));
  f.save();
  assert.match(f.check().errors.join('\n'), /코드 블록 불일치/);
  const invalidDisplay = corrected.replace('````markdown\n', '```markdown\n').replace('\n````\n\n## 뒤따르는', '\n```\n\n## 뒤따르는');
  f.put(f.entry.translation, invalidDisplay);
  f.entry.translation_sha256 = hash(invalidDisplay);
  f.entry.rendering_adjustments[0].translation_sha256 = hash(invalidDisplay);
  f.save();
  assert.match(f.check().errors.join('\n'), /렌더링 안전/);
});

test('an unterminated source Markdown example can be closed at a recorded boundary', t => {
  const f = fixture(t);
  const original = `${source}\n\n\`\`\`markdown\n# Example\n\n| Name | Type |\n|---|---|\n| Id | Long |\n\n## Following instructions\n\nEnd.\n`;
  const corrected = `${translation}\n\n\`\`\`\`markdown\n# Example\n\n| Name | Type |\n|---|---|\n| Id | Long |\n\`\`\`\`\n\n## Following instructions\n\n이후 지시입니다.\n`;
  f.put(f.entry.source, original);
  f.put(f.entry.translation, corrected);
  f.entry.source_sha256 = hash(original);
  f.entry.translation_sha256 = hash(corrected);
  f.entry.rendering_adjustments = [{ kind: 'unterminated_markdown_fence', end_before_source_line: '## Following instructions', reason: '원문의 Markdown 예시 바깥 펜스가 닫히지 않아 이후 지시를 삼키므로, 지정된 제목 직전에 닫음.', source_sha256: hash(original), translation_sha256: hash(corrected) }];
  f.save();
  assert.deepEqual(f.check().errors, []);
  f.put(f.entry.translation, corrected.replace('Id | Long', 'Id | String'));
  f.entry.translation_sha256 = hash(readFileSync(join(f.root, f.entry.translation)));
  f.entry.rendering_adjustments[0].translation_sha256 = f.entry.translation_sha256;
  f.save();
  assert.match(f.check().errors.join('\n'), /코드 블록 불일치/);
});

test('fence length may change without changing example payload or language', t => {
  const f = fixture(t);
  const changed = translation.replace('```sh\n', '````sh\n').replace('\n```\n', '\n````\n');
  f.put(f.entry.translation, changed);
  f.entry.translation_sha256 = hash(changed);
  f.save();
  assert.deepEqual(f.check().errors, []);
});

test('fence-like source text in a shell example does not start a nested Markdown block', t => {
  const f = fixture(t);
  const original = source.replace('echo FR-001', 'printf "%s\\n" "```java"\necho FR-001');
  const korean = translation.replace('echo FR-001', 'printf "%s\\n" "```java"\necho FR-001');
  f.put(f.entry.source, original);
  f.put(f.entry.translation, korean);
  f.entry.source_sha256 = hash(original);
  f.entry.translation_sha256 = hash(korean);
  f.save();
  assert.deepEqual(f.check().errors, []);
});

test('source inline commands and identifiers cannot be silently changed in human review copies', t => {
  const f = fixture(t);
  const original = `${source}\n현재 \`FR-001\` 요구사항을 설명합니다.\n`;
  const changed = `${translation}\n현재 \`FR-009\` 요구사항을 설명합니다.\n`;
  f.put(f.entry.source, original);
  f.put(f.entry.translation, changed);
  f.entry.source_sha256 = hash(original);
  f.entry.translation_sha256 = hash(changed);
  f.save();
  assert.match(f.check().errors.join('\n'), /원문 인라인 명령·식별자 누락 가능성/);
});

test('inline code wrapped across Markdown lines keeps the same rendered value', t => {
  const f = fixture(t);
  const original = `${source}\n\n\`UC-004 step 7: payment timeout handled as\n  a declined payment\`\n`;
  const sameRenderedValue = `${translation}\n\n\`UC-004 step 7: payment timeout handled as a declined payment\`\n`;
  f.put(f.entry.source, original);
  f.put(f.entry.translation, sameRenderedValue);
  f.entry.source_sha256 = hash(original);
  f.entry.translation_sha256 = hash(sameRenderedValue);
  f.save();
  assert.deepEqual(f.check().errors, []);
});

test('reference links, balanced parentheses, angle destinations and bad escapes are reported', t => {
  const f = fixture(t);
  const text = `${translation}\n\n[보고서](<ok%20file.ko.md>)\n[대안](foo(1).md)\n[참조][guide] [누락][missing]\n\n[guide]: missing.ko.md\n`;
  f.put(f.entry.translation, text);
  f.entry.translation_sha256 = hash(text);
  f.put('docs/ko-skills/aiwf-test/skills/one/ok file.ko.md', '# 한글\n');
  f.put('docs/ko-skills/aiwf-test/skills/one/foo(1).md', '# 한글\n');
  f.save();
  assert.match(f.check().errors.join('\n'), /깨진 문서 링크/);
  assert.match(f.check().errors.join('\n'), /정의되지 않은 참조 missing/);
  const malformed = `${translation}\n\n[누락](100%-coverage.md)\n`;
  f.put(f.entry.translation, malformed);
  f.entry.translation_sha256 = hash(malformed);
  f.save();
  assert.match(f.check().errors.join('\n'), /잘못된 문서 링크 인코딩/);
});

test('local snapshots report machine drift without making regular checks machine-dependent', t => {
  const f = fixture(t);
  const snapshot = 'docs/ko-skills/local/example/source/SKILL.source.md';
  const target = 'docs/ko-skills/local/example/SKILL.ko.md';
  f.put(snapshot, source);
  f.put(target, translation);
  f.manifest.local_sources.push({ name: 'example', installed_root: '~/.codex/skills/example', snapshot_root: 'docs/ko-skills/local/example/source' });
  f.manifest.documents.push({ ...f.entry, source: snapshot, translation: target, scope: 'local_snapshot' });
  f.put('docs/ko-skills/CATALOG.md', f.manifest.documents.map(document => `[검토](${document.translation.slice('docs/ko-skills/'.length)})`).join('\n'));
  f.save();
  assert.deepEqual(f.check().errors, []);
  assert.equal(f.check().localUnavailable.length, 1);
  f.put('home/.codex/skills/example/SKILL.md', source);
  f.put('home/.codex/skills/example/references/new.md', '# new\n');
  assert.deepEqual(f.check().errors, []);
  assert.equal(f.check().localDrift.length, 1);
  assert.match(f.check({ strictLocal: true }).errors.join('\n'), /로컬 설치 원문 변경/);
});

test('awaiting a new human review removes a former live review record', t => {
  const f = fixture(t);
  f.entry.human_review = { reviewer: 'Reviewer', reviewed_at: '2026-10-03T00:00:00Z', source_sha256: f.entry.source_sha256, translation_sha256: f.entry.translation_sha256 };
  f.save();
  assert.match(f.check().errors.join('\n'), /대기 상태의 휴먼 리뷰 정보/);
});

test('duplicate mappings and paths outside the repository fail without reading them', t => {
  const f = fixture(t);
  f.manifest.documents.push({ ...f.entry });
  f.manifest.documents.push({ ...f.entry, source: '../outside.md' });
  f.save();
  const errors = f.check().errors.join('\n');
  assert.match(errors, /중복/);
  assert.match(errors, /허용되지 않은/);
});
