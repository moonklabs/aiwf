#!/usr/bin/env node

/**
 * AIWF 파일 목록 자동 업데이트 스크립트
 * 
 * 이 스크립트는 claude-code 디렉토리를 스캔하여
 * src/config/file-lists.js 파일을 자동으로 업데이트합니다.
 * 
 * 사용법:
 *   npm run update:file-lists
 *   npm run update:file-lists -- --dry-run  # 미리보기만
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 스캔할 디렉토리 경로들
const SCAN_PATHS = {
  commands: {
    en: path.join(ROOT_DIR, 'claude-code/aiwf/en/.claude/commands/aiwf'),
    ko: path.join(ROOT_DIR, 'claude-code/aiwf/ko/.claude/commands/aiwf')
  },
  globalRules: path.join(ROOT_DIR, 'rules/global'),
  manualRules: path.join(ROOT_DIR, 'rules/manual')
};

const OUTPUT_FILE = path.join(ROOT_DIR, 'src/config/file-lists.js');

/**
 * 디렉토리에서 .md 파일들을 스캔
 */
async function scanDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter(file => file.endsWith('.md'))
      .sort();
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not scan directory ${dirPath}: ${error.message}`));
    return [];
  }
}

/**
 * 두 언어 버전에서 공통으로 존재하는 파일들만 추출
 */
async function getCommonCommandFiles() {
  const [enFiles, koFiles] = await Promise.all([
    scanDirectory(SCAN_PATHS.commands.en),
    scanDirectory(SCAN_PATHS.commands.ko)
  ]);

  // 두 언어에 모두 존재하는 파일들만 포함
  const commonFiles = enFiles.filter(file => koFiles.includes(file));
  
  // 언어별 특수 파일들도 포함 (선택적)
  const enOnlyFiles = enFiles.filter(file => !koFiles.includes(file));
  const koOnlyFiles = koFiles.filter(file => !enFiles.includes(file));

  console.log(chalk.blue('📊 Command Files Analysis:'));
  console.log(`  Common files: ${chalk.green(commonFiles.length)}`);
  console.log(`  English only: ${chalk.yellow(enOnlyFiles.length)} ${enOnlyFiles.length > 0 ? `(${enOnlyFiles.join(', ')})` : ''}`);
  console.log(`  Korean only: ${chalk.yellow(koOnlyFiles.length)} ${koOnlyFiles.length > 0 ? `(${koOnlyFiles.join(', ')})` : ''}`);

  // 공통 파일들 + 언어별 특수 파일들을 모두 포함
  return [...commonFiles, ...enOnlyFiles, ...koOnlyFiles].sort();
}

/**
 * file-lists.js 파일 생성
 */
async function generateFileListsContent(commandFiles, globalRulesFiles, manualRulesFiles) {
  const template = `/**
 * AIWF 설치 시 다운로드할 파일 목록들
 * 이 파일은 GitHub에서 다운로드할 파일들의 사전 정의된 목록을 포함합니다.
 * 
 * ⚠️  이 파일은 자동 생성됩니다. 수동으로 편집하지 마세요!
 * 업데이트하려면: npm run update:file-lists
 * 
 * Generated at: ${new Date().toISOString()}
 */

// Claude Code 명령어 파일 목록 (한국어와 영어 공통)
export const COMMAND_FILES = [
${commandFiles.map(file => `  '${file}'`).join(',\n')}
];

// 글로벌 룰 파일 목록
export const GLOBAL_RULES_FILES = [
${globalRulesFiles.map(file => `  '${file}'`).join(',\n')}
];

// 수동 룰 파일 목록
export const MANUAL_RULES_FILES = [
${manualRulesFiles.map(file => `  '${file}'`).join(',\n')}
];

// 템플릿 파일 목록 (향후 추가 예정)
export const TEMPLATE_FILES = [
  // 템플릿 파일들이 추가되면 여기에 나열
];

// 프롬프트 파일 목록 (향후 추가 예정)
export const PROMPT_FILES = [
  // 프롬프트 파일들이 추가되면 여기에 나열
];

// 모든 파일 목록을 하나의 객체로 export
export const FILE_LISTS = {
  COMMAND_FILES,
  GLOBAL_RULES_FILES,
  MANUAL_RULES_FILES,
  TEMPLATE_FILES,
  PROMPT_FILES
};

// 개별 카테고리별 파일 수 정보
export const FILE_COUNTS = {
  commands: COMMAND_FILES.length,
  globalRules: GLOBAL_RULES_FILES.length,
  manualRules: MANUAL_RULES_FILES.length,
  templates: TEMPLATE_FILES.length,
  prompts: PROMPT_FILES.length,
  total: COMMAND_FILES.length + GLOBAL_RULES_FILES.length + MANUAL_RULES_FILES.length + TEMPLATE_FILES.length + PROMPT_FILES.length
};

