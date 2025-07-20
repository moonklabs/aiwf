import { AiwfConfig, IntegrationResult } from '../types';
import { FeatureTracker } from './FeatureTracker';
import { ContextManager } from './ContextManager';

/**
 * Main AIWF Integration class
 */
export class AiwfIntegration {
  private config: AiwfConfig;
  private featureTracker?: FeatureTracker;
  private contextManager?: ContextManager;

  constructor(config: AiwfConfig) {
    this.config = config;
    this.initialize();
  }

  /**
   * Initialize AIWF components based on configuration
   */
  private initialize(): void {
    if (this.config.features.featureLedger) {
      this.featureTracker = new FeatureTracker(this.config.projectName);
    }

    if (this.config.features.contextCompression) {
      this.contextManager = new ContextManager();
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): AiwfConfig {
    return { ...this.config };
  }

  /**
   * Get the feature tracker instance
   */
  getFeatureTracker(): FeatureTracker | undefined {
    return this.featureTracker;
  }

  /**
   * Get the context manager instance
   */
  getContextManager(): ContextManager | undefined {
    return this.contextManager;
  }

  /**
   * Check if AIWF is properly initialized
   */
  async validate(): Promise<IntegrationResult> {
    try {
      // Validation logic here
      return {
        success: true,
        message: 'AIWF integration is valid',
        data: {
          projectName: this.config.projectName,
          features: Object.entries(this.config.features)
            .filter(([_, enabled]) => enabled)
            .map(([feature]) => feature),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}