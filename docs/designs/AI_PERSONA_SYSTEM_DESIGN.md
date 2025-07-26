# AI Persona System Design Document

## Overview

The AI Persona System is designed to optimize Claude Code's behavior for different development tasks through specialized personas. This document outlines the architecture, implementation strategy, and integration approach.

## Design Principles

1. **Hybrid Activation**: Automatic detection with manual override capability
2. **Context Preservation**: Maintain existing context while adding persona-specific rules
3. **Predefined Personas**: Start with 5 core personas, extensible in future versions
4. **Prompt Injection**: Integrate with Claude via system prompt modification
5. **Tool Recommendations**: Suggest optimal tools without hard restrictions
6. **Dynamic Token Management**: Adjust token allocation based on task complexity
7. **Metrics-Driven**: Collect completion time and quality metrics for continuous improvement

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Claude Code                           │
├─────────────────────────────────────────────────────────────┤
│                    AI Persona System                         │
├─────────────────┬───────────────────┬───────────────────────┤
│  Persona Manager │  Context Engine   │  Metrics Collector   │
├─────────────────┼───────────────────┼───────────────────────┤
│ Auto Detector   │  Rule Processor   │  Quality Analyzer    │
│ Manual Switch   │  Token Optimizer  │  Time Tracker        │
│ State Manager   │  Prompt Builder   │  Report Generator    │
└─────────────────┴───────────────────┴───────────────────────┘
```

### Core Personas

| Persona | Primary Focus | Key Behaviors | Recommended Tools |
|---------|---------------|---------------|-------------------|
| **Architect** | System design | Big picture thinking, scalability focus | Glob, LS, MarkdownProcessor |
| **Debugger** | Problem solving | Detailed analysis, systematic approach | Grep, Read, MemoryProfiler |
| **Reviewer** | Code quality | Standards compliance, security awareness | Git commands, FileUtils |
| **Documenter** | Documentation | Clear explanations, examples | MarkdownProcessor, TemplateEngine |
| **Optimizer** | Performance | Efficiency focus, benchmarking | PerformanceBenchmark, TokenTracker |

## Implementation Strategy

### Phase 1: Core Infrastructure

#### 1.1 Persona Manager Class

```javascript
class PersonaManager {
  constructor(options = {}) {
    this.currentPersona = null;
    this.personaHistory = [];
    this.autoDetectionEnabled = true;
    this.metricsCollector = new MetricsCollector();
    this.contextEngine = new ContextEngine();
  }

  async switchPersona(personaName, options = {}) {
    // Validate persona
    if (!this.isValidPersona(personaName)) {
      throw new Error(`Invalid persona: ${personaName}`);
    }

    // Save current state
    if (this.currentPersona) {
      this.personaHistory.push({
        persona: this.currentPersona,
        timestamp: new Date(),
        metrics: await this.collectMetrics()
      });
    }

    // Load new persona
    const persona = await this.loadPersona(personaName);
    
    // Apply context rules
    await this.contextEngine.applyPersonaRules(persona);
    
    // Update state
    this.currentPersona = persona;
    
    // Track switch event
    this.metricsCollector.trackEvent('persona_switch', {
      from: this.personaHistory[this.personaHistory.length - 1]?.persona?.name,
      to: personaName,
      trigger: options.manual ? 'manual' : 'auto'
    });

    return persona;
  }

  async detectOptimalPersona(taskContext) {
    // Analyze task characteristics
    const analysis = await this.analyzeTask(taskContext);
    
    // Score each persona
    const scores = {};
    for (const personaName of this.getAvailablePersonas()) {
      scores[personaName] = await this.scorePersonaFit(personaName, analysis);
    }
    
    // Return best match
    return Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0][0];
  }
}
```

#### 1.2 Context Engine

```javascript
class ContextEngine {
  constructor() {
    this.baseContext = null;
    this.personaOverlay = null;
    this.tokenOptimizer = new TokenOptimizer();
  }

  async applyPersonaRules(persona) {
    // Preserve base context
    if (!this.baseContext) {
      this.baseContext = await this.captureCurrentContext();
    }

    // Build persona-specific overlay
    this.personaOverlay = {
      systemPrompt: this.buildSystemPrompt(persona),
      priorityPatterns: persona.contextRules.priority,
      exclusionPatterns: persona.contextRules.exclude,
      focusAreas: persona.contextRules.focus,
      keywords: persona.contextRules.keywords
    };

    // Optimize token usage
    const optimizedContext = await this.tokenOptimizer.optimize(
      this.baseContext,
      this.personaOverlay,
      persona.tokenAllocation
    );

    // Inject into Claude
    await this.injectContext(optimizedContext);
  }

