/**
 * 컨텍스트 토큰 모니터
 * 페르소나 컨텍스트 주입으로 인한 토큰 사용량을 모니터링하는 모듈
 */

const TokenCounter = require('./token-counter');
const fs = require('fs').promises;
const path = require('path');

class ContextTokenMonitor {
  constructor() {
    this.tokenCounter = new TokenCounter();
    this.usageHistory = [];
    this.personaStats = new Map();
    this.thresholds = {
      warning: 2000,  // 경고 임계값 (토큰)
      critical: 3000  // 위험 임계값 (토큰)
    };
  }

  /**
   * 컨텍스트 주입 토큰 사용량 추적
   * @param {Object} injectionResult - 프롬프트 주입 결과
   * @returns {Object} 토큰 사용량 분석
   */
  async trackContextUsage(injectionResult) {
    const { tokenMetrics, personaName, context } = injectionResult;
    
    const usage = {
      personaName,
      timestamp: new Date().toISOString(),
      originalTokens: tokenMetrics.originalTokens,
      contextTokens: tokenMetrics.contextTokens,
      totalTokens: tokenMetrics.injectedTokens,
      percentageIncrease: tokenMetrics.percentageIncrease,
      contextElements: await this.analyzeContextElements(context),
      alert: this.checkThresholds(tokenMetrics.contextTokens)
    };

    // 히스토리에 추가
    this.usageHistory.push(usage);

    // 페르소나별 통계 업데이트
    this.updatePersonaStats(personaName, usage);

    return usage;
  }

  /**
   * 컨텍스트 요소별 토큰 사용량 분석
   * @param {Object} context - 페르소나 컨텍스트
   * @returns {Object} 요소별 토큰 사용량
   */
  async analyzeContextElements(context) {
    const elements = {};

    // 각 컨텍스트 요소의 토큰 수 계산
    if (context.persona_name) {
      elements.persona_name = await this.tokenCounter.estimateTokens(context.persona_name);
    }

    if (context.analysis_approach) {
      elements.analysis_approach = await this.tokenCounter.estimateTokens(context.analysis_approach);
    }

    if (context.design_principles) {
      const principlesText = context.design_principles.join(', ');
      elements.design_principles = await this.tokenCounter.estimateTokens(principlesText);
    }

    if (context.communication_style) {
      elements.communication_style = await this.tokenCounter.estimateTokens(context.communication_style);
    }

    if (context.content) {
      elements.content = await this.tokenCounter.estimateTokens(context.content);
    }

    // 총 토큰 수
    elements.total = Object.values(elements).reduce((sum, tokens) => sum + tokens, 0);

    return elements;
  }

  /**
   * 임계값 확인
   * @param {number} contextTokens - 컨텍스트 토큰 수
   * @returns {Object} 알림 정보
   */
  checkThresholds(contextTokens) {
    if (contextTokens >= this.thresholds.critical) {
      return {
        level: 'critical',
        message: `컨텍스트 토큰이 위험 수준(${this.thresholds.critical})을 초과했습니다: ${contextTokens}`
      };
    } else if (contextTokens >= this.thresholds.warning) {
      return {
        level: 'warning',
        message: `컨텍스트 토큰이 경고 수준(${this.thresholds.warning})에 도달했습니다: ${contextTokens}`
      };
    }
    return null;
  }

  /**
   * 페르소나별 통계 업데이트
   * @param {string} personaName - 페르소나 이름
   * @param {Object} usage - 사용량 정보
   */
  updatePersonaStats(personaName, usage) {
    if (!this.personaStats.has(personaName)) {
      this.personaStats.set(personaName, {
        totalUsages: 0,
        totalContextTokens: 0,
        averageContextTokens: 0,
        maxContextTokens: 0,
        minContextTokens: Infinity,
        warningCount: 0,
        criticalCount: 0
      });
    }

    const stats = this.personaStats.get(personaName);
    
    // 통계 업데이트
    stats.totalUsages++;
    stats.totalContextTokens += usage.contextTokens;
    stats.averageContextTokens = stats.totalContextTokens / stats.totalUsages;
    stats.maxContextTokens = Math.max(stats.maxContextTokens, usage.contextTokens);
    stats.minContextTokens = Math.min(stats.minContextTokens, usage.contextTokens);

    // 알림 카운트
    if (usage.alert) {
      if (usage.alert.level === 'warning') stats.warningCount++;
      if (usage.alert.level === 'critical') stats.criticalCount++;
    }

    this.personaStats.set(personaName, stats);
  }

