#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { installAIWF } from '../lib/installer.js';
import StateCommand from '../commands/state.js';
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
  .option('--docs-only', 'Install AIWF documentation folder only')
  .option('--claude-only', 'Install Claude Code commands and agents only')
  .option('--windsurf-only', 'Install Windsurf rules only')
  .option('--cursor-only', 'Install Cursor rules only')
  .option('--all', 'Install all components (default behavior)')
  .option('--interactive', 'Interactive installation with option selection')
  .action((options) => {
    // Convert CLI options to selectedOptions array
    const selectedOptions = [];

    if (options.docsOnly) {
      selectedOptions.push('aiwf-docs');
    } else if (options.claudeOnly) {
      selectedOptions.push('claude-code-commands');
    } else if (options.windsurfOnly) {
      selectedOptions.push('windsurf-rules');
    } else if (options.cursorOnly) {
      selectedOptions.push('cursor-rules');
    } else if (options.all) {
      selectedOptions.push('aiwf-docs', 'claude-code-commands', 'windsurf-rules', 'cursor-rules');
    }

    // Pass selected options to installer
    installAIWF({
      ...options,
      debugLog: true,
      preselectedOptions: selectedOptions.length > 0 ? selectedOptions : null
    });
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


// Display ASCII art logo
const aiwfLogo = figlet.textSync('AIWF', {
  font: 'ANSI Shadow',
  horizontalLayout: 'default',
  verticalLayout: 'default',
  width: 80,
  whitespaceBreak: true
});

console.log(chalk.magentaBright(aiwfLogo));
console.log(chalk.cyanBright.bold('AI Workflow Framework'));
console.log();

// Parse command line arguments
program.parse(process.argv);