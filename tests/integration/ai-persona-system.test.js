/**
 * AI Persona System Integration Tests
 */

import { AIPersonaManager } from '../../src/lib/ai-persona-manager.js';
import { ContextEngine } from '../../src/lib/context-engine.js';
import { MetricsCollector } from '../../src/lib/metrics-collector.js';
import { TaskAnalyzer } from '../../src/lib/task-analyzer.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('AI Persona System Integration', () => {
  let personaManager;
  let testDir;

  beforeAll(async () => {
    // Create test directory
    testDir = path.join(__dirname, 'test-persona-system');
    await fs.mkdir(testDir, { recursive: true });
    
    // Create test project structure
    await createTestProjectStructure(testDir);
  });

  afterAll(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    // Initialize persona manager with test directory
    personaManager = new AIPersonaManager({
      personaConfigPath: path.join(testDir, '.aiwf', 'personas'),
      metricsPath: path.join(testDir, '.aiwf', 'metrics'),
      metricsEnabled: true,
      autoDetectionEnabled: true
    });
    
    await personaManager.init();
  });

  afterEach(async () => {
    if (personaManager) {
      await personaManager.cleanup();
    }
  });

  describe('Full Workflow', () => {
    test('complete debugging workflow with auto-detection', async () => {
      // Simulate a debugging task
      const task = {
        command: 'debug the authentication error in login.js',
        description: 'Users are getting 401 errors when trying to login'
      };

      // Detect optimal persona
      const detectedPersona = await personaManager.detectOptimalPersona(task);
      
      // Should detect debugger persona
      expect(detectedPersona).toBe('debugger');
      expect(personaManager.currentPersona.name).toBe('debugger');

      // Verify context rules are applied
      const context = personaManager.contextEngine.getCurrentContext();
      expect(context).toBeTruthy();
      expect(context.personaOverlay).toBeTruthy();
      expect(context.personaOverlay.systemPrompt).toContain('debugger mode');

      // Simulate task completion
      const sessionId = personaManager.metricsCollector.startSession(
        personaManager.currentPersona,
        task
      );
      
      // Track some events
      personaManager.metricsCollector.trackEvent('interaction', { type: 'code_analysis' });
      personaManager.metricsCollector.trackEvent('interaction', { type: 'error_trace' });
      personaManager.metricsCollector.trackEvent('task_completed', { success: true });
      
      // End session
      const session = personaManager.metricsCollector.endSession('completed');
      
      expect(session).toBeTruthy();
      expect(session.persona).toBe('debugger');
      expect(session.metrics.completionStatus).toBe('completed');
      expect(session.metrics.interactions).toBe(2);
    });

    test('architecture design workflow with manual switching', async () => {
      // Manually switch to architect persona
      await personaManager.switchPersona('architect', { manual: true });
      
      expect(personaManager.currentPersona.name).toBe('architect');
      
      // Verify architect-specific context
      const context = personaManager.getPersonaContext('architect');
      expect(context.priority).toContain('*.md');
      expect(context.priority).toContain('*.yml');
      expect(context.exclude).toContain('test/**');
      
      // Apply persona rules to content
      const projectFiles = [
        'src/index.js',
        'test/test.js',
        'architecture.md',
        'design.yml'
      ];
      
      const filtered = await personaManager.applyPersonaRules(
        projectFiles,
        'architect'
      );
      
      // Should filter based on architect rules
      expect(filtered).toBeTruthy();
    });

    test('multi-persona workflow for feature development', async () => {
      const personas = ['architect', 'developer', 'reviewer', 'documenter'];
      const history = [];

      for (const personaName of personas) {
        // Switch persona
        await personaManager.switchPersona(personaName);
        
        // Simulate work
        const sessionId = personaManager.metricsCollector.startSession(
          personaName,
          { type: 'feature_development', description: `${personaName} phase` }
        );
        
        // Track events
        personaManager.metricsCollector.trackEvent('interaction', { 
          persona: personaName 
        });
        
        // End session
        const session = personaManager.metricsCollector.endSession('completed');
        history.push(session);
      }

      // Verify workflow
      expect(history).toHaveLength(4);
      expect(history[0].persona).toBe('architect');
      expect(history[3].persona).toBe('documenter');
      
      // Check persona history
      expect(personaManager.personaHistory).toHaveLength(3); // Excludes last switch
    });
  });

  describe('Performance and Metrics', () => {
    test('collects and reports persona performance metrics', async () => {
      // Simulate multiple sessions with different personas
      const testSessions = [
        { persona: 'debugger', task: 'fix bug', quality: 0.9, duration: 120000 },
        { persona: 'debugger', task: 'trace error', quality: 0.8, duration: 180000 },
        { persona: 'architect', task: 'design api', quality: 0.95, duration: 300000 },
        { persona: 'optimizer', task: 'improve speed', quality: 0.85, duration: 240000 }
      ];

      for (const testSession of testSessions) {
        await personaManager.switchPersona(testSession.persona);
        
        const sessionId = personaManager.metricsCollector.startSession(
          testSession.persona,
          { type: 'test', description: testSession.task }
        );
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 10));
        
        personaManager.metricsCollector.trackEvent('task_completed');
        const session = personaManager.metricsCollector.endSession('completed');
        
        // Override quality metrics for testing
        session.qualityMetrics = { overallScore: testSession.quality };
      }

      // Generate report
      const report = await personaManager.generateReport();
      
      expect(report).toBeTruthy();
      expect(report.summary).toBeTruthy();
      expect(report.personaAnalysis).toBeTruthy();
      expect(report.personaInsights).toBeTruthy();
      
      // Check debugger insights (2 sessions)
      expect(report.personaInsights.debugger).toBeTruthy();
      expect(report.personaInsights.debugger.effectiveness).toBeTruthy();
    });

    test('tracks token usage optimization', async () => {
      // Switch to optimizer persona
      await personaManager.switchPersona('optimizer');
      
      // Get context stats before
      const statsBefore = personaManager.contextEngine.getContextStats();
      
      // Apply optimization
      const largeContext = {
        projectFiles: {
          structure: generateLargeFileStructure(100),
          recentFiles: Array(50).fill('file.js')
        }
      };
      
      const optimized = await personaManager.contextEngine.tokenOptimizer.optimize(
        largeContext,
        personaManager.currentPersona.contextRules,
        personaManager.currentPersona.tokenAllocation
      );
      
      // Verify optimization
      expect(optimized.size).toBeLessThan(
        personaManager.contextEngine.calculateContextSize(largeContext)
      );
    });
  });

  describe('Auto-Detection Accuracy', () => {
    test('correctly identifies debugging tasks', async () => {
      const debugTasks = [
        'fix the null pointer exception',
        'debug the login error',
        'trace the memory leak',
        'investigate why tests are failing'
      ];

      for (const command of debugTasks) {
        const detected = await personaManager.detectOptimalPersona({ command });
        expect(['debugger', 'developer']).toContain(detected);
      }
    });

    test('correctly identifies architecture tasks', async () => {
      const architectTasks = [
        'design the microservices architecture',
        'plan the system structure',
        'create architectural diagram',
        'define module interfaces'
      ];

      for (const command of architectTasks) {
        const detected = await personaManager.detectOptimalPersona({ command });
        expect(['architect', 'developer']).toContain(detected);
      }
    });

    test('correctly identifies documentation tasks', async () => {
      const docTasks = [
        'write API documentation',
        'create user guide',
        'document the installation process',
        'explain how the feature works'
      ];

      for (const command of docTasks) {
        const detected = await personaManager.detectOptimalPersona({ command });
        expect(['documenter', 'developer']).toContain(detected);
      }
    });
  });

  describe('Context Management', () => {
    test('preserves base context across persona switches', async () => {
      // Create base context
      const baseFiles = ['app.js', 'config.js', 'package.json'];
      
      // Switch personas and verify base context preserved
      const personas = ['architect', 'debugger', 'reviewer'];
      
      for (const persona of personas) {
        await personaManager.switchPersona(persona);
        
        const context = personaManager.contextEngine.getCurrentContext();
        expect(context).toBeTruthy();
        
        // Base context should be preserved
        if (personaManager.contextEngine.baseContext) {
          expect(context).toHaveProperty('environment');
        }
      }
    });

    test('applies persona-specific filtering correctly', async () => {
      // Test architect filtering
      await personaManager.switchPersona('architect');
      
      const files = {
        'src/index.js': 'implementation',
        'test/test.js': 'test code',
        'docs/api.md': 'documentation',
        'design/architecture.yml': 'architecture'
      };
      
      const architectFiltered = await personaManager.applyPersonaRules(
        Object.keys(files),
        'architect'
      );
      
      // Test debugger filtering
      await personaManager.switchPersona('debugger');
      
      const debuggerFiltered = await personaManager.applyPersonaRules(
        Object.keys(files),
        'debugger'
      );
      
      // Results should differ based on persona
      expect(architectFiltered).not.toEqual(debuggerFiltered);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('recovers from failed persona switch', async () => {
      // Force an error in context engine
      const originalApply = personaManager.contextEngine.applyPersonaRules;
      personaManager.contextEngine.applyPersonaRules = jest.fn()
        .mockRejectedValueOnce(new Error('Context error'));
      
      // Attempt switch
      await expect(personaManager.switchPersona('architect')).rejects.toThrow();
      
      // Should still be in developer persona
      expect(personaManager.currentPersona.name).toBe('developer');
      
      // Restore and retry
      personaManager.contextEngine.applyPersonaRules = originalApply;
      await personaManager.switchPersona('architect');
      
      expect(personaManager.currentPersona.name).toBe('architect');
    });

    test('handles metrics collection failure gracefully', async () => {
      // Disable metrics
      personaManager.options.metricsEnabled = false;
      
      // Operations should still work
      await personaManager.switchPersona('reviewer');
      const stats = await personaManager.getPersonaStats('reviewer');
      
      expect(stats).toHaveProperty('message', 'Metrics collection is disabled');
      expect(personaManager.currentPersona.name).toBe('reviewer');
    });
  });
});

// Helper functions

async function createTestProjectStructure(baseDir) {
  // Create directories
  const dirs = [
    '.aiwf/personas',
    '.aiwf/metrics',
    'src',
    'test',
    'docs'
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(path.join(baseDir, dir), { recursive: true });
  }
  
  // Create sample files
  const files = {
    'src/index.js': 'console.log("Hello");',
    'src/auth.js': 'function login() {}',
    'test/test.js': 'describe("test", () => {});',
    'docs/README.md': '# Project',
    'package.json': JSON.stringify({ name: 'test-project' })
  };
  
  for (const [file, content] of Object.entries(files)) {
    await fs.writeFile(path.join(baseDir, file), content);
  }
}

function generateLargeFileStructure(count) {
  const structure = [];
  
  for (let i = 0; i < count; i++) {
    structure.push({
      type: 'file',
      path: `src/file${i}.js`,
      extension: '.js'
    });
  }
  
  return structure;
}