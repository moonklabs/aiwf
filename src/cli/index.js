#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { installAIWF } from '../lib/installer.js';
import AIToolCommand from '../commands/ai-tool.js';
import PersonaCommand from '../commands/persona.js';
import { CacheCLI } from './cache-cli.js';
import { addTaskToSprint } from '../commands/sprint-task.js';
import CompressCommand from '../commands/compress.js';
import TokenCommand from '../commands/token.js';
import EvaluateCommand from '../commands/evaluate.js';
import { createProject } from '../commands/create-project.js';
import StateCommand from '../commands/state.js';
import { createIndependentSprint } from '../commands/sprint-independent.js';
import { CheckpointManager } from '../utils/checkpoint-manager.js';
import { createYoloConfig, createInteractiveYoloConfig, showYoloConfig } from '../commands/yolo-config.js';

// Parse version from package.json
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));

// Main program setup
program
  .name('aiwf')
  .version(packageJson.version)
  .description('AIWF - AI Workflow Framework');

// Install command
program
  .command('install')
  .description('Install AIWF framework')
  .option('-f, --force', 'Force complete reinstall without prompts')
  .action((options) => installAIWF({ ...options, debugLog: true }));

// AI Tool command
program
  .command('ai-tool <subcommand> [tool-name]')
  .description('Manage AI tool integrations')
  .action(async (subcommand, toolName) => {
    const aiToolCmd = new AIToolCommand();
    const args = [subcommand];
    if (toolName) args.push(toolName);
    await aiToolCmd.execute(args);
  });

// Cache management commands
const cache = program.command('cache');
cache.description('Manage offline template cache');

cache
  .command('download')
  .description('Download templates for offline use')
  .option('--all', 'Download all templates')
  .option('--type <type>', 'Download specific type (ai-tools, projects)')
  .action(async (options) => {
    const cacheCLI = new CacheCLI();
    try {
      await cacheCLI.init();
      await cacheCLI.downloadCommand(options);
    } catch (error) {
      console.error(chalk.red('Cache download failed:', error.message));
      process.exit(1);
    } finally {
      await cacheCLI.cleanup();
    }
  });

cache
  .command('list')
  .description('List cached templates')
  .option('--type <type>', 'Filter by type (ai-tools, projects)')
  .action(async (options) => {
    const cacheCLI = new CacheCLI();
    try {
      await cacheCLI.init();
      await cacheCLI.listCommand(options);
    } catch (error) {
      console.error(chalk.red('Cache list failed:', error.message));
      process.exit(1);
    } finally {
      await cacheCLI.cleanup();
    }
  });

cache
  .command('clean')
  .description('Clean up cached templates')
  .option('--all', 'Clear all cached templates')
  .option('--max-age <days>', 'Maximum age in days (default: 7)', '7')
  .action(async (options) => {
    const cacheCLI = new CacheCLI();
    try {
      await cacheCLI.init();
      await cacheCLI.cleanCommand(options);
    } catch (error) {
      console.error(chalk.red('Cache clean failed:', error.message));
      process.exit(1);
    } finally {
      await cacheCLI.cleanup();
    }
  });

cache
  .command('update')
  .description('Check for template updates')
  .option('--install', 'Install available updates')
  .action(async (options) => {
    const cacheCLI = new CacheCLI();
    try {
      await cacheCLI.init();
      await cacheCLI.updateCommand(options);
    } catch (error) {
      console.error(chalk.red('Cache update failed:', error.message));
      process.exit(1);
    } finally {
      await cacheCLI.cleanup();
    }
  });

cache
  .command('status')
  .description('Show cache system status')
  .action(async () => {
    const cacheCLI = new CacheCLI();
    try {
      await cacheCLI.init();
      await cacheCLI.statusCommand();
    } catch (error) {
      console.error(chalk.red('Cache status failed:', error.message));
      process.exit(1);
    } finally {
      await cacheCLI.cleanup();
    }
  });

// Language management commands
const lang = program.command('lang');
lang.description('Manage language settings / 언어 설정 관리');

