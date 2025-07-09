#!/usr/bin/env node

/**
 * AI Persona Commands for Claude Code
 * Manages AI behavior personas for different development tasks
 */

import { AIPersonaManager } from '../../../../lib/ai-persona-manager.js';
import path from 'path';
import chalk from 'chalk';

// Global persona manager instance
let personaManager = null;

/**
 * Get or create persona manager instance
 */
async function getPersonaManager() {
  if (!personaManager) {
    personaManager = new AIPersonaManager({
      personaConfigPath: path.join(process.cwd(), '.aiwf', 'personas'),
      metricsPath: path.join(process.cwd(), '.aiwf', 'metrics'),
      metricsEnabled: true,
      autoDetectionEnabled: true
    });
    
    await personaManager.init();
  }
  
  return personaManager;
}

/**
 * Format persona status for display
 */
function formatPersonaStatus(persona, metrics) {
  const lines = [];
  
  lines.push(chalk.cyan('🎭 AI Persona Status'));
  lines.push(chalk.gray('━'.repeat(50)));
  lines.push(`Current Persona: ${chalk.yellow(persona.name)}`);
  lines.push(`Description: ${persona.description}`);
  
  if (persona.behaviors?.length) {
    lines.push('\nKey Behaviors:');
    persona.behaviors.forEach(behavior => {
      lines.push(`  • ${behavior}`);
    });
  }
  
  if (persona.recommendedTools?.length) {
    lines.push(`\nRecommended Tools: ${persona.recommendedTools.join(', ')}`);
  }
  
  if (metrics && metrics.duration !== undefined) {
    lines.push('\nCurrent Session:');
    lines.push(`  Duration: ${Math.round(metrics.duration / 1000)}s`);
    lines.push(`  Interactions: ${metrics.interactions}`);
    lines.push(`  Token Usage: ${metrics.tokenUsage.current}`);
  }
  
  return lines.join('\n');
}

/**
 * Format persona report
 */
