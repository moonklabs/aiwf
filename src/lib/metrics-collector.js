/**
 * Metrics Collector
 * Collects and analyzes metrics for AI persona performance
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

class MetricsCollector extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      metricsPath: options.metricsPath || 
        path.join(process.cwd(), '.aiwf', 'metrics'),
      maxHistorySize: options.maxHistorySize || 1000,
      aggregationInterval: options.aggregationInterval || 3600000, // 1 hour
      persistInterval: options.persistInterval || 300000, // 5 minutes
      ...options
    };

    this.metrics = {
      sessions: [],
      personaPerformance: {},
      taskOutcomes: [],
      aggregated: {}
    };

    this.currentSession = null;
    this.startTime = Date.now();
    this.persistTimer = null;
  }

  /**
   * Initialize metrics collector
   */
  async init() {
    try {
      // Ensure metrics directory exists
      await fs.mkdir(this.options.metricsPath, { recursive: true });
      
      // Load existing metrics
      await this.loadMetrics();
      
      // Start persist timer
      this.startPersistTimer();
      
      this.emit('initialized', {
        sessionsLoaded: this.metrics.sessions.length,
        startTime: this.startTime
      });
      
      return true;
    } catch (error) {
      this.emit('error', { error, phase: 'initialization' });
      throw error;
    }
  }

  /**
   * Start a new metrics session
   */
  startSession(persona, task) {
    // End current session if exists
    if (this.currentSession) {
      this.endSession();
    }

    this.currentSession = {
      id: this.generateSessionId(),
      persona: persona.name || persona,
      task: {
        type: task.type || 'general',
        description: task.description || task.command || '',
        complexity: this.estimateTaskComplexity(task)
      },
      startTime: Date.now(),
      events: [],
      metrics: {
        tokenUsage: {
          start: this.getCurrentTokenCount(),
          end: null,
          contextSwitches: 0
        },
        interactions: 0,
        errors: 0,
        completionStatus: null
      }
    };

    this.emit('sessionStarted', {
      sessionId: this.currentSession.id,
      persona: this.currentSession.persona
    });

    return this.currentSession.id;
  }

  /**
   * End current session
   */
  endSession(status = 'completed') {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.metrics.completionStatus = status;
    this.currentSession.metrics.tokenUsage.end = this.getCurrentTokenCount();

    // Calculate quality metrics
    this.currentSession.qualityMetrics = this.calculateQualityMetrics(this.currentSession);

    // Store session
    this.metrics.sessions.push(this.currentSession);
    this.updatePersonaPerformance(this.currentSession);

    // Limit history size
    if (this.metrics.sessions.length > this.options.maxHistorySize) {
      this.metrics.sessions = this.metrics.sessions.slice(-this.options.maxHistorySize);
    }

    this.emit('sessionEnded', {
      sessionId: this.currentSession.id,
      duration: this.currentSession.duration,
      status
    });

    const session = this.currentSession;
    this.currentSession = null;
    
    return session;
  }

  /**
   * Track an event
   */
  trackEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data
    };

    // Add to current session if active
    if (this.currentSession) {
      this.currentSession.events.push(event);
      
      // Update session metrics based on event
      this.updateSessionMetrics(eventType, data);
    }

    // Track global events
    this.trackGlobalEvent(eventType, data);

    this.emit('eventTracked', event);
  }

  /**
   * Update session metrics based on event
   */
  updateSessionMetrics(eventType, data) {
    if (!this.currentSession) return;

    switch (eventType) {
      case 'interaction':
        this.currentSession.metrics.interactions++;
        break;
        
      case 'error':
        this.currentSession.metrics.errors++;
        break;
        
      case 'context_switch':
        this.currentSession.metrics.tokenUsage.contextSwitches++;
        break;
        
      case 'task_completed':
        this.currentSession.metrics.completionStatus = 'completed';
        break;
        
      case 'task_failed':
        this.currentSession.metrics.completionStatus = 'failed';
        break;
    }
  }

  /**
   * Track global events (not session-specific)
   */
  trackGlobalEvent(eventType, data) {
    // Aggregate event counts
    if (!this.metrics.aggregated.eventCounts) {
      this.metrics.aggregated.eventCounts = {};
    }
    
    this.metrics.aggregated.eventCounts[eventType] = 
      (this.metrics.aggregated.eventCounts[eventType] || 0) + 1;

    // Track persona switches
    if (eventType === 'persona_switch') {
      if (!this.metrics.aggregated.personaSwitches) {
        this.metrics.aggregated.personaSwitches = [];
      }
      
      this.metrics.aggregated.personaSwitches.push({
        from: data.from,
        to: data.to,
        trigger: data.trigger,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Calculate quality metrics for a session
   */
  calculateQualityMetrics(session) {
    const metrics = {
      completionTime: session.duration,
      tokenEfficiency: this.calculateTokenEfficiency(session),
      errorRate: this.calculateErrorRate(session),
      interactionEfficiency: this.calculateInteractionEfficiency(session),
      overallScore: 0
    };

    // Calculate overall score (0-1)
    const weights = {
      completion: 0.3,
      tokenEfficiency: 0.3,
      errorRate: 0.2,
      interactionEfficiency: 0.2
    };

    let score = 0;
    
    // Completion score
    if (session.metrics.completionStatus === 'completed') {
      score += weights.completion;
    }

    // Token efficiency score
    score += metrics.tokenEfficiency * weights.tokenEfficiency;

    // Error rate score (inverse - lower is better)
    score += (1 - metrics.errorRate) * weights.errorRate;

    // Interaction efficiency score
    score += metrics.interactionEfficiency * weights.interactionEfficiency;

    metrics.overallScore = score;

    return metrics;
  }

  /**
   * Calculate token efficiency
   */
  calculateTokenEfficiency(session) {
    const tokensUsed = (session.metrics.tokenUsage.end || 0) - 
                      (session.metrics.tokenUsage.start || 0);
    
    if (tokensUsed === 0) return 1;

    // Estimate expected tokens based on task complexity
    const expectedTokens = session.task.complexity * 1000;
    
    // Efficiency is inverse of usage ratio (lower usage = higher efficiency)
    const efficiency = Math.min(expectedTokens / tokensUsed, 1);
    
    return efficiency;
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate(session) {
    if (session.metrics.interactions === 0) return 0;
    
    return Math.min(session.metrics.errors / session.metrics.interactions, 1);
  }

  /**
   * Calculate interaction efficiency
   */
  calculateInteractionEfficiency(session) {
    if (session.metrics.interactions === 0) return 0;
    
    // Estimate expected interactions based on task complexity
    const expectedInteractions = Math.max(session.task.complexity * 2, 1);
    
    // Efficiency is inverse of interaction ratio
    const efficiency = Math.min(expectedInteractions / session.metrics.interactions, 1);
    
    return efficiency;
  }

  /**
   * Estimate task complexity
   */
  estimateTaskComplexity(task) {
    let complexity = 1; // Base complexity

    // Increase based on task type
    const complexTypes = ['debug', 'optimize', 'architect', 'refactor'];
    if (complexTypes.includes(task.type)) {
      complexity += 1;
    }

    // Increase based on keywords
    const complexKeywords = ['complex', 'difficult', 'large', 'entire', 'all'];
    const description = (task.description || '').toLowerCase();
    complexKeywords.forEach(keyword => {
      if (description.includes(keyword)) {
        complexity += 0.5;
      }
    });

    // Cap at 5
    return Math.min(complexity, 5);
  }

  /**
   * Update persona performance metrics
   */
  updatePersonaPerformance(session) {
    const personaName = session.persona;
    
    if (!this.metrics.personaPerformance[personaName]) {
      this.metrics.personaPerformance[personaName] = {
        totalSessions: 0,
        completedSessions: 0,
        totalDuration: 0,
        totalTokens: 0,
        totalErrors: 0,
        qualityScores: [],
        taskTypes: {}
      };
    }

    const perf = this.metrics.personaPerformance[personaName];
    
    perf.totalSessions++;
    if (session.metrics.completionStatus === 'completed') {
      perf.completedSessions++;
    }
    
    perf.totalDuration += session.duration;
    
    const tokensUsed = (session.metrics.tokenUsage.end || 0) - 
                      (session.metrics.tokenUsage.start || 0);
    perf.totalTokens += tokensUsed;
    
    perf.totalErrors += session.metrics.errors;
    
    if (session.qualityMetrics) {
      perf.qualityScores.push(session.qualityMetrics.overallScore);
    }
    
    // Track task types
    const taskType = session.task.type;
    perf.taskTypes[taskType] = (perf.taskTypes[taskType] || 0) + 1;
  }

  /**
   * Get current token count (simulated)
   */
  getCurrentTokenCount() {
    // In a real implementation, this would interface with the token tracking system
    // For now, return a simulated increasing value
    return Math.floor((Date.now() - this.startTime) / 100);
  }

  /**
   * Collect current metrics
   */
  async collectCurrentMetrics() {
    if (!this.currentSession) return null;

    return {
      duration: Date.now() - this.currentSession.startTime,
      interactions: this.currentSession.metrics.interactions,
      errors: this.currentSession.metrics.errors,
      tokenUsage: {
        current: this.getCurrentTokenCount() - this.currentSession.metrics.tokenUsage.start,
        contextSwitches: this.currentSession.metrics.tokenUsage.contextSwitches
      }
    };
  }

  /**
   * Get persona history
   */
  async getPersonaHistory(personaName) {
    return this.metrics.sessions.filter(
      session => session.persona === personaName
    );
  }

  /**
   * Get persona statistics
   */
  async getPersonaStats(personaName) {
    const perf = this.metrics.personaPerformance[personaName];
    
    if (!perf || perf.totalSessions === 0) {
      return {
        message: `No data available for persona: ${personaName}`
      };
    }

    const avgQualityScore = perf.qualityScores.length > 0 ?
      perf.qualityScores.reduce((a, b) => a + b, 0) / perf.qualityScores.length : 0;

    return {
      totalSessions: perf.totalSessions,
      completionRate: perf.completedSessions / perf.totalSessions,
      averageDuration: perf.totalDuration / perf.totalSessions,
      averageTokens: perf.totalTokens / perf.totalSessions,
      errorRate: perf.totalErrors / perf.totalSessions,
      averageQualityScore: avgQualityScore,
      taskDistribution: perf.taskTypes
    };
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(options = {}) {
    const timeRange = options.timeRange || 'all';
    const startTime = this.getStartTime(timeRange);
    
    // Filter sessions by time range
    const sessions = this.metrics.sessions.filter(
      session => session.startTime >= startTime
    );

    const report = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalSessions: sessions.length,
        averageCompletionTime: this.calculateAverageTime(sessions),
        personaUsage: this.getPersonaUsageStats(sessions),
        qualityTrend: this.calculateQualityTrend(sessions)
      },
      personaAnalysis: this.analyzePersonaEffectiveness(sessions),
      taskAnalysis: this.analyzeTaskTypes(sessions),
      recommendations: this.generateRecommendations(sessions)
    };

    return report;
  }

  /**
   * Get start time for time range
   */
  getStartTime(timeRange) {
    const now = Date.now();
    
    switch (timeRange) {
      case 'hour':
        return now - 3600000;
      case 'day':
        return now - 86400000;
      case 'week':
        return now - 604800000;
      case 'month':
        return now - 2592000000;
      default:
        return 0;
    }
  }

  /**
   * Calculate average completion time
   */
  calculateAverageTime(sessions) {
    if (sessions.length === 0) return 0;
    
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    return totalTime / sessions.length;
  }

  /**
   * Get persona usage statistics
   */
  getPersonaUsageStats(sessions) {
    const usage = {};
    
    sessions.forEach(session => {
      usage[session.persona] = (usage[session.persona] || 0) + 1;
    });
    
    // Convert to percentages
    const total = sessions.length;
    const stats = {};
    
    for (const [persona, count] of Object.entries(usage)) {
      stats[persona] = {
        count,
        percentage: (count / total) * 100
      };
    }
    
    return stats;
  }

  /**
   * Calculate quality trend
   */
  calculateQualityTrend(sessions) {
    if (sessions.length < 2) {
      return { trend: 'insufficient_data' };
    }

    // Get quality scores over time
    const scores = sessions
      .filter(s => s.qualityMetrics)
      .map(s => ({
        time: s.startTime,
        score: s.qualityMetrics.overallScore
      }))
      .sort((a, b) => a.time - b.time);

    if (scores.length < 2) {
      return { trend: 'insufficient_data' };
    }

    // Calculate trend (simple linear regression)
    const n = scores.length;
    const sumX = scores.reduce((sum, s, i) => sum + i, 0);
    const sumY = scores.reduce((sum, s) => sum + s.score, 0);
    const sumXY = scores.reduce((sum, s, i) => sum + i * s.score, 0);
    const sumX2 = scores.reduce((sum, s, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return {
      trend: slope > 0.01 ? 'improving' : slope < -0.01 ? 'declining' : 'stable',
      slope,
      latestScore: scores[scores.length - 1].score,
      averageScore: sumY / n
    };
  }

  /**
   * Analyze persona effectiveness
   */
  analyzePersonaEffectiveness(sessions) {
    const analysis = {};
    
    // Group sessions by persona
    const personaSessions = {};
    sessions.forEach(session => {
      if (!personaSessions[session.persona]) {
        personaSessions[session.persona] = [];
      }
      personaSessions[session.persona].push(session);
    });

    // Analyze each persona
    for (const [persona, personaSessions] of Object.entries(personaSessions)) {
      const completed = personaSessions.filter(s => s.metrics.completionStatus === 'completed');
      const qualityScores = personaSessions
        .filter(s => s.qualityMetrics)
        .map(s => s.qualityMetrics.overallScore);

      analysis[persona] = {
        sessionCount: personaSessions.length,
        completionRate: completed.length / personaSessions.length,
        averageCompletionTime: this.calculateAverageTime(personaSessions),
        averageQualityScore: qualityScores.length > 0 ?
          qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length : 0,
        tokenEfficiency: this.calculateAverageTokenEfficiency(personaSessions),
        bestUseCases: this.identifyBestUseCases(persona, personaSessions),
        improvementAreas: this.identifyImprovementAreas(persona, personaSessions)
      };
    }

    return analysis;
  }

  /**
   * Calculate average token efficiency
   */
  calculateAverageTokenEfficiency(sessions) {
    const efficiencies = sessions
      .filter(s => s.qualityMetrics)
      .map(s => s.qualityMetrics.tokenEfficiency);

    if (efficiencies.length === 0) return 0;

    return efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
  }

  /**
   * Identify best use cases for persona
   */
  identifyBestUseCases(persona, sessions) {
    // Group by task type and calculate success rate
    const taskStats = {};
    
    sessions.forEach(session => {
      const taskType = session.task.type;
      if (!taskStats[taskType]) {
        taskStats[taskType] = {
          total: 0,
          successful: 0,
          avgQuality: 0,
          qualityCount: 0
        };
      }
      
      taskStats[taskType].total++;
      
      if (session.metrics.completionStatus === 'completed') {
        taskStats[taskType].successful++;
      }
      
      if (session.qualityMetrics) {
        taskStats[taskType].avgQuality += session.qualityMetrics.overallScore;
        taskStats[taskType].qualityCount++;
      }
    });

    // Calculate success rates and find best
    const taskScores = Object.entries(taskStats).map(([type, stats]) => ({
      type,
      successRate: stats.successful / stats.total,
      avgQuality: stats.qualityCount > 0 ? stats.avgQuality / stats.qualityCount : 0,
      count: stats.total
    }));

    // Return top 3 task types
    return taskScores
      .filter(t => t.count >= 2) // Minimum sample size
      .sort((a, b) => (b.successRate + b.avgQuality) - (a.successRate + a.avgQuality))
      .slice(0, 3)
      .map(t => t.type);
  }

  /**
   * Identify improvement areas
   */
  identifyImprovementAreas(persona, sessions) {
    const areas = [];

    // Check completion rate
    const completionRate = sessions.filter(s => 
      s.metrics.completionStatus === 'completed'
    ).length / sessions.length;
    
    if (completionRate < 0.8) {
      areas.push('completion_rate');
    }

    // Check error rate
    const avgErrors = sessions.reduce((sum, s) => 
      sum + s.metrics.errors, 0
    ) / sessions.length;
    
    if (avgErrors > 1) {
      areas.push('error_rate');
    }

    // Check token efficiency
    const avgTokenEfficiency = this.calculateAverageTokenEfficiency(sessions);
    if (avgTokenEfficiency < 0.5) {
      areas.push('token_efficiency');
    }

    return areas;
  }

  /**
   * Analyze task types
   */
  analyzeTaskTypes(sessions) {
    const taskAnalysis = {};
    
    sessions.forEach(session => {
      const taskType = session.task.type;
      
      if (!taskAnalysis[taskType]) {
        taskAnalysis[taskType] = {
          count: 0,
          totalDuration: 0,
          completedCount: 0,
          totalQuality: 0,
          qualityCount: 0,
          personas: {}
        };
      }
      
      const analysis = taskAnalysis[taskType];
      analysis.count++;
      analysis.totalDuration += session.duration;
      
      if (session.metrics.completionStatus === 'completed') {
        analysis.completedCount++;
      }
      
      if (session.qualityMetrics) {
        analysis.totalQuality += session.qualityMetrics.overallScore;
        analysis.qualityCount++;
      }
      
      // Track which personas handle this task type
      analysis.personas[session.persona] = (analysis.personas[session.persona] || 0) + 1;
    });

    // Calculate averages
    for (const [taskType, analysis] of Object.entries(taskAnalysis)) {
      analysis.averageDuration = analysis.totalDuration / analysis.count;
      analysis.completionRate = analysis.completedCount / analysis.count;
      analysis.averageQuality = analysis.qualityCount > 0 ?
        analysis.totalQuality / analysis.qualityCount : 0;
      
      // Find best persona for this task type
      analysis.bestPersona = Object.entries(analysis.personas)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
    }

    return taskAnalysis;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(sessions) {
    const recommendations = [];
    
    // Analyze overall patterns
    const personaAnalysis = this.analyzePersonaEffectiveness(sessions);
    const taskAnalysis = this.analyzeTaskTypes(sessions);
    
    // Recommendation 1: Underutilized personas
    for (const [persona, stats] of Object.entries(personaAnalysis)) {
      if (stats.sessionCount < sessions.length * 0.1) {
        recommendations.push({
          type: 'persona_usage',
          priority: 'medium',
          message: `Consider using ${persona} persona more often for ${stats.bestUseCases.join(', ')} tasks`,
          data: { persona, usage: stats.sessionCount }
        });
      }
    }
    
    // Recommendation 2: Task-persona mismatches
    for (const [taskType, analysis] of Object.entries(taskAnalysis)) {
      if (analysis.averageQuality < 0.6 && analysis.count > 3) {
        recommendations.push({
          type: 'task_persona_match',
          priority: 'high',
          message: `${taskType} tasks have low quality scores. Try using ${analysis.bestPersona} persona`,
          data: { taskType, currentQuality: analysis.averageQuality }
        });
      }
    }
    
    // Recommendation 3: High error rates
    for (const [persona, stats] of Object.entries(personaAnalysis)) {
      if (stats.improvementAreas.includes('error_rate')) {
        recommendations.push({
          type: 'error_rate',
          priority: 'high',
          message: `${persona} persona has high error rate. Review context rules and tool recommendations`,
          data: { persona, areas: stats.improvementAreas }
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Load metrics from disk
   */
  async loadMetrics() {
    try {
      const metricsFile = path.join(this.options.metricsPath, 'metrics.json');
      const data = await fs.readFile(metricsFile, 'utf-8');
      const loaded = JSON.parse(data);
      
      // Merge with current metrics
      this.metrics = {
        ...this.metrics,
        ...loaded,
        sessions: [...(loaded.sessions || []), ...this.metrics.sessions]
      };
      
      // Limit to max history size
      if (this.metrics.sessions.length > this.options.maxHistorySize) {
        this.metrics.sessions = this.metrics.sessions.slice(-this.options.maxHistorySize);
      }
    } catch (error) {
      // No existing metrics or error loading - start fresh
    }
  }

  /**
   * Persist metrics to disk
   */
  async persistMetrics() {
    try {
      const metricsFile = path.join(this.options.metricsPath, 'metrics.json');
      await fs.writeFile(
        metricsFile,
        JSON.stringify(this.metrics, null, 2),
        'utf-8'
      );
      
      this.emit('metricsPersisted', {
        sessionCount: this.metrics.sessions.length
      });
    } catch (error) {
      this.emit('error', { error, phase: 'persist' });
    }
  }

  /**
   * Start persist timer
   */
  startPersistTimer() {
    this.persistTimer = setInterval(
      () => this.persistMetrics(),
      this.options.persistInterval
    );
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session metrics
   */
  async getCurrentSessionMetrics() {
    if (!this.currentSession) {
      return { message: 'No active session' };
    }

    return await this.collectCurrentMetrics();
  }

  /**
   * Reset metrics
   */
  async reset() {
    this.metrics = {
      sessions: [],
      personaPerformance: {},
      taskOutcomes: [],
      aggregated: {}
    };
    
    this.currentSession = null;
    
    await this.persistMetrics();
    
    this.emit('reset');
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.persistTimer) {
      clearInterval(this.persistTimer);
      this.persistTimer = null;
    }
    
    // Persist final metrics
    await this.persistMetrics();
    
    this.removeAllListeners();
  }
}

export default MetricsCollector;
export { MetricsCollector };