/**
 * 특정 언어의 파일 존재 여부 확인을 위한 헬퍼 함수들
 */

/**
 * 언어별로 존재하지 않을 수 있는 파일들을 필터링
 * @param {Array<string>} fileList - 원본 파일 목록
 * @param {string} language - 언어 코드 (ko, en)
 * @returns {Array<string>} 필터링된 파일 목록
 */
export function filterFilesByLanguage(fileList, language) {
  // 일부 파일들은 특정 언어에만 존재할 수 있음
  const languageSpecificFiles = {
    ko: [
      // 한국어에만 있는 파일들 (현재는 없음)
    ],
    en: [
      // 영어에만 있는 파일들 (현재는 없음)
    ]
  };
  
  // 현재는 모든 파일이 두 언어 모두 존재한다고 가정
  return fileList;
}

/**
 * 파일 목록 업데이트를 위한 헬퍼 함수
 * 실제 디렉토리를 스캔하여 파일 목록을 업데이트할 수 있는 함수
 */
export function getLatestFileList() {
  // 이 함수는 향후 자동 업데이트 기능 구현 시 사용
  return {
    commands: COMMAND_FILES,
    globalRules: GLOBAL_RULES_FILES,
    manualRules: MANUAL_RULES_FILES,
    templates: TEMPLATE_FILES,
    prompts: PROMPT_FILES
  };
}`;

  return template;
}

/**
 * 기존 파일과 비교하여 변경사항 확인
 */
async function compareWithExisting(newContent) {
  try {
    const existingContent = await fs.readFile(OUTPUT_FILE, 'utf-8');
    
    // 생성 시간 라인 제외하고 비교 (Generated at: 부분)
    const normalizeContent = (content) => {
      return content.replace(/Generated at: .*$/m, 'Generated at: <timestamp>');
    };
    
    return normalizeContent(existingContent) === normalizeContent(newContent);
  } catch {
    return false; // 파일이 없으면 변경사항이 있다고 간주
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const isVerbose = process.argv.includes('--verbose');

  console.log(chalk.blue.bold('🔄 AIWF File Lists Update Script'));
  console.log(chalk.gray(`Scanning directories and updating file lists...\n`));

  try {
    // 각 디렉토리 스캔
    const [commandFiles, globalRulesFiles, manualRulesFiles] = await Promise.all([
      getCommonCommandFiles(),
      scanDirectory(SCAN_PATHS.globalRules),
      scanDirectory(SCAN_PATHS.manualRules)
    ]);

    // 통계 출력
    console.log(chalk.blue('📊 Scan Results:'));
    console.log(`  Command files: ${chalk.green(commandFiles.length)}`);
    console.log(`  Global rules: ${chalk.green(globalRulesFiles.length)}`);
    console.log(`  Manual rules: ${chalk.green(manualRulesFiles.length)}`);
    console.log(`  Total files: ${chalk.green(commandFiles.length + globalRulesFiles.length + manualRulesFiles.length)}`);

    if (isVerbose) {
      console.log(chalk.gray('\n📝 Detailed file lists:'));
      console.log(chalk.gray('Commands:'), commandFiles.join(', '));
      console.log(chalk.gray('Global rules:'), globalRulesFiles.join(', '));
      console.log(chalk.gray('Manual rules:'), manualRulesFiles.join(', '));
    }

    // 새 내용 생성
    const newContent = await generateFileListsContent(commandFiles, globalRulesFiles, manualRulesFiles);

    // 변경사항 확인
    const hasChanges = !(await compareWithExisting(newContent));

    if (!hasChanges) {
      console.log(chalk.green('\n✅ File lists are already up to date!'));
      return;
    }

    if (isDryRun) {
      console.log(chalk.yellow('\n🔍 Dry run mode - Changes detected but not saved:'));
      console.log(chalk.gray(`Would update: ${OUTPUT_FILE}`));
      console.log(chalk.gray(`Content length: ${newContent.length} characters`));
      return;
    }

    // 파일 업데이트
    await fs.writeFile(OUTPUT_FILE, newContent, 'utf-8');

    console.log(chalk.green('\n✅ Successfully updated file lists!'));
    console.log(chalk.gray(`Updated: ${OUTPUT_FILE}`));
    console.log(chalk.blue('\n💡 Next steps:'));
    console.log(chalk.gray('  1. Review the changes: git diff src/config/file-lists.js'));
    console.log(chalk.gray('  2. Test the changes: npm test'));
    console.log(chalk.gray('  3. Commit the changes: git add . && git commit -m "update: refresh file lists"'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error updating file lists:'));
    console.error(chalk.red(error.message));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as updateFileLists };