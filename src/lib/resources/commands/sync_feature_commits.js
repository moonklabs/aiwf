#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { 
  syncFeatureWithGit, 
  syncAllActiveFeatures,
  findFeatureFile 
} = require('../utils/feature-updater');
const { 
  getFeatureRelatedCommits,
  isGitRepository,
  getRecentFeatureCommits
} = require('../utils/git-utils');

const program = new Command();

/**
 * sync_feature_commits 명령어
 * Feature Ledger와 Git 커밋을 동기화
 */

program
  .name('sync_feature_commits')
  .description('Feature Ledger와 Git 커밋 히스토리를 동기화합니다')
  .argument('[featureId]', 'Feature ID (예: FL001). 생략 시 모든 활성 Feature 동기화')
  .option('-s, --since <date>', '특정 날짜 이후의 커밋만 동기화 (YYYY-MM-DD)')
  .option('-r, --recent <count>', '최근 N개의 커밋에서 Feature 관련 커밋 찾기', '50')
  .option('-a, --all', '모든 활성 Feature를 동기화')
  .option('-v, --verbose', '상세 로그 출력')
  .action(async (featureId, options) => {
    const spinner = ora();
    
    try {
      // Git 저장소 확인
      if (!await isGitRepository()) {
        console.error(chalk.red('❌ 현재 디렉토리는 Git 저장소가 아닙니다.'));
        process.exit(1);
      }
      
      // 특정 Feature ID가 제공된 경우
      if (featureId && !options.all) {
        spinner.start(`${featureId} Feature와 Git 커밋 동기화 중...`);
        
        // Feature 파일 존재 확인
        const featureFile = await findFeatureFile(featureId);
        if (!featureFile) {
          spinner.fail(chalk.red(`Feature 파일을 찾을 수 없습니다: ${featureId}`));
          process.exit(1);
        }
        
        const result = await syncFeatureWithGit(featureId);
        
        if (result.success) {
          spinner.succeed(chalk.green(
            `✅ ${featureId} 동기화 완료! (${result.commitCount}개 커밋 연결됨)`
          ));
          
          if (options.verbose && result.commitCount > 0) {
            console.log(chalk.gray(`\n연결된 커밋 수: ${result.commitCount}`));
          }
        } else {
          spinner.fail(chalk.red(`❌ ${featureId} 동기화 실패`));
          process.exit(1);
        }
      }
      // 모든 활성 Feature 동기화
      else if (options.all || !featureId) {
        spinner.start('모든 활성 Feature와 Git 커밋 동기화 중...');
        
        const results = await syncAllActiveFeatures();
        
        spinner.succeed(chalk.green('✅ 동기화 완료!'));
        console.log(chalk.cyan(`\n📊 동기화 결과:`));
        console.log(chalk.white(`   총 Feature: ${results.total}`));
        console.log(chalk.green(`   성공: ${results.synced}`));
        if (results.failed > 0) {
          console.log(chalk.red(`   실패: ${results.failed}`));
        }
      }
      
      // 최근 커밋에서 Feature 관련 커밋 찾기 (옵션)
      if (options.recent) {
        spinner.start(`최근 ${options.recent}개 커밋에서 Feature 관련 커밋 검색 중...`);
        
        const recentCommits = await getRecentFeatureCommits(parseInt(options.recent));
        
        if (recentCommits.length > 0) {
          spinner.succeed(chalk.green(`${recentCommits.length}개의 Feature 관련 커밋 발견`));
          
          if (options.verbose) {
            console.log(chalk.cyan('\n📝 Feature 관련 커밋:'));
            recentCommits.forEach(commit => {
              const shortHash = commit.hash.substring(0, 7);
              const features = commit.featureIds.join(', ');
              console.log(chalk.gray(`   ${shortHash} - ${features}: ${commit.message.split('\n')[0]}`));
            });
          }
        } else {
          spinner.info(chalk.yellow('최근 커밋에서 Feature 관련 커밋을 찾을 수 없습니다.'));
        }
      }
      
      // 특정 날짜 이후 커밋 검색 (옵션)
      if (options.since) {
        spinner.start(`${options.since} 이후의 Feature 관련 커밋 검색 중...`);
        
        const commits = await getFeatureRelatedCommits(options.since);
        
        if (commits.length > 0) {
          spinner.succeed(chalk.green(`${commits.length}개의 Feature 관련 커밋 발견`));
          
          // Feature별로 그룹화
          const featureGroups = {};
          commits.forEach(commit => {
            commit.featureIds.forEach(featureId => {
              if (!featureGroups[featureId]) {
                featureGroups[featureId] = [];
              }
              featureGroups[featureId].push(commit);
            });
          });
          
          console.log(chalk.cyan('\n📊 Feature별 커밋 통계:'));
          Object.entries(featureGroups).forEach(([featureId, commits]) => {
            console.log(chalk.white(`   ${featureId}: ${commits.length}개 커밋`));
          });
        } else {
          spinner.info(chalk.yellow(`${options.since} 이후 Feature 관련 커밋이 없습니다.`));
        }
      }
      
      // 도움말 메시지
      if (!featureId && !options.all && !options.recent && !options.since) {
        console.log(chalk.cyan('\n💡 사용 예시:'));
        console.log(chalk.gray('   sync_feature_commits FL001        # 특정 Feature 동기화'));
        console.log(chalk.gray('   sync_feature_commits --all         # 모든 활성 Feature 동기화'));
        console.log(chalk.gray('   sync_feature_commits --recent 100  # 최근 100개 커밋에서 Feature 찾기'));
        console.log(chalk.gray('   sync_feature_commits --since 2025-01-01  # 특정 날짜 이후 커밋 검색'));
      }
      
    } catch (error) {
      spinner.fail(chalk.red('동기화 중 오류 발생'));
      console.error(chalk.red(error.message));
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// 명령어 실행
program.parse(process.argv);