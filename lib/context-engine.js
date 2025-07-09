/**
 * Context Engine
 * Manages context rules and content filtering for AI personas
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

// Import token optimizer
import { TokenOptimizer } from './token-optimizer.js';

class ContextEngine extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      maxContextSize: options.maxContextSize || 100000, // Max tokens
      preserveBase: options.preserveBase !== false,
      enableOptimization: options.enableOptimization !== false,
      contextCachePath: options.contextCachePath || 
        path.join(process.cwd(), '.aiwf', 'cache', 'context'),
      ...options
    };

    this.baseContext = null;
    this.personaOverlay = null;
    this.currentContext = null;
    
    // Initialize token optimizer
    this.tokenOptimizer = new TokenOptimizer(this.options);
    
    // Context cache
    this.contextCache = new Map();
  }

  /**
   * Initialize the context engine
   */
  async init() {
    try {
      // Ensure cache directory exists
      await fs.mkdir(this.options.contextCachePath, { recursive: true });
      
      // Capture initial context
      this.baseContext = await this.captureCurrentContext();
      
      this.emit('initialized', {
        baseContextSize: this.baseContext?.size || 0
      });
      
      return true;
    } catch (error) {
      this.emit('error', { error, phase: 'initialization' });
      throw error;
    }
  }

  /**
   * Apply persona-specific context rules
   */
  async applyPersonaRules(persona) {
    try {
      // Preserve base context if enabled
      if (this.options.preserveBase && !this.baseContext) {
        this.baseContext = await this.captureCurrentContext();
      }

      // Build persona-specific overlay
      this.personaOverlay = {
        systemPrompt: this.buildSystemPrompt(persona),
        priorityPatterns: persona.contextRules.priority || [],
        exclusionPatterns: persona.contextRules.exclude || [],
        focusAreas: persona.contextRules.focus || [],
        keywords: persona.contextRules.keywords || [],
        tokenAllocation: persona.tokenAllocation || { context: 0.4, response: 0.6 }
      };

      // Optimize context if enabled
      let optimizedContext;
      if (this.options.enableOptimization) {
        optimizedContext = await this.tokenOptimizer.optimize(
          this.baseContext,
          this.personaOverlay,
          persona.tokenAllocation
        );
      } else {
        optimizedContext = this.mergeContexts(this.baseContext, this.personaOverlay);
      }

      // Apply the context
      this.currentContext = optimizedContext;
      await this.injectContext(optimizedContext);

      // Cache the context
      this.cacheContext(persona.name, optimizedContext);

      this.emit('contextApplied', {
        persona: persona.name,
        contextSize: optimizedContext.size,
        optimization: this.options.enableOptimization
      });

      return optimizedContext;
    } catch (error) {
      this.emit('error', { error, phase: 'apply_rules' });
      throw error;
    }
  }

  /**
   * Build system prompt for persona
   */
  buildSystemPrompt(persona) {
    const sections = [];

    // Operating mode
    sections.push(`You are currently operating in ${persona.name} mode.`);
    sections.push('');

    // Key behaviors
    if (persona.behaviors?.length) {
      sections.push('Key behaviors:');
      persona.behaviors.forEach(behavior => {
        sections.push(`- ${behavior}`);
      });
      sections.push('');
    }

    // Focus areas
    if (persona.focusAreas?.length) {
      sections.push('Focus areas:');
      persona.focusAreas.forEach(area => {
        sections.push(`- ${area}`);
      });
      sections.push('');
    }

    // Communication style
    if (persona.communicationStyle) {
      sections.push(`Communication style: ${persona.communicationStyle}`);
      sections.push('');
    }

    // Recommended tools
    if (persona.recommendedTools?.length) {
      sections.push(`Recommended tools: ${persona.recommendedTools.join(', ')}`);
      sections.push('');
    }

    // Context rules
    if (persona.contextRules) {
      sections.push('Context priorities:');
      
      if (persona.contextRules.priority?.length) {
        sections.push(`- Prioritize: ${persona.contextRules.priority.join(', ')}`);
      }
      
      if (persona.contextRules.exclude?.length) {
        sections.push(`- Exclude: ${persona.contextRules.exclude.join(', ')}`);
      }
      
      if (persona.contextRules.focus?.length) {
        sections.push(`- Focus on: ${persona.contextRules.focus.join(', ')}`);
      }
    }

    return sections.join('\n');
  }

  /**
   * Capture current context from environment
   */
  async captureCurrentContext() {
    const context = {
      timestamp: new Date(),
      environment: await this.captureEnvironment(),
      projectFiles: await this.captureProjectFiles(),
      recentChanges: await this.captureRecentChanges(),
      size: 0 // Will be calculated
    };

    // Calculate size
    context.size = this.calculateContextSize(context);

    return context;
  }

  /**
   * Capture environment information
   */
  async captureEnvironment() {
    return {
      workingDirectory: process.cwd(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Capture relevant project files
   */
  async captureProjectFiles() {
    const projectFiles = {
      structure: [],
      recentFiles: [],
      importantFiles: []
    };

    try {
      // Get project structure
      projectFiles.structure = await this.getProjectStructure();
      
      // Get recently modified files
      projectFiles.recentFiles = await this.getRecentFiles();
      
      // Get important files (package.json, README, etc.)
      projectFiles.importantFiles = await this.getImportantFiles();
    } catch (error) {
      // Non-critical, continue without files
    }

    return projectFiles;
  }

  /**
   * Capture recent changes (git history, etc.)
   */
  async captureRecentChanges() {
    const changes = {
      gitStatus: null,
      recentCommits: [],
      uncommittedChanges: []
    };

    try {
      // This would integrate with git
      // For now, return empty structure
    } catch (error) {
      // Non-critical, continue without git info
    }

    return changes;
  }

  /**
   * Get project structure
   */
  async getProjectStructure(dir = process.cwd(), level = 0, maxLevel = 3) {
    if (level > maxLevel) return [];
    
    const structure = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip node_modules and hidden directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }
        
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(process.cwd(), fullPath);
        
        if (entry.isDirectory()) {
          structure.push({
            type: 'directory',
            path: relativePath,
            children: await this.getProjectStructure(fullPath, level + 1, maxLevel)
          });
        } else {
          structure.push({
            type: 'file',
            path: relativePath,
            extension: path.extname(entry.name)
          });
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return structure;
  }

  /**
   * Get recently modified files
   */
  async getRecentFiles(limit = 10) {
    // This would use file system stats to find recent files
    // For now, return empty array
    return [];
  }

  /**
   * Get important project files
   */
  async getImportantFiles() {
    const importantFiles = [];
    const filesToCheck = [
      'package.json',
      'README.md',
      'tsconfig.json',
      '.aiwf/00_PROJECT_MANIFEST.md',
      'CLAUDE.md'
    ];

    for (const file of filesToCheck) {
      try {
        const filePath = path.join(process.cwd(), file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          importantFiles.push({
            path: file,
            size: stats.size,
            modified: stats.mtime
          });
        }
      } catch (error) {
        // File doesn't exist, skip
      }
    }

    return importantFiles;
  }

  /**
   * Calculate context size (approximate token count)
   */
  calculateContextSize(context) {
    // Rough approximation: 1 token ≈ 4 characters
    const jsonString = JSON.stringify(context);
    return Math.ceil(jsonString.length / 4);
  }

  /**
   * Merge base context with persona overlay
   */
  mergeContexts(base, overlay) {
    return {
      ...base,
      personaOverlay: overlay,
      size: this.calculateContextSize({ ...base, personaOverlay: overlay })
    };
  }

  /**
   * Inject context into Claude Code
   */
  async injectContext(context) {
    // This would integrate with Claude Code's context system
    // For now, we'll prepare the context for injection
    
    const injection = {
      systemPrompt: context.personaOverlay?.systemPrompt || '',
      contextRules: context.personaOverlay || {},
      metadata: {
        persona: context.persona,
        timestamp: new Date(),
        size: context.size
      }
    };

    // In a real implementation, this would communicate with Claude Code
    // For now, we'll emit an event
    this.emit('contextInjected', injection);
    
    return true;
  }

  /**
   * Filter content based on persona rules
   */
  async filterContent(content, persona) {
    if (!persona.contextRules) {
      return content;
    }

    let filtered = content;

    // Apply exclusion patterns
    if (persona.contextRules.exclude?.length) {
      filtered = await this.applyExclusions(filtered, persona.contextRules.exclude);
    }

    // Apply priority patterns
    if (persona.contextRules.priority?.length) {
      filtered = await this.applyPriorities(filtered, persona.contextRules.priority);
    }

    // Focus on specific areas
    if (persona.contextRules.focus?.length) {
      filtered = await this.applyFocus(filtered, persona.contextRules.focus);
    }

    return filtered;
  }

  /**
   * Apply exclusion patterns to content
   */
  async applyExclusions(content, patterns) {
    if (typeof content === 'string') {
      // For string content, remove lines matching patterns
      const lines = content.split('\n');
      const filtered = lines.filter(line => {
        return !patterns.some(pattern => this.matchesPattern(line, pattern));
      });
      return filtered.join('\n');
    } else if (Array.isArray(content)) {
      // For array content, filter items
      return content.filter(item => {
        const itemStr = typeof item === 'string' ? item : item.path || '';
        return !patterns.some(pattern => this.matchesPattern(itemStr, pattern));
      });
    } else if (typeof content === 'object') {
      // For object content, recursively filter
      const filtered = {};
      for (const [key, value] of Object.entries(content)) {
        if (!patterns.some(pattern => this.matchesPattern(key, pattern))) {
          filtered[key] = await this.applyExclusions(value, patterns);
        }
      }
      return filtered;
    }
    
    return content;
  }

  /**
   * Apply priority patterns to content
   */
  async applyPriorities(content, patterns) {
    if (Array.isArray(content)) {
      // Sort array content by priority
      return content.sort((a, b) => {
        const aStr = typeof a === 'string' ? a : a.path || '';
        const bStr = typeof b === 'string' ? b : b.path || '';
        
        const aPriority = this.calculatePriority(aStr, patterns);
        const bPriority = this.calculatePriority(bStr, patterns);
        
        return bPriority - aPriority;
      });
    }
    
    // For other content types, return as-is
    return content;
  }

  /**
   * Apply focus areas to content
   */
  async applyFocus(content, focusAreas) {
    // This would implement intelligent focusing based on the focus areas
    // For now, return content as-is
    return content;
  }

  /**
   * Calculate priority score for an item
   */
  calculatePriority(item, patterns) {
    let score = 0;
    
    patterns.forEach((pattern, index) => {
      if (this.matchesPattern(item, pattern)) {
        // Higher priority for patterns listed first
        score += (patterns.length - index) * 10;
      }
    });
    
    return score;
  }

  /**
   * Check if item matches pattern
   */
  matchesPattern(item, pattern) {
    // Convert glob pattern to regex
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/\./g, '\\.');
    
    return new RegExp(regex).test(item);
  }

  /**
   * Cache context for reuse
   */
  cacheContext(personaName, context) {
    const cacheKey = `${personaName}_${Date.now()}`;
    this.contextCache.set(cacheKey, {
      context,
      timestamp: Date.now()
    });

    // Limit cache size
    if (this.contextCache.size > 10) {
      const oldestKey = Array.from(this.contextCache.keys())[0];
      this.contextCache.delete(oldestKey);
    }
  }

  /**
   * Get cached context
   */
  getCachedContext(personaName) {
    for (const [key, value] of this.contextCache.entries()) {
      if (key.startsWith(personaName)) {
        // Check if cache is still valid (5 minutes)
        if (Date.now() - value.timestamp < 300000) {
          return value.context;
        }
      }
    }
    return null;
  }

  /**
   * Get current context
   */
  getCurrentContext() {
    return this.currentContext;
  }

  /**
   * Get context statistics
   */
  getContextStats() {
    return {
      baseContextSize: this.baseContext?.size || 0,
      currentContextSize: this.currentContext?.size || 0,
      cacheSize: this.contextCache.size,
      hasPersonaOverlay: !!this.personaOverlay
    };
  }

  /**
   * Reset context engine
   */
  async reset() {
    this.baseContext = null;
    this.personaOverlay = null;
    this.currentContext = null;
    this.contextCache.clear();
    
    // Recapture base context
    this.baseContext = await this.captureCurrentContext();
    
    this.emit('reset');
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.contextCache.clear();
    this.removeAllListeners();
  }
}

export default ContextEngine;
export { ContextEngine };