#!/usr/bin/env node

/**
 * AI Persona Commands for Claude Code
 * Manages AI behavior personas for different development tasks
 */

import { AIPersonaManager } from '../../../../lib/ai-persona-manager.js';
import { getBackgroundMonitor } from '../../ko/utils/background-monitor.js';
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
      return chalk.red('Error: Please specify a persona name (architect, security, frontend, backend, data_analyst)');
    }
    
    try {
      const manager = await getPersonaManager();
      
      if (!manager.isValidPersona(personaName)) {
        return chalk.red(`Error: Invalid persona '${personaName}'. Available personas: ${manager.getAvailablePersonas().join(', ')}`);
      }
      
      await manager.switchPersona(personaName, { manual: true });
      
      // Initialize background monitor (non-blocking)
      const monitor = getBackgroundMonitor();
      monitor.initialize().catch(() => {}); // Ignore errors
      
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

  '/project:aiwf:ai_persona:security': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['security']);
  },

  '/project:aiwf:ai_persona:frontend': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['frontend']);
  },

  '/project:aiwf:ai_persona:backend': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['backend']);
  },

  '/project:aiwf:ai_persona:data_analyst': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['data_analyst']);
  },
  
  // Shorter aliases for personas
  '/aiwf:persona:architect': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['architect']);
  },
  
  '/aiwf:persona:security': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['security']);
  },
  
  '/aiwf:persona:frontend': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['frontend']);
  },
  
  '/aiwf:persona:backend': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['backend']);
  },
  
  '/aiwf:persona:data_analyst': async () => {
    return commands['/project:aiwf:ai_persona:switch'](['data_analyst']);
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
      
      return chalk.green('✅ Persona system reset to default');
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
  },
  
  // Shorter aliases for common commands
  '/aiwf:persona:status': async () => {
    return commands['/project:aiwf:ai_persona:status']();
  },
  
  '/aiwf:persona:list': async () => {
    return commands['/project:aiwf:ai_persona:list']();
  },
  
  '/aiwf:persona:switch': async (args) => {
    return commands['/project:aiwf:ai_persona:switch'](args);
  }
};

/**
 * Persona Command Mappings
 * Maps persona names to their available command shortcuts
 */
export const personaCommandMappings = {
  'architect': [
    '/project:aiwf:ai_persona:architect',
    '/aiwf:persona:architect'
  ],
  'security': [
    '/project:aiwf:ai_persona:security',
    '/aiwf:persona:security'
  ],
  'frontend': [
    '/project:aiwf:ai_persona:frontend',
    '/aiwf:persona:frontend'
  ],
  'backend': [
    '/project:aiwf:ai_persona:backend',
    '/aiwf:persona:backend'
  ],
  'data_analyst': [
    '/project:aiwf:ai_persona:data_analyst',
    '/aiwf:persona:data_analyst'
  ]
};

/**
 * Detailed persona descriptions for AI assistance
 */
export const personaDescriptions = {
  architect: {
    name: 'architect',
    description: 'System design and architecture expert focused on scalable, maintainable solutions',
    behaviors: [
      'Analyzes overall system architecture and design patterns',
      'Recommends scalable and maintainable solutions',
      'Creates clear architectural diagrams and documentation',
      'Considers non-functional requirements (performance, security, scalability)',
      'Evaluates technology choices and trade-offs'
    ],
    focusAreas: ['system design', 'architecture patterns', 'scalability', 'maintainability'],
    recommendedTools: ['design tools', 'diagramming', 'documentation']
  },
  
  security: {
    name: 'security',
    description: 'Security specialist ensuring code safety and best practices',
    behaviors: [
      'Identifies security vulnerabilities and risks',
      'Implements security best practices',
      'Reviews authentication and authorization logic',
      'Ensures data protection and encryption',
      'Validates input sanitization and output encoding'
    ],
    focusAreas: ['security audit', 'vulnerability assessment', 'encryption', 'authentication'],
    recommendedTools: ['security scanners', 'static analysis', 'penetration testing']
  },
  
  frontend: {
    name: 'frontend',
    description: 'Frontend development expert specializing in UI/UX and modern web technologies',
    behaviors: [
      'Creates responsive and accessible user interfaces',
      'Optimizes frontend performance and bundle sizes',
      'Implements modern frontend frameworks and patterns',
      'Ensures cross-browser compatibility',
      'Focuses on user experience and interaction design'
    ],
    focusAreas: ['UI/UX', 'React/Vue/Angular', 'CSS/styling', 'performance optimization'],
    recommendedTools: ['component libraries', 'build tools', 'testing frameworks']
  },
  
  backend: {
    name: 'backend',
    description: 'Backend development specialist for APIs, databases, and server-side logic',
    behaviors: [
      'Designs efficient database schemas and queries',
      'Implements robust API endpoints and services',
      'Optimizes server-side performance',
      'Handles data processing and business logic',
      'Ensures data integrity and consistency'
    ],
    focusAreas: ['API design', 'database optimization', 'microservices', 'server architecture'],
    recommendedTools: ['ORMs', 'API frameworks', 'database tools', 'monitoring']
  },
  
  data_analyst: {
    name: 'data_analyst',
    description: 'Data analysis expert for insights, visualization, and data-driven decisions',
    behaviors: [
      'Analyzes data patterns and trends',
      'Creates meaningful visualizations and reports',
      'Implements data processing pipelines',
      'Performs statistical analysis and modeling',
      'Optimizes data queries and transformations'
    ],
    focusAreas: ['data analysis', 'visualization', 'statistics', 'reporting'],
    recommendedTools: ['pandas', 'visualization libraries', 'SQL', 'analytics tools']
  }
};