lang
  .command('status')
  .alias('s')
  .description('Show current language configuration / 현재 언어 설정 표시')
  .action(async () => {
    const { showLanguageStatus } = await import('./language-cli.js');
    await showLanguageStatus();
  });

lang
  .command('set [language]')
  .alias('switch')
  .description('Set or change language / 언어 설정 또는 변경')
  .option('-a, --auto-detect [boolean]', 'Enable/disable auto detection / 자동 감지 활성화/비활성화')
  .action(async (language, options) => {
    const { setLanguage } = await import('./language-cli.js');
    await setLanguage(language, options);
  });

lang
  .command('reset')
  .alias('r')
  .description('Reset language configuration to auto-detection / 언어 설정을 자동 감지로 초기화')
  .action(async () => {
    const { resetLanguage } = await import('./language-cli.js');
    await resetLanguage();
  });

// Persona management commands
const persona = program.command('persona');
persona.description('Manage AI personas / AI 페르소나 관리');

persona
  .command('status')
  .alias('s')
  .description('Show current persona status / 현재 페르소나 상태 표시')
  .action(async () => {
    const personaCmd = new PersonaCommand();
    await personaCmd.showStatus();
  });

persona
  .command('list')
  .alias('ls')
  .description('List available personas / 사용 가능한 페르소나 목록')
  .action(async () => {
    const personaCmd = new PersonaCommand();
    await personaCmd.listPersonas();
  });

persona
  .command('set <persona-name>')
  .alias('switch')
  .description('Switch to specific persona / 특정 페르소나로 전환')
  .action(async (personaName) => {
    const personaCmd = new PersonaCommand();
    await personaCmd.setPersona(personaName);
  });

persona
  .command('reset')
  .alias('r')
  .description('Reset to default persona / 기본 페르소나로 리셋')
  .action(async () => {
    const personaCmd = new PersonaCommand();
    await personaCmd.resetPersona();
  });

// Sprint task management command
program
  .command('sprint-task <sprintId> <taskTitle>')
  .alias('st')
  .description('Add a task to an existing sprint / 스프린트에 태스크 추가')
  .action(async (sprintId, taskTitle) => {
    try {
      await addTaskToSprint(sprintId, taskTitle);
    } catch (error) {
      console.error(chalk.red(`오류: ${error.message}`));
      process.exit(1);
    }
  });

// Create project command
program
  .command('create-project')
  .alias('create')
  .description('Create a new AIWF project / 새 AIWF 프로젝트 생성')
  .action(async () => {
    try {
      await createProject();
    } catch (error) {
      console.error(chalk.red(`오류: ${error.message}`));
      process.exit(1);
    }
  });

// Context compression command
program
  .command('compress [mode] [path]')
  .description('Compress context for token optimization / 토큰 최적화를 위한 컨텍스트 압축')
  .option('--persona, -p', 'Enable persona-aware compression / 페르소나 인식 압축 활성화')
  .action(async (mode, path, options) => {
    const compressCmd = new CompressCommand();
    const args = [];
    if (mode) args.push(mode);
    if (path) args.push(path);
    if (options.persona) args.push('--persona');
    await compressCmd.execute(args);
  });


// Token tracking commands
const token = program.command('token');
token.description('Manage token usage tracking / 토큰 사용량 추적 관리');

token
  .command('status')
  .alias('s')
  .description('Show token usage status / 토큰 사용 현황 표시')
  .action(async () => {
    const tokenCmd = new TokenCommand();
    await tokenCmd.execute(['status']);
  });

token
  .command('report [period]')
  .description('Generate usage report / 사용 리포트 생성')
  .action(async (period) => {
    const tokenCmd = new TokenCommand();
    const args = ['report'];
    if (period) args.push(period);
    await tokenCmd.execute(args);
  });

token
  .command('track <input> <output>')
  .description('Manually track token usage / 토큰 사용량 수동 기록')
  .action(async (input, output) => {
    const tokenCmd = new TokenCommand();
    await tokenCmd.execute(['track', input, output]);
  });

