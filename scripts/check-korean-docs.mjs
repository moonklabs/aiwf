#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFileSync(path, 'utf8');
const safePath = path => typeof path === 'string' && path.length > 0
  && !path.startsWith('/') && !path.includes('\\')
  && !path.split('/').some(part => part === '..' || part === '.' || part === '');

function files(root, directory) {
  if (!existsSync(join(root, directory))) { return []; }
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? files(root, path) : [path];
  });
}

function filesBelow(directory) {
  if (!existsSync(directory)) { return []; }
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

// Preserve complete fenced examples, including fence length and language.
function codeBlocks(text) {
  const blocks = [];
  let fence;
  let info = '';
  let nestedFences = [];
  let nestedStack = [];
  let block = [];
  for (const line of text.split('\n')) {
    const match = line.match(/^[ \t]*(`{3,}|~{3,})(.*)$/);
    if (!fence && match) {
      fence = match[1];
      info = match[2].trim();
      nestedFences = [];
      nestedStack = [];
      block = [line];
    } else if (fence) {
      block.push(line);
      if (match && match[1][0] === fence[0]) {
        if (/^(markdown|md)(?:\s|$)/i.test(info) && match[2].trim()) {
          const nested = { char: match[1][0], length: match[1].length };
          nestedFences.push(nested);
          nestedStack.push(nested);
        } else if (!match[2].trim()) {
          const nested = nestedStack.at(-1);
          if (nested && match[1].length >= nested.length) { nestedStack.pop(); }
          else if (match[1].length >= fence.length) {
            blocks.push({ raw: block.join('\n'), language: info, nestedFences, fenceLength: fence.length, closed: true });
            fence = undefined;
          }
        }
      }
    }
  }
  if (fence) { blocks.push({ raw: block.join('\n'), language: info, nestedFences, fenceLength: fence.length, closed: false }); }
  return blocks;
}

function prose(text) {
  for (const block of codeBlocks(text)) { text = text.replace(block.raw, ''); }
  return text.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function inlineCode(text) {
  text = prose(text).replace(/^ {0,3}> ?/gm, '');
  const spans = [];
  for (let index = 0; index < text.length;) {
    if (text[index] !== '`') { index++; continue; }
    let end = index + 1;
    while (text[end] === '`') { end++; }
    const marker = '`'.repeat(end - index);
    let close = text.indexOf(marker, end);
    while (close >= 0 && (text[close - 1] === '`' || text[close + marker.length] === '`')) {
      close = text.indexOf(marker, close + marker.length);
    }
    if (close < 0) { index = end; continue; }
    spans.push(text.slice(end, close).replace(/\r?\n[ \t]*/g, ' '));
    index = close + marker.length;
  }
  return spans.sort();
}

function markdownDestinations(text) {
  text = prose(text).replace(/(`+)[\s\S]*?\1/g, '');
  const links = [];
  const definitions = new Map();
  const definition = /^ {0,3}\[([^\]]+)\]:\s*(?:<([^>\r\n]+)>|([^\s]+))/gm;
  for (const match of text.matchAll(definition)) {
    definitions.set(match[1].trim().toLowerCase().replace(/\s+/g, ' '), match[2] ?? match[3]);
  }
  for (const match of text.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) { links.push({ destination: match[1], source: 'HTML href' }); }
  for (let index = 0; index < text.length;) {
    if (text[index] !== ']') { index++; continue; }
    let next = index + 1;
    if (text[next] === '(') {
      next++;
      while (/[ \t]/.test(text[next] ?? '')) { next++; }
      let destination = '';
      if (text[next] === '<') {
        next++;
        while (next < text.length && (text[next] !== '>' || text[next - 1] === '\\')) { destination += text[next++]; }
        if (text[next] === '>') { next++; }
      } else {
        let depth = 0;
        while (next < text.length) {
          const character = text[next];
          if (character === '\\' && next + 1 < text.length) { destination += text[next + 1]; next += 2; continue; }
          if (character === '(') { depth++; destination += character; next++; continue; }
          if (character === ')') {
            if (depth === 0) { break; }
            depth--; destination += character; next++; continue;
          }
          if (/\s/.test(character) && depth === 0) { break; }
          destination += character;
          next++;
        }
      }
      if (destination) { links.push({ destination, source: 'Markdown link' }); }
      index = next;
    } else {
      while (/[ \t]/.test(text[next] ?? '')) { next++; }
    }
    if (text[next] === '[') {
      const end = text.indexOf(']', next + 1);
      if (end >= 0) {
        const label = (text.slice(next + 1, end) || text.slice(Math.max(0, text.lastIndexOf('[', index - 1) + 1), index)).trim().toLowerCase().replace(/\s+/g, ' ');
        if (definitions.has(label)) { links.push({ destination: definitions.get(label), source: 'Markdown reference' }); }
        else if (label) { links.push({ destination: '', source: `정의되지 않은 참조 ${label}` }); }
        index = end + 1;
      } else { index++; }
    } else if (text[index + 1] !== '(') {
      const start = text.lastIndexOf('[', index - 1);
      const label = start >= 0 ? text.slice(start + 1, index).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      const lineStart = text.lastIndexOf('\n', start) + 1;
      if (label && definitions.has(label) && !/^ {0,3}\[[^\]]+\]:/.test(text.slice(lineStart, index + 1))) {
        links.push({ destination: definitions.get(label), source: 'Markdown shortcut reference' });
      }
      index++;
    }
  }
  for (const [label, destination] of definitions) { links.push({ destination, source: `링크 정의 ${label}` }); }
  return links;
}

export function checkKoreanDocs(root, { localHome = homedir(), strictLocal = false } = {}) {
  const result = { errors: [], documents: 0, skills: 0, awaitingReview: 0, humanReviewed: 0, localUnavailable: [], localDrift: [] };
  const error = message => result.errors.push(message);
  let manifest;
  try { manifest = JSON.parse(read(join(root, 'docs/ko-skills/manifest.json'))); }
  catch (cause) { error(`관리 목록을 읽을 수 없음: ${cause.message}`); return result; }
  if (manifest.schema_version !== 1 || !Array.isArray(manifest.documents) || !Array.isArray(manifest.local_sources)) {
    error('관리 목록 형식 오류: schema_version, documents, local_sources를 확인하세요.');
    return result;
  }

  const required = files(root, 'plugins').filter(path => /^plugins\/[^/]+\/README\.md$/.test(path)
    || /^plugins\/[^/]+\/(skills|rules|agents)\/.+\.md$/.test(path));
  const localFiles = new Map();
  for (const local of manifest.local_sources) {
    if (!local || !/^[a-z0-9-]+$/.test(local.name) || local.snapshot_root !== `docs/ko-skills/local/${local.name}/source`
      || local.installed_root !== `~/.codex/skills/${local.name}`) {
      error('로컬 출처 형식 오류'); continue;
    }
    for (const source of files(root, local.snapshot_root).filter(path => /\.(md|yaml)$/.test(path))) {
      required.push(source);
      const relative = source.slice(local.snapshot_root.length + 1).replace(/^SKILL\.source\.md$/, 'SKILL.md');
      localFiles.set(source, join(localHome, '.codex/skills', local.name, relative));
    }
  }

  const seenSources = new Set();
  const seenTranslations = new Set();
  for (const entry of manifest.documents) {
    if (!entry || !safePath(entry.source) || !safePath(entry.translation)
      || !entry.translation.startsWith('docs/ko-skills/')) {
      error('허용되지 않은 문서 경로'); continue;
    }
    const { source, translation } = entry;
    if (seenSources.has(source) || seenTranslations.has(translation)) { error(`중복 문서 연결: ${source}`); }
    seenSources.add(source);
    seenTranslations.add(translation);
    if (!required.includes(source)) { error(`원문 대상이 삭제되었거나 범위 밖임: ${source}`); }
    const expectedScope = localFiles.has(source) ? 'local_snapshot' : 'repository';
    if (entry.scope !== expectedScope) { error(`원문 범위 불일치: ${source}`); }
    const expectedTranslation = expectedScope === 'repository'
      ? source.replace(/^plugins\//, 'docs/ko-skills/').replace(/\.md$/, '.ko.md')
      : source.replace('/source/', '/').replace(/SKILL\.source\.md$/, 'SKILL.md').replace(/\.(md|yaml)$/, '.ko.md');
    if (translation !== expectedTranslation) { error(`번역 경로 불일치: ${translation}`); }
    if (!existsSync(join(root, source))) { error(`원문 파일 누락: ${source}`); continue; }
    if (!existsSync(join(root, translation))) { error(`번역 파일 누락: ${translation}`); continue; }
    const original = read(join(root, source));
    const korean = read(join(root, translation));
    const sourceHash = digest(readFileSync(join(root, source)));
    const translationHash = digest(readFileSync(join(root, translation)));
    if (entry.source_sha256 !== sourceHash) { error(`원문 변경: ${source} (현재 SHA256 ${sourceHash})`); }
    if (entry.translation_sha256 !== translationHash) { error(`번역 변경: ${translation} (현재 SHA256 ${translationHash})`); }
    if (!/[가-힣]/.test(prose(korean))) { error(`한국어 본문 없음: ${translation}`); }
    if (/^\uFEFF?---\r?\n/.test(korean)) { error(`설치용 frontmatter 금지: ${translation}`); }
    const sourceBlocks = codeBlocks(original);
    const translationBlocks = codeBlocks(korean);
    const matchingPayloads = blocks => blocks.map(({ language, raw }) => {
      const lines = raw.split('\n');
      return { language, payload: lines.slice(1, -1).join('\n') };
    });
    const unterminatedSource = sourceBlocks.find(block => /^(markdown|md)(?:\s|$)/i.test(block.language) && !block.closed);
    const adjustment = entry.rendering_adjustments?.find(item => item?.kind === 'unterminated_markdown_fence');
    let codeBlocksMatch = JSON.stringify(matchingPayloads(sourceBlocks)) === JSON.stringify(matchingPayloads(translationBlocks));
    if (unterminatedSource && adjustment && typeof adjustment.end_before_source_line === 'string') {
      const sourcePayload = unterminatedSource.raw.split('\n').slice(1).join('\n');
      const [sourcePrefix, ...afterMarker] = sourcePayload.split(`${adjustment.end_before_source_line}\n`);
      const adjusted = translationBlocks.find(block => /^(markdown|md)(?:\s|$)/i.test(block.language));
      const translationPayload = adjusted?.raw.split('\n').slice(1, -1).join('\n').trimEnd();
      codeBlocksMatch = Boolean(afterMarker.length && translationPayload === sourcePrefix.trimEnd());
    }
    if (!codeBlocksMatch) { error(`코드 블록 불일치: ${translation}`); }
    for (const block of translationBlocks.filter(block => /^(markdown|md)(?:\s|$)/i.test(block.language))) {
      if (block.nestedFences.some(nested => nested.char === block.raw.match(/^[ \t]*(`+|~+)/)?.[1]?.[0] && nested.length >= block.fenceLength)) {
        error(`Markdown 예제 중첩 펜스 렌더링 안전성 오류: ${translation}`);
      }
    }
    const malformedMarkdown = sourceBlocks.some(block => /^(markdown|md)(?:\s|$)/i.test(block.language)
      && (!block.closed || block.nestedFences.some(nested => nested.char === block.raw.match(/^[ \t]*(`+|~+)/)?.[1]?.[0] && nested.length >= block.fenceLength)));
    if (malformedMarkdown) {
      const adjustment = entry.rendering_adjustments?.find(item => ['nested_markdown_fence', 'unterminated_markdown_fence'].includes(item?.kind));
      const requiredKind = unterminatedSource ? 'unterminated_markdown_fence' : 'nested_markdown_fence';
      const reasonWord = unterminatedSource ? '닫히지' : '중첩';
      if (!adjustment || adjustment.kind !== requiredKind || typeof adjustment.reason !== 'string' || !adjustment.reason.includes(reasonWord)
        || adjustment.source_sha256 !== sourceHash || adjustment.translation_sha256 !== translationHash) {
        error(`원문 Markdown 표시 보정 기록 누락 또는 버전 불일치: ${translation}`);
      }
    } else if (entry.rendering_adjustments?.length) { error(`필요성이 확인되지 않은 표시 보정: ${translation}`); }
    const sourceInlineCode = new Map();
    for (const token of inlineCode(original)) { sourceInlineCode.set(token, (sourceInlineCode.get(token) || 0) + 1); }
    const translatedInlineCode = new Map();
    for (const token of inlineCode(korean)) { translatedInlineCode.set(token, (translatedInlineCode.get(token) || 0) + 1); }
    if ([...sourceInlineCode].some(([token, count]) => (translatedInlineCode.get(token) || 0) < count)) {
      error(`원문 인라인 명령·식별자 누락 가능성: ${translation}`);
    }
    for (const [pattern, label] of [[/^#{1,6}\s/gm, '헤딩'], [/^\s*\|.*\|\s*$/gm, '표 행']]) {
      if ((prose(korean).match(pattern) || []).length < (prose(original).match(pattern) || []).length) {
        error(`${label} 누락 가능성: ${translation}`);
      }
    }
    if (entry.review_status === 'awaiting_review') {
      if (entry.human_review) { error(`대기 상태의 휴먼 리뷰 정보는 삭제하거나 이력으로 보관해야 함: ${translation}`); }
      result.awaitingReview++;
    }
    else if (entry.review_status === 'human_reviewed') {
      const review = entry.human_review;
      if (!review || typeof review.reviewer !== 'string' || !review.reviewer.trim()
        || typeof review.reviewed_at !== 'string' || !Number.isFinite(Date.parse(review.reviewed_at))) {
        error(`휴먼 리뷰 기록 누락: ${translation}`);
      } else if (review.source_sha256 !== sourceHash || review.translation_sha256 !== translationHash) {
        error(`휴먼 리뷰 버전 불일치: ${translation}`);
      } else { result.humanReviewed++; }
    } else { error(`검토 상태 오류: ${translation}`); }
    const installed = localFiles.get(source);
    if (installed && existsSync(installed)) {
      if (digest(readFileSync(installed)) !== sourceHash) {
        result.localDrift.push(source);
        if (strictLocal) { error(`로컬 설치 원문 변경: ${source}`); }
      }
    } else if (installed) { result.localUnavailable.push(source); }
    result.documents++;
    if (/\/SKILL(\.source)?\.md$/.test(source)) { result.skills++; }
  }
  for (const local of manifest.local_sources) {
    if (!local || !/^[a-z0-9-]+$/.test(local.name)) { continue; }
    const installedRoot = join(localHome, '.codex/skills', local.name);
    for (const liveFile of filesBelow(installedRoot).filter(path => /\.(md|yaml)$/.test(path))) {
      const relative = liveFile.slice(installedRoot.length + 1);
      const snapshotRelative = relative.replace(/^SKILL\.md$/, 'SKILL.source.md');
      const snapshotFile = join(root, local.snapshot_root, snapshotRelative);
      const sourcePath = `${local.snapshot_root}/${snapshotRelative}`;
      if (!existsSync(snapshotFile) || digest(readFileSync(liveFile)) !== digest(readFileSync(snapshotFile))) {
        result.localDrift.push(`${local.name}/${relative}`);
        if (strictLocal) { error(`로컬 설치 원문 변경: ${sourcePath}`); }
      }
    }
  }
  for (const source of required) {
    if (!seenSources.has(source)) { error(`원문 목록 누락: ${source}`); }
  }
  const reviewFiles = files(root, 'docs/ko-skills');
  for (const path of reviewFiles) {
    if (path.endsWith('/SKILL.md')) { error(`검토 폴더에 설치용 SKILL.md 금지: ${path}`); }
    if (path.endsWith('.ko.md') && !seenTranslations.has(path)) { error(`번역 목록 누락: ${path}`); }
  }
  const cataloguePath = 'docs/ko-skills/CATALOG.md';
  if (!existsSync(join(root, cataloguePath))) { error('전체 한글 검토 문서 목록이 없음: docs/ko-skills/CATALOG.md'); }
  const catalogueTargets = new Set();
  for (const path of [...seenTranslations, ...files(root, 'docs/ko-skills').filter(file => /^docs\/ko-skills\/[^/]+\.md$/.test(file)), 'README.md', 'README.ko.md', 'CHANGELOG.md']) {
    if (!existsSync(join(root, path))) { continue; }
    for (const { destination, source: linkSource } of markdownDestinations(read(join(root, path)))) {
      if (!destination || /^[a-z][a-z0-9+.-]*:/i.test(destination) || destination.startsWith('#')) {
        if (!destination) { error(`${linkSource} 참조 누락: ${path}`); }
        continue;
      }
      let decoded;
      try { decoded = decodeURIComponent(destination); }
      catch { error(`잘못된 문서 링크 인코딩: ${path} -> ${destination}`); continue; }
      const ref = decoded.split('#')[0].split('?')[0];
      if (!ref) { continue; }
      const target = resolve(root, dirname(path), ref);
      if (target !== root && !target.startsWith(`${root}/`)) { error(`저장소 밖 문서 링크 금지: ${path} -> ${destination}`); continue; }
      if (!existsSync(target)) { error(`깨진 문서 링크: ${path} -> ${destination}`); }
      if (path === cataloguePath && destination.endsWith('.ko.md') && seenTranslations.has(target.slice(root.length + 1))) {
        if (catalogueTargets.has(target)) { error(`목록에 번역 문서가 중복됨: ${destination}`); }
        catalogueTargets.add(target);
      }
    }
  }
  if (existsSync(join(root, cataloguePath))) {
    for (const translation of seenTranslations) if (!catalogueTargets.has(resolve(root, translation))) { error(`전체 문서 목록에서 번역본 누락: ${translation}`); }
    for (const target of catalogueTargets) if (!seenTranslations.has(target.slice(root.length + 1))) { error(`목록에 관리되지 않는 번역본: ${target.slice(root.length + 1)}`); }
  }
  result.localDrift = [...new Set(result.localDrift)];
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const result = checkKoreanDocs(root, { strictLocal: process.argv.includes('--check-local') });
  for (const error of result.errors) { console.error(error); }
  console.log(`한글 검토 문서 ${result.documents}개 / 스킬 ${result.skills}개: 검토 대기 ${result.awaitingReview}, 휴먼 리뷰 기록 ${result.humanReviewed}.`);
  if (result.localUnavailable.length) { console.log(`로컬 설치 원문 ${result.localUnavailable.length}개를 찾을 수 없어 해당 문서는 보관된 스냅샷 기준으로만 확인했습니다.`); }
  if (result.localDrift.length) { console.warn(`로컬 설치 원문 ${result.localDrift.length}개가 스냅샷 이후 바뀌었습니다.${process.argv.includes('--check-local') ? '' : ' 필요하면 npm run docs:check:local로 엄격 검사하세요.'}`); }
  console.log('자동 검사는 번역 의미의 정확성이나 휴먼 승인을 보장하지 않습니다.');
  process.exitCode = result.errors.length ? 1 : 0;
}
