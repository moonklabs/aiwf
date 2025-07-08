#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
const { 
  getFeatureRelatedCommits,
  isGitRepository,
  runGitCommand
} = require('../utils/git-utils');
const { 
  syncFeatureWithGit,
  findFeatureFile
} = require('../utils/feature-updater');

const program = new Command();

/**
 * scan_git_history 명령어
 * 기존 Git 히스토리를 스캔하여 Feature와 연결
 */

program
  .name('scan_git_history')
  .description('기존 Git 히스토리를 스캔하여 Feature Ledger와 연결합니다')
  .option('-s, --since <date>', '스캔 시작 날짜 (YYYY-MM-DD)', '2025-01-01')
  .option('-u, --until <date>', '스캔 종료 날짜 (YYYY-MM-DD)', 'HEAD')
  .option('-l, --limit <number>', '스캔할 최대 커밋 수', '1000')
  .option('-d, --dry-run', '실제 업데이트 없이 결과만 표시')
  .option('-f, --feature <id>', '특정 Feature ID만 스캔')
  .option('-c, --create-missing', '누락된 Feature 파일 자동 생성')
  .option('-v, --verbose', '상세 로그 출력')
  .action(async (options) => {
    const spinner = ora();
    
    try {
      // Git 저장소 확인
      if (!await isGitRepository()) {
        console.error(chalk.red('❌ 현재 디렉토리는 Git 저장소가 아닙니다.'));
        process.exit(1);
      }
      
      console.log(chalk.cyan('🔍 Git 히스토리 스캔 시작'));
      console.log(chalk.gray(`   기간: ${options.since} ~ ${options.until}`));
      console.log(chalk.gray(`   최대 커밋 수: ${options.limit}`));
      if (options.dryRun) {
        console.log(chalk.yellow('   🏃 Dry-run 모드 (실제 업데이트 없음)'));
      }
      
      spinner.start('Git 히스토리 분석 중...');
      
      // Git log 명령어로 커밋 목록 가져오기
      let gitCommand = `log --since="${options.since}"`;
      if (options.until !== 'HEAD') {
        gitCommand += ` --until="${options.until}"`;
      }
      gitCommand += ` --max-count=${options.limit} --pretty=format:"%H"`;
      
      if (options.feature) {
        gitCommand += ` --grep="${options.feature}"`;
      } else {
        gitCommand += ` --grep="FL[0-9]\\{3\\}"`;
      }
      
      const commitHashes = await runGitCommand(gitCommand);
      
      if (!commitHashes) {
        spinner.warn(chalk.yellow('Feature 관련 커밋을 찾을 수 없습니다.'));
        return;
      }
      
      const hashes = commitHashes.split('\n').filter(Boolean);
      spinner.succeed(chalk.green(`${hashes.length}개의 관련 커밋 발견`));
      
      // 커밋 분석 및 Feature별 그룹화
      spinner.start('커밋 분석 중...');
      const { getCommitInfo } = require('../utils/git-utils');
      const featureCommitMap = {};
      const missingFeatures = new Set();
      
      for (const hash of hashes) {
        const commitInfo = await getCommitInfo(hash);
        
        for (const featureId of commitInfo.featureIds) {
          if (options.feature && featureId !== options.feature) {
            continue;
          }
          
          if (!featureCommitMap[featureId]) {
            featureCommitMap[featureId] = [];
          }
          featureCommitMap[featureId].push(commitInfo);
          
          // Feature 파일 존재 확인
          const featureFile = await findFeatureFile(featureId);
          if (!featureFile) {
            missingFeatures.add(featureId);
          }
        }
      }
      
      spinner.succeed(chalk.green('커밋 분석 완료'));
      
      // 분석 결과 출력
      console.log(chalk.cyan('\n📊 스캔 결과:'));
      console.log(chalk.white(`   발견된 Feature: ${Object.keys(featureCommitMap).length}개`));
      console.log(chalk.white(`   총 커밋 수: ${hashes.length}개`));
      
      if (missingFeatures.size > 0) {
        console.log(chalk.yellow(`   누락된 Feature: ${missingFeatures.size}개`));
        if (options.verbose) {
          console.log(chalk.gray(`      ${[...missingFeatures].join(', ')}`));
        }
      }
      
      // Feature별 상세 정보
      console.log(chalk.cyan('\n📋 Feature별 커밋 수:'));
      for (const [featureId, commits] of Object.entries(featureCommitMap)) {
        const isMissing = missingFeatures.has(featureId);
        const statusIcon = isMissing ? '❌' : '✅';
        const statusText = isMissing ? ' (파일 없음)' : '';
        console.log(chalk.white(`   ${statusIcon} ${featureId}: ${commits.length}개 커밋${statusText}`));
      }
      
      // 누락된 Feature 파일 생성 (옵션)
      if (options.createMissing && missingFeatures.size > 0 && !options.dryRun) {
        console.log(chalk.cyan('\n📝 누락된 Feature 파일 생성 중...'));
        
        for (const featureId of missingFeatures) {
          spinner.start(`${featureId} 파일 생성 중...`);
          
          try {
            // Feature 파일 생성
            const featureDir = path.join(process.cwd(), '.aiwf', '06_FEATURE_LEDGERS', 'active');
            await fs.mkdir(featureDir, { recursive: true });
            
            const fileName = `${featureId}_Auto_Generated.md`;
            const filePath = path.join(featureDir, fileName);
            
            const content = `---
feature_id: ${featureId}
title: Auto Generated Feature
status: active
created_date: ${new Date().toISOString().substring(0, 10)}
last_updated: ${new Date().toISOString().replace('T', ' ').substring(0, 16)}
milestone: TBD
sprint_ids: []
tasks: []
assignee: TBD
tags: [auto-generated]
---

# Feature: Auto Generated Feature

## Overview
이 Feature는 Git 히스토리 스캔 중 자동으로 생성되었습니다.
커밋 메시지에서 ${featureId} 참조가 발견되었지만 해당 Feature 파일이 없어 생성되었습니다.

## Requirements
- [ ] 실제 요구사항으로 업데이트 필요

## Git History
### Commits
`;
            
            await fs.writeFile(filePath, content, 'utf8');
            spinner.succeed(chalk.green(`✅ ${featureId} 파일 생성 완료`));
            
            // missingFeatures에서 제거
            missingFeatures.delete(featureId);
          } catch (error) {
            spinner.fail(chalk.red(`❌ ${featureId} 파일 생성 실패: ${error.message}`));
          }
        }
      }
      
      // Feature 업데이트
      if (!options.dryRun) {
        console.log(chalk.cyan('\n🔄 Feature 파일 업데이트 중...'));
        
        let successCount = 0;
        let failCount = 0;
        
        for (const [featureId, commits] of Object.entries(featureCommitMap)) {
          if (missingFeatures.has(featureId)) {
            continue;
          }
          
          spinner.start(`${featureId} 업데이트 중 (${commits.length}개 커밋)...`);
          
          try {
            const { updateFeatureWithCommits } = require('../utils/feature-updater');
            const success = await updateFeatureWithCommits(featureId, commits);
            
            if (success) {
              spinner.succeed(chalk.green(`✅ ${featureId} 업데이트 완료`));
              successCount++;
            } else {
              spinner.fail(chalk.red(`❌ ${featureId} 업데이트 실패`));
              failCount++;
            }
          } catch (error) {
            spinner.fail(chalk.red(`❌ ${featureId} 업데이트 중 오류: ${error.message}`));
            failCount++;
          }
        }
        
        console.log(chalk.cyan('\n✨ 업데이트 완료!'));
        console.log(chalk.green(`   성공: ${successCount}개`));
        if (failCount > 0) {
          console.log(chalk.red(`   실패: ${failCount}개`));
        }
      }
      
      // 추가 권장사항
      if (missingFeatures.size > 0 && !options.createMissing) {
        console.log(chalk.yellow('\n💡 팁:'));
        console.log(chalk.gray('   --create-missing 옵션을 사용하면 누락된 Feature 파일을 자동으로 생성할 수 있습니다.'));
      }
      
    } catch (error) {
      spinner.fail(chalk.red('스캔 중 오류 발생'));
      console.error(chalk.red(error.message));
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// 명령어 실행
program.parse(process.argv);