token
  .command('limit <type> <value>')
  .description('Set usage limits / 사용 한도 설정')
  .action(async (type, value) => {
    const tokenCmd = new TokenCommand();
    await tokenCmd.execute(['limit', type, value]);
  });

token
  .command('reset')
  .description('Reset tracking data / 추적 데이터 초기화')
  .action(async () => {
    const tokenCmd = new TokenCommand();
    await tokenCmd.execute(['reset']);
  });

// Evaluation commands
const evaluate = program.command('evaluate');
evaluate.description('Evaluate AI responses and code quality / AI 응답 및 코드 품질 평가');

evaluate
  .command('response <file>')
  .description('Evaluate AI response quality / AI 응답 품질 평가')
  .action(async (file) => {
    const evaluateCmd = new EvaluateCommand();
    await evaluateCmd.execute(['response', file]);
  });

evaluate
  .command('code <file>')
  .description('Evaluate code quality / 코드 품질 평가')
  .action(async (file) => {
    const evaluateCmd = new EvaluateCommand();
    await evaluateCmd.execute(['code', file]);
  });

evaluate
  .command('persona <file> <persona>')
  .description('Evaluate persona appropriateness / 페르소나 적합성 평가')
  .action(async (file, persona) => {
    const evaluateCmd = new EvaluateCommand();
    await evaluateCmd.execute(['persona', file, persona]);
  });

evaluate
  .command('report')
  .description('Generate evaluation report / 평가 리포트 생성')
  .action(async () => {
    const evaluateCmd = new EvaluateCommand();
    await evaluateCmd.execute(['report']);
  });

evaluate
  .command('criteria')
  .description('Show evaluation criteria / 평가 기준 표시')
  .action(async () => {
    const evaluateCmd = new EvaluateCommand();
    await evaluateCmd.execute(['criteria']);
  });

// State management commands
const state = program.command('state');
state.description('Manage task state index / 태스크 상태 인덱스 관리');

state
  .command('init')
  .description('Initialize state index / 상태 인덱스 초기화')
  .action(async () => {
    const stateCmd = new StateCommand();
    await stateCmd.execute(['init']);
  });

state
  .command('update')
  .alias('u')
  .description('Update state index / 상태 인덱스 업데이트')
  .action(async () => {
    const stateCmd = new StateCommand();
    await stateCmd.execute(['update']);
  });

state
  .command('show')
  .alias('s')
  .description('Show current state / 현재 상태 표시')
  .action(async () => {
    const stateCmd = new StateCommand();
    await stateCmd.execute(['show']);
  });

state
  .command('focus <task-id>')
  .alias('f')
  .description('Focus on a task / 태스크에 포커스')
  .action(async (taskId) => {
    const stateCmd = new StateCommand();
    await stateCmd.execute(['focus', taskId]);
  });

state
  .command('complete <task-id>')
  .alias('c')
  .description('Mark task as completed / 태스크 완료 처리')
  .action(async (taskId) => {
    const stateCmd = new StateCommand();
    await stateCmd.execute(['complete', taskId]);
  });

state
  .command('next')
  .alias('n')
  .description('Suggest next actions / 다음 작업 제안')
  .action(async () => {
    const stateCmd = new StateCommand();
    await stateCmd.execute(['next']);
  });

// Sprint management commands (YOLO focused)
const sprint = program.command('sprint');
sprint.description('Independent sprint management / 독립 스프린트 관리');

