import fs from 'fs';
import path from 'path';
import { TokenStorage } from './token-storage.js';
import { TokenCounter } from './token-counter.js';

/**
 * 토큰 사용량 보고서를 생성하고 포맷팅하는 클래스
 */
export class TokenReporter {
  constructor() {
    this.storage = new TokenStorage();
    this.counter = new TokenCounter();
  }

  /**
   * 프로젝트 전체 토큰 분석 보고서를 생성합니다
   * @param {string} projectPath - 프로젝트 경로
   * @returns {Object} 프로젝트 토큰 분석 보고서
   */
  generateProjectAnalysisReport(projectPath = '.') {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        projectPath,
        analysis: {
          totalTokens: 0,
          fileBreakdown: {},
          directoryBreakdown: {},
          compressionOpportunities: [],
          recommendations: []
        }
      };

      // 주요 AIWF 디렉토리 분석
      const directories = [
        '.aiwf/01_PROJECT_DOCS',
        '.aiwf/02_REQUIREMENTS',
        '.aiwf/03_SPRINTS',
        '.aiwf/04_GENERAL_TASKS',
        '.aiwf/05_COMPLETED_TASKS',
        '.aiwf/06_FEATURE_LEDGERS',
        '.aiwf/07_AI_PERSONAS'
      ];

      // 각 디렉토리별 토큰 수 분석
      for (const dir of directories) {
        const dirPath = path.join(projectPath, dir);
        if (fs.existsSync(dirPath)) {
          const tokens = this.counter.countDirectoryTokens(dirPath);
          report.analysis.directoryBreakdown[dir] = {
            tokens,
            percentage: 0, // 나중에 계산
            files: this.getFileAnalysis(dirPath)
          };
          report.analysis.totalTokens += tokens;
        }
      }

      // 퍼센티지 계산
      Object.keys(report.analysis.directoryBreakdown).forEach(dir => {
        const breakdown = report.analysis.directoryBreakdown[dir];
        breakdown.percentage = report.analysis.totalTokens > 0 
          ? ((breakdown.tokens / report.analysis.totalTokens) * 100).toFixed(1)
          : 0;
      });

      // 압축 기회 식별
      report.analysis.compressionOpportunities = this.identifyCompressionOpportunities(
        report.analysis.directoryBreakdown
      );

      // 권장사항 생성
      report.analysis.recommendations = this.generateRecommendations(
        report.analysis.totalTokens,
        report.analysis.compressionOpportunities
      );

