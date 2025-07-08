#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
// import { table } from 'table'; // 임시로 비활성화

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * AI Tool integration command for AIWF
 * Manages AI tool templates and configurations
 */
export class AIToolCommand {
  constructor() {
    this.toolsPath = path.join(process.cwd(), '.aiwf', 'ai-tools');
    this.availableTools = ['claude-code', 'github-copilot', 'cursor', 'windsurf', 'augment'];
  }

  /**
   * Main command handler
   */
  async execute(args) {
    const subcommand = args[0];
    const toolName = args[1];

    switch (subcommand) {
      case 'install':
        return await this.install(toolName);
      case 'list':
        return await this.list();
      case 'update':
        return await this.update(toolName);
      case 'verify':
        return await this.verify(toolName);
      case 'check':
        return await this.check(toolName);
      case 'version':
        return await this.version(toolName);
      default:
        return this.showHelp();
    }
  }

  /**
   * Install an AI tool template
   */
  async install(toolName) {
    if (!toolName) {
      console.error(chalk.red('Error: Tool name is required'));
      console.log('Usage: aiwf ai-tool install <tool-name>');
      console.log(`Available tools: ${this.availableTools.join(', ')}`);
      return;
    }

    if (!this.availableTools.includes(toolName)) {
      console.error(chalk.red(`Error: Unknown tool '${toolName}'`));
      console.log(`Available tools: ${this.availableTools.join(', ')}`);
      return;
    }

    const spinner = ora(`Installing ${toolName} template...`).start();

    try {
      const toolPath = path.join(this.toolsPath, toolName);
      const configPath = path.join(toolPath, 'config.json');

      // Check if tool template exists
      if (!await fs.pathExists(configPath)) {
        spinner.fail(`Template for ${toolName} not found`);
        return;
      }

      // Read configuration
      const config = await fs.readJson(configPath);
      
      // Copy template files
      for (const fileToCopy of config.files_to_copy) {
        const sourcePath = path.join(toolPath, fileToCopy.source);
        const destPath = path.join(process.cwd(), fileToCopy.destination);

        if (await fs.pathExists(sourcePath)) {
          await fs.copy(sourcePath, destPath, { overwrite: true });
          spinner.text = `Copying ${fileToCopy.destination}...`;
        }
      }

      // Run setup commands if any
      if (config.setup_commands && config.setup_commands.length > 0) {
        spinner.text = 'Running setup commands...';
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);

        for (const command of config.setup_commands) {
          await execAsync(command);
        }
      }

      // Create installation record
      const installRecord = {
        tool: toolName,
        version: config.version,
        installedAt: new Date().toISOString(),
        features: config.features
      };

      const recordPath = path.join(process.cwd(), '.aiwf', 'ai-tools-installed.json');
      let installedTools = {};
      
      if (await fs.pathExists(recordPath)) {
        installedTools = await fs.readJson(recordPath);
      }

      installedTools[toolName] = installRecord;
      await fs.writeJson(recordPath, installedTools, { spaces: 2 });

      spinner.succeed(chalk.green(`Successfully installed ${toolName} template`));
      
      // Show post-installation message
      console.log('\n' + chalk.cyan('Next steps:'));
      console.log(`1. Review the installed files`);
      console.log(`2. Customize settings as needed`);
      console.log(`3. Read the documentation in .aiwf/ai-tools/${toolName}/README.md`);

      // Show feature status
      if (config.features) {
        console.log('\n' + chalk.cyan('Enabled features:'));
        Object.entries(config.features).forEach(([feature, enabled]) => {
          if (enabled) {
            console.log(`  ✓ ${feature}`);
          }
        });
      }

    } catch (error) {
      spinner.fail(`Failed to install ${toolName}: ${error.message}`);
      console.error(chalk.red(error.stack));
    }
  }

  /**
   * List available and installed AI tools
   */
  async list() {
    console.log(chalk.cyan('\n🤖 AI Tool Templates\n'));

    const installedPath = path.join(process.cwd(), '.aiwf', 'ai-tools-installed.json');
    let installedTools = {};

    if (await fs.pathExists(installedPath)) {
      installedTools = await fs.readJson(installedPath);
    }

    const tableData = [
      ['Tool', 'Status', 'Version', 'Features']
    ];

    for (const toolName of this.availableTools) {
      const toolPath = path.join(this.toolsPath, toolName);
      const configPath = path.join(toolPath, 'config.json');

      if (await fs.pathExists(configPath)) {
        const config = await fs.readJson(configPath);
        const isInstalled = installedTools[toolName] ? '✓ Installed' : 'Available';
        const status = isInstalled === '✓ Installed' ? chalk.green(isInstalled) : chalk.gray(isInstalled);
        const version = installedTools[toolName]?.version || config.version;
        const features = Object.entries(config.features)
          .filter(([_, enabled]) => enabled)
          .map(([feature]) => feature)
          .slice(0, 3)
          .join(', ') + (Object.keys(config.features).length > 3 ? '...' : '');

        tableData.push([
          chalk.bold(toolName),
          status,
          version,
          features
        ]);
      }
    }

    console.log(table(tableData, {
      border: {
        topBody: '─',
        topJoin: '┬',
        topLeft: '┌',
        topRight: '┐',
        bottomBody: '─',
        bottomJoin: '┴',
        bottomLeft: '└',
        bottomRight: '┘',
        bodyLeft: '│',
        bodyRight: '│',
        bodyJoin: '│',
        joinBody: '─',
        joinLeft: '├',
        joinRight: '┤',
        joinJoin: '┼'
      }
    }));

    console.log('\n' + chalk.cyan('Commands:'));
    console.log('  Install a tool:  aiwf ai-tool install <tool-name>');
    console.log('  Update a tool:   aiwf ai-tool update <tool-name>');
    console.log('  Verify a tool:   aiwf ai-tool verify <tool-name>');
  }

  /**
   * Update an installed AI tool template
   */
  async update(toolName) {
    if (!toolName) {
      console.error(chalk.red('Error: Tool name is required'));
      return;
    }

    const installedPath = path.join(process.cwd(), '.aiwf', 'ai-tools-installed.json');
    
    if (!await fs.pathExists(installedPath)) {
      console.error(chalk.red('No AI tools installed'));
      return;
    }

    const installedTools = await fs.readJson(installedPath);

    if (!installedTools[toolName]) {
      console.error(chalk.red(`${toolName} is not installed`));
      return;
    }

    console.log(chalk.cyan(`Updating ${toolName}...`));
    
    // Reinstall with latest template
    await this.install(toolName);
  }

  /**
   * Verify an installed AI tool
   */
  async verify(toolName) {
    if (!toolName) {
      console.error(chalk.red('Error: Tool name is required'));
      return;
    }

    const spinner = ora(`Verifying ${toolName} installation...`).start();

    try {
      const toolPath = path.join(this.toolsPath, toolName);
      const configPath = path.join(toolPath, 'config.json');
      const config = await fs.readJson(configPath);

      let allFilesExist = true;
      const missingFiles = [];

      // Check if all required files exist
      for (const fileToCopy of config.files_to_copy) {
        const destPath = path.join(process.cwd(), fileToCopy.destination);
        if (!await fs.pathExists(destPath)) {
          allFilesExist = false;
          missingFiles.push(fileToCopy.destination);
        }
      }

      if (allFilesExist) {
        spinner.succeed(chalk.green(`${toolName} installation verified successfully`));
      } else {
        spinner.fail(chalk.red(`${toolName} installation incomplete`));
        console.log(chalk.yellow('\nMissing files:'));
        missingFiles.forEach(file => console.log(`  - ${file}`));
        console.log(chalk.cyan(`\nRun 'aiwf ai-tool install ${toolName}' to fix`));
      }

    } catch (error) {
      spinner.fail(`Failed to verify ${toolName}: ${error.message}`);
    }
  }

  /**
   * Check for updates for a tool
   */
  async check(toolName) {
    if (!toolName) {
      // Check all installed tools
      const installedPath = path.join(process.cwd(), '.aiwf', 'ai-tools-installed.json');
      
      if (!await fs.pathExists(installedPath)) {
        console.log(chalk.yellow('No AI tools installed'));
        return;
      }

      const installedTools = await fs.readJson(installedPath);
      console.log(chalk.cyan('\nChecking for updates...\n'));

      for (const [tool, info] of Object.entries(installedTools)) {
        await this.checkSingleTool(tool, info.version);
      }
    } else {
      await this.checkSingleTool(toolName);
    }
  }

  /**
   * Check a single tool for updates
   */
  async checkSingleTool(toolName, installedVersion) {
    const toolPath = path.join(this.toolsPath, toolName);
    const configPath = path.join(toolPath, 'config.json');

    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      const latestVersion = config.version;

      if (!installedVersion) {
        // Get installed version
        const installedPath = path.join(process.cwd(), '.aiwf', 'ai-tools-installed.json');
        if (await fs.pathExists(installedPath)) {
          const installedTools = await fs.readJson(installedPath);
          installedVersion = installedTools[toolName]?.version;
        }
      }

      if (installedVersion && installedVersion !== latestVersion) {
        console.log(chalk.yellow(`${toolName}: Update available (${installedVersion} → ${latestVersion})`));
      } else if (installedVersion) {
        console.log(chalk.green(`${toolName}: Up to date (${latestVersion})`));
      } else {
        console.log(chalk.gray(`${toolName}: Not installed`));
      }
    }
  }

  /**
   * Show version of a tool
   */
  async version(toolName) {
    if (!toolName) {
      console.error(chalk.red('Error: Tool name is required'));
      return;
    }

    const installedPath = path.join(process.cwd(), '.aiwf', 'ai-tools-installed.json');
    
    if (await fs.pathExists(installedPath)) {
      const installedTools = await fs.readJson(installedPath);
      if (installedTools[toolName]) {
        console.log(`${toolName}: ${installedTools[toolName].version}`);
        return;
      }
    }

    console.log(chalk.yellow(`${toolName} is not installed`));
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log(chalk.cyan('\n🤖 AIWF AI Tool Integration\n'));
    console.log('Usage: aiwf ai-tool <command> [tool-name]');
    console.log('\nCommands:');
    console.log('  install <tool>   Install an AI tool template');
    console.log('  list             List available and installed tools');
    console.log('  update <tool>    Update an installed tool');
    console.log('  verify <tool>    Verify tool installation');
    console.log('  check [tool]     Check for updates');
    console.log('  version <tool>   Show installed version');
    console.log('\nAvailable tools:');
    this.availableTools.forEach(tool => {
      console.log(`  - ${tool}`);
    });
    console.log('\nExamples:');
    console.log('  aiwf ai-tool install claude-code');
    console.log('  aiwf ai-tool list');
    console.log('  aiwf ai-tool update cursor');
  }
}

// Export for use in main CLI
export default AIToolCommand;