  buildSystemPrompt(persona) {
    return `You are currently operating in ${persona.name} mode.

Key behaviors:
${persona.behaviors.map(b => `- ${b}`).join('\n')}

Focus areas:
${persona.focusAreas.map(f => `- ${f}`).join('\n')}

Communication style: ${persona.communicationStyle}

Recommended tools: ${persona.recommendedTools.join(', ')}`;
  }
}
```

### Phase 2: Auto-Detection System

#### 2.1 Task Analyzer

```javascript
class TaskAnalyzer {
  constructor() {
    this.patterns = {
      architecture: [
        /design|architect|structure|system|scalab/i,
        /interface|api|contract|schema/i
      ],
      debugging: [
        /bug|error|fix|issue|problem|debug/i,
        /trace|stack|exception|fail/i
      ],
      review: [
        /review|audit|check|quality|standard/i,
        /security|vulnerability|code.*smell/i
      ],
      documentation: [
        /document|docs|readme|guide|tutorial/i,
        /explain|describe|comment/i
      ],
      optimization: [
        /optimiz|performance|speed|efficient/i,
        /benchmark|profile|memory|token/i
      ]
    };
  }

  async analyzeTask(context) {
    const analysis = {
      command: context.command,
      recentFiles: await this.getRecentFiles(),
      keywords: this.extractKeywords(context),
      gitContext: await this.getGitContext(),
      errorState: await this.checkErrorState()
    };

    // Score each persona category
    analysis.scores = {};
    for (const [persona, patterns] of Object.entries(this.patterns)) {
      analysis.scores[persona] = this.calculatePatternScore(
        analysis,
        patterns
      );
    }

    return analysis;
  }

  calculatePatternScore(analysis, patterns) {
    let score = 0;
    
    // Check command
    patterns.forEach(pattern => {
      if (pattern.test(analysis.command)) score += 10;
    });

    // Check keywords
    analysis.keywords.forEach(keyword => {
      patterns.forEach(pattern => {
        if (pattern.test(keyword)) score += 5;
      });
    });

    // Context bonuses
    if (analysis.errorState.hasErrors && patterns.some(p => p.test('debug'))) {
      score += 20;
    }

    return score;
  }
}
```

### Phase 3: Metrics Collection

#### 3.1 Metrics Collector

```javascript
class MetricsCollector {
  constructor() {
    this.metrics = {
      sessions: [],
      personaPerformance: {},
      taskOutcomes: []
    };
    this.currentSession = null;
  }

  startSession(persona, task) {
    this.currentSession = {
      id: generateId(),
      persona: persona.name,
      task: task,
      startTime: Date.now(),
      events: [],
      tokenUsage: {
        start: this.getCurrentTokenCount(),
        contextSwitches: 0
      }
    };
  }

  trackEvent(eventType, data) {
    if (!this.currentSession) return;
    
    this.currentSession.events.push({
      type: eventType,
      timestamp: Date.now(),
      data
    });

    // Special handling for quality events
    if (eventType === 'task_completed') {
      this.calculateQualityMetrics(data);
    }
  }

  async calculateQualityMetrics(completionData) {
    const metrics = {
      completionTime: Date.now() - this.currentSession.startTime,
      tokenEfficiency: this.calculateTokenEfficiency(),
      errorRate: await this.calculateErrorRate(),
      codeQuality: await this.assessCodeQuality(completionData),
      userSatisfaction: null // To be collected via feedback
    };

    this.currentSession.qualityMetrics = metrics;
    this.updatePersonaPerformance(this.currentSession.persona, metrics);
  }

  calculateTokenEfficiency() {
    const totalTokens = this.getCurrentTokenCount() - 
                       this.currentSession.tokenUsage.start;
    const taskComplexity = this.estimateTaskComplexity();
    
    return {
      totalUsed: totalTokens,
      efficiency: taskComplexity / totalTokens,
      contextSwitches: this.currentSession.tokenUsage.contextSwitches
    };
  }