sprint
  .command('independent [name]')
  .alias('ind')
  .description('Create independent sprint / 독립 스프린트 생성')
  .option('--from-readme', 'Extract from README TODOs / README TODO에서 추출')
  .option('--from-issue <number>', 'Create from GitHub issue / GitHub 이슈에서 생성')
  .option('--minimal', 'Minimal engineering level / 최소 엔지니어링 레벨')
  .option('--balanced', 'Balanced engineering level / 균형 엔지니어링 레벨')
  .option('--complete', 'Complete engineering level / 완전 엔지니어링 레벨')
  .option('--description <desc>', 'Sprint description / 스프린트 설명')
  .action(async (name, options) => {
    try {
      console.log(chalk.blue('🚀 독립 스프린트 생성 중...'));
      
      // 엔지니어링 레벨 결정
      let engineeringLevel = 'minimal';
      if (options.balanced) engineeringLevel = 'balanced';
      else if (options.complete) engineeringLevel = 'complete';
      
      const sprintOptions = {
        name,
        description: options.description,
        engineeringLevel,
        fromReadme: options.fromReadme,
        fromIssue: options.fromIssue,
        minimal: engineeringLevel === 'minimal'
      };
      
      const result = await createIndependentSprint(sprintOptions);
      
      if (result.success) {
        console.log('');
        console.log(chalk.green('✅ 독립 스프린트 생성 완료!'));
        console.log(`  스프린트 ID: ${chalk.cyan(result.sprintId)}`);
        console.log(`  태스크 수: ${chalk.blue(result.tasks)}개`);
        console.log('');
        console.log(chalk.bold('🚀 다음 단계:'));
        console.log(`  Claude Code에서 ${chalk.cyan(`/project:aiwf:yolo ${result.sprintId}`)} 실행`);
      }
    } catch (error) {
      console.error(chalk.red('❌ 독립 스프린트 생성 실패:'), error.message);
      process.exit(1);
    }
  });

// YOLO configuration commands  
const yoloConfig = program.command('yolo-config');
yoloConfig.description('YOLO configuration management / YOLO 설정 관리');

yoloConfig
  .command('init')
  .description('Initialize YOLO configuration / YOLO 설정 초기화')
  .option('-f, --force', 'Force overwrite existing config / 기존 설정 덮어쓰기')
  .action(async (options) => {
    try {
      const result = await createYoloConfig(options);
      if (result.success) {
        console.log(chalk.green('✅ YOLO 설정이 초기화되었습니다!'));
        console.log(`📁 위치: ${chalk.cyan(result.configPath)}`);
      } else if (result.skipped) {
        console.log(chalk.yellow('⏭️ 설정 파일이 이미 존재합니다.'));
      }
    } catch (error) {
      console.error(chalk.red('❌ YOLO 설정 초기화 실패:'), error.message);
      process.exit(1);
    }
  });

yoloConfig
  .command('wizard')
  .alias('interactive')
  .description('Interactive YOLO configuration wizard / 대화형 YOLO 설정 마법사')
  .action(async () => {
    try {
      const result = await createInteractiveYoloConfig();
      if (!result.success && result.cancelled) {
        process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red('❌ YOLO 설정 마법사 실패:'), error.message);
      process.exit(1);
    }
  });

yoloConfig
  .command('show')
  .alias('status')
  .description('Show current YOLO configuration / 현재 YOLO 설정 확인')
  .action(async () => {
    try {
      await showYoloConfig();
    } catch (error) {
      console.error(chalk.red('❌ YOLO 설정 확인 실패:'), error.message);
      process.exit(1);
    }
  });

// Checkpoint management commands (YOLO recovery)
const checkpoint = program.command('checkpoint');
checkpoint.description('YOLO checkpoint management / YOLO 체크포인트 관리');

