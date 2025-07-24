#!/usr/bin/env node

/**
 * AIWF 체크포인트 CLI
 * YOLO 모드 체크포인트 관리를 위한 명령어 인터페이스
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { CheckpointManager } from '../utils/checkpoint-manager.js';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();

program
  .name('aiwf-checkpoint')
  .description('AIWF 체크포인트 관리 도구')
  .version('0.3.12');

// 프로젝트 루트 찾기 헬퍼
async function findProjectRoot(startDir = process.cwd()) {
  let currentDir = startDir;
  
  while (currentDir !== path.parse(currentDir).root) {
    try {
      await fs.access(path.join(currentDir, '.aiwf'));
      return currentDir;
    } catch {
      currentDir = path.dirname(currentDir);
    }
  }
  
  throw new Error('.aiwf 디렉토리를 찾을 수 없습니다. AIWF 프로젝트 내에서 실행해주세요.');
}

// 체크포인트 목록 보기
program
  .command('list')
  .alias('ls')
  .description('사용 가능한 체크포인트 목록')
  .option('--limit <n>', '표시할 체크포인트 수 제한', '10')
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot();
      const manager = new CheckpointManager(projectRoot);
      
      console.log(chalk.bold('📊 체크포인트 목록:'));
      console.log('');
      
      const checkpoints = await manager.listCheckpoints();
      
      if (checkpoints.length === 0) {
        console.log(chalk.yellow('📭 체크포인트가 없습니다.'));
        console.log('');
        console.log(chalk.gray('YOLO 모드를 실행하면 자동으로 체크포인트가 생성됩니다.'));
        return;
      }
      
      const limit = parseInt(options.limit);
      const limitedCheckpoints = checkpoints.slice(0, limit);
      
      for (const cp of limitedCheckpoints) {
        const typeIcon = cp.type === 'session_start' ? '🚀' :
                        cp.type === 'task_complete' ? '✅' :
                        cp.type === 'sprint_complete' ? '🎯' :
                        cp.type === 'session_end' ? '🏁' :
                        cp.type === 'manual' ? '📝' : '🔄';
        
        const timeAgo = getTimeAgo(new Date(cp.created));
        
        console.log(`${typeIcon} ${chalk.cyan(cp.id)} - ${chalk.yellow(cp.type)}`);
        console.log(`    생성: ${chalk.gray(timeAgo)}`);
        console.log(`    태스크: ${chalk.blue(cp.tasks_completed)}개 완료`);
        
        if (cp.metadata && Object.keys(cp.metadata).length > 0) {
          console.log(`    메타: ${chalk.gray(JSON.stringify(cp.metadata))}`);
        }
        console.log('');
      }
      
      if (checkpoints.length > limit) {
        console.log(chalk.gray(`... 더 많은 체크포인트가 있습니다 (총 ${checkpoints.length}개)`));
        console.log(chalk.blue(`모든 체크포인트를 보려면: aiwf-checkpoint list --limit ${checkpoints.length}`));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 체크포인트 목록 조회 실패:'), error.message);
      process.exit(1);
    }
  });

// 체크포인트에서 복구
program
  .command('restore <checkpointId>')
  .description('체크포인트에서 복구')
  .option('--dry-run', '실제 복구 없이 미리보기만')
  .action(async (checkpointId, options) => {
    try {
      const projectRoot = await findProjectRoot();
      const manager = new CheckpointManager(projectRoot);
      await manager.initialize();
      
      console.log(chalk.blue(`🔄 체크포인트 ${checkpointId}에서 복구 중...`));
      console.log('');
      
      if (options.dryRun) {
        console.log(chalk.yellow('🔍 드라이런 모드: 실제 복구는 수행하지 않습니다.'));
        console.log('');
      }
      
      const result = await manager.restoreFromCheckpoint(checkpointId);
      
      if (result.success) {
        console.log(chalk.green('✅ 체크포인트 복구 성공!'));
        console.log('');
        console.log(chalk.bold('📊 복구된 세션 정보:'));
        console.log(`  세션 ID: ${chalk.cyan(result.checkpoint.state_snapshot.session_id)}`);
        console.log(`  스프린트: ${chalk.blue(result.checkpoint.state_snapshot.sprint_id || 'N/A')}`);
        console.log(`  모드: ${chalk.yellow(result.checkpoint.state_snapshot.mode || 'N/A')}`);
        console.log('');
        
        console.log(chalk.bold('🔄 재개 가능한 작업:'));
        if (result.tasks_to_resume.current) {
          console.log(`  현재 태스크: ${chalk.cyan(result.tasks_to_resume.current)}`);
        }
        console.log(`  완료된 태스크: ${chalk.blue(result.tasks_to_resume.completed.length)}개`);
        console.log(`  다음 작업: ${chalk.gray(result.tasks_to_resume.next_task_hint)}`);
        console.log('');
        
        if (result.checkpoint.git_info) {
          console.log(chalk.bold('📋 Git 정보:'));
          console.log(`  브랜치: ${chalk.cyan(result.checkpoint.git_info.branch)}`);
          console.log(`  커밋: ${chalk.gray(result.checkpoint.git_info.commit.substring(0, 8))}`);
          console.log('');
        }
        
        console.log(chalk.green('🚀 복구 완료! YOLO 모드를 다시 실행할 수 있습니다.'));
        
      } else {
        console.error(chalk.red('❌ 체크포인트 복구 실패'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 체크포인트 복구 실패:'), error.message);
      process.exit(1);
    }
  });

// 체크포인트 생성
program
  .command('create [message]')
  .description('수동 체크포인트 생성')
  .action(async (message) => {
    try {
      const projectRoot = await findProjectRoot();
      const manager = new CheckpointManager(projectRoot);
      await manager.initialize();
      
      const checkpointMessage = message || '수동 체크포인트';
      
      console.log(chalk.blue('📝 수동 체크포인트 생성 중...'));
      
      const checkpointId = await manager.createCheckpoint('manual', {
        message: checkpointMessage,
        created_by: 'user'
      });
      
      console.log(chalk.green('✅ 체크포인트 생성 완료!'));
      console.log('');
      console.log(`체크포인트 ID: ${chalk.cyan(checkpointId)}`);
      console.log(`메시지: ${chalk.yellow(checkpointMessage)}`);
      console.log('');
      console.log(chalk.gray('이 체크포인트에서 복구하려면:'));
      console.log(chalk.blue(`aiwf-checkpoint restore ${checkpointId}`));
      
    } catch (error) {
      console.error(chalk.red('❌ 체크포인트 생성 실패:'), error.message);
      process.exit(1);
    }
  });

// 현재 상태 보기
program
  .command('status')
  .description('현재 YOLO 세션 상태')
  .action(async () => {
    try {
      const projectRoot = await findProjectRoot();
      const manager = new CheckpointManager(projectRoot);
      await manager.loadState();
      
      console.log(chalk.bold('📊 YOLO 세션 상태:'));
      console.log('');
      
      if (!manager.currentState.session_id) {
        console.log(chalk.yellow('📭 활성 YOLO 세션이 없습니다.'));
        console.log('');
        console.log(chalk.gray('YOLO 모드를 시작하려면:'));
        console.log(chalk.blue('/project:aiwf:yolo'));
        return;
      }
      
      console.log(`세션 ID: ${chalk.cyan(manager.currentState.session_id)}`);
      console.log(`시작 시간: ${chalk.gray(new Date(manager.currentState.started_at).toLocaleString())}`);
      console.log(`스프린트: ${chalk.blue(manager.currentState.sprint_id || 'N/A')}`);
      console.log(`모드: ${chalk.yellow(manager.currentState.mode || 'N/A')}`);
      console.log('');
      
      console.log(chalk.bold('📈 진행 상황:'));
      console.log(`  완료된 태스크: ${chalk.green(manager.currentState.completed_tasks.length)}개`);
      console.log(`  실패한 태스크: ${chalk.red(manager.currentState.metrics.failed_tasks)}개`);
      console.log(`  건너뛴 태스크: ${chalk.yellow(manager.currentState.metrics.skipped_tasks)}개`);
      
      if (manager.currentState.current_task) {
        console.log(`  현재 태스크: ${chalk.cyan(manager.currentState.current_task.id)}`);
        console.log(`  시도 횟수: ${chalk.blue(manager.currentState.current_task.attempts)}회`);
      }
      console.log('');
      
      if (manager.currentState.metrics.total_time > 0) {
        console.log(chalk.bold('⏱️ 성능 지표:'));
        console.log(`  총 실행 시간: ${chalk.blue(manager.formatDuration(manager.currentState.metrics.total_time))}`);
        console.log(`  평균 태스크 시간: ${chalk.blue(manager.formatDuration(manager.currentState.metrics.avg_task_time))}`);
        console.log('');
      }
      
      console.log(chalk.bold('📊 체크포인트:'));
      console.log(`  생성된 체크포인트: ${chalk.blue(manager.currentState.checkpoints.length)}개`);
      
      if (manager.currentState.checkpoints.length > 0) {
        const latest = manager.currentState.checkpoints[manager.currentState.checkpoints.length - 1];
        console.log(`  최근 체크포인트: ${chalk.cyan(latest.id)} (${chalk.gray(latest.type)})`);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 상태 확인 실패:'), error.message);
      process.exit(1);
    }
  });

// 체크포인트 정리
program
  .command('clean')
  .description('오래된 체크포인트 정리')
  .option('--keep <n>', '유지할 체크포인트 수', '10')
  .option('--dry-run', '실제 삭제 없이 미리보기만')
  .action(async (options) => {
    try {
      const projectRoot = await findProjectRoot();
      const manager = new CheckpointManager(projectRoot);
      
      const keepLast = parseInt(options.keep);
      
      console.log(chalk.blue(`🧹 체크포인트 정리 중... (최근 ${keepLast}개 유지)`));
      console.log('');
      
      if (options.dryRun) {
        console.log(chalk.yellow('🔍 드라이런 모드: 실제 삭제는 수행하지 않습니다.'));
        console.log('');
        
        const checkpoints = await manager.listCheckpoints();
        if (checkpoints.length <= keepLast) {
          console.log(chalk.green('✅ 정리할 체크포인트가 없습니다.'));
        } else {
          const toDelete = checkpoints.slice(keepLast);
          console.log(chalk.yellow(`삭제 예정 체크포인트 (${toDelete.length}개):`));
          for (const cp of toDelete) {
            console.log(`  ${chalk.red('🗑️')} ${chalk.cyan(cp.id)} - ${chalk.gray(cp.type)}`);
          }
        }
      } else {
        await manager.cleanup(keepLast);
        console.log(chalk.green('✅ 체크포인트 정리 완료!'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 체크포인트 정리 실패:'), error.message);
      process.exit(1);
    }
  });

// 체크포인트 리포트 생성
program
  .command('report')
  .description('현재 세션의 진행 상황 리포트 생성')
  .action(async () => {
    try {
      const projectRoot = await findProjectRoot();
      const manager = new CheckpointManager(projectRoot);
      await manager.loadState();
      
      console.log(chalk.blue('📊 진행 상황 리포트 생성 중...'));
      console.log('');
      
      const report = await manager.generateProgressReport();
      
      console.log(chalk.bold('🎯 YOLO 세션 리포트'));
      console.log(''.padEnd(50, '='));
      console.log('');
      
      // 세션 정보
      console.log(chalk.bold('📋 세션 정보:'));
      console.log(`  ID: ${chalk.cyan(report.session.id)}`);
      console.log(`  시작: ${chalk.gray(new Date(report.session.started).toLocaleString())}`);
      console.log(`  스프린트: ${chalk.blue(report.session.sprint || 'N/A')}`);
      console.log(`  모드: ${chalk.yellow(report.session.mode || 'N/A')}`);
      console.log('');
      
      // 진행 상황
      console.log(chalk.bold('📈 진행 상황:'));
      console.log(`  완료: ${chalk.green(report.progress.completed)}개`);
      console.log(`  실패: ${chalk.red(report.progress.failed)}개`);
      console.log(`  건너뜀: ${chalk.yellow(report.progress.skipped)}개`);
      console.log(`  현재: ${chalk.cyan(report.progress.current)}`);
      console.log('');
      
      // 성능 지표
      console.log(chalk.bold('⏱️ 성능 지표:'));
      console.log(`  총 시간: ${chalk.blue(report.performance.total_time)}`);
      console.log(`  평균 태스크 시간: ${chalk.blue(report.performance.avg_task_time)}`);
      console.log(`  성공률: ${chalk.green(report.performance.success_rate)}`);
      console.log('');
      
      // 체크포인트
      if (report.checkpoints.length > 0) {
        console.log(chalk.bold('📊 체크포인트:'));
        for (const cp of report.checkpoints.slice(-5)) {  // 최근 5개만
          const typeIcon = cp.type === 'session_start' ? '🚀' :
                          cp.type === 'task_complete' ? '✅' :
                          cp.type === 'auto' ? '🔄' : '📝';
          console.log(`  ${typeIcon} ${chalk.cyan(cp.id)} - ${chalk.gray(cp.type)}`);
        }
        console.log('');
      }
      
      // 권장사항
      if (report.recommendations.length > 0) {
        console.log(chalk.bold('💡 권장사항:'));
        for (const rec of report.recommendations) {
          console.log(`  • ${chalk.yellow(rec)}`);
        }
        console.log('');
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 리포트 생성 실패:'), error.message);
      process.exit(1);
    }
  });

// 도움말 명령어
program
  .command('help')
  .description('AIWF 체크포인트 명령어 도움말')
  .action(() => {
    console.log(chalk.bold('📊 AIWF 체크포인트 CLI 도움말'));
    console.log('');
    console.log(chalk.yellow('📋 주요 명령어:'));
    console.log('');
    console.log(`  ${chalk.cyan('aiwf-checkpoint list')} - 체크포인트 목록 보기`);
    console.log(`  ${chalk.cyan('aiwf-checkpoint status')} - 현재 세션 상태`);
    console.log(`  ${chalk.cyan('aiwf-checkpoint restore <id>')} - 체크포인트에서 복구`);
    console.log(`  ${chalk.cyan('aiwf-checkpoint create [message]')} - 수동 체크포인트 생성`);
    console.log(`  ${chalk.cyan('aiwf-checkpoint clean')} - 오래된 체크포인트 정리`);
    console.log(`  ${chalk.cyan('aiwf-checkpoint report')} - 진행 상황 리포트`);
    console.log('');
    console.log(chalk.yellow('🔧 유용한 옵션:'));
    console.log('');
    console.log(`  ${chalk.blue('--dry-run')} - 실제 실행 없이 미리보기`);
    console.log(`  ${chalk.blue('--limit <n>')} - 목록 표시 제한`);
    console.log(`  ${chalk.blue('--keep <n>')} - 정리 시 유지할 개수`);
    console.log('');
    console.log(chalk.yellow('💡 사용 예시:'));
    console.log('');
    console.log(`  ${chalk.gray('# 최근 체크포인트에서 복구')}`);
    console.log(`  ${chalk.blue('aiwf-checkpoint list')}`);
    console.log(`  ${chalk.blue('aiwf-checkpoint restore cp_1234567890')}`);
    console.log('');
    console.log(`  ${chalk.gray('# 중요한 작업 전 수동 체크포인트 생성')}`);
    console.log(`  ${chalk.blue('aiwf-checkpoint create "주요 리팩토링 전"')}`);
    console.log('');
    console.log(`  ${chalk.gray('# 오래된 체크포인트 정리')}`);
    console.log(`  ${chalk.blue('aiwf-checkpoint clean --keep 5')}`);
    console.log('');
    console.log(chalk.green('🛡️ 체크포인트는 YOLO 모드 실행 중 자동으로 생성됩니다!'));
  });

// 시간 경과 계산 헬퍼
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}일 전`;
  if (diffHours > 0) return `${diffHours}시간 전`;
  if (diffMins > 0) return `${diffMins}분 전`;
  return '방금 전';
}

// 에러 핸들링
program.on('command:*', () => {
  console.error(chalk.red('❌ 알 수 없는 명령어입니다.'));
  console.log('');
  console.log(chalk.blue('도움말을 보려면: aiwf-checkpoint help'));
  process.exit(1);
});

// CLI 실행
program.parse(process.argv);

// 인수가 없으면 도움말 표시
if (!process.argv.slice(2).length) {
  program.outputHelp();
}