import { AiwfIntegration } from '../src/core/AiwfIntegration';
import { AiwfConfig } from '../src/types';

describe('AiwfIntegration', () => {
  let integration: AiwfIntegration;
  const config: AiwfConfig = {
    projectName: 'test-project',
    projectType: 'npm-library',
    features: {
      featureLedger: true,
      contextCompression: true,
      aiPersona: false,
    },
  };

  beforeEach(() => {
    integration = new AiwfIntegration(config);
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(integration.getConfig()).toEqual(config);
    });

    it('should create feature tracker when enabled', () => {
      expect(integration.getFeatureTracker()).toBeDefined();
    });

    it('should create context manager when enabled', () => {
      expect(integration.getContextManager()).toBeDefined();
    });

    it('should not create feature tracker when disabled', () => {
      const customConfig: AiwfConfig = {
        ...config,
        features: { ...config.features, featureLedger: false },
      };
      const customIntegration = new AiwfIntegration(customConfig);
      expect(customIntegration.getFeatureTracker()).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should return success when properly initialized', async () => {
      const result = await integration.validate();
      expect(result.success).toBe(true);
      expect(result.message).toContain('valid');
    });

    it('should include enabled features in validation result', async () => {
      const result = await integration.validate();
      expect(result.data).toBeDefined();
      const data = result.data as any;
      expect(data.features).toContain('featureLedger');
      expect(data.features).toContain('contextCompression');
      expect(data.features).not.toContain('aiPersona');
    });
  });
});