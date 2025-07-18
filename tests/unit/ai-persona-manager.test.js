/**
 * AI Persona Manager Unit Tests
 */

import { jest } from '@jest/globals';
import { AIPersonaManager } from '../../src/lib/ai-persona-manager.js';
import { ContextEngine } from '../../src/lib/context-engine.js';
import { MetricsCollector } from '../../src/lib/metrics-collector.js';
import { TaskAnalyzer } from '../../src/lib/task-analyzer.js';
import fs from 'fs/promises';
import path from 'path';

// Mock dependencies
jest.mock('../../src/lib/context-engine.js');
jest.mock('../../src/lib/metrics-collector.js');
jest.mock('../../src/lib/task-analyzer.js');
jest.mock('fs/promises');

describe('AIPersonaManager', () => {
  let manager;
  let mockContextEngine;
  let mockMetricsCollector;
  let mockTaskAnalyzer;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock instances
    mockContextEngine = {
      init: jest.fn().mockResolvedValue(true),
      applyPersonaRules: jest.fn().mockResolvedValue({}),
      filterContent: jest.fn().mockResolvedValue('filtered content'),
      reset: jest.fn().mockResolvedValue(true),
      cleanup: jest.fn().mockResolvedValue(true)
    };
    
    mockMetricsCollector = {
      init: jest.fn().mockResolvedValue(true),
      trackEvent: jest.fn(),
      collectCurrentMetrics: jest.fn().mockResolvedValue({}),
      getPersonaHistory: jest.fn().mockResolvedValue([]),
      getPersonaStats: jest.fn().mockResolvedValue({}),
      generateReport: jest.fn().mockResolvedValue({}),
      reset: jest.fn().mockResolvedValue(true),
      cleanup: jest.fn().mockResolvedValue(true)
    };
    
    mockTaskAnalyzer = {
      analyzeTask: jest.fn().mockResolvedValue({
        keywords: ['test'],
        scores: { developer: 50, architect: 30 },
        primaryType: 'developer'
      }),
      calculateSimilarity: jest.fn().mockReturnValue(0.5),
      cleanup: jest.fn()
    };
    
    // Mock constructor implementations
    ContextEngine.mockImplementation(() => mockContextEngine);
    MetricsCollector.mockImplementation(() => mockMetricsCollector);
    TaskAnalyzer.mockImplementation(() => mockTaskAnalyzer);
    
    // Mock fs
    fs.mkdir.mockResolvedValue(undefined);
    fs.readdir.mockResolvedValue([]);
    
    // Create manager instance
    manager = new AIPersonaManager({
      metricsEnabled: true,
      autoDetectionEnabled: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    test('initializes successfully', async () => {
      const result = await manager.init();
      
      expect(result).toBe(true);
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('.aiwf/personas'),
        { recursive: true }
      );
      expect(mockContextEngine.init).toHaveBeenCalled();
      expect(mockMetricsCollector.init).toHaveBeenCalled();
    });

    test('loads available personas', async () => {
      await manager.init();
      
      const personas = manager.getAvailablePersonas();
      expect(personas).toContain('architect');
      expect(personas).toContain('debugger');
      expect(personas).toContain('reviewer');
      expect(personas).toContain('documenter');
      expect(personas).toContain('optimizer');
      expect(personas).toContain('developer');
    });

    test('sets default persona to developer', async () => {
      await manager.init();
      
      const current = manager.getCurrentPersona();
      expect(current.name).toBe('developer');
    });

    test('emits initialized event', async () => {
      const listener = jest.fn();
      manager.on('initialized', listener);
      
      await manager.init();
      
      expect(listener).toHaveBeenCalledWith({
        availablePersonas: expect.arrayContaining(['developer']),
        currentPersona: 'developer'
      });
    });
  });

  describe('persona switching', () => {
    beforeEach(async () => {
      await manager.init();
    });

    test('switches personas correctly', async () => {
      const result = await manager.switchPersona('architect');
      
      expect(result.name).toBe('architect');
      expect(manager.currentPersona.name).toBe('architect');
      expect(mockContextEngine.applyPersonaRules).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'architect' })
      );
    });

    test('tracks persona switch event', async () => {
      await manager.switchPersona('debugger', { manual: true });
      
      expect(mockMetricsCollector.trackEvent).toHaveBeenCalledWith(
        'persona_switch',
        expect.objectContaining({
          from: 'developer',
          to: 'debugger',
          trigger: 'manual'
        })
      );
    });

    test('saves persona history', async () => {
      await manager.switchPersona('architect');
      await manager.switchPersona('debugger');
      
      expect(manager.personaHistory).toHaveLength(1);
      expect(manager.personaHistory[0].persona.name).toBe('architect');
    });

    test('throws error for invalid persona', async () => {
      await expect(manager.switchPersona('invalid')).rejects.toThrow(
        'Invalid persona: invalid'
      );
    });

    test('skips switch if already in persona', async () => {
      await manager.switchPersona('architect');
      mockContextEngine.applyPersonaRules.mockClear();
      
      await manager.switchPersona('architect');
      
      expect(mockContextEngine.applyPersonaRules).not.toHaveBeenCalled();
    });

    test('emits personaSwitched event', async () => {
      const listener = jest.fn();
      manager.on('personaSwitched', listener);
      
      await manager.switchPersona('reviewer', { manual: true });
      
      expect(listener).toHaveBeenCalledWith({
        persona: 'reviewer',
        trigger: 'manual'
      });
    });
  });

  describe('automatic persona detection', () => {
    beforeEach(async () => {
      await manager.init();
    });

    test('detects optimal persona for debugging task', async () => {
      mockTaskAnalyzer.analyzeTask.mockResolvedValue({
        keywords: ['bug', 'error', 'fix'],
        scores: {
          debugger: 80,
          developer: 40,
          architect: 20
        },
        primaryType: 'debugger'
      });

      const result = await manager.detectOptimalPersona({
        command: 'fix the login error',
        description: 'Users cannot login due to session bug'
      });

      expect(result).toBe('debugger');
      expect(mockTaskAnalyzer.analyzeTask).toHaveBeenCalled();
    });

    test('switches persona if confidence is high', async () => {
      mockTaskAnalyzer.analyzeTask.mockResolvedValue({
        scores: {
          architect: 90,
          developer: 30
        }
      });

      await manager.detectOptimalPersona({
        command: 'design the system architecture'
      });

      expect(manager.currentPersona.name).toBe('architect');
    });

    test('does not switch if confidence is low', async () => {
      mockTaskAnalyzer.analyzeTask.mockResolvedValue({
        scores: {
          developer: 55,
          architect: 50
        }
      });

      await manager.detectOptimalPersona({
        command: 'implement feature'
      });

      expect(manager.currentPersona.name).toBe('developer');
    });

    test('returns current persona if auto-detection disabled', async () => {
      manager.options.autoDetectionEnabled = false;
      
      const result = await manager.detectOptimalPersona({
        command: 'debug error'
      });

      expect(result).toBe('developer');
      expect(mockTaskAnalyzer.analyzeTask).not.toHaveBeenCalled();
    });
  });

  describe('persona scoring', () => {
    beforeEach(async () => {
      await manager.init();
    });

    test('calculates persona fit score', async () => {
      const analysis = {
        keywords: ['design', 'architecture', 'system'],
        scores: { architect: 70 },
        recentFiles: ['architecture.md', 'design.yml'],
        errorState: { hasErrors: false }
      };

      const score = await manager.scorePersonaFit('architect', analysis);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('gives bonus for debugger when errors exist', async () => {
      const analysis = {
        keywords: ['error'],
        scores: { debugger: 50 },
        errorState: { hasErrors: true }
      };

      const score = await manager.scorePersonaFit('debugger', analysis);
      
      expect(score).toBeGreaterThan(0.5);
    });

    test('considers historical performance', async () => {
      mockMetricsCollector.getPersonaHistory.mockResolvedValue([
        {
          task: { type: 'debug' },
          qualityMetrics: { overallScore: 0.9 }
        }
      ]);

      const analysis = {
        keywords: ['debug'],
        scores: { debugger: 60 }
      };

      const score = await manager.scorePersonaFit('debugger', analysis);
      
      expect(mockMetricsCollector.getPersonaHistory).toHaveBeenCalledWith('debugger');
    });
  });

  describe('context management', () => {
    beforeEach(async () => {
      await manager.init();
    });

    test('gets persona context rules', () => {
      const context = manager.getPersonaContext('architect');
      
      expect(context).toHaveProperty('priority');
      expect(context).toHaveProperty('exclude');
      expect(context).toHaveProperty('focus');
      expect(context).toHaveProperty('keywords');
    });

    test('applies persona rules to content', async () => {
      const content = 'test content';
      const result = await manager.applyPersonaRules(content, 'reviewer');
      
      expect(mockContextEngine.filterContent).toHaveBeenCalledWith(
        content,
        expect.objectContaining({ name: 'reviewer' })
      );
      expect(result).toBe('filtered content');
    });

    test('uses current persona if none specified', async () => {
      await manager.switchPersona('optimizer');
      
      await manager.applyPersonaRules('content');
      
      expect(mockContextEngine.filterContent).toHaveBeenCalledWith(
        'content',
        expect.objectContaining({ name: 'optimizer' })
      );
    });
  });

  describe('metrics and reporting', () => {
    beforeEach(async () => {
      await manager.init();
    });

    test('gets persona statistics', async () => {
      mockMetricsCollector.getPersonaStats.mockResolvedValue({
        totalSessions: 10,
        averageQualityScore: 0.85
      });

      const stats = await manager.getPersonaStats('architect');
      
      expect(mockMetricsCollector.getPersonaStats).toHaveBeenCalledWith('architect');
      expect(stats).toHaveProperty('totalSessions', 10);
    });

    test('generates comprehensive report', async () => {
      mockMetricsCollector.generateReport.mockResolvedValue({
        personaAnalysis: {
          architect: { effectiveness: 0.8 }
        }
      });

      const report = await manager.generateReport({ timeRange: 'week' });
      
      expect(mockMetricsCollector.generateReport).toHaveBeenCalledWith({ timeRange: 'week' });
      expect(report).toHaveProperty('personaInsights');
    });

    test('returns message when metrics disabled', async () => {
      manager.options.metricsEnabled = false;
      
      const stats = await manager.getPersonaStats('architect');
      
      expect(stats).toHaveProperty('message', 'Metrics collection is disabled');
    });
  });

  describe('persona insights', () => {
    beforeEach(async () => {
      await manager.init();
    });

    test('generates insights for persona', async () => {
      const analysis = {
        tokenEfficiency: 0.3,
        averageCompletionTime: 400000,
        averageQualityScore: 0.7,
        bestUseCases: ['design', 'planning']
      };

      const insights = await manager.generatePersonaInsights('architect', analysis);
      
      expect(insights).toHaveProperty('effectiveness');
      expect(insights).toHaveProperty('recommendations');
      expect(insights).toHaveProperty('bestPractices');
      expect(insights.recommendations).toContain(
        'Consider more aggressive context filtering to improve token efficiency'
      );
    });

    test('calculates effectiveness rating', () => {
      const analysis = {
        averageCompletionTime: 60000,
        averageQualityScore: 0.9,
        tokenEfficiency: 0.8
      };

      const effectiveness = manager.calculateEffectiveness(analysis);
      
      expect(effectiveness.score).toBeGreaterThan(0.8);
      expect(effectiveness.rating).toBe('excellent');
    });
  });

  describe('utility methods', () => {
    beforeEach(async () => {
      await manager.init();
    });

    test('validates persona names', () => {
      expect(manager.isValidPersona('architect')).toBe(true);
      expect(manager.isValidPersona('invalid')).toBe(false);
    });

    test('gets available personas', () => {
      const personas = manager.getAvailablePersonas();
      
      expect(personas).toBeInstanceOf(Array);
      expect(personas.length).toBe(6);
      expect(personas).toContain('developer');
    });

    test('matches file patterns', () => {
      expect(manager.matchesPattern('test.js', '*.js')).toBe(true);
      expect(manager.matchesPattern('src/test.js', 'src/**')).toBe(true);
      expect(manager.matchesPattern('test.py', '*.js')).toBe(false);
    });
  });

  describe('reset and cleanup', () => {
    beforeEach(async () => {
      await manager.init();
    });

    test('resets persona system', async () => {
      await manager.switchPersona('architect');
      manager.personaHistory.push({ test: 'data' });
      
      await manager.reset();
      
      expect(manager.currentPersona.name).toBe('developer');
      expect(manager.personaHistory).toHaveLength(0);
      expect(manager.personaCache.size).toBe(0);
      expect(mockContextEngine.reset).toHaveBeenCalled();
      expect(mockMetricsCollector.reset).toHaveBeenCalled();
    });

    test('cleans up resources', async () => {
      await manager.cleanup();
      
      expect(manager.personaCache.size).toBe(0);
      expect(mockContextEngine.cleanup).toHaveBeenCalled();
      expect(mockMetricsCollector.cleanup).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await manager.init();
    });

    test('emits error on initialization failure', async () => {
      const error = new Error('Init failed');
      mockContextEngine.init.mockRejectedValue(error);
      
      const listener = jest.fn();
      const newManager = new AIPersonaManager();
      newManager.on('error', listener);
      
      await expect(newManager.init()).rejects.toThrow('Init failed');
      expect(listener).toHaveBeenCalledWith({
        error,
        phase: 'initialization'
      });
    });

    test('emits error on persona switch failure', async () => {
      const error = new Error('Switch failed');
      mockContextEngine.applyPersonaRules.mockRejectedValue(error);
      
      const listener = jest.fn();
      manager.on('error', listener);
      
      await expect(manager.switchPersona('architect')).rejects.toThrow('Switch failed');
      expect(listener).toHaveBeenCalledWith({
        error,
        phase: 'persona_switch'
      });
    });

    test('handles detection errors gracefully', async () => {
      mockTaskAnalyzer.analyzeTask.mockRejectedValue(new Error('Analysis failed'));
      
      const result = await manager.detectOptimalPersona({
        command: 'test command'
      });
      
      expect(result).toBe('developer'); // Falls back to current persona
    });
  });
});