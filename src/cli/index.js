#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { installAIWF } from '../lib/installer.js';
import AIToolCommand from '../commands/ai-tool.js';
import PersonaCommand from '../commands/persona.js';
import { CacheCLI } from './cache-cli.js';
import { addTaskToSprint } from '../commands/sprint-task.js';
import CompressCommand from '../commands/compress.js';
import FeatureCommand from '../commands/feature.js';
import TokenCommand from '../commands/token.js';
import EvaluateCommand from '../commands/evaluate.js';
import { createProject } from '../commands/create-project.js';

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
  .option('-f, --force', 'Force install without prompts')
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

// Feature ledger management commands
const feature = program.command('feature');
feature.description('Manage feature development tracking / 기능 개발 추적 관리');

feature
  .command('list')
  .alias('ls')
  .description('List all features / 모든 기능 목록')
  .action(async () => {
    const featureCmd = new FeatureCommand();
    await featureCmd.execute(['list']);
  });

feature
  .command('create <name> [description...]')
  .alias('add')
  .description('Create a new feature / 새 기능 생성')
  .action(async (name, description) => {
    const featureCmd = new FeatureCommand();
    const args = ['create', name];
    if (description) args.push(...description);
    await featureCmd.execute(args);
  });

feature
  .command('update <featureId> <status>')
  .description('Update feature status / 기능 상태 업데이트')
  .action(async (featureId, status) => {
    const featureCmd = new FeatureCommand();
    await featureCmd.execute(['update', featureId, status]);
  });

feature
  .command('status [featureId]')
  .description('Show feature status / 기능 상태 표시')
  .action(async (featureId) => {
    const featureCmd = new FeatureCommand();
    const args = ['status'];
    if (featureId) args.push(featureId);
    await featureCmd.execute(args);
  });

feature
  .command('sync')
  .description('Sync with git commits / Git 커밋과 동기화')
  .action(async () => {
    const featureCmd = new FeatureCommand();
    await featureCmd.execute(['sync']);
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

// Parse command line arguments
program.parse(process.argv);