function formatPersonaReport(report) {
  const lines = [];
  
  lines.push(chalk.cyan('📊 AI Persona Performance Report'));
  lines.push(chalk.gray('━'.repeat(50)));
  lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push(`Time Range: ${report.timeRange}`);
  
  // Summary
  lines.push('\n' + chalk.yellow('Summary:'));
  lines.push(`Total Sessions: ${report.summary.totalSessions}`);
  lines.push(`Avg Completion Time: ${Math.round(report.summary.averageCompletionTime / 1000)}s`);
  
  // Persona Usage
  if (report.summary.personaUsage) {
    lines.push('\n' + chalk.yellow('Persona Usage:'));
    Object.entries(report.summary.personaUsage).forEach(([persona, stats]) => {
      lines.push(`  ${persona}: ${stats.count} sessions (${stats.percentage.toFixed(1)}%)`);
    });
  }
  
  // Quality Trend
  if (report.summary.qualityTrend) {
    lines.push('\n' + chalk.yellow('Quality Trend:'));
    lines.push(`  Trend: ${report.summary.qualityTrend.trend}`);
    if (report.summary.qualityTrend.averageScore) {
      lines.push(`  Average Score: ${(report.summary.qualityTrend.averageScore * 100).toFixed(1)}%`);
    }
  }
  
  // Persona Analysis
  if (report.personaAnalysis) {
    lines.push('\n' + chalk.yellow('Persona Performance:'));
    Object.entries(report.personaAnalysis).forEach(([persona, analysis]) => {
      lines.push(`\n  ${chalk.green(persona)}:`);
      lines.push(`    Sessions: ${analysis.sessionCount}`);
      lines.push(`    Completion Rate: ${(analysis.completionRate * 100).toFixed(1)}%`);
      lines.push(`    Avg Quality: ${(analysis.averageQualityScore * 100).toFixed(1)}%`);
      lines.push(`    Token Efficiency: ${(analysis.tokenEfficiency * 100).toFixed(1)}%`);
      
      if (analysis.bestUseCases?.length) {
        lines.push(`    Best For: ${analysis.bestUseCases.join(', ')}`);
      }
    });
  }
  
  // Recommendations
  if (report.recommendations?.length) {
    lines.push('\n' + chalk.yellow('Recommendations:'));
    report.recommendations.forEach(rec => {
      const icon = rec.priority === 'high' ? '🔴' : '🟡';
      lines.push(`  ${icon} ${rec.message}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Command handlers
 */
export const commands = {
  /**
   * Switch to a specific persona
   */
  '/project:aiwf:ai_persona:switch': async (args) => {
    const personaName = args[0];
    
    if (!personaName) {
      return chalk.red('Error: Please specify a persona name (architect, debugger, reviewer, documenter, optimizer, developer)');
    }
    
    try {
      const manager = await getPersonaManager();
      
      if (!manager.isValidPersona(personaName)) {
        return chalk.red(`Error: Invalid persona '${personaName}'. Available personas: ${manager.getAvailablePersonas().join(', ')}`);
      }
      
      await manager.switchPersona(personaName, { manual: true });
      
      return chalk.green(`✅ Switched to ${personaName} persona`);
    } catch (error) {
      return chalk.red(`Error: ${error.message}`);
    }
  },

  /**
   * Shortcuts for specific personas
   */
  '/project:aiwf:ai_persona:architect': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['architect']);
  },

  '/project:aiwf:ai_persona:debugger': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['debugger']);
  },

  '/project:aiwf:ai_persona:reviewer': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['reviewer']);
  },

  '/project:aiwf:ai_persona:documenter': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['documenter']);
  },

  '/project:aiwf:ai_persona:optimizer': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['optimizer']);
  },

  '/project:aiwf:ai_persona:developer': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['developer']);
  },

  /**
   * Enable/disable auto-detection
   */
  '/project:aiwf:ai_persona:auto': async (args) => {
    const enabled = args[0] !== 'false' && args[0] !== 'off';
    
    try {
      const manager = await getPersonaManager();
      manager.options.autoDetectionEnabled = enabled;
      
      return chalk.green(`✅ Auto-detection ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      return chalk.red(`Error: ${error.message}`);
    }
  },

  /**
   * Show current persona status
   */
  '/project:aiwf:ai_persona:status': async () => {
    try {
      const manager = await getPersonaManager();
      const current = manager.getCurrentPersona();
      
      if (!current) {
        return chalk.yellow('No persona currently active');
      }
      
      const metrics = await manager.metricsCollector.getCurrentSessionMetrics();
      
      return formatPersonaStatus(current, metrics);
    } catch (error) {
      return chalk.red(`Error: ${error.message}`);
    }
  },

  /**
   * Generate persona performance report
   */
  '/project:aiwf:ai_persona:report': async (args) => {
    const timeRange = args[0] || 'all';
    
    try {
      const manager = await getPersonaManager();
      const report = await manager.generateReport({ timeRange });
      
      return formatPersonaReport(report);
    } catch (error) {
      return chalk.red(`Error: ${error.message}`);
    }
  },

  /**
   * List available personas
   */
  '/project:aiwf:ai_persona:list': async () => {
    try {
      const manager = await getPersonaManager();
      const personas = manager.getAvailablePersonas();
      const current = manager.getCurrentPersona();
      
      const lines = [];
      lines.push(chalk.cyan('🎭 Available AI Personas'));
      lines.push(chalk.gray('━'.repeat(50)));
      
      for (const personaName of personas) {
        const persona = manager.availablePersonas[personaName];
        const isCurrent = current?.name === personaName;
        
        lines.push(`\n${isCurrent ? '▶ ' : '  '}${chalk.yellow(personaName)}${isCurrent ? ' (current)' : ''}`);
        lines.push(`  ${persona.description}`);
        
        if (persona.focusAreas?.length) {
          lines.push(`  Focus: ${persona.focusAreas.slice(0, 3).join(', ')}`);
        }
      }
      
      lines.push('\n' + chalk.gray('Use /project:aiwf:ai_persona:switch <name> to change persona'));
      
      return lines.join('\n');
    } catch (error) {
      return chalk.red(`Error: ${error.message}`);
    }
  },

  /**
   * Get persona statistics
   */
  '/project:aiwf:ai_persona:stats': async (args) => {
    const personaName = args[0];
    
    try {
      const manager = await getPersonaManager();
      
      if (personaName && !manager.isValidPersona(personaName)) {
        return chalk.red(`Error: Invalid persona '${personaName}'`);
      }
      
      const targetPersona = personaName || manager.getCurrentPersona()?.name;
      
      if (!targetPersona) {
        return chalk.yellow('No persona specified or active');
      }
      
      const stats = await manager.getPersonaStats(targetPersona);
      
      if (stats.message) {
        return chalk.yellow(stats.message);
      }
      
      const lines = [];
      lines.push(chalk.cyan(`📊 ${targetPersona} Persona Statistics`));
      lines.push(chalk.gray('━'.repeat(50)));
      lines.push(`Total Sessions: ${stats.totalSessions}`);
      lines.push(`Completion Rate: ${(stats.completionRate * 100).toFixed(1)}%`);
      lines.push(`Average Duration: ${Math.round(stats.averageDuration / 1000)}s`);
      lines.push(`Average Tokens: ${Math.round(stats.averageTokens)}`);
      lines.push(`Error Rate: ${stats.errorRate.toFixed(2)} per session`);
      lines.push(`Average Quality: ${(stats.averageQualityScore * 100).toFixed(1)}%`);
      
      if (stats.taskDistribution && Object.keys(stats.taskDistribution).length > 0) {
        lines.push('\nTask Distribution:');
        Object.entries(stats.taskDistribution).forEach(([task, count]) => {
          lines.push(`  ${task}: ${count}`);
        });
      }
      
      return lines.join('\n');
    } catch (error) {
      return chalk.red(`Error: ${error.message}`);
    }
  },

  /**
   * Reset persona system
   */
  '/project:aiwf:ai_persona:reset': async () => {
    try {
      const manager = await getPersonaManager();
      await manager.reset();
      
      return chalk.green('✅ Persona system reset to default (developer)');
    } catch (error) {
      return chalk.red(`Error: ${error.message}`);
    }
  },

  /**
   * Detect optimal persona for current task
   */
  '/project:aiwf:ai_persona:detect': async (args) => {
    const command = args.join(' ');
    
    if (!command) {
      return chalk.red('Error: Please provide a task description');
    }
    
    try {
      const manager = await getPersonaManager();
      
      const taskContext = {
        command,
        description: command
      };
      
      const optimal = await manager.detectOptimalPersona(taskContext);
      
      const lines = [];
      lines.push(chalk.cyan('🔍 Persona Detection Result'));
      lines.push(chalk.gray('━'.repeat(50)));
      lines.push(`Task: "${command}"`);
      lines.push(`Recommended Persona: ${chalk.yellow(optimal)}`);
      
      const persona = manager.availablePersonas[optimal];
      if (persona) {
        lines.push(`\nReason: ${persona.description}`);
        lines.push(`Focus Areas: ${persona.focusAreas.join(', ')}`);
      }
      
      lines.push('\n' + chalk.gray('Use /project:aiwf:ai_persona:switch ' + optimal + ' to activate'));
      
      return lines.join('\n');
    } catch (error) {
      return chalk.red(`Error: ${error.message}`);
    }
  }
};

// Export for testing
export { getPersonaManager };

// If running directly, handle command line arguments
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  if (commands[command]) {
    commands[command](args)
      .then(console.log)
      .catch(console.error);
  } else {
    console.error('Unknown command:', command);
    console.log('Available commands:', Object.keys(commands).join('\n'));
  }
}