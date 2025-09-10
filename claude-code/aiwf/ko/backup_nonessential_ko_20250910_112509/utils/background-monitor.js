/**
 * 백그라운드 평가 모니터
 * 사용자 작업을 방해하지 않고 품질 모니터링
 */

import { SimplifiedEvaluator } from './simplified-evaluator.js';
import fs from 'fs/promises';
import path from 'path';

export class BackgroundMonitor {
  constructor() {
    this.evaluator = new SimplifiedEvaluator();
    this.recentEvaluations = [];
    this.maxHistorySize = 100;
    this.statsFile = null;
    this.initialized = false;
  }

  /**
   * 모니터 초기화
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // 프로젝트 루트의 .aiwf 디렉토리 찾기
      const projectRoot = await this.findProjectRoot();
      if (projectRoot) {
        this.statsFile = path.join(projectRoot, '.aiwf', '.evaluation-stats.json');
        await this.loadStats();
      }
      this.initialized = true;
    } catch (error) {
      // 초기화 실패해도 기본 기능은 작동
      this.initialized = true;
    }
  }

  /**
   * 프로젝트 루트 찾기
   */
  async findProjectRoot() {
    let currentDir = process.cwd();
    
    while (currentDir !== path.dirname(currentDir)) {
      try {
        await fs.access(path.join(currentDir, '.aiwf'));
        return currentDir;
      } catch {
        currentDir = path.dirname(currentDir);
      }
    }
    
    return null;
  }

  /**
   * 통계 로드
   */
  async loadStats() {
    if (!this.statsFile) return;

    try {
      const data = await fs.readFile(this.statsFile, 'utf8');
      const stats = JSON.parse(data);
      this.recentEvaluations = stats.recentEvaluations || [];
    } catch {
      // 파일이 없으면 새로 시작
      this.recentEvaluations = [];
    }
  }

  /**
   * 통계 저장 (비동기, 에러 무시)
   */
  async saveStats() {
    if (!this.statsFile) return;

    try {
      const stats = {
        recentEvaluations: this.recentEvaluations.slice(-this.maxHistorySize),
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(this.statsFile, JSON.stringify(stats, null, 2));
    } catch {
      // 저장 실패해도 무시
    }
  }

  /**
   * 백그라운드에서 응답 모니터링
   */
  async monitorResponse(response, persona, options = {}) {
    // 초기화 확인
    if (!this.initialized) {
      await this.initialize();
    }

    // 빠른 평가 수행
    const evaluation = this.evaluator.quickEvaluate(response, persona);
    
    // 기록 추가
    this.recentEvaluations.push({
      persona,
      score: evaluation.score,
      timestamp: new Date().toISOString(),
      responseLength: response.length
    });

    // 크기 제한
    if (this.recentEvaluations.length > this.maxHistorySize) {
      this.recentEvaluations = this.recentEvaluations.slice(-this.maxHistorySize);
    }

    // 비동기 저장 (차단하지 않음)
    this.saveStats().catch(() => {});

    // 피드백이 필요한 경우만 반환
    if (evaluation.needsFeedback && !options.silent) {
      return {
        feedback: evaluation.feedback,
        score: evaluation.score
      };
    }

    return null;
  }

  /**
   * 최근 통계 요약
   */
  getRecentStats(persona = null) {
    let evaluations = this.recentEvaluations;
    
    if (persona) {
      evaluations = evaluations.filter(e => e.persona === persona);
    }

    if (evaluations.length === 0) {
      return { message: '아직 평가 기록이 없습니다.' };
    }

    const scores = evaluations.map(e => e.score);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    
    // 페르소나별 통계
    const personaStats = {};
    evaluations.forEach(e => {
      if (!personaStats[e.persona]) {
        personaStats[e.persona] = { count: 0, totalScore: 0 };
      }
      personaStats[e.persona].count++;
      personaStats[e.persona].totalScore += e.score;
    });

    Object.keys(personaStats).forEach(p => {
      const stats = personaStats[p];
      stats.avgScore = (stats.totalScore / stats.count).toFixed(2);
      delete stats.totalScore;
    });

    return {
      totalEvaluations: evaluations.length,
      averageScore: avgScore.toFixed(2),
      personaStats,
      trend: this.calculateTrend(scores)
    };
  }

  /**
   * 점수 추세 계산
   */
  calculateTrend(scores) {
    if (scores.length < 2) return 'stable';
    
    const recent = scores.slice(-10);
    const older = scores.slice(-20, -10);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.1) return 'improving';
    if (recentAvg < olderAvg - 0.1) return 'declining';
    return 'stable';
  }

  /**
   * 주간 요약 생성
   */
  getWeeklySummary() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyEvals = this.recentEvaluations.filter(e => 
      new Date(e.timestamp) > oneWeekAgo
    );

    if (weeklyEvals.length === 0) {
      return { message: '최근 일주일간 평가 기록이 없습니다.' };
    }

    const summary = this.getRecentStats();
    summary.period = 'weekly';
    summary.evaluationCount = weeklyEvals.length;
    
    return summary;
  }
}

// 싱글톤 인스턴스
let monitorInstance = null;

export function getBackgroundMonitor() {
  if (!monitorInstance) {
    monitorInstance = new BackgroundMonitor();
  }
  return monitorInstance;
}

export default BackgroundMonitor;