checkpoint
  .command('list')
  .alias('ls')
  .description('List available checkpoints / 사용 가능한 체크포인트 목록')
  .option('--limit <n>', 'Limit number of checkpoints / 체크포인트 수 제한', '10')
  .action(async (options) => {
    try {
      // 프로젝트 루트 찾기
      const fs = await import('fs/promises');
      const path = await import('path');
      let currentDir = process.cwd();
      
      while (currentDir !== path.parse(currentDir).root) {
        try {
          await fs.access(path.join(currentDir, '.aiwf'));
          break;
        } catch {
          currentDir = path.dirname(currentDir);
        }
      }
      
      const manager = new CheckpointManager(currentDir);
      const checkpoints = await manager.listCheckpoints();
      
      console.log(chalk.bold('📊 체크포인트 목록:'));
      console.log('');
      
      if (checkpoints.length === 0) {
        console.log(chalk.yellow('📭 체크포인트가 없습니다.'));
        return;
      }
      
      const limit = parseInt(options.limit);
      const limitedCheckpoints = checkpoints.slice(0, limit);
      
      for (const cp of limitedCheckpoints) {
        const typeIcon = cp.type === 'session_start' ? '🚀' :
                        cp.type === 'task_complete' ? '✅' : '🔄';
        console.log(`${typeIcon} ${chalk.cyan(cp.id)} - ${chalk.yellow(cp.type)}`);
        console.log(`    태스크: ${chalk.blue(cp.tasks_completed)}개 완료`);
        console.log('');
      }
    } catch (error) {
      console.error(chalk.red('❌ 체크포인트 목록 조회 실패:'), error.message);
      process.exit(1);
    }
  });

checkpoint
  .command('add [type]')
  .alias('create')
  .description('Create a checkpoint / 체크포인트 생성')
  .option('-m, --message <text>', 'Description for the checkpoint / 체크포인트 설명')
  .option('--meta <json>', 'Additional metadata as JSON / 추가 메타데이터(JSON)')
  .option('--cleanup <n>', 'Keep only last N checkpoints after creating / 생성 후 최근 N개만 보존')
  .action(async (type, options) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      let currentDir = process.cwd();

      // 프로젝트 루트 탐색 (.aiwf 기준)
      while (currentDir !== path.parse(currentDir).root) {
        try {
          await fs.access(path.join(currentDir, '.aiwf'));
          break;
        } catch {
          currentDir = path.dirname(currentDir);
        }
      }

      const manager = new CheckpointManager(currentDir);
      await manager.initialize();

      // 메타데이터 구성
      const metadata = {};
      if (options.message) metadata.message = options.message;
      if (options.meta) {
        try {
          const parsed = JSON.parse(options.meta);
          Object.assign(metadata, parsed);
        } catch (e) {
          console.error(chalk.red('❌ --meta 값이 올바른 JSON 형식이 아닙니다.'));
          process.exit(1);
        }
      }

      const cpType = type || 'manual';
      const checkpointId = await manager.createCheckpoint(cpType, metadata);

      console.log(chalk.green('✅ 체크포인트 생성 완료!'));
      console.log(`  ID: ${chalk.cyan(checkpointId)}  유형: ${chalk.yellow(cpType)}`);
      if (metadata.message) {
        console.log(`  메시지: ${chalk.blue(metadata.message)}`);
      }

      if (options.cleanup) {
        const keep = parseInt(options.cleanup, 10);
        if (!Number.isNaN(keep) && keep > 0) {
          await manager.cleanup(keep);
          console.log(`🧹 최근 ${chalk.cyan(keep)}개만 보존하도록 정리했습니다.`);
        } else {
          console.log(chalk.yellow('⚠️ --cleanup 값이 유효하지 않아 정리를 건너뜁니다. 정수로 입력하세요.'));
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ 체크포인트 생성 실패:'), error.message);
      process.exit(1);
    }
  });

checkpoint
  .command('restore <checkpointId>')
  .description('Restore from checkpoint / 체크포인트에서 복구')
  .action(async (checkpointId) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      let currentDir = process.cwd();
      
      while (currentDir !== path.parse(currentDir).root) {
        try {
          await fs.access(path.join(currentDir, '.aiwf'));
          break;
        } catch {
          currentDir = path.dirname(currentDir);
        }
      }
      
      const manager = new CheckpointManager(currentDir);
      await manager.initialize();
      
      console.log(chalk.blue(`🔄 체크포인트 ${checkpointId}에서 복구 중...`));
      
      const result = await manager.restoreFromCheckpoint(checkpointId);
      
      if (result.success) {
        console.log(chalk.green('✅ 체크포인트 복구 성공!'));
        console.log(`  세션 ID: ${chalk.cyan(result.checkpoint.state_snapshot.session_id)}`);
        console.log(`  스프린트: ${chalk.blue(result.checkpoint.state_snapshot.sprint_id || 'N/A')}`);
        console.log('');
        console.log(chalk.green('🚀 복구 완료! YOLO 모드를 다시 실행할 수 있습니다.'));
      }
    } catch (error) {
      console.error(chalk.red('❌ 체크포인트 복구 실패:'), error.message);
      process.exit(1);
    }
  });

