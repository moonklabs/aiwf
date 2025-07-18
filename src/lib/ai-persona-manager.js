/**
 * AI Persona Manager
 * Manages AI behavior personas for different development tasks
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import related modules
import { ContextEngine } from './context-engine.js';
import { MetricsCollector } from './metrics-collector.js';
import { TaskAnalyzer } from './task-analyzer.js';

class AIPersonaManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      personaConfigPath: options.personaConfigPath || 
        path.join(process.cwd(), '.aiwf', 'personas'),
      autoDetectionEnabled: options.autoDetectionEnabled !== false,
      metricsEnabled: options.metricsEnabled !== false,
      cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
      ...options
    };

    this.currentPersona = null;
    this.personaHistory = [];
    this.availablePersonas = {};
    this.lastSwitchTime = null;
    
    // Initialize sub-systems
    this.contextEngine = new ContextEngine(this.options);
    this.metricsCollector = new MetricsCollector(this.options);
    this.taskAnalyzer = new TaskAnalyzer(this.options);
    
    // Cache for persona configurations
    this.personaCache = new Map();
  }

  /**
   * Initialize the persona system
   */
  async init() {
    try {
      // Ensure persona directory exists
      await fs.mkdir(this.options.personaConfigPath, { recursive: true });
      
      // Load available personas
      await this.loadAvailablePersonas();
      
      // Initialize sub-systems
      await this.contextEngine.init();
      if (this.options.metricsEnabled) {
        await this.metricsCollector.init();
      }
      
      // Set default persona
      if (!this.currentPersona) {
        await this.switchPersona('developer', { silent: true });
      }
      
      this.emit('initialized', {
        availablePersonas: Object.keys(this.availablePersonas),
        currentPersona: this.currentPersona?.name
      });
      
      return true;
    } catch (error) {
      this.emit('error', { error, phase: 'initialization' });
      throw error;
    }
  }

  /**
   * Load available persona configurations
   */
  async loadAvailablePersonas() {
    // Default personas
    const defaultPersonas = {
      architect: {
        name: 'architect',
        description: 'System design and architecture',
        behaviors: [
          'Focus on big picture and overall system structure',
          'Prioritize scalability and maintainability',
          'Apply design patterns and architectural principles',
          'Consider integration points and interfaces'
        ],
        focusAreas: ['system design', 'architecture', 'patterns', 'scalability'],
        communicationStyle: 'strategic and high-level',
        recommendedTools: ['Glob', 'LS', 'MarkdownProcessor', 'Read'],
        contextRules: {
          priority: ['*.md', '*.yml', '*.json', 'architecture/**'],
          exclude: ['test/**', 'node_modules/**', '*.test.*'],
          focus: ['interfaces', 'contracts', 'dependencies'],
          keywords: ['design', 'pattern', 'architecture', 'structure']
        },
        tokenAllocation: {
          context: 0.3,
          response: 0.7
        }
      },
      
      debugger: {
        name: 'debugger',
        description: 'Bug detection and problem solving',
        behaviors: [
          'Systematic and methodical approach',
          'Focus on root cause analysis',
          'Consider edge cases and error scenarios',
          'Trace execution flow step by step'
        ],
        focusAreas: ['error handling', 'debugging', 'testing', 'validation'],
        communicationStyle: 'detailed and analytical',
        recommendedTools: ['Grep', 'Read', 'Bash', 'MemoryProfiler'],
        contextRules: {
          priority: ['*.log', '*.test.*', 'error.**', 'debug/**'],
          exclude: ['docs/**', '*.md'],
          focus: ['errors', 'exceptions', 'stack traces', 'logs'],
          keywords: ['error', 'bug', 'fix', 'debug', 'trace']
        },
        tokenAllocation: {
          context: 0.5,
          response: 0.5
        }
      },
      
      reviewer: {
        name: 'reviewer',
        description: 'Code quality and standards',
        behaviors: [
          'Verify coding standards compliance',
          'Identify security vulnerabilities',
          'Suggest optimizations and improvements',
          'Ensure best practices are followed'
        ],
        focusAreas: ['code quality', 'security', 'standards', 'best practices'],
        communicationStyle: 'constructive and thorough',
        recommendedTools: ['Grep', 'Read', 'Bash', 'FileUtils'],
        contextRules: {
          priority: ['*.js', '*.ts', '*.py', 'src/**'],
          exclude: ['dist/**', 'build/**', 'coverage/**'],
          focus: ['functions', 'classes', 'imports', 'exports'],
          keywords: ['review', 'quality', 'security', 'standard']
        },
        tokenAllocation: {
          context: 0.4,
          response: 0.6
        }
      },
      
      documenter: {
        name: 'documenter',
        description: 'Documentation and guides',
        behaviors: [
          'Write clear and understandable explanations',
          'Provide practical examples',
          'Ensure comprehensive coverage',
          'Maintain consistent documentation style'
        ],
        focusAreas: ['documentation', 'guides', 'examples', 'tutorials'],
        communicationStyle: 'clear and educational',
        recommendedTools: ['MarkdownProcessor', 'Read', 'Write', 'TemplateEngine'],
        contextRules: {
          priority: ['*.md', 'README*', 'docs/**', 'examples/**'],
          exclude: ['test/**', 'node_modules/**'],
          focus: ['APIs', 'interfaces', 'usage', 'examples'],
          keywords: ['document', 'explain', 'guide', 'example']
        },
        tokenAllocation: {
          context: 0.2,
          response: 0.8
        }
      },
      
      optimizer: {
        name: 'optimizer',
        description: 'Performance optimization',
        behaviors: [
          'Analyze performance bottlenecks',
          'Focus on efficiency and resource usage',
          'Measure and benchmark improvements',
          'Apply optimization techniques'
        ],
        focusAreas: ['performance', 'efficiency', 'optimization', 'benchmarking'],
        communicationStyle: 'data-driven and precise',
        recommendedTools: ['PerformanceBenchmark', 'MemoryProfiler', 'TokenTracker'],
        contextRules: {
          priority: ['*.bench.*', 'benchmark/**', 'perf/**'],
          exclude: ['docs/**', '*.md'],
          focus: ['algorithms', 'loops', 'memory', 'complexity'],
          keywords: ['optimize', 'performance', 'speed', 'efficiency']
        },
        tokenAllocation: {
          context: 0.6,
          response: 0.4
        }
      },
      
      developer: {
        name: 'developer',
        description: 'General development (default)',
        behaviors: [
          'Balanced approach to coding',
          'Focus on functionality and correctness',
          'Write clean and maintainable code',
          'Follow project conventions'
        ],
        focusAreas: ['implementation', 'features', 'functionality', 'coding'],
        communicationStyle: 'practical and straightforward',
        recommendedTools: ['Read', 'Write', 'Edit', 'Bash'],
        contextRules: {
          priority: ['src/**', 'lib/**', '*.js', '*.ts'],
          exclude: ['node_modules/**', 'dist/**'],
          focus: ['implementation', 'logic', 'features'],
          keywords: ['implement', 'create', 'build', 'develop']
        },
        tokenAllocation: {
          context: 0.4,
          response: 0.6
        }
      }
    };

    // Store default personas
    this.availablePersonas = { ...defaultPersonas };

    // Load custom personas if they exist
    try {
      const customPath = path.join(this.options.personaConfigPath, 'custom');
      const files = await fs.readdir(customPath).catch(() => []);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(
            path.join(customPath, file),
            'utf-8'
          );
          const persona = JSON.parse(content);
          this.availablePersonas[persona.name] = persona;
        }
      }
    } catch (error) {
      // Custom personas are optional
    }
  }

  /**
   * Switch to a different persona
   */
  async switchPersona(personaName, options = {}) {
    try {
      // Validate persona
      if (!this.isValidPersona(personaName)) {
        throw new Error(`Invalid persona: ${personaName}`);
      }

      // Check if already in this persona
      if (this.currentPersona?.name === personaName && !options.force) {
        return this.currentPersona;
      }

      // Save current state to history
      if (this.currentPersona && !options.silent) {
        const metrics = this.options.metricsEnabled ? 
          await this.metricsCollector.collectCurrentMetrics() : null;
        
        this.personaHistory.push({
          persona: this.currentPersona,
          startTime: this.lastSwitchTime,
          endTime: new Date(),
          metrics
        });
      }

      // Load new persona
      const persona = await this.loadPersona(personaName);
      
      // Apply context rules
      await this.contextEngine.applyPersonaRules(persona);
      
      // Update state
      this.currentPersona = persona;
      this.lastSwitchTime = new Date();
      
      // Track switch event
      if (this.options.metricsEnabled && !options.silent) {
        this.metricsCollector.trackEvent('persona_switch', {
          from: this.personaHistory[this.personaHistory.length - 1]?.persona?.name,
          to: personaName,
          trigger: options.manual ? 'manual' : 'auto',
          reason: options.reason
        });
      }

      // Emit event
      this.emit('personaSwitched', {
        persona: personaName,
        trigger: options.manual ? 'manual' : 'auto'
      });

      return persona;
    } catch (error) {
      this.emit('error', { error, phase: 'persona_switch' });
      throw error;
    }
  }

  /**
   * Load a specific persona configuration
   */
  async loadPersona(personaName) {
    // Check cache first
    if (this.personaCache.has(personaName)) {
      const cached = this.personaCache.get(personaName);
      if (Date.now() - cached.timestamp < this.options.cacheTimeout) {
        return cached.persona;
      }
    }

    // Load from configuration
    const persona = this.availablePersonas[personaName];
    if (!persona) {
      throw new Error(`Persona not found: ${personaName}`);
    }

    // Process and validate persona
    const processed = {
      ...persona,
      loadedAt: new Date(),
      isActive: true
    };

    // Cache the persona
    this.personaCache.set(personaName, {
      persona: processed,
      timestamp: Date.now()
    });

    return processed;
  }

  /**
   * Detect optimal persona for a task
   */
  async detectOptimalPersona(taskContext) {
    if (!this.options.autoDetectionEnabled) {
      return this.currentPersona?.name || 'developer';
    }

    try {
      // Analyze task
      const analysis = await this.taskAnalyzer.analyzeTask(taskContext);
      
      // Score each persona
      const scores = {};
      for (const personaName of Object.keys(this.availablePersonas)) {
        scores[personaName] = await this.scorePersonaFit(personaName, analysis);
      }
      
      // Get best match
      const sorted = Object.entries(scores)
        .sort(([,a], [,b]) => b - a);
      
      const bestMatch = sorted[0][0];
      const confidence = sorted[0][1];
      
      // Only switch if confidence is high enough
      if (confidence > 0.7 && bestMatch !== this.currentPersona?.name) {
        await this.switchPersona(bestMatch, {
          manual: false,
          reason: 'auto_detection',
          confidence
        });
      }
      
      return bestMatch;
    } catch (error) {
      this.emit('error', { error, phase: 'persona_detection' });
      return this.currentPersona?.name || 'developer';
    }
  }

  /**
   * Score how well a persona fits a task
   */
  async scorePersonaFit(personaName, taskAnalysis) {
    const persona = this.availablePersonas[personaName];
    if (!persona) return 0;

    let score = 0;
    const weights = {
      keywords: 0.4,
      patterns: 0.3,
      context: 0.2,
      history: 0.1
    };

    // Keyword matching
    const keywordScore = this.calculateKeywordScore(
      persona.contextRules.keywords,
      taskAnalysis.keywords
    );
    score += keywordScore * weights.keywords;

    // Pattern matching
    const patternScore = taskAnalysis.scores[personaName] || 0;
    score += (patternScore / 100) * weights.patterns;

    // Context matching
    const contextScore = this.calculateContextScore(persona, taskAnalysis);
    score += contextScore * weights.context;

    // Historical performance
    const historyScore = await this.calculateHistoryScore(personaName, taskAnalysis);
    score += historyScore * weights.history;

    return Math.min(score, 1);
  }

  /**
   * Calculate keyword matching score
   */
  calculateKeywordScore(personaKeywords, taskKeywords) {
    if (!personaKeywords?.length || !taskKeywords?.length) return 0;
    
    const matches = taskKeywords.filter(keyword => 
      personaKeywords.some(pk => 
        keyword.toLowerCase().includes(pk.toLowerCase())
      )
    );
    
    return matches.length / taskKeywords.length;
  }

  /**
   * Calculate context matching score
   */
  calculateContextScore(persona, analysis) {
    let score = 0;
    let factors = 0;

    // File type matching
    if (analysis.recentFiles?.length) {
      const priorityPatterns = persona.contextRules.priority || [];
      const matchingFiles = analysis.recentFiles.filter(file =>
        priorityPatterns.some(pattern => 
          this.matchesPattern(file, pattern)
        )
      );
      score += matchingFiles.length / analysis.recentFiles.length;
      factors++;
    }

    // Error state bonus for debugger
    if (persona.name === 'debugger' && analysis.errorState?.hasErrors) {
      score += 1;
      factors++;
    }

    // Git context bonus
    if (persona.name === 'reviewer' && analysis.gitContext?.isPullRequest) {
      score += 1;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Calculate historical performance score
   */
  async calculateHistoryScore(personaName, analysis) {
    if (!this.options.metricsEnabled) return 0.5; // Neutral score
    
    const history = await this.metricsCollector.getPersonaHistory(personaName);
    if (!history || history.length === 0) return 0.5;

    // Find similar tasks in history
    const similarTasks = history.filter(session =>
      this.taskAnalyzer.calculateSimilarity(session.task, analysis) > 0.6
    );

    if (similarTasks.length === 0) return 0.5;

    // Calculate average performance
    const avgPerformance = similarTasks.reduce((sum, task) => 
      sum + (task.qualityMetrics?.overallScore || 0.5), 0
    ) / similarTasks.length;

    return avgPerformance;
  }

  /**
   * Get current persona
   */
  getCurrentPersona() {
    return this.currentPersona;
  }

  /**
   * Get persona context rules
   */
  getPersonaContext(personaName) {
    const persona = this.availablePersonas[personaName];
    return persona?.contextRules || null;
  }

  /**
   * Apply persona rules to content
   */
  async applyPersonaRules(content, personaName) {
    const persona = personaName ? 
      this.availablePersonas[personaName] : 
      this.currentPersona;
    
    if (!persona) {
      throw new Error('No persona specified or active');
    }

    return await this.contextEngine.filterContent(content, persona);
  }

  /**
   * Get available personas
   */
  getAvailablePersonas() {
    return Object.keys(this.availablePersonas);
  }

  /**
   * Check if persona is valid
   */
  isValidPersona(personaName) {
    return personaName in this.availablePersonas;
  }

  /**
   * Get persona statistics
   */
  async getPersonaStats(personaName) {
    if (!this.options.metricsEnabled) {
      return { message: 'Metrics collection is disabled' };
    }

    return await this.metricsCollector.getPersonaStats(personaName);
  }

  /**
   * Generate persona report
   */
  async generateReport(options = {}) {
    if (!this.options.metricsEnabled) {
      return { message: 'Metrics collection is disabled' };
    }

    const report = await this.metricsCollector.generateReport(options);
    
    // Add persona-specific insights
    report.personaInsights = {};
    for (const personaName of this.getAvailablePersonas()) {
      report.personaInsights[personaName] = await this.generatePersonaInsights(
        personaName,
        report.personaAnalysis[personaName]
      );
    }

    return report;
  }

  /**
   * Generate insights for a specific persona
   */
  async generatePersonaInsights(personaName, analysis) {
    if (!analysis) return null;

    const insights = {
      effectiveness: this.calculateEffectiveness(analysis),
      recommendations: [],
      bestPractices: []
    };

    // Generate recommendations
    if (analysis.tokenEfficiency < 0.5) {
      insights.recommendations.push(
        'Consider more aggressive context filtering to improve token efficiency'
      );
    }

    if (analysis.averageCompletionTime > 300000) { // 5 minutes
      insights.recommendations.push(
        'Tasks are taking longer than expected. Review task complexity or persona fit'
      );
    }

    // Add best practices based on persona
    const persona = this.availablePersonas[personaName];
    if (persona) {
      insights.bestPractices = this.generateBestPractices(persona, analysis);
    }

    return insights;
  }

  /**
   * Calculate persona effectiveness
   */
  calculateEffectiveness(analysis) {
    const weights = {
      completionTime: 0.3,
      qualityScore: 0.4,
      tokenEfficiency: 0.3
    };

    let score = 0;
    
    // Normalize completion time (lower is better)
    const timeScore = Math.max(0, 1 - (analysis.averageCompletionTime / 600000));
    score += timeScore * weights.completionTime;

    // Quality score (already normalized)
    score += (analysis.averageQualityScore || 0.5) * weights.qualityScore;

    // Token efficiency (already normalized)
    score += (analysis.tokenEfficiency || 0.5) * weights.tokenEfficiency;

    return {
      score,
      rating: score > 0.8 ? 'excellent' : 
              score > 0.6 ? 'good' :
              score > 0.4 ? 'fair' : 'needs improvement'
    };
  }

  /**
   * Generate best practices for a persona
   */
  generateBestPractices(persona, analysis) {
    const practices = [];

    // General best practices
    practices.push(`Use ${persona.name} persona for ${persona.focusAreas.join(', ')}`);
    practices.push(`Recommended tools: ${persona.recommendedTools.join(', ')}`);

    // Specific recommendations based on analysis
    if (analysis.bestUseCases?.length) {
      practices.push(`Most effective for: ${analysis.bestUseCases.join(', ')}`);
    }

    return practices;
  }

  /**
   * Check if pattern matches file path
   */
  matchesPattern(filePath, pattern) {
    // Convert glob pattern to regex
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    
    return new RegExp(`^${regex}$`).test(filePath);
  }

  /**
   * Reset persona system
   */
  async reset() {
    this.currentPersona = null;
    this.personaHistory = [];
    this.personaCache.clear();
    this.lastSwitchTime = null;
    
    if (this.options.metricsEnabled) {
      await this.metricsCollector.reset();
    }
    
    await this.contextEngine.reset();
    
    // Set default persona
    await this.switchPersona('developer', { silent: true });
    
    this.emit('reset');
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.personaCache.clear();
    
    if (this.options.metricsEnabled) {
      await this.metricsCollector.cleanup();
    }
    
    await this.contextEngine.cleanup();
    
    this.removeAllListeners();
  }
}

export default AIPersonaManager;
export { AIPersonaManager };