// Export for testing
export { getPersonaManager };

/**
 * Handle persona command from command line
 * Supports direct persona activation and management
 */
async function handlePersonaCommand() {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  // If no command provided, show help
  if (!command) {
    console.log(chalk.cyan('🎭 AIWF AI Persona Manager'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log('\nUsage:');
    console.log('  ai-persona <persona>    Switch to specific persona');
    console.log('  ai-persona status       Show current persona status');
    console.log('  ai-persona list         List available personas');
    console.log('  ai-persona default      Restore default mode');
    console.log('\nAvailable personas:');
    console.log('  architect     - System design and architecture expert');
    console.log('  security      - Security specialist');
    console.log('  frontend      - Frontend development expert');
    console.log('  backend       - Backend development specialist');
    console.log('  data_analyst  - Data analysis expert');
    return;
  }
  
  try {
    // Initialize persona manager
    const manager = await getPersonaManager();
    
    // Check if command is a persona name
    const validPersonas = ['architect', 'security', 'frontend', 'backend', 'data_analyst'];
    
    if (validPersonas.includes(command)) {
      // Save current persona state
      const personaState = {
        persona: command,
        timestamp: new Date().toISOString(),
        contextRules: []
      };
      
      // Load context rules for the persona
      try {
        const contextPath = path.join(process.cwd(), '.aiwf', 'personas', `${command}_context.json`);
        const { readFile } = await import('fs/promises');
        const contextData = await readFile(contextPath, 'utf8');
        const context = JSON.parse(contextData);
        personaState.contextRules = context.rules || [];
      } catch (error) {
        // Context file might not exist, which is okay
      }
      
      // Save persona state
      const statePath = path.join(process.cwd(), '.aiwf', 'current_persona.json');
      const { writeFile, mkdir } = await import('fs/promises');
      await mkdir(path.dirname(statePath), { recursive: true });
      await writeFile(statePath, JSON.stringify(personaState, null, 2));
      
      // Switch persona
      await manager.switchPersona(command, { manual: true });
      
      console.log(chalk.green(`✅ Activated ${command} persona`));
      
      // Show persona info
      const persona = personaDescriptions[command];
      if (persona) {
        console.log(chalk.gray('━'.repeat(50)));
        console.log(chalk.yellow(`Role: ${persona.description}`));
        
        if (persona.behaviors?.length) {
          console.log('\nKey behaviors:');
          persona.behaviors.forEach(behavior => {
            console.log(`  • ${behavior}`);
          });
        }
        
        if (personaState.contextRules?.length) {
          console.log('\nContext rules applied:');
          personaState.contextRules.forEach(rule => {
            console.log(`  • ${rule.description || rule.pattern || 'Custom rule'}`);
          });
        }
      }
      
      return;
    }
    
    // Handle other commands
    switch (command) {
      case 'status':
        const current = manager.getCurrentPersona();
        if (current) {
          const metrics = await manager.metricsCollector.getCurrentSessionMetrics();
          console.log(formatPersonaStatus(current, metrics));
        } else {
          console.log(chalk.yellow('No persona currently active'));
        }
        break;
        
      case 'list':
        const personas = manager.getAvailablePersonas();
        const currentPersona = manager.getCurrentPersona();
        
        console.log(chalk.cyan('🎭 Available AI Personas'));
        console.log(chalk.gray('━'.repeat(50)));
        
        for (const personaName of personas) {
          const persona = personaDescriptions[personaName];
          const isCurrent = currentPersona?.name === personaName;
          
          console.log(`\n${isCurrent ? '▶ ' : '  '}${chalk.yellow(personaName)}${isCurrent ? ' (current)' : ''}`);
          if (persona) {
            console.log(`  ${persona.description}`);
          }
        }
        break;
        
      case 'default':
      case 'reset':
        // Remove persona state file to restore default mode
        try {
          const statePath = path.join(process.cwd(), '.aiwf', 'current_persona.json');
          const { unlink } = await import('fs/promises');
          await unlink(statePath);
          console.log(chalk.green('✅ Restored default mode'));
        } catch (error) {
          // File might not exist
          console.log(chalk.yellow('Already in default mode'));
        }
        
        // Reset persona manager
        await manager.reset();
        break;
        
      default:
        // Check if it's a command format
        if (command.startsWith('/')) {
          if (commands[command]) {
            const result = await commands[command](args);
            console.log(result);
          } else {
            console.error(chalk.red(`Unknown command: ${command}`));
          }
        } else {
          console.error(chalk.red(`Unknown command: ${command}`));
          console.log(chalk.gray('Use "ai-persona" without arguments to see help'));
        }
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// If running directly, handle command line arguments
if (import.meta.url === `file://${process.argv[1]}`) {
  handlePersonaCommand();
}