checkpoint
  .command('status')
  .description('Show current YOLO session status / 현재 YOLO 세션 상태')
  .action(async () => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      let currentDir = process.cwd();
      
      while (currentDir !== path.parse(currentDir).root) {
        try {
          await fs.access(path.join(currentDir, '.aiwf'));
          break;
        } catch {
          currentDir = path.dirname(currentDir);
        }
      }
      
      const manager = new CheckpointManager(currentDir);
      await manager.loadState();
      
      console.log(chalk.bold('📊 YOLO 세션 상태:'));
      console.log('');
      
      if (!manager.currentState.session_id) {
        console.log(chalk.yellow('📭 활성 YOLO 세션이 없습니다.'));
        return;
      }
      
      console.log(`세션 ID: ${chalk.cyan(manager.currentState.session_id)}`);
      console.log(`스프린트: ${chalk.blue(manager.currentState.sprint_id || 'N/A')}`);
      console.log(`완료된 태스크: ${chalk.green(manager.currentState.completed_tasks.length)}개`);
      console.log(`체크포인트: ${chalk.blue(manager.currentState.checkpoints.length)}개`);
    } catch (error) {
      console.error(chalk.red('❌ 상태 확인 실패:'), error.message);
      process.exit(1);
    }
  });

// 체크포인트 리포트 생성
checkpoint
  .command('report')
  .description('Generate progress report / 진행 상황 리포트 생성')
  .action(async () => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      let currentDir = process.cwd();
      
      while (currentDir !== path.parse(currentDir).root) {
        try {
          await fs.access(path.join(currentDir, '.aiwf'));
          break;
        } catch {
          currentDir = path.dirname(currentDir);
        }
      }
      
      const manager = new CheckpointManager(currentDir);
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
      console.log('');
      
      // 진행 상황
      console.log(chalk.bold('📈 진행 상황:'));
      console.log(`  완료: ${chalk.green(report.progress.completed)}개`);
      console.log(`  실패: ${chalk.red(report.progress.failed)}개`);
      console.log(`  건너뜀: ${chalk.yellow(report.progress.skipped)}개`);
      console.log('');
      
      // 성능 지표
      console.log(chalk.bold('⏱️ 성능 지표:'));
      console.log(`  총 시간: ${chalk.blue(report.performance.total_time)}`);
      console.log(`  평균 태스크 시간: ${chalk.blue(report.performance.avg_task_time)}`);
      console.log(`  성공률: ${chalk.green(report.performance.success_rate)}`);
      
    } catch (error) {
      console.error(chalk.red('❌ 리포트 생성 실패:'), error.message);
      process.exit(1);
    }
  });

