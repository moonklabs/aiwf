import { ContextOptions } from '../types';

/**
 * Context compression and management
 */
export class ContextManager {
  private options: ContextOptions;
  private cache: Map<string, string> = new Map();
  private tokenCount: number = 0;

  constructor(options?: Partial<ContextOptions>) {
    this.options = {
      level: options?.level ?? 'balanced',
      tokenLimit: options?.tokenLimit ?? 100000,
      cacheEnabled: options?.cacheEnabled ?? true,
    };
  }

  /**
   * Compress context based on configured level
   */
  compress(content: string): string {
    if (this.options.level === 'none') {
      return content;
    }

    // Check cache first
    if (this.options.cacheEnabled) {
      const cached = this.cache.get(content);
      if (cached) return cached;
    }

    let compressed = content;

    if (this.options.level === 'balanced') {
      // Balanced compression: remove extra whitespace, comments
      compressed = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\/\/.*/g, '') // Remove single-line comments
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    } else if (this.options.level === 'aggressive') {
      // Aggressive compression: minify
      compressed = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .trim();
    }

    // Cache the result
    if (this.options.cacheEnabled) {
      this.cache.set(content, compressed);
    }

    return compressed;
  }

  /**
   * Estimate token count (simplified)
   */
  estimateTokens(content: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(content.length / 4);
  }

  /**
   * Check if content fits within token limit
   */
  checkTokenLimit(content: string): boolean {
    const tokens = this.estimateTokens(content);
    return tokens <= this.options.tokenLimit;
  }

  /**
   * Update token usage
   */
  updateTokenUsage(tokens: number): void {
    this.tokenCount += tokens;
  }

  /**
   * Get current token usage
   */
  getTokenUsage(): { used: number; limit: number; percentage: number } {
    return {
      used: this.tokenCount,
      limit: this.options.tokenLimit,
      percentage: (this.tokenCount / this.options.tokenLimit) * 100,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: number } {
    let size = 0;
    this.cache.forEach((value) => {
      size += value.length;
    });

    return {
      size,
      entries: this.cache.size,
    };
  }
}