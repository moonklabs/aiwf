/**
 * {{projectName}} - {{description}}
 * @packageDocumentation
 */

export { AiwfIntegration } from './core/AiwfIntegration';
export { FeatureTracker } from './core/FeatureTracker';
export { ContextManager } from './core/ContextManager';

// Type exports
export type { AiwfConfig, Feature, ContextOptions } from './types';

// Version
export { version } from '../package.json';

/**
 * Default export for convenience
 */
export default {
  AiwfIntegration: require('./core/AiwfIntegration').AiwfIntegration,
  FeatureTracker: require('./core/FeatureTracker').FeatureTracker,
  ContextManager: require('./core/ContextManager').ContextManager,
};