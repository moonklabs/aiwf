/**
 * AIWF Configuration interface
 */
export interface AiwfConfig {
  projectName: string;
  projectType: 'web-app' | 'api-server' | 'npm-library' | 'custom';
  features: {
    featureLedger?: boolean;
    contextCompression?: boolean;
    aiPersona?: boolean;
  };
  options?: Record<string, unknown>;
}

/**
 * Feature definition
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  type: 'feature' | 'bugfix' | 'enhancement' | 'setup';
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  tags: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Context compression options
 */
export interface ContextOptions {
  level: 'none' | 'balanced' | 'aggressive';
  tokenLimit: number;
  cacheEnabled: boolean;
}

/**
 * AIWF Integration result
 */
export interface IntegrationResult {
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * Error types
 */
export class AiwfError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AiwfError';
  }
}