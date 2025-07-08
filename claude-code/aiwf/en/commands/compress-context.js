#!/usr/bin/env node

import { ContextCompressor } from '../utils/context-compressor.js';
import { TokenCounter } from '../utils/token-counter.js';
import { CompressionMetrics } from '../utils/compression-metrics.js';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * compress-context 명령어 실행
 */
export async function executeCompressContext(args = []) {
  const spinner = ora('Context 압축 준비 중...').start();
  
  try {
    // 파라미터 파싱
    const { mode, targetPath } = parseArguments(args);
    
    spinner.text = '압축 대상 분석 중...';
    
    // 대상 경로 결정
    const resolvedPath = await resolveTargetPath(targetPath);
    const files = await collectMarkdownFiles(resolvedPath);
    
    if (files.length === 0) {
      spinner.fail('압축할 마크다운 파일이 없습니다.');
      return;
    }
    
    // 압축 전 통계
    spinner.text = '원본 토큰 수 계산 중...';
    const beforeStats = await calculateStats(files);
    
    // 압축 시작
    console.log('');
    console.log(chalk.cyan('🗜️  Context 압축 시작'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(`압축 모드: ${chalk.yellow(mode)}`);
    console.log(`대상: ${chalk.yellow(resolvedPath)}`);
    console.log('');
    
    console.log(chalk.cyan('📊 압축 전 통계:'));
    console.log(`- 총 파일 수: ${files.length}`);
    console.log(`- 원본 토큰: ${chalk.red(beforeStats.totalTokens.toLocaleString())}`);
    console.log(`- 원본 크기: ${(beforeStats.totalSize / 1024).toFixed(1)} KB`);
    console.log('');
    
    spinner.text = '압축 진행 중...';
    
    // 압축 수행
    const compressor = new ContextCompressor(mode);
    const compressionResults = [];
    const startTime = Date.now();
    
    console.log(chalk.cyan('⚙️  압축 진행 중...'));
    
    for (const file of files) {
      const fileName = path.basename(file);
      const content = await fs.readFile(file, 'utf8');
      
      const result = await compressor.compress(content, {
        strategy: mode,
        preserveStructure: true,
        enableSummarization: mode === 'aggressive',
        enableNormalization: true,
        enableFiltering: mode !== 'minimal'
      });
      
      if (result.success) {
        const savedTokens = result.originalTokens - result.compressedTokens;
        const ratio = result.compressionRatio.toFixed(1);
        
        console.log(chalk.green(`✓ ${fileName} (${result.originalTokens.toLocaleString()} → ${result.compressedTokens.toLocaleString()} 토큰, -${ratio}%)`));
        
        compressionResults.push({
          filePath: file,
          fileName,
          ...result
        });
      } else {
        console.log(chalk.red(`✗ ${fileName} (압축 실패: ${result.error})`));
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // 압축 후 통계
    const afterStats = calculateCompressedStats(compressionResults);
    const totalSaved = beforeStats.totalTokens - afterStats.totalTokens;
    const overallRatio = ((totalSaved / beforeStats.totalTokens) * 100).toFixed(1);
    
    // 압축된 파일 저장
    spinner.text = '압축된 파일 저장 중...';
    const outputDir = await saveCompressedFiles(compressionResults, resolvedPath);
    
    // 압축 보고서 생성
    await generateReport(compressionResults, {
      mode,
      targetPath: resolvedPath,
      outputDir,
      beforeStats,
      afterStats,
      processingTime
    });
    
    spinner.stop();
    
    // 결과 출력
    console.log('');
    console.log(chalk.cyan('📊 압축 후 통계:'));
    console.log(`- 압축된 토큰: ${chalk.green(afterStats.totalTokens.toLocaleString())}`);
    console.log(`- 절약된 토큰: ${chalk.green(totalSaved.toLocaleString())}`);
    console.log(`- 토큰 절약률: ${chalk.green(overallRatio + '%')}`);
    console.log(`- 압축 시간: ${(processingTime / 1000).toFixed(1)}초`);
    
    // 평균 품질 점수 계산
    const avgQuality = compressionResults.reduce((sum, r) => {
      return sum + (r.metadata?.validation?.qualityScore || 0);
    }, 0) / compressionResults.length;
    
    console.log(`- 품질 점수: ${chalk.green(avgQuality.toFixed(0) + '/100')}`);
    console.log('');
    
    console.log(chalk.green('✅ 압축 완료!'));
    console.log(`압축된 파일 위치: ${chalk.yellow(outputDir)}`);
    
    // 목표 달성 여부 확인
    const targetRange = getTargetRange(mode);
    if (parseFloat(overallRatio) < targetRange.min) {
      console.log('');
      console.log(chalk.yellow(`⚠️  경고: 압축률이 목표 범위(${targetRange.min}-${targetRange.max}%)에 미달했습니다.`));
      console.log('더 높은 압축률이 필요하면 aggressive 모드를 시도해보세요.');
    }
    
    // 리소스 정리
    compressor.cleanup();
    
  } catch (error) {
    spinner.fail(`압축 실패: ${error.message}`);
    console.error(error);
  }
}

/**
 * 명령어 인자를 파싱합니다
 * @param {Array<string>} args - 인자 배열
 * @returns {Object} 파싱된 옵션
 */
function parseArguments(args) {
  let mode = 'balanced';
  let targetPath = null;
  
  for (const arg of args) {
    if (['aggressive', 'balanced', 'minimal'].includes(arg)) {
      mode = arg;
    } else if (arg && !arg.startsWith('-')) {
      targetPath = arg;
    }
  }
  
  return { mode, targetPath };
}

/**
 * 대상 경로를 결정합니다
 * @param {string} targetPath - 사용자 지정 경로
 * @returns {string} 결정된 경로
 */
async function resolveTargetPath(targetPath) {
  if (targetPath) {
    // 절대 경로가 아니면 현재 디렉토리 기준으로 변환
    if (!path.isAbsolute(targetPath)) {
      targetPath = path.join(process.cwd(), targetPath);
    }
    return targetPath;
  }
  
  // 기본값: 프로젝트의 .aiwf 디렉토리
  const aiwfPath = path.join(process.cwd(), '.aiwf');
  try {
    await fs.access(aiwfPath);
    return aiwfPath;
  } catch {
    // .aiwf가 없으면 현재 디렉토리
    return process.cwd();
  }
}

/**
 * 마크다운 파일들을 수집합니다
 * @param {string} targetPath - 대상 경로
 * @returns {Array<string>} 파일 경로 배열
 */
async function collectMarkdownFiles(targetPath) {
  const files = [];
  
  try {
    const stats = await fs.stat(targetPath);
    
    if (stats.isFile() && targetPath.endsWith('.md')) {
      files.push(targetPath);
    } else if (stats.isDirectory()) {
      await collectFromDirectory(targetPath, files);
    }
  } catch (error) {
    console.error(`경로 접근 오류: ${targetPath}`);
  }
  
  return files;
}

/**
 * 디렉토리에서 마크다운 파일을 재귀적으로 수집합니다
 * @param {string} dirPath - 디렉토리 경로
 * @param {Array<string>} files - 파일 배열
 */
async function collectFromDirectory(dirPath, files) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      await collectFromDirectory(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
}

/**
 * 파일 통계를 계산합니다
 * @param {Array<string>} files - 파일 경로 배열
 * @returns {Object} 통계 정보
 */
async function calculateStats(files) {
  const tokenCounter = new TokenCounter();
  let totalTokens = 0;
  let totalSize = 0;
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    totalTokens += tokenCounter.countTokens(content);
    totalSize += Buffer.byteLength(content, 'utf8');
  }
  
  tokenCounter.cleanup();
  
  return { totalTokens, totalSize };
}

/**
 * 압축된 통계를 계산합니다
 * @param {Array<Object>} results - 압축 결과 배열
 * @returns {Object} 통계 정보
 */
function calculateCompressedStats(results) {
  const totalTokens = results.reduce((sum, r) => sum + r.compressedTokens, 0);
  const totalSize = results.reduce((sum, r) => sum + Buffer.byteLength(r.compressed, 'utf8'), 0);
  
  return { totalTokens, totalSize };
}

/**
 * 압축된 파일들을 저장합니다
 * @param {Array<Object>} results - 압축 결과 배열
 * @param {string} targetPath - 원본 경로
 * @returns {string} 출력 디렉토리
 */
async function saveCompressedFiles(results, targetPath) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const outputDir = path.join(path.dirname(targetPath), `.aiwf_compressed`, timestamp);
  
  await fs.mkdir(outputDir, { recursive: true });
  
  for (const result of results) {
    const outputPath = path.join(outputDir, result.fileName);
    await fs.writeFile(outputPath, result.compressed);
  }
  
  return outputDir;
}

/**
 * 압축 보고서를 생성합니다
 * @param {Array<Object>} results - 압축 결과 배열
 * @param {Object} stats - 통계 정보
 */
async function generateReport(results, stats) {
  const report = [];
  
  report.push('# Context 압축 보고서');
  report.push('');
  report.push(`**생성 시간**: ${new Date().toISOString()}`);
  report.push(`**압축 모드**: ${stats.mode}`);
  report.push(`**대상 경로**: ${stats.targetPath}`);
  report.push(`**출력 경로**: ${stats.outputDir}`);
  report.push('');
  
  report.push('## 전체 통계');
  report.push(`- **파일 수**: ${results.length}`);
  report.push(`- **원본 토큰**: ${stats.beforeStats.totalTokens.toLocaleString()}`);
  report.push(`- **압축 토큰**: ${stats.afterStats.totalTokens.toLocaleString()}`);
  report.push(`- **절약 토큰**: ${(stats.beforeStats.totalTokens - stats.afterStats.totalTokens).toLocaleString()}`);
  report.push(`- **전체 압축률**: ${((stats.beforeStats.totalTokens - stats.afterStats.totalTokens) / stats.beforeStats.totalTokens * 100).toFixed(1)}%`);
  report.push(`- **처리 시간**: ${(stats.processingTime / 1000).toFixed(1)}초`);
  report.push('');
  
  report.push('## 파일별 상세');
  report.push('');
  report.push('| 파일명 | 원본 토큰 | 압축 토큰 | 압축률 | 품질 점수 |');
  report.push('|--------|-----------|-----------|--------|-----------|');
  
  for (const result of results) {
    const qualityScore = result.metadata?.validation?.qualityScore || 0;
    report.push(
      `| ${result.fileName} | ${result.originalTokens.toLocaleString()} | ` +
      `${result.compressedTokens.toLocaleString()} | ${result.compressionRatio}% | ` +
      `${qualityScore}/100 |`
    );
  }
  
  const reportPath = path.join(stats.outputDir, 'compression-report.md');
  await fs.writeFile(reportPath, report.join('\n'));
}

/**
 * 압축 모드별 목표 범위를 반환합니다
 * @param {string} mode - 압축 모드
 * @returns {Object} 목표 범위
 */
function getTargetRange(mode) {
  const ranges = {
    aggressive: { min: 50, max: 70 },
    balanced: { min: 30, max: 50 },
    minimal: { min: 10, max: 30 }
  };
  
  return ranges[mode] || { min: 0, max: 100 };
}

// CLI로 직접 실행하는 경우
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  executeCompressContext(args);
}

export default executeCompressContext;