  /**
   * 토큰 사용량 리포트 생성
   * @param {Object} options - 리포트 옵션
   * @returns {Object} 토큰 사용량 리포트
   */
  generateReport(options = {}) {
    const { 
      startDate = null, 
      endDate = null, 
      personaName = null,
      format = 'summary' 
    } = options;

    // 필터링된 데이터 가져오기
    let filteredHistory = this.filterHistory(startDate, endDate, personaName);

    if (format === 'detailed') {
      return this.generateDetailedReport(filteredHistory);
    } else {
      return this.generateSummaryReport(filteredHistory);
    }
  }

  /**
   * 히스토리 필터링
   * @param {Date} startDate - 시작 날짜
   * @param {Date} endDate - 종료 날짜
   * @param {string} personaName - 페르소나 이름
   * @returns {Array} 필터링된 히스토리
   */
  filterHistory(startDate, endDate, personaName) {
    let filtered = this.usageHistory;

    if (startDate) {
      filtered = filtered.filter(u => new Date(u.timestamp) >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(u => new Date(u.timestamp) <= endDate);
    }

    if (personaName) {
      filtered = filtered.filter(u => u.personaName === personaName);
    }

    return filtered;
  }

  /**
   * 요약 리포트 생성
   * @param {Array} history - 필터링된 히스토리
   * @returns {Object} 요약 리포트
   */
  generateSummaryReport(history) {
    if (history.length === 0) {
      return { message: '해당 기간의 데이터가 없습니다.' };
    }

    const totalContextTokens = history.reduce((sum, u) => sum + u.contextTokens, 0);
    const averageContextTokens = totalContextTokens / history.length;
    const maxUsage = history.reduce((max, u) => u.contextTokens > max.contextTokens ? u : max);
    const minUsage = history.reduce((min, u) => u.contextTokens < min.contextTokens ? u : min);

    // 페르소나별 집계
    const personaSummary = {};
    history.forEach(usage => {
      if (!personaSummary[usage.personaName]) {
        personaSummary[usage.personaName] = {
          count: 0,
          totalTokens: 0,
          alerts: { warning: 0, critical: 0 }
        };
      }
      
      personaSummary[usage.personaName].count++;
      personaSummary[usage.personaName].totalTokens += usage.contextTokens;
      
      if (usage.alert) {
        personaSummary[usage.personaName].alerts[usage.alert.level]++;
      }
    });

    return {
      period: {
        start: history[0].timestamp,
        end: history[history.length - 1].timestamp
      },
      totalUsages: history.length,
      tokenStats: {
        total: totalContextTokens,
        average: Math.round(averageContextTokens),
        max: {
          tokens: maxUsage.contextTokens,
          persona: maxUsage.personaName,
          timestamp: maxUsage.timestamp
        },
        min: {
          tokens: minUsage.contextTokens,
          persona: minUsage.personaName,
          timestamp: minUsage.timestamp
        }
      },
      personaSummary,
      alerts: {
        total: history.filter(u => u.alert).length,
        warning: history.filter(u => u.alert?.level === 'warning').length,
        critical: history.filter(u => u.alert?.level === 'critical').length
      }
    };
  }

  /**
   * 상세 리포트 생성
   * @param {Array} history - 필터링된 히스토리
   * @returns {Object} 상세 리포트
   */
  generateDetailedReport(history) {
    const summary = this.generateSummaryReport(history);
    
    // 시간대별 분석
    const hourlyAnalysis = this.analyzeHourlyPattern(history);
    
    // 컨텍스트 요소별 분석
    const elementAnalysis = this.analyzeContextElements(history);
    
    // 트렌드 분석
    const trendAnalysis = this.analyzeTrends(history);

    return {
      summary,
      hourlyAnalysis,
      elementAnalysis,
      trendAnalysis,
      rawData: history
    };
  }

  /**
   * 시간대별 패턴 분석
   * @param {Array} history - 필터링된 히스토리
   * @returns {Object} 시간대별 분석
   */
  analyzeHourlyPattern(history) {
    const hourlyData = {};
    
    history.forEach(usage => {
      const hour = new Date(usage.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          count: 0,
          totalTokens: 0
        };
      }
      hourlyData[hour].count++;
      hourlyData[hour].totalTokens += usage.contextTokens;
    });

    // 평균 계산
    Object.keys(hourlyData).forEach(hour => {
      hourlyData[hour].average = hourlyData[hour].totalTokens / hourlyData[hour].count;
    });

    return hourlyData;
  }

