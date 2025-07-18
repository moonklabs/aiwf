#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { installAIWF } from '../lib/installer.js';
import AIToolCommand from '../commands/ai-tool.js';
import { CacheCLI } from './cache-cli.js';

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

// Install command (default action)
program
  .command('install', { isDefault: true })
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

// Parse command line arguments
program.parse(process.argv);