  async generateReport(timeRange = 'week') {
    const report = {
      summary: {
        totalSessions: this.metrics.sessions.length,
        averageCompletionTime: this.calculateAverageTime(),
        personaUsage: this.getPersonaUsageStats(),
        qualityTrend: this.calculateQualityTrend()
      },
      personaAnalysis: this.analyzePersonaEffectiveness(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  analyzePersonaEffectiveness() {
    const analysis = {};
    
    for (const [persona, data] of Object.entries(this.metrics.personaPerformance)) {
      analysis[persona] = {
        averageCompletionTime: average(data.completionTimes),
        averageQualityScore: average(data.qualityScores),
        tokenEfficiency: average(data.tokenEfficiencies),
        bestUseCases: this.identifyBestUseCases(persona),
        improvementAreas: this.identifyImprovementAreas(persona)
      };
    }

    return analysis;
  }
}
```

### Phase 4: Integration Points

#### 4.1 Claude Command Integration

```javascript
// In .claude/commands/aiwf/persona-commands.js

export const personaCommands = {
  '/project:aiwf:ai_persona:switch': async (personaName) => {
    const manager = getPersonaManager();
    await manager.switchPersona(personaName, { manual: true });
    return `Switched to ${personaName} persona`;
  },

  '/project:aiwf:ai_persona:auto': async (enabled) => {
    const manager = getPersonaManager();
    manager.autoDetectionEnabled = enabled;
    return `Auto-detection ${enabled ? 'enabled' : 'disabled'}`;
  },

  '/project:aiwf:ai_persona:status': async () => {
    const manager = getPersonaManager();
    const current = manager.currentPersona;
    const metrics = await manager.metricsCollector.getCurrentSessionMetrics();
    
    return formatPersonaStatus(current, metrics);
  },

  '/project:aiwf:ai_persona:report': async (timeRange) => {
    const manager = getPersonaManager();
    const report = await manager.metricsCollector.generateReport(timeRange);
    
    return formatPersonaReport(report);
  }
};
```

#### 4.2 Git Hook Integration

```bash
#!/bin/bash
# .git/hooks/post-commit

# Detect if this was a bug fix
if git log -1 --pretty=%B | grep -qiE "fix|bug|error"; then
  # Suggest debugger persona for follow-up
  echo "💡 Tip: Switch to debugger persona for thorough testing"
  echo "   /project:aiwf:ai_persona:debugger"
fi

# Track commit patterns for persona optimization
aiwf-persona track-commit
```

## Performance Optimization

### Token Management Strategy

1. **Base Allocation**: Each persona has a suggested token budget
   - Architect: 30% context, 70% response
   - Debugger: 50% context, 50% response  
   - Reviewer: 40% context, 60% response
   - Documenter: 20% context, 80% response
   - Optimizer: 60% context, 40% response

2. **Dynamic Adjustment**: Based on task complexity
   - Simple tasks: -20% tokens
   - Complex tasks: +30% tokens
   - Multi-file tasks: +50% tokens

3. **Context Pruning**: Remove irrelevant information
   - Architect: Prune implementation details
   - Debugger: Prune documentation
   - Reviewer: Prune test files
   - Documenter: Prune internal logic
   - Optimizer: Prune comments

## Testing Strategy

### Unit Tests

```javascript
describe('PersonaManager', () => {
  test('switches personas correctly', async () => {
    const manager = new PersonaManager();
    await manager.switchPersona('architect');
    
    expect(manager.currentPersona.name).toBe('architect');
    expect(manager.personaHistory).toHaveLength(0);
  });

  test('detects optimal persona', async () => {
    const manager = new PersonaManager();
    const taskContext = {
      command: 'debug the login error',
      recentFiles: ['auth.js', 'login.test.js']
    };
    
    const optimal = await manager.detectOptimalPersona(taskContext);
    expect(optimal).toBe('debugger');
  });
});
```

### Integration Tests

```javascript
describe('Persona System Integration', () => {
  test('full workflow with auto-detection', async () => {
    // Initialize system
    const system = await initializePersonaSystem();
    
    // Simulate task
    const task = {
      type: 'bug_fix',
      description: 'Fix authentication timeout'
    };
    
    // Start task
    await system.startTask(task);
    
    // Verify persona selection
    expect(system.currentPersona.name).toBe('debugger');
    
    // Complete task
    const result = await system.completeTask({
      success: true,
      filesModified: ['auth.js']
    });
    
    // Verify metrics collected
    expect(result.metrics).toHaveProperty('completionTime');
    expect(result.metrics).toHaveProperty('tokenEfficiency');
  });
});
```

## Rollout Plan

### Phase 1: Beta (Week 1-2)
- Core PersonaManager implementation
- Manual switching only
- Basic metrics collection

### Phase 2: Auto-Detection (Week 3-4)
- Task analyzer implementation
- Auto-detection with manual override
- Enhanced context engine

### Phase 3: Metrics & Optimization (Week 5-6)
- Full metrics collection
- Performance reports
- Token optimization

### Phase 4: Production (Week 7+)
- Public release
- User feedback collection
- Continuous improvement

## Success Metrics

1. **Adoption Rate**: >70% of users actively using personas
2. **Task Completion Time**: 20% reduction on average
3. **Token Efficiency**: 30% improvement
4. **User Satisfaction**: >4.5/5 rating
5. **Auto-Detection Accuracy**: >85% correct persona selection

## Future Enhancements

1. **Custom Personas**: User-defined personas
2. **Team Personas**: Shared team configurations
3. **Learning System**: ML-based persona optimization
4. **IDE Integration**: Direct VS Code/Cursor integration
5. **Persona Marketplace**: Community-shared personas