      return report;
    } catch (error) {
      console.error('프로젝트 분석 보고서 생성 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 디렉토리 내 파일별 토큰 분석을 수행합니다
   * @param {string} dirPath - 디렉토리 경로
   * @returns {Array<Object>} 파일별 분석 결과
   */
  getFileAnalysis(dirPath) {
    try {
      const files = this.counter.getMarkdownFiles(dirPath);
      const analysis = [];

      for (const file of files) {
        const tokens = this.counter.countFileTokens(file);
        const relativePath = path.relative(process.cwd(), file);
        
        analysis.push({
          path: relativePath,
          tokens,
          size: fs.statSync(file).size,
          tokensPerByte: tokens > 0 ? (tokens / fs.statSync(file).size).toFixed(3) : 0
        });
      }

      return analysis.sort((a, b) => b.tokens - a.tokens);
    } catch (error) {
      console.error('파일 분석 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 압축 기회를 식별합니다
   * @param {Object} directoryBreakdown - 디렉토리별 분석 결과
   * @returns {Array<Object>} 압축 기회 목록
   */
  identifyCompressionOpportunities(directoryBreakdown) {
    const opportunities = [];

    try {
      // 대용량 디렉토리 식별
      const largeDirectories = Object.entries(directoryBreakdown)
        .filter(([_, data]) => data.tokens > 5000)
        .sort((a, b) => b[1].tokens - a[1].tokens);

      for (const [dir, data] of largeDirectories) {
        opportunities.push({
          type: 'large_directory',
          target: dir,
          currentTokens: data.tokens,
          description: `대용량 디렉토리 (${data.tokens} 토큰)`,
          potentialSavings: Math.round(data.tokens * 0.3),
          priority: data.tokens > 10000 ? 'high' : 'medium'
        });
      }

      // 반복 콘텐츠 식별
      opportunities.push({
        type: 'repetitive_content',
        target: 'all',
        description: '반복되는 템플릿 및 보일러플레이트 콘텐츠',
        potentialSavings: Math.round(Object.values(directoryBreakdown).reduce((sum, data) => sum + data.tokens, 0) * 0.15),
        priority: 'medium'
      });

      // 완료된 태스크 압축
      if (directoryBreakdown['.aiwf/05_COMPLETED_TASKS']) {
        opportunities.push({
          type: 'completed_tasks',
          target: '.aiwf/05_COMPLETED_TASKS',
          currentTokens: directoryBreakdown['.aiwf/05_COMPLETED_TASKS'].tokens,
          description: '완료된 태스크 아카이브',
          potentialSavings: Math.round(directoryBreakdown['.aiwf/05_COMPLETED_TASKS'].tokens * 0.6),
          priority: 'low'
        });
      }
    } catch (error) {
      console.error('압축 기회 식별 중 오류 발생:', error);
    }

    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 권장사항을 생성합니다
   * @param {number} totalTokens - 총 토큰 수
   * @param {Array<Object>} opportunities - 압축 기회 목록
   * @returns {Array<Object>} 권장사항 목록
   */
  generateRecommendations(totalTokens, opportunities) {
    const recommendations = [];

    try {
      // 총 토큰 수에 따른 권장사항
      if (totalTokens > 50000) {
        recommendations.push({
          type: 'aggressive_compression',
          priority: 'high',
          title: '적극적 압축 모드 권장',
          description: `프로젝트 크기가 ${totalTokens.toLocaleString()} 토큰으로 매우 큽니다. 적극적 압축 모드를 사용하여 50-70% 압축을 권장합니다.`,
          action: 'aiwf compress --mode aggressive --level 4'
        });
      } else if (totalTokens > 20000) {
        recommendations.push({
          type: 'balanced_compression',
          priority: 'medium',
          title: '균형 압축 모드 권장',
          description: `프로젝트 크기가 ${totalTokens.toLocaleString()} 토큰입니다. 균형 압축 모드를 사용하여 30-50% 압축을 권장합니다.`,
          action: 'aiwf compress --mode balanced --level 3'
        });
      }

      // 압축 기회 기반 권장사항
      const highPriorityOpportunities = opportunities.filter(op => op.priority === 'high');
      if (highPriorityOpportunities.length > 0) {
        recommendations.push({
          type: 'targeted_compression',
          priority: 'high',
          title: '특정 디렉토리 압축 권장',
          description: `${highPriorityOpportunities.length}개의 대용량 디렉토리가 식별되었습니다.`,
          action: 'aiwf compress --target-directories'
        });
      }

      // 정기적 정리 권장사항
      recommendations.push({
        type: 'regular_cleanup',
        priority: 'low',
        title: '정기적 프로젝트 정리',
        description: '오래된 로그, 완료된 태스크 등을 정기적으로 정리하여 토큰 사용량을 최적화하세요.',
        action: 'aiwf cleanup --older-than 30d'
      });

      // 토큰 모니터링 권장사항
      recommendations.push({
        type: 'monitoring',
        priority: 'medium',
        title: '토큰 사용량 모니터링 설정',
        description: '토큰 사용량을 실시간으로 모니터링하고 임계값을 설정하세요.',
        action: 'aiwf token-monitor --enable --threshold 10000'
      });
    } catch (error) {
      console.error('권장사항 생성 중 오류 발생:', error);
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 사용량 보고서를 생성합니다
   * @param {string} type - 보고서 타입
   * @returns {Object} 사용량 보고서
   */
  generateUsageReport(type = 'daily') {
    try {
      const report = this.storage.generateUsageReport(type);
      
      if (!report) {
        return null;
      }

      // 보고서 포맷팅
      const formattedReport = {
        ...report,
        formatted: {
          summary: this.formatSummary(report.summary),
          dailyUsage: this.formatDailyUsage(report.dailyUsage),
          topCommands: this.formatTopCommands(report.topCommands),
          compressionStats: this.formatCompressionStats(report.compressionStats),
          trends: this.formatTrends(report.trends)
        }
      };

      return formattedReport;
    } catch (error) {
      console.error('사용량 보고서 생성 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 요약 정보를 포맷팅합니다
   * @param {Object} summary - 요약 정보
   * @returns {Object} 포맷팅된 요약 정보
   */
  formatSummary(summary) {
    return {
      totalTokens: summary.totalTokens.toLocaleString(),
      totalSessions: summary.totalSessions.toLocaleString(),
      avgTokensPerSession: summary.avgTokensPerSession.toLocaleString(),
      efficiency: summary.avgTokensPerSession > 1000 ? 'High' : 
                  summary.avgTokensPerSession > 500 ? 'Medium' : 'Low'
    };
  }

  /**
   * 일일 사용량을 포맷팅합니다
   * @param {Object} dailyUsage - 일일 사용량
   * @returns {Array<Object>} 포맷팅된 일일 사용량
   */
  formatDailyUsage(dailyUsage) {
    return Object.entries(dailyUsage)
      .map(([date, usage]) => ({
        date,
        tokens: usage.tokens.toLocaleString(),
        sessions: usage.sessions,
        commands: usage.commands,
        avgTokensPerSession: usage.sessions > 0 ? 
          Math.round(usage.tokens / usage.sessions).toLocaleString() : '0'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * 상위 명령어를 포맷팅합니다
   * @param {Array<Object>} topCommands - 상위 명령어 목록
   * @returns {Array<Object>} 포맷팅된 상위 명령어 목록
   */
  formatTopCommands(topCommands) {
    return topCommands.map(cmd => ({
      command: cmd.command,
      count: cmd.count.toLocaleString(),
      totalTokens: cmd.totalTokens.toLocaleString(),
      avgTokens: cmd.avgTokens.toLocaleString(),
      efficiency: cmd.avgTokens > 1000 ? 'High' : 
                  cmd.avgTokens > 500 ? 'Medium' : 'Low'
    }));
  }

  /**
   * 압축 통계를 포맷팅합니다
   * @param {Object} compressionStats - 압축 통계
   * @returns {Object} 포맷팅된 압축 통계
   */
  formatCompressionStats(compressionStats) {
    return {
      totalOriginal: compressionStats.totalOriginal.toLocaleString(),
      totalCompressed: compressionStats.totalCompressed.toLocaleString(),
      totalSaved: compressionStats.totalSaved.toLocaleString(),
      avgRatio: compressionStats.avgRatio.toFixed(1) + '%',
      efficiency: compressionStats.avgRatio > 50 ? 'High' : 
                  compressionStats.avgRatio > 25 ? 'Medium' : 'Low'
    };
  }

  /**
   * 트렌드를 포맷팅합니다
   * @param {Object} trends - 트렌드 정보
   * @returns {Object} 포맷팅된 트렌드 정보
   */
  formatTrends(trends) {
    const trendEmoji = {
      increasing: '📈',
      decreasing: '📉',
      stable: '➡️',
      insufficient_data: '❓',
      error: '❌'
    };

    return {
      trend: trends.trend,
      emoji: trendEmoji[trends.trend] || '❓',
      change: trends.change > 0 ? `+${trends.change}%` : `${trends.change}%`,
      recentAvg: trends.recentAvg?.toLocaleString() || '0',
      olderAvg: trends.olderAvg?.toLocaleString() || '0',
      description: this.getTrendDescription(trends.trend, trends.change)
    };
  }

  /**
   * 트렌드 설명을 생성합니다
   * @param {string} trend - 트렌드
   * @param {number} change - 변화율
   * @returns {string} 트렌드 설명
   */
  getTrendDescription(trend, change) {
    switch (trend) {
      case 'increasing':
        return `토큰 사용량이 ${Math.abs(change)}% 증가하고 있습니다`;
      case 'decreasing':
        return `토큰 사용량이 ${Math.abs(change)}% 감소하고 있습니다`;
      case 'stable':
        return '토큰 사용량이 안정적입니다';
      case 'insufficient_data':
        return '분석할 데이터가 부족합니다';
      default:
        return '트렌드 분석에 오류가 발생했습니다';
    }
  }

  /**
   * 보고서를 콘솔에 출력합니다
   * @param {Object} report - 보고서 데이터
   */
  printReport(report) {
    try {
      console.log('\n=== 토큰 사용량 보고서 ===');
      console.log(`생성일시: ${new Date(report.generatedAt).toLocaleString()}`);
      console.log(`보고서 타입: ${report.type}`);
      console.log(`기간: ${report.period.start} ~ ${report.period.end}`);
      
      if (report.formatted) {
        console.log('\n--- 요약 ---');
        console.log(`총 토큰: ${report.formatted.summary.totalTokens}`);
        console.log(`총 세션: ${report.formatted.summary.totalSessions}`);
        console.log(`세션당 평균 토큰: ${report.formatted.summary.avgTokensPerSession}`);
        console.log(`효율성: ${report.formatted.summary.efficiency}`);
        
        console.log('\n--- 트렌드 ---');
        console.log(`${report.formatted.trends.emoji} ${report.formatted.trends.description}`);
        console.log(`변화율: ${report.formatted.trends.change}`);
        
        if (report.formatted.topCommands.length > 0) {
          console.log('\n--- 상위 명령어 ---');
          report.formatted.topCommands.slice(0, 5).forEach((cmd, idx) => {
            console.log(`${idx + 1}. ${cmd.command}: ${cmd.totalTokens} 토큰 (${cmd.count}회)`);
          });
        }
        
        if (report.formatted.compressionStats.totalOriginal > 0) {
          console.log('\n--- 압축 통계 ---');
          console.log(`원본: ${report.formatted.compressionStats.totalOriginal} 토큰`);
          console.log(`압축: ${report.formatted.compressionStats.totalCompressed} 토큰`);
          console.log(`절약: ${report.formatted.compressionStats.totalSaved} 토큰`);
          console.log(`압축률: ${report.formatted.compressionStats.avgRatio}`);
        }
      }
      
      console.log('\n========================\n');
    } catch (error) {
      console.error('보고서 출력 중 오류 발생:', error);
    }
  }

  /**
   * 보고서를 파일로 저장합니다
   * @param {Object} report - 보고서 데이터
   * @param {string} filename - 파일명
   */
  saveReportToFile(report, filename) {
    try {
      const reportDir = '.aiwf/token-data/reports';
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const filepath = path.join(reportDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`보고서가 ${filepath}에 저장되었습니다.`);
    } catch (error) {
      console.error('보고서 저장 중 오류 발생:', error);
    }
  }

  /**
   * 리소스를 정리합니다
   */
  cleanup() {
    if (this.counter) {
      this.counter.cleanup();
    }
  }
}

export default TokenReporter;