// 체크포인트 정리
checkpoint
  .command('clean')
  .description('Clean old checkpoints / 오래된 체크포인트 정리')
  .option('--keep <n>', 'Number of checkpoints to keep / 유지할 체크포인트 수', '10')
  .option('--dry-run', 'Preview without deletion / 실제 삭제 없이 미리보기')
  .action(async (options) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      let currentDir = process.cwd();
      
      while (currentDir !== path.parse(currentDir).root) {
        try {
          await fs.access(path.join(currentDir, '.aiwf'));
          break;
        } catch {
          currentDir = path.dirname(currentDir);
        }
      }
      
      const manager = new CheckpointManager(currentDir);
      const keepLast = parseInt(options.keep);
      
      console.log(chalk.blue(`🧹 체크포인트 정리 중... (최근 ${keepLast}개 유지)`));
      
      if (options.dryRun) {
        console.log(chalk.yellow('🔍 드라이런 모드: 실제 삭제는 수행하지 않습니다.'));
        const checkpoints = await manager.listCheckpoints();
        if (checkpoints.length <= keepLast) {
          console.log(chalk.green('✅ 정리할 체크포인트가 없습니다.'));
        } else {
          const toDelete = checkpoints.slice(keepLast);
          console.log(chalk.yellow(`삭제 예정 체크포인트 (${toDelete.length}개):`));
          for (const cp of toDelete) {
            console.log(`  ${chalk.red('🗑️')} ${chalk.cyan(cp.id)}`);
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

// Engineering Guard commands (오버엔지니어링 방지)
const guard = program.command('guard');
guard.description('Engineering guard for overengineering prevention / 오버엔지니어링 방지 가드');

guard
  .command('check [path]')
  .description('Check project complexity / 프로젝트 복잡도 검사')
  .option('--config <path>', 'YOLO config file path / YOLO 설정 파일 경로', '.aiwf/yolo-config.yaml')
  .action(async (targetPath, options) => {
    try {
      const { EngineeringGuard } = await import('../utils/engineering-guard.js');
      const guard = new EngineeringGuard();
      
      // 설정 파일 로드
      await guard.loadConfig(options.config);
      
      const checkPath = targetPath || process.cwd();
      console.log(chalk.blue(`🔍 복잡도 검사 중: ${checkPath}`));
      console.log('');
      
      const report = await guard.checkProject(checkPath);
      
      // 결과 출력
      console.log(chalk.bold('📊 복잡도 분석 결과:'));
      console.log(`  총 위반사항: ${chalk.yellow(report.summary.total_violations)}`);
      console.log(`  높은 심각도: ${chalk.red(report.summary.high_severity)}`);
      console.log(`  중간 심각도: ${chalk.yellow(report.summary.medium_severity)}`);
      console.log(`  경고사항: ${chalk.blue(report.summary.warnings)}`);
      console.log('');
      
      if (report.violations && report.violations.length > 0) {
        console.log(chalk.bold('🚨 위반사항:'));
        for (const violation of report.violations.slice(0, 10)) {
          const icon = violation.severity === 'high' ? '❌' : 
                      violation.severity === 'medium' ? '⚠️' : '💡';
          console.log(`  ${icon} ${chalk.cyan(violation.type)}: ${violation.file || violation.message}`);
          if (violation.details) {
            console.log(`      ${chalk.gray(violation.details)}`);
          }
        }
        console.log('');
      }
      
      if (report.recommendations && report.recommendations.length > 0) {
        console.log(chalk.bold('💡 권장사항:'));
        for (const rec of report.recommendations) {
          console.log(`  • ${chalk.green(rec)}`);
        }
        console.log('');
      }
      
      // 통과/실패 판정
      if (report.passed) {
        console.log(chalk.green('✅ 복잡도 기준 통과'));
      } else {
        console.log(chalk.red('❌ 복잡도 기준 초과 - 리팩토링 필요'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 복잡도 검사 실패:'), error.message);
      process.exit(1);
    }
  });

guard
  .command('quick [path]')
  .description('Quick complexity check / 빠른 복잡도 체크')
  .action(async (targetPath) => {
    try {
      const { quickCheck } = await import('../utils/engineering-guard.js');
      
      const checkPath = targetPath || process.cwd();
      console.log(chalk.blue(`⚡ 빠른 복잡도 체크: ${checkPath}`));
      
      const report = await quickCheck(checkPath);
      
      if (report.summary.high_severity > 0) {
        console.log(chalk.red('⚠️ 오버엔지니어링 위험 감지!'));
        console.log('권장사항:', report.recommendations.join(', '));
      } else {
        console.log(chalk.green('✅ 복잡도 양호'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 빠른 체크 실패:'), error.message);
      process.exit(1);
    }
  });

guard
  .command('init')
  .description('Initialize YOLO config with guard settings / YOLO 설정 초기화')
  .action(async () => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const yaml = await import('js-yaml');
      
      const configPath = path.join(process.cwd(), '.aiwf', 'yolo-config.yaml');
      
      // 기본 설정 생성
      const defaultConfig = {
        engineering_level: 'minimal',
        focus_rules: ['requirement_first', 'simple_solution', 'no_gold_plating', 'stay_on_track'],
        overengineering_prevention: {
          max_file_lines: 300,
          max_function_lines: 50,
          max_nesting_depth: 4,
          max_abstraction_layers: 3,
          limit_design_patterns: true,
          no_future_proofing: true,
          enforce_yagni: true
        }
      };
      
      // .aiwf 디렉토리 생성
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      
      // 설정 파일 쓰기
      await fs.writeFile(configPath, yaml.dump(defaultConfig), 'utf-8');
      
      console.log(chalk.green('✅ YOLO 설정 파일 생성 완료!'));
      console.log(`  경로: ${chalk.cyan(configPath)}`);
      console.log('');
      console.log(chalk.bold('🛡️ 오버엔지니어링 방지 설정:'));
      console.log(`  파일 크기 제한: ${chalk.yellow('300')}줄`);
      console.log(`  함수 크기 제한: ${chalk.yellow('50')}줄`);
      console.log(`  중첩 깊이 제한: ${chalk.yellow('4')}레벨`);
      console.log(`  YAGNI 원칙: ${chalk.green('적용')}`);
      
    } catch (error) {
      console.error(chalk.red('❌ 설정 초기화 실패:'), error.message);
      process.exit(1);
    }
  });

guard
  .command('feedback [area]')
  .description('Get engineering feedback for area / 특정 영역 피드백 받기')
  .action(async (area) => {
    try {
      const { EngineeringGuard } = await import('../utils/engineering-guard.js');
      const guard = new EngineeringGuard();
      
      // 설정 파일 로드 시도
      await guard.loadConfig('.aiwf/yolo-config.yaml');
      
      const targetArea = area || 'current_task_area';
      console.log(chalk.blue(`💡 엔지니어링 피드백 제공: ${targetArea}`));
      console.log('');
      
      const feedback = await guard.provideFeedback(targetArea);
      
      if (feedback && feedback.length > 0) {
        for (const item of feedback) {
          const icon = item.level === 'error' ? '❌' :
                      item.level === 'warning' ? '⚠️' : '💡';
          console.log(`${icon} ${item.message}`);
        }
      } else {
        console.log(chalk.green('✅ 현재 영역은 복잡도 기준을 만족합니다.'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 피드백 생성 실패:'), error.message);
      process.exit(1);
    }
  });

// GitHub integration commands
const github = program.command('github');
github.description('GitHub integration / GitHub 통합');

github
  .command('issue <task-id>')
  .description('Create GitHub issue from task / 태스크에서 GitHub 이슈 생성')
  .action(async (taskId) => {
    try {
      const { GitHubIntegration } = await import('../lib/github-integration.js');
      const ghIntegration = new GitHubIntegration();
      await ghIntegration.createIssue(taskId);
    } catch (error) {
      console.error(chalk.red(`GitHub issue creation failed: ${error.message}`));
      process.exit(1);
    }
  });

github
  .command('pr [task-id]')
  .description('Create pull request for completed task / 완료된 태스크로 PR 생성')
  .action(async (taskId) => {
    try {
      const { GitHubIntegration } = await import('../lib/github-integration.js');
      const ghIntegration = new GitHubIntegration();
      await ghIntegration.createPullRequest(taskId);
    } catch (error) {
      console.error(chalk.red(`Pull request creation failed: ${error.message}`));
      process.exit(1);
    }
  });

github
  .command('sync')
  .description('Sync GitHub issues with AIWF tasks / GitHub 이슈와 AIWF 태스크 동기화')
  .action(async () => {
    try {
      const { GitHubIntegration } = await import('../lib/github-integration.js');
      const ghIntegration = new GitHubIntegration();
      await ghIntegration.syncIssues();
    } catch (error) {
      console.error(chalk.red(`GitHub sync failed: ${error.message}`));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);