  /**
   * 트렌드 분석
   * @param {Array} history - 필터링된 히스토리
   * @returns {Object} 트렌드 정보
   */
  analyzeTrends(history) {
    if (history.length < 2) {
      return { message: '트렌드 분석을 위한 데이터가 부족합니다.' };
    }

    // 시간 순 정렬
    const sorted = [...history].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // 이동 평균 계산
    const windowSize = Math.min(5, Math.floor(sorted.length / 3));
    const movingAverages = [];

    for (let i = windowSize - 1; i < sorted.length; i++) {
      const window = sorted.slice(i - windowSize + 1, i + 1);
      const average = window.reduce((sum, u) => sum + u.contextTokens, 0) / windowSize;
      movingAverages.push({
        timestamp: sorted[i].timestamp,
        average: Math.round(average)
      });
    }

    // 증가/감소 트렌드 판단
    const firstAvg = movingAverages[0].average;
    const lastAvg = movingAverages[movingAverages.length - 1].average;
    const trendDirection = lastAvg > firstAvg ? 'increasing' : 
                          lastAvg < firstAvg ? 'decreasing' : 'stable';
    const trendPercentage = ((lastAvg - firstAvg) / firstAvg * 100).toFixed(2);

    return {
      direction: trendDirection,
      changePercentage: trendPercentage + '%',
      movingAverages,
      prediction: this.predictNextUsage(movingAverages)
    };
  }

  /**
   * 다음 사용량 예측
   * @param {Array} movingAverages - 이동 평균 데이터
   * @returns {number} 예측 토큰 수
   */
  predictNextUsage(movingAverages) {
    if (movingAverages.length < 3) {
      return null;
    }

    // 간단한 선형 예측
    const recent = movingAverages.slice(-3);
    const trend = (recent[2].average - recent[0].average) / 2;
    const prediction = recent[2].average + trend;

    return Math.round(Math.max(0, prediction));
  }

  /**
   * 토큰 사용량 최적화 제안
   * @param {string} personaName - 페르소나 이름
   * @returns {Object} 최적화 제안
   */
  getOptimizationSuggestions(personaName) {
    const stats = this.personaStats.get(personaName);
    if (!stats) {
      return { message: '해당 페르소나의 사용 기록이 없습니다.' };
    }

    const suggestions = [];

    // 평균 토큰 사용량이 높은 경우
    if (stats.averageContextTokens > this.thresholds.warning * 0.8) {
      suggestions.push({
        type: 'high_average',
        message: '평균 컨텍스트 토큰 사용량이 높습니다. 컨텍스트 내용을 간소화하는 것을 고려하세요.',
        currentAverage: Math.round(stats.averageContextTokens),
        recommendedMax: Math.round(this.thresholds.warning * 0.8)
      });
    }

    // 경고/위험 발생률이 높은 경우
    const alertRate = (stats.warningCount + stats.criticalCount) / stats.totalUsages;
    if (alertRate > 0.2) {
      suggestions.push({
        type: 'high_alert_rate',
        message: '토큰 한계 초과가 자주 발생합니다. 컨텍스트 압축을 활성화하세요.',
        alertRate: (alertRate * 100).toFixed(2) + '%',
        warningCount: stats.warningCount,
        criticalCount: stats.criticalCount
      });
    }

    // 최대 사용량이 위험 수준에 근접한 경우
    if (stats.maxContextTokens > this.thresholds.critical * 0.9) {
      suggestions.push({
        type: 'near_critical',
        message: '최대 토큰 사용량이 위험 수준에 근접합니다. 긴 컨텍스트를 분할하거나 요약하세요.',
        maxTokens: stats.maxContextTokens,
        criticalThreshold: this.thresholds.critical
      });
    }

    return {
      personaName,
      suggestions,
      currentStats: stats
    };
  }

  /**
   * 리포트 파일로 저장
   * @param {Object} report - 리포트 데이터
   * @param {string} filename - 파일명
   */
  async saveReport(report, filename) {
    const reportsDir = path.join(process.cwd(), '.aiwf', 'reports', 'token-usage');
    
    // 디렉토리 생성
    await fs.mkdir(reportsDir, { recursive: true });
    
    // 파일 경로
    const filePath = path.join(reportsDir, filename);
    
    // JSON 형식으로 저장
    await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
    
    console.log(`토큰 사용량 리포트 저장: ${filePath}`);
    return filePath;
  }

  /**
   * 임계값 설정
   * @param {Object} thresholds - 새로운 임계값
   */
  setThresholds(thresholds) {
    if (thresholds.warning) {
      this.thresholds.warning = thresholds.warning;
    }
    if (thresholds.critical) {
      this.thresholds.critical = thresholds.critical;
    }
  }

  /**
   * 모니터링 데이터 초기화
   */
  reset() {
    this.usageHistory = [];
    this.personaStats.clear();
    console.log('토큰 모니터링 데이터가 초기화되었습니다.');
  }
}

module.exports = ContextTokenMonitor;