/**
 * Task Analyzer
 * Analyzes tasks to determine the optimal AI persona
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import { execSync } from 'child_process';

class TaskAnalyzer extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      recentFileLimit: options.recentFileLimit || 10,
      keywordWeight: options.keywordWeight || 0.4,
      patternWeight: options.patternWeight || 0.3,
      contextWeight: options.contextWeight || 0.2,
      historyWeight: options.historyWeight || 0.1,
      ...options
    };

    // Pattern definitions for each persona
    this.patterns = {
      architect: {
        keywords: [
          'design', 'architect', 'structure', 'system', 'scalab',
          'interface', 'api', 'contract', 'schema', 'pattern',
          'module', 'component', 'integration', 'dependency'
        ],
        filePatterns: ['*.md', '*.yml', '*.yaml', 'architecture/**', 'design/**'],
        contextIndicators: ['creating new feature', 'planning', 'designing']
      },
      
      debugger: {
        keywords: [
          'bug', 'error', 'fix', 'issue', 'problem', 'debug',
          'trace', 'stack', 'exception', 'fail', 'crash',
          'investigate', 'diagnose', 'troubleshoot'
        ],
        filePatterns: ['*.log', '*.test.*', 'test/**', 'debug/**'],
        contextIndicators: ['error in', 'not working', 'broken', 'failing']
      },
      
      reviewer: {
        keywords: [
          'review', 'audit', 'check', 'quality', 'standard',
          'security', 'vulnerability', 'smell', 'refactor',
          'improve', 'optimize', 'clean', 'lint'
        ],
        filePatterns: ['*.js', '*.ts', '*.py', 'src/**', 'lib/**'],
        contextIndicators: ['review code', 'check quality', 'pull request']
      },
      
      documenter: {
        keywords: [
          'document', 'docs', 'readme', 'guide', 'tutorial',
          'explain', 'describe', 'comment', 'annotation',
          'example', 'usage', 'api', 'reference'
        ],
        filePatterns: ['*.md', 'README*', 'docs/**', 'examples/**'],
        contextIndicators: ['write documentation', 'explain', 'document']
      },
      
      optimizer: {
        keywords: [
          'optimiz', 'performance', 'speed', 'efficient',
          'benchmark', 'profile', 'memory', 'token',
          'slow', 'bottleneck', 'improve', 'fast'
        ],
        filePatterns: ['*.bench.*', 'benchmark/**', 'perf/**'],
        contextIndicators: ['optimize', 'improve performance', 'too slow']
      },
      
      developer: {
        keywords: [
          'implement', 'create', 'build', 'develop',
          'add', 'feature', 'function', 'code',
          'write', 'make', 'new', 'update'
        ],
        filePatterns: ['*.js', '*.ts', '*.py', 'src/**', 'lib/**'],
        contextIndicators: ['implement', 'create', 'build', 'add feature']
      }
    };

    // Compile regex patterns
    this.compiledPatterns = {};
    for (const [persona, config] of Object.entries(this.patterns)) {
      this.compiledPatterns[persona] = {
        keywordRegex: new RegExp(config.keywords.join('|'), 'i'),
        contextRegex: new RegExp(config.contextIndicators.join('|'), 'i')
      };
    }
  }

  /**
   * Analyze a task to determine characteristics
   */
  async analyzeTask(taskContext) {
    const analysis = {
      command: taskContext.command || '',
      description: taskContext.description || '',
      recentFiles: await this.getRecentFiles(),
      keywords: this.extractKeywords(taskContext),
      gitContext: await this.getGitContext(),
      errorState: await this.checkErrorState(),
      fileTypes: await this.analyzeFileTypes(),
      scores: {},
      timestamp: new Date()
    };

    // Calculate scores for each persona
    for (const personaName of Object.keys(this.patterns)) {
      analysis.scores[personaName] = await this.calculatePersonaScore(
        personaName,
        analysis
      );
    }

    // Determine primary task type
    analysis.primaryType = this.determinePrimaryType(analysis.scores);

    this.emit('taskAnalyzed', analysis);
    return analysis;
  }

  /**
   * Extract keywords from task context
   */
  extractKeywords(taskContext) {
    const text = `${taskContext.command || ''} ${taskContext.description || ''}`;
    
    // Split into words and filter
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));

    // Find matching keywords for any persona
    const keywords = [];
    for (const [persona, config] of Object.entries(this.patterns)) {
      for (const keyword of config.keywords) {
        if (words.some(word => word.includes(keyword))) {
          keywords.push(keyword);
        }
      }
    }

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Check if word is a stop word
   */
  isStopWord(word) {
    const stopWords = [
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an',
      'as', 'are', 'been', 'by', 'for', 'from', 'has', 'have',
      'in', 'it', 'of', 'or', 'that', 'to', 'was', 'will', 'with'
    ];
    return stopWords.includes(word);
  }

  /**
   * Get recently modified files
   */
  async getRecentFiles() {
    try {
      // Use git to get recently modified files
      const output = execSync(
        `git log --name-only --pretty=format: -${this.options.recentFileLimit} | sort | uniq | grep -v '^$'`,
        { encoding: 'utf-8', cwd: process.cwd() }
      );
      
      return output
        .split('\n')
        .filter(file => file.trim())
        .slice(0, this.options.recentFileLimit);
    } catch (error) {
      // Fallback to file system scan
      return await this.scanRecentFiles();
    }
  }

  /**
   * Scan file system for recent files
   */
  async scanRecentFiles() {
    const files = [];
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    async function scan(dir, level = 0) {
      if (level > 3) return; // Max depth
      
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
          }
          
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await scan(fullPath, level + 1);
          } else {
            const stats = await fs.stat(fullPath);
            if (now - stats.mtime.getTime() < maxAge) {
              files.push({
                path: path.relative(process.cwd(), fullPath),
                modified: stats.mtime
              });
            }
          }
        }
      } catch (error) {
        // Ignore errors
      }
    }

    await scan(process.cwd());
    
    // Sort by modification time and return paths
    return files
      .sort((a, b) => b.modified - a.modified)
      .slice(0, this.options.recentFileLimit)
      .map(f => f.path);
  }

  /**
   * Get git context
   */
  async getGitContext() {
    const context = {
      branch: null,
      isPullRequest: false,
      hasUncommittedChanges: false,
      recentCommitTypes: []
    };

    try {
      // Get current branch
      context.branch = execSync('git branch --show-current', {
        encoding: 'utf-8'
      }).trim();

      // Check if PR branch
      context.isPullRequest = context.branch.includes('feature/') || 
                             context.branch.includes('fix/') ||
                             context.branch.includes('pr/');

      // Check for uncommitted changes
      const status = execSync('git status --porcelain', {
        encoding: 'utf-8'
      });
      context.hasUncommittedChanges = status.trim().length > 0;

      // Get recent commit types
      const commits = execSync('git log --pretty=format:%s -10', {
        encoding: 'utf-8'
      }).split('\n');
      
      context.recentCommitTypes = commits
        .map(msg => {
          const match = msg.match(/^(\w+)(\(.*?\))?:/);
          return match ? match[1] : null;
        })
        .filter(Boolean);
    } catch (error) {
      // Git not available or not a git repo
    }

    return context;
  }

  /**
   * Check for error state
   */
  async checkErrorState() {
    const errorState = {
      hasErrors: false,
      errorFiles: [],
      testFailures: false
    };

    try {
      // Check for error logs
      const errorLogPatterns = ['error.log', 'errors.log', '*.error.log'];
      for (const pattern of errorLogPatterns) {
        try {
          const files = await this.findFiles(pattern);
          if (files.length > 0) {
            errorState.hasErrors = true;
            errorState.errorFiles.push(...files);
          }
        } catch (error) {
          // Ignore
        }
      }

      // Check test status
      try {
        execSync('npm test -- --passWithNoTests', {
          encoding: 'utf-8',
          stdio: 'pipe'
        });
      } catch (error) {
        errorState.testFailures = true;
        errorState.hasErrors = true;
      }
    } catch (error) {
      // Ignore errors in error checking
    }

    return errorState;
  }

  /**
   * Analyze file types in project
   */
  async analyzeFileTypes() {
    const fileTypes = {
      hasTests: false,
      hasDocumentation: false,
      hasConfiguration: false,
      primaryLanguage: null,
      frameworks: []
    };

    try {
      // Check for test files
      fileTypes.hasTests = await this.checkFileExists(['*.test.*', '*.spec.*', 'test/**']);

      // Check for documentation
      fileTypes.hasDocumentation = await this.checkFileExists(['*.md', 'docs/**']);

      // Check for configuration
      fileTypes.hasConfiguration = await this.checkFileExists(['*.config.*', '*.json', '*.yml']);

      // Determine primary language
      const languages = {
        javascript: await this.countFiles(['*.js', '*.jsx']),
        typescript: await this.countFiles(['*.ts', '*.tsx']),
        python: await this.countFiles(['*.py']),
        java: await this.countFiles(['*.java'])
      };
      
      fileTypes.primaryLanguage = Object.entries(languages)
        .sort(([,a], [,b]) => b - a)[0][0];

      // Detect frameworks
      if (await this.checkFileExists('package.json')) {
        try {
          const pkg = JSON.parse(
            await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
          );
          
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };
          
          if (deps.react) fileTypes.frameworks.push('react');
          if (deps.vue) fileTypes.frameworks.push('vue');
          if (deps.angular) fileTypes.frameworks.push('angular');
          if (deps.express) fileTypes.frameworks.push('express');
          if (deps.next) fileTypes.frameworks.push('nextjs');
        } catch (error) {
          // Ignore
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return fileTypes;
  }

  /**
   * Calculate score for a specific persona
   */
  async calculatePersonaScore(personaName, analysis) {
    const config = this.patterns[personaName];
    const compiled = this.compiledPatterns[personaName];
    
    let score = 0;

    // Keyword matching in command/description
    const text = `${analysis.command} ${analysis.description}`.toLowerCase();
    const keywordMatches = (text.match(compiled.keywordRegex) || []).length;
    score += keywordMatches * 10;

    // Context indicator matching
    if (compiled.contextRegex.test(text)) {
      score += 20;
    }

    // File pattern matching
    if (analysis.recentFiles?.length) {
      const matchingFiles = analysis.recentFiles.filter(file =>
        config.filePatterns.some(pattern => this.matchesFilePattern(file, pattern))
      );
      score += (matchingFiles.length / analysis.recentFiles.length) * 30;
    }

    // Special context bonuses
    score += this.applyContextBonuses(personaName, analysis);

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Apply context-specific bonuses
   */
  applyContextBonuses(personaName, analysis) {
    let bonus = 0;

    switch (personaName) {
      case 'debugger':
        if (analysis.errorState?.hasErrors) bonus += 30;
        if (analysis.errorState?.testFailures) bonus += 20;
        if (analysis.gitContext?.recentCommitTypes.includes('fix')) bonus += 10;
        break;

      case 'reviewer':
        if (analysis.gitContext?.isPullRequest) bonus += 25;
        if (analysis.command?.includes('review')) bonus += 20;
        break;

      case 'architect':
        if (analysis.command?.includes('design')) bonus += 20;
        if (analysis.fileTypes?.hasConfiguration) bonus += 10;
        if (!analysis.fileTypes?.hasTests) bonus += 15; // Early stage project
        break;

      case 'documenter':
        if (analysis.fileTypes?.hasDocumentation) bonus += 15;
        if (analysis.command?.includes('document')) bonus += 25;
        break;

      case 'optimizer':
        if (analysis.command?.includes('slow')) bonus += 20;
        if (analysis.command?.includes('performance')) bonus += 25;
        break;
    }

    return bonus;
  }

  /**
   * Determine primary task type from scores
   */
  determinePrimaryType(scores) {
    const sorted = Object.entries(scores)
      .sort(([,a], [,b]) => b - a);
    
    // If top score is significantly higher, return it
    if (sorted[0][1] > sorted[1][1] * 1.5) {
      return sorted[0][0];
    }

    // Otherwise, consider it mixed and return developer
    return 'developer';
  }

  /**
   * Calculate similarity between two tasks
   */
  calculateSimilarity(task1, task2) {
    if (!task1 || !task2) return 0;

    // Extract features from both tasks
    const features1 = this.extractTaskFeatures(task1);
    const features2 = this.extractTaskFeatures(task2);

    // Calculate Jaccard similarity
    const intersection = features1.filter(f => features2.includes(f));
    const union = [...new Set([...features1, ...features2])];

    return union.length > 0 ? intersection.length / union.length : 0;
  }

  /**
   * Extract features from a task for similarity comparison
   */
  extractTaskFeatures(task) {
    const features = [];

    // Add keywords
    if (task.keywords) {
      features.push(...task.keywords);
    }

    // Add primary type
    if (task.primaryType) {
      features.push(`type:${task.primaryType}`);
    }

    // Add file types
    if (task.fileTypes) {
      if (task.fileTypes.primaryLanguage) {
        features.push(`lang:${task.fileTypes.primaryLanguage}`);
      }
      if (task.fileTypes.frameworks) {
        task.fileTypes.frameworks.forEach(fw => 
          features.push(`framework:${fw}`)
        );
      }
    }

    return features;
  }

  /**
   * Check if file exists matching patterns
   */
  async checkFileExists(patterns) {
    for (const pattern of (Array.isArray(patterns) ? patterns : [patterns])) {
      const files = await this.findFiles(pattern);
      if (files.length > 0) return true;
    }
    return false;
  }

  /**
   * Count files matching patterns
   */
  async countFiles(patterns) {
    let count = 0;
    for (const pattern of (Array.isArray(patterns) ? patterns : [patterns])) {
      const files = await this.findFiles(pattern);
      count += files.length;
    }
    return count;
  }

  /**
   * Find files matching a pattern
   */
  async findFiles(pattern, dir = process.cwd(), results = []) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && pattern.includes('**')) {
          await this.findFiles(pattern, fullPath, results);
        } else if (entry.isFile() && this.matchesFilePattern(entry.name, pattern)) {
          results.push(path.relative(process.cwd(), fullPath));
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return results;
  }

  /**
   * Check if file matches pattern
   */
  matchesFilePattern(file, pattern) {
    // Simple glob pattern matching
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/\./g, '\\.');
    
    return new RegExp(regex).test(file);
  }

  /**
   * Get task analysis for a command
   */
  async analyzeCommand(command) {
    return await this.analyzeTask({
      command,
      description: '',
      timestamp: new Date()
    });
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.removeAllListeners();
  }
}

export default TaskAnalyzer;
export { TaskAnalyzer };