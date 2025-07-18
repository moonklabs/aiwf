/**
 * Token Optimizer
 * Optimizes token usage for AI persona contexts
 */

import { EventEmitter } from 'events';

class TokenOptimizer extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      maxTokens: options.maxTokens || 100000,
      compressionStrategies: options.compressionStrategies || ['summarize', 'filter', 'truncate'],
      preserveImportant: options.preserveImportant !== false,
      qualityThreshold: options.qualityThreshold || 0.8,
      ...options
    };

    // Token estimation factors
    this.tokenFactors = {
      charToToken: 4, // Approximate: 1 token ≈ 4 characters
      lineOverhead: 1, // Additional tokens per line
      structureOverhead: 0.1 // 10% overhead for JSON structure
    };
  }

  /**
   * Optimize context based on persona token allocation
   */
  async optimize(baseContext, personaOverlay, tokenAllocation) {
    try {
      // Calculate current token usage
      const currentTokens = this.estimateTokens(baseContext) + 
                          this.estimateTokens(personaOverlay);

      // Calculate target tokens
      const targetTokens = Math.floor(this.options.maxTokens * (tokenAllocation.context || 0.4));

      // If already within limits, return as-is
      if (currentTokens <= targetTokens) {
        return this.mergeContexts(baseContext, personaOverlay);
      }

      // Apply optimization strategies
      let optimizedContext = baseContext;
      let optimizedOverlay = personaOverlay;

      for (const strategy of this.options.compressionStrategies) {
        const result = await this.applyStrategy(
          strategy,
          optimizedContext,
          optimizedOverlay,
          targetTokens
        );

        optimizedContext = result.context;
        optimizedOverlay = result.overlay;

        // Check if we've reached target
        const newTokens = this.estimateTokens(optimizedContext) + 
                         this.estimateTokens(optimizedOverlay);
        
        if (newTokens <= targetTokens) {
          break;
        }
      }

      const finalContext = this.mergeContexts(optimizedContext, optimizedOverlay);
      
      this.emit('optimized', {
        originalTokens: currentTokens,
        optimizedTokens: this.estimateTokens(finalContext),
        reduction: ((currentTokens - this.estimateTokens(finalContext)) / currentTokens) * 100
      });

      return finalContext;
    } catch (error) {
      this.emit('error', { error, phase: 'optimization' });
      throw error;
    }
  }

  /**
   * Apply optimization strategy
   */
  async applyStrategy(strategy, context, overlay, targetTokens) {
    switch (strategy) {
      case 'summarize':
        return await this.applySummarization(context, overlay, targetTokens);
        
      case 'filter':
        return await this.applyFiltering(context, overlay, targetTokens);
        
      case 'truncate':
        return await this.applyTruncation(context, overlay, targetTokens);
        
      default:
        return { context, overlay };
    }
  }

  /**
   * Apply summarization strategy
   */
  async applySummarization(context, overlay, targetTokens) {
    const optimized = {
      context: { ...context },
      overlay: { ...overlay }
    };

    // Summarize project files
    if (context.projectFiles) {
      optimized.context.projectFiles = this.summarizeProjectFiles(context.projectFiles);
    }

    // Summarize environment (keep as-is, already minimal)
    
    // Summarize recent changes
    if (context.recentChanges) {
      optimized.context.recentChanges = this.summarizeRecentChanges(context.recentChanges);
    }

    return optimized;
  }

  /**
   * Summarize project files
   */
  summarizeProjectFiles(projectFiles) {
    const summarized = {
      structure: this.summarizeFileStructure(projectFiles.structure || []),
      recentFiles: (projectFiles.recentFiles || []).slice(0, 5), // Keep only top 5
      importantFiles: projectFiles.importantFiles || []
    };

    return summarized;
  }

  /**
   * Summarize file structure
   */
  summarizeFileStructure(structure, maxDepth = 2, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
      return { type: 'truncated', count: this.countItems(structure) };
    }

    return structure.map(item => {
      if (item.type === 'directory' && item.children) {
        // Summarize large directories
        if (item.children.length > 10) {
          return {
            ...item,
            children: [
              ...item.children.slice(0, 5),
              { type: 'truncated', count: item.children.length - 5 }
            ]
          };
        }
        
        return {
          ...item,
          children: this.summarizeFileStructure(item.children, maxDepth, currentDepth + 1)
        };
      }
      
      return item;
    });
  }

  /**
   * Count items in structure
   */
  countItems(structure) {
    let count = 0;
    
    for (const item of structure) {
      count++;
      if (item.children) {
        count += this.countItems(item.children);
      }
    }
    
    return count;
  }

  /**
   * Summarize recent changes
   */
  summarizeRecentChanges(changes) {
    return {
      gitStatus: changes.gitStatus,
      recentCommits: (changes.recentCommits || []).slice(0, 3), // Keep only 3 most recent
      hasUncommittedChanges: changes.uncommittedChanges?.length > 0
    };
  }

  /**
   * Apply filtering strategy
   */
  async applyFiltering(context, overlay, targetTokens) {
    const optimized = {
      context: { ...context },
      overlay: { ...overlay }
    };

    // Apply persona-specific filtering
    if (overlay.exclusionPatterns?.length > 0) {
      optimized.context = this.filterByPatterns(
        optimized.context,
        overlay.exclusionPatterns,
        'exclude'
      );
    }

    if (overlay.priorityPatterns?.length > 0) {
      optimized.context = this.filterByPatterns(
        optimized.context,
        overlay.priorityPatterns,
        'include'
      );
    }

    return optimized;
  }

  /**
   * Filter context by patterns
   */
  filterByPatterns(context, patterns, mode = 'exclude') {
    const filtered = { ...context };

    // Filter project files
    if (filtered.projectFiles) {
      filtered.projectFiles = {
        ...filtered.projectFiles,
        structure: this.filterFileStructure(
          filtered.projectFiles.structure || [],
          patterns,
          mode
        ),
        recentFiles: this.filterFileList(
          filtered.projectFiles.recentFiles || [],
          patterns,
          mode
        )
      };
    }

    return filtered;
  }

  /**
   * Filter file structure by patterns
   */
  filterFileStructure(structure, patterns, mode) {
    return structure
      .map(item => {
        const matches = this.matchesPatterns(item.path, patterns);
        
        if (mode === 'exclude' && matches) {
          return null;
        }
        
        if (mode === 'include' && !matches) {
          return null;
        }
        
        if (item.type === 'directory' && item.children) {
          const filteredChildren = this.filterFileStructure(item.children, patterns, mode);
          
          // Remove empty directories
          if (filteredChildren.length === 0) {
            return null;
          }
          
          return {
            ...item,
            children: filteredChildren
          };
        }
        
        return item;
      })
      .filter(Boolean);
  }

  /**
   * Filter file list by patterns
   */
  filterFileList(files, patterns, mode) {
    return files.filter(file => {
      const path = typeof file === 'string' ? file : file.path;
      const matches = this.matchesPatterns(path, patterns);
      
      if (mode === 'exclude') {
        return !matches;
      }
      
      return matches;
    });
  }

  /**
   * Check if path matches any pattern
   */
  matchesPatterns(path, patterns) {
    return patterns.some(pattern => {
      const regex = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.')
        .replace(/\./g, '\\.');
      
      return new RegExp(regex).test(path);
    });
  }

  /**
   * Apply truncation strategy
   */
  async applyTruncation(context, overlay, targetTokens) {
    const optimized = {
      context: { ...context },
      overlay: { ...overlay }
    };

    // Calculate how much we need to reduce
    const currentTokens = this.estimateTokens(context) + this.estimateTokens(overlay);
    const reductionRatio = targetTokens / currentTokens;

    // Truncate various sections proportionally
    if (context.projectFiles?.structure) {
      const maxItems = Math.floor(10 * reductionRatio);
      optimized.context.projectFiles.structure = 
        this.truncateStructure(context.projectFiles.structure, maxItems);
    }

    if (context.projectFiles?.recentFiles) {
      const maxFiles = Math.floor(context.projectFiles.recentFiles.length * reductionRatio);
      optimized.context.projectFiles.recentFiles = 
        context.projectFiles.recentFiles.slice(0, Math.max(maxFiles, 3));
    }

    // Truncate system prompt if needed
    if (overlay.systemPrompt) {
      const maxLength = Math.floor(overlay.systemPrompt.length * reductionRatio);
      optimized.overlay.systemPrompt = this.truncateText(
        overlay.systemPrompt,
        maxLength,
        true // preserve important parts
      );
    }

    return optimized;
  }

  /**
   * Truncate structure to maximum items
   */
  truncateStructure(structure, maxItems, currentCount = 0) {
    const truncated = [];
    let count = currentCount;

    for (const item of structure) {
      if (count >= maxItems) {
        truncated.push({ type: 'truncated', count: structure.length - truncated.length });
        break;
      }

      if (item.type === 'directory' && item.children) {
        const remainingItems = maxItems - count - 1;
        const truncatedChildren = this.truncateStructure(
          item.children,
          remainingItems,
          0
        );
        
        truncated.push({
          ...item,
          children: truncatedChildren
        });
        
        count += 1 + this.countItems(truncatedChildren);
      } else {
        truncated.push(item);
        count++;
      }
    }

    return truncated;
  }

  /**
   * Truncate text while preserving important parts
   */
  truncateText(text, maxLength, preserveImportant = false) {
    if (text.length <= maxLength) {
      return text;
    }

    if (!preserveImportant) {
      return text.substring(0, maxLength - 3) + '...';
    }

    // Try to preserve complete sentences
    const sentences = text.split(/\. |\n/);
    let truncated = '';
    
    for (const sentence of sentences) {
      if (truncated.length + sentence.length + 2 > maxLength) {
        break;
      }
      truncated += sentence + '. ';
    }

    return truncated.trim() || text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Estimate token count
   */
  estimateTokens(obj) {
    if (!obj) return 0;

    const jsonString = JSON.stringify(obj);
    const charCount = jsonString.length;
    const lineCount = jsonString.split('\n').length;

    // Base token count from characters
    let tokens = Math.ceil(charCount / this.tokenFactors.charToToken);
    
    // Add line overhead
    tokens += lineCount * this.tokenFactors.lineOverhead;
    
    // Add structure overhead
    tokens *= (1 + this.tokenFactors.structureOverhead);

    return Math.ceil(tokens);
  }

  /**
   * Merge contexts
   */
  mergeContexts(context, overlay) {
    return {
      ...context,
      personaOverlay: overlay,
      size: this.estimateTokens({ ...context, personaOverlay: overlay })
    };
  }

  /**
   * Validate optimization quality
   */
  validateQuality(original, optimized) {
    // Check that important information is preserved
    const quality = {
      score: 1.0,
      issues: []
    };

    // Check if environment is preserved
    if (!optimized.environment) {
      quality.score -= 0.2;
      quality.issues.push('Missing environment information');
    }

    // Check if important files are preserved
    if (original.projectFiles?.importantFiles && 
        (!optimized.projectFiles?.importantFiles || 
         optimized.projectFiles.importantFiles.length === 0)) {
      quality.score -= 0.1;
      quality.issues.push('Important files removed');
    }

    // Check if persona overlay is preserved
    if (!optimized.personaOverlay?.systemPrompt) {
      quality.score -= 0.3;
      quality.issues.push('Missing persona system prompt');
    }

    return quality;
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats() {
    // This would track optimization performance over time
    return {
      averageReduction: 0.3, // 30% average reduction
      strategyEffectiveness: {
        summarize: 0.2,
        filter: 0.3,
        truncate: 0.5
      }
    };
  }

  /**
   * Reset optimizer
   */
  reset() {
    this.removeAllListeners();
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.reset();
  }
}

export default TokenOptimizer;
export { TokenOptimizer };