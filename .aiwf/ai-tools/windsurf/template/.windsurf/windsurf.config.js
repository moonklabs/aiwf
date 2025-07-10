/**
 * Windsurf AI Configuration for AIWF Projects
 * 
 * This configuration enables Windsurf to understand and work with
 * the AI Workflow Framework (AIWF) structure and conventions.
 */

module.exports = {
  // Project context
  projectType: 'aiwf',
  frameworkVersion: '1.0.0',
  
  // AIWF structure recognition
  projectStructure: {
    root: '.aiwf',
    features: '.aiwf/06_FEATURE_LEDGERS',
    sprints: '.aiwf/03_SPRINTS',
    personas: '.aiwf/personas',
    templates: '.aiwf/99_TEMPLATES'
  },
  
  // Code generation patterns
  patterns: {
    // Feature-based patterns
    feature: {
      template: 'aiwf-feature',
      metadata: ['featureId', 'taskId', 'sprintId', 'persona'],
      validation: 'always',
      documentation: 'required'
    },
    
    // Service patterns
    service: {
      template: 'aiwf-service',
      includes: ['feature-validation', 'error-handling', 'logging'],
      baseClass: 'AiwfService'
    },
    
    // Component patterns
    component: {
      template: 'aiwf-component',
      style: 'functional',
      hooks: ['useFeature', 'useTask', 'usePersona']
    }
  },
  
  // Context providers
  contextProviders: [
    {
      name: 'featureLedger',
      path: '.aiwf/06_FEATURE_LEDGERS',
      parser: 'markdown',
      cache: true
    },
    {
      name: 'currentSprint',
      path: '.aiwf/03_SPRINTS',
      parser: 'aiwf-sprint',
      watch: true
    },
    {
      name: 'activePersona',
      path: '.aiwf/current_persona.json',
      parser: 'json',
      watch: true
    }
  ],
  
  // Code suggestions behavior
  suggestions: {
    // Prioritize AIWF patterns
    priorityPatterns: [
      'feature-reference',
      'task-implementation',
      'sprint-alignment',
      'persona-specific'
    ],
    
    // Auto-include metadata
    autoInclude: {
      featureId: true,
      taskId: true,
      persona: true,
      timestamp: false
    },
    
    // Validation rules
    validation: {
      requireFeatureId: true,
      checkFeatureStatus: true,
      validateTaskAlignment: true
    }
  },
  
  // Persona-specific configurations
  personas: {
    architect: {
      focus: ['design-patterns', 'architecture', 'scalability'],
      suggestions: ['interfaces', 'abstractions', 'patterns'],
      documentation: 'extensive'
    },
    security: {
      focus: ['validation', 'sanitization', 'authentication'],
      suggestions: ['security-checks', 'audit-logging', 'encryption'],
      warnings: 'aggressive'
    },
    frontend: {
      focus: ['ui-components', 'user-experience', 'performance'],
      suggestions: ['react-patterns', 'optimization', 'accessibility'],
      style: 'modern'
    },
    backend: {
      focus: ['api-design', 'data-flow', 'scalability'],
      suggestions: ['rest-patterns', 'database-optimization', 'caching'],
      testing: 'comprehensive'
    },
    data_analyst: {
      focus: ['data-processing', 'visualization', 'insights'],
      suggestions: ['pandas-patterns', 'chart-types', 'statistics'],
      documentation: 'detailed'
    }
  },
  
  // Integration with AIWF commands
  commands: {
    // Feature operations
    'Create Feature': {
      command: 'aiwf ledger create',
      shortcut: 'ctrl+shift+f',
      context: 'always'
    },
    'Update Task': {
      command: 'aiwf task update',
      shortcut: 'ctrl+shift+t',
      context: 'in-task'
    },
    'Switch Persona': {
      command: 'aiwf persona use',
      shortcut: 'ctrl+shift+p',
      context: 'always'
    }
  },
  
  // Code templates
  templates: {
    // Feature implementation template
    'aiwf-feature': `/**
 * @feature {{featureId}} - {{featureName}}
 * @task {{taskId}} - {{taskName}}
 * @sprint {{sprintId}}
 * @persona {{activePersona}}
 */

import { FeatureLedger, TaskManager } from '@aiwf/core';

export class {{className}} {
  constructor(
    private ledger: FeatureLedger,
    private taskManager: TaskManager
  ) {
    this.validateFeature();
  }
  
  private async validateFeature() {
    const feature = await this.ledger.getFeature('{{featureId}}');
    if (feature.status !== 'active') {
      throw new Error(\`Feature {{featureId}} is not active\`);
    }
  }
  
  // Implementation here
}`,
    
    // Service template
    'aiwf-service': `/**
 * {{serviceName}} Service
 * @feature {{featureId}}
 * @layer service
 */

import { BaseService } from '@aiwf/core';
import { Logger } from '@aiwf/logging';

export class {{serviceName}}Service extends BaseService {
  private logger: Logger;
  
  constructor() {
    super('{{featureId}}');
    this.logger = new Logger('{{serviceName}}Service');
  }
  
  // Service methods
}`,
    
    // Test template
    'aiwf-test': `/**
 * Tests for {{featureName}}
 * @feature {{featureId}}
 * @task {{taskId}}
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { {{className}} } from './{{fileName}}';

describe('Feature {{featureId}}: {{featureName}}', () => {
  describe('Task {{taskId}}: {{taskName}}', () => {
    let instance: {{className}};
    
    beforeEach(() => {
      instance = new {{className}}();
    });
    
    describe('Acceptance Criteria', () => {
      it('should meet criteria 1', async () => {
        // Test implementation
      });
    });
  });
});`
  },
  
  // Import organization
  importOrganization: {
    order: [
      'external',
      '@aiwf/core',
      '@aiwf/*',
      'project',
      'feature',
      'relative'
    ],
    grouping: true,
    sorting: 'alphabetical'
  },
  
  // Error handling patterns
  errorHandling: {
    style: 'contextual',
    includeFeatureContext: true,
    standardErrors: {
      'FeatureNotActive': 'Feature {{featureId}} is not active',
      'TaskNotFound': 'Task {{taskId}} not found in sprint {{sprintId}}',
      'PersonaMismatch': 'Current persona {{current}} does not match required {{required}}'
    }
  },
  
  // Documentation generation
  documentation: {
    style: 'jsdoc',
    required: ['feature', 'task', 'params', 'returns'],
    autoGenerate: {
      feature: true,
      task: true,
      sprint: true,
      persona: true
    }
  },
  
  // Performance optimization
  performance: {
    enableProfiling: true,
    featureMetrics: true,
    suggestions: {
      memoization: true,
      lazyLoading: true,
      codeSpitting: true
    }
  },
  
  // Security patterns
  security: {
    enableChecks: true,
    patterns: {
      inputValidation: 'always',
      outputSanitization: 'always',
      authentication: 'feature-based',
      authorization: 'role-based'
    }
  },
  
  // Git integration
  git: {
    commitFormat: '{{type}}({{featureId}}): {{message}}',
    branchFormat: 'feature/{{featureId}}-{{name}}',
    prTemplate: `## Feature: {{featureId}}
## Task: {{taskId}}
## Sprint: {{sprintId}}

### Changes
- 

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Acceptance criteria met

### Documentation
- [ ] Code documented
- [ ] Feature ledger updated
- [ ] Sprint log updated`
  },
  
  // Project-specific overrides
  projectRules: {
    // Add your project-specific rules here
  },
  
  // Disabled features
  disabled: [
    // Add any features to disable
  ]
};