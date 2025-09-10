import { TokenCounter } from '../utils/token-counter.js';
import { TokenTracker } from '../utils/token-tracker.js';
import { TokenStorage } from '../utils/token-storage.js';
import { TokenReporter } from '../utils/token-reporter.js';
import { TokenMonitor } from '../utils/token-monitor.js';

/**
 * 토큰 추적 시스템 명령어 인터페이스
 */
export class TokenTrackingCommands {
  constructor() {
    this.counter = new TokenCounter();
    this.tracker = new TokenTracker();
    this.storage = new TokenStorage();
    this.reporter = new TokenReporter();
    this.monitor = new TokenMonitor();
  }

  /**
   * 텍스트 또는 파일의 토큰 수를 계산합니다
   * @param {Object} options - 옵션
   * @param {string} options.text - 분석할 텍스트
   * @param {string} options.file - 분석할 파일 경로
   * @param {string} options.dir - 분석할 디렉토리 경로
   * @returns {Object} 토큰 카운트 결과
   */
  async countTokens(options = {}) {
    try {
      if (options.text) {
        const tokens = this.counter.countTokens(options.text);
        return {
          type: 'text',
          tokens,
          characters: options.text.length,
          ratio: options.text.length > 0 ? (tokens / options.text.length).toFixed(3) : 0
        };
      }

      if (options.file) {
        const tokens = this.counter.countFileTokens(options.file);
        const stats = await import('fs').then(fs => fs.promises.stat(options.file));
        return {
          type: 'file',
          path: options.file,
          tokens,
          size: stats.size,
          ratio: stats.size > 0 ? (tokens / stats.size).toFixed(3) : 0
        };
      }

      if (options.dir) {
        const tokens = this.counter.countDirectoryTokens(options.dir);
        const files = this.counter.getMarkdownFiles(options.dir);
        return {
          type: 'directory',
          path: options.dir,
          tokens,
          fileCount: files.length,
          avgTokensPerFile: files.length > 0 ? Math.round(tokens / files.length) : 0
        };
      }

      throw new Error('텍스트, 파일 또는 디렉토리 중 하나를 지정해야 합니다.');
    } catch (error) {
      console.error('토큰 카운트 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 명령어 실행을 추적합니다
   * @param {Object} options - 옵션
   * @param {string} options.command - 실행된 명령어
   * @param {string} options.input - 입력 텍스트
   * @param {string} options.output - 출력 텍스트
   * @returns {Object} 추적 결과
   */
  async trackCommand(options = {}) {
    try {
      const result = this.tracker.trackCommand(
        options.command || 'unknown',
        options.input || '',
        options.output || ''
      );

      if (result) {
        // 모니터링 시스템에 체크
        const violations = this.monitor.checkThresholds();
        
        return {
          ...result,
          violations,
          sessionStats: this.tracker.getSessionStats()
        };
      }

      return null;
    } catch (error) {
      console.error('명령어 추적 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 현재 세션의 토큰 사용량 보고서를 생성합니다
   * @returns {Object} 세션 보고서
   */
  async generateSessionReport() {
    try {
      const report = this.tracker.generateReport();
      
      if (report) {
        console.log('\n=== 세션 토큰 사용량 보고서 ===');
        console.log(`세션 ID: ${report.sessionId}`);
        console.log(`세션 시간: ${report.sessionDuration}`);
        console.log(`실행 명령어: ${report.totalCommands}개`);
        console.log(`총 토큰: ${report.totalTokens.toLocaleString()}`);
        console.log(`명령어당 평균 토큰: ${report.avgTokensPerCommand.toLocaleString()}`);
        console.log(`시작 시간: ${report.startTime}`);
        console.log(`마지막 업데이트: ${report.lastUpdated}`);
        
        if (report.compressionStats) {
          console.log('\n--- 압축 통계 ---');
          console.log(`원본 토큰: ${report.compressionStats.originalTokens.toLocaleString()}`);
          console.log(`압축 토큰: ${report.compressionStats.compressedTokens.toLocaleString()}`);
          console.log(`절약 토큰: ${report.compressionStats.savedTokens.toLocaleString()}`);
          console.log(`압축률: ${report.compressionStats.compressionRatio}`);
          console.log(`효율성: ${report.compressionStats.efficiency}`);
        }
        
        if (report.recentCommands.length > 0) {
          console.log('\n--- 최근 명령어 ---');
          report.recentCommands.forEach((cmd, idx) => {
            console.log(`${idx + 1}. ${cmd.command}: ${cmd.totalTokens} 토큰`);
          });
        }
        
        console.log('\n========================\n');
      }
      
      return report;
    } catch (error) {
      console.error('세션 보고서 생성 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 프로젝트 토큰 분석을 수행합니다
   * @param {Object} options - 옵션
   * @param {string} options.path - 프로젝트 경로
   * @param {boolean} options.detailed - 상세 분석 여부
   * @returns {Object} 분석 결과
   */
  async analyzeProject(options = {}) {
    try {
      const report = this.reporter.generateProjectAnalysisReport(options.path || '.');
      
      if (!report) {
        return null;
      }

      console.log('\n=== 프로젝트 토큰 분석 ===');
      console.log(`프로젝트 경로: ${report.projectPath}`);
      console.log(`총 토큰: ${report.analysis.totalTokens.toLocaleString()}`);
      console.log(`분석 시간: ${new Date(report.generatedAt).toLocaleString()}`);
      
      console.log('\n--- 디렉토리별 분석 ---');
      Object.entries(report.analysis.directoryBreakdown).forEach(([dir, data]) => {
        console.log(`${dir}: ${data.tokens.toLocaleString()} 토큰 (${data.percentage}%)`);
      });
      
      if (options.detailed) {
        console.log('\n--- 상세 파일 분석 ---');
        Object.entries(report.analysis.directoryBreakdown).forEach(([dir, data]) => {
          if (data.files.length > 0) {
            console.log(`\n${dir}:`);
            data.files.slice(0, 5).forEach(file => {
              console.log(`  - ${file.path}: ${file.tokens.toLocaleString()} 토큰`);
            });
          }
        });
      }
      
      if (report.analysis.compressionOpportunities.length > 0) {
        console.log('\n--- 압축 기회 ---');
        report.analysis.compressionOpportunities.forEach(op => {
          console.log(`${op.priority.toUpperCase()}: ${op.description}`);
          console.log(`  예상 절약: ${op.potentialSavings.toLocaleString()} 토큰`);
        });
      }
      
      if (report.analysis.recommendations.length > 0) {
        console.log('\n--- 권장사항 ---');
        report.analysis.recommendations.forEach(rec => {
          console.log(`${rec.priority.toUpperCase()}: ${rec.title}`);
          console.log(`  ${rec.description}`);
          console.log(`  명령어: ${rec.action}`);
        });
      }
      
      console.log('\n========================\n');
      
      return report;
    } catch (error) {
      console.error('프로젝트 분석 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 사용량 보고서를 생성합니다
   * @param {Object} options - 옵션
   * @param {string} options.type - 보고서 타입 (daily, weekly, monthly)
   * @param {boolean} options.save - 파일 저장 여부
   * @returns {Object} 보고서 데이터
   */
  async generateUsageReport(options = {}) {
    try {
      const report = this.reporter.generateUsageReport(options.type || 'daily');
      
      if (!report) {
        return null;
      }

      this.reporter.printReport(report);
      
      if (options.save) {
        const filename = `usage_report_${options.type || 'daily'}_${Date.now()}.json`;
        this.reporter.saveReportToFile(report, filename);
      }
      
      return report;
    } catch (error) {
      console.error('사용량 보고서 생성 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 모니터링을 설정합니다
   * @param {Object} options - 옵션
   * @param {boolean} options.enable - 모니터링 활성화 여부
   * @param {Object} options.thresholds - 임계값 설정
   * @param {boolean} options.start - 실시간 모니터링 시작 여부
   * @returns {Object} 설정 결과
   */
  async setupMonitoring(options = {}) {
    try {
      if (options.enable !== undefined) {
        this.monitor.setEnabled(options.enable);
      }

      if (options.thresholds) {
        this.monitor.setThresholds(options.thresholds);
      }

      if (options.start) {
        this.monitor.startMonitoring();
      }

      return {
        success: true,
        status: this.monitor.getStatus()
      };
    } catch (error) {
      console.error('모니터링 설정 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 모니터링 상태를 조회합니다
   * @returns {Object} 모니터링 상태
   */
  async getMonitoringStatus() {
    try {
      this.monitor.displayDashboard();
      return this.monitor.getStatus();
    } catch (error) {
      console.error('모니터링 상태 조회 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 알림을 관리합니다
   * @param {Object} options - 옵션
   * @param {string} options.action - 액션 (list, acknowledge, clear)
   * @param {string} options.alertId - 알림 ID (acknowledge 시 필요)
   * @returns {Object} 알림 관리 결과
   */
  async manageAlerts(options = {}) {
    try {
      switch (options.action) {
        case 'list':
          const unacknowledged = this.monitor.getUnacknowledgedAlerts();
          console.log(`미확인 알림: ${unacknowledged.length}개`);
          unacknowledged.forEach(alert => {
            const emoji = alert.level === 'critical' ? '🚨' : 
                         alert.level === 'warning' ? '⚠️' : 'ℹ️';
            console.log(`${emoji} [${alert.id}] ${alert.message}`);
          });
          return unacknowledged;

        case 'acknowledge':
          if (options.alertId) {
            this.monitor.acknowledgeAlert(options.alertId);
          } else {
            this.monitor.acknowledgeAllAlerts();
          }
          return { success: true };

        case 'clear':
          this.monitor.cleanupOldAlerts();
          return { success: true };

        default:
          throw new Error('올바른 액션을 지정해주세요: list, acknowledge, clear');
      }
    } catch (error) {
      console.error('알림 관리 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 압축 전후 토큰 수를 기록합니다
   * @param {Object} options - 옵션
   * @param {number} options.originalTokens - 원본 토큰 수
   * @param {number} options.compressedTokens - 압축 토큰 수
   * @returns {Object} 압축 추적 결과
   */
  async trackCompression(options = {}) {
    try {
      if (!options.originalTokens || !options.compressedTokens) {
        throw new Error('원본 토큰 수와 압축 토큰 수를 모두 지정해야 합니다.');
      }

      this.tracker.trackCompression(options.originalTokens, options.compressedTokens);
      
      const saved = options.originalTokens - options.compressedTokens;
      const ratio = ((saved / options.originalTokens) * 100).toFixed(2);
      
      console.log(`압축 완료: ${saved.toLocaleString()} 토큰 절약 (${ratio}%)`);
      
      return {
        originalTokens: options.originalTokens,
        compressedTokens: options.compressedTokens,
        savedTokens: saved,
        compressionRatio: ratio
      };
    } catch (error) {
      console.error('압축 추적 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 세션 데이터를 정리합니다
   * @param {Object} options - 옵션
   * @param {number} options.daysToKeep - 보관할 일수
   * @returns {Object} 정리 결과
   */
  async cleanupSessions(options = {}) {
    try {
      const daysToKeep = options.daysToKeep || 7;
      this.tracker.cleanupOldSessions(daysToKeep);
      
      return { success: true, daysToKeep };
    } catch (error) {
      console.error('세션 정리 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 토큰 추적 시스템을 초기화합니다
   * @returns {Object} 초기화 결과
   */
  async resetSystem() {
    try {
      this.storage.resetData();
      this.monitor.cleanupOldAlerts();
      
      console.log('토큰 추적 시스템이 초기화되었습니다.');
      
      return { success: true };
    } catch (error) {
      console.error('시스템 초기화 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 토큰 추적 시스템의 상태를 조회합니다
   * @returns {Object} 시스템 상태
   */
  async getSystemStatus() {
    try {
      const sessionStats = this.tracker.getSessionStats();
      const monitoringStatus = this.monitor.getStatus();
      const alertStats = this.monitor.getAlertStats();
      
      return {
        session: sessionStats,
        monitoring: monitoringStatus,
        alerts: alertStats,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('시스템 상태 조회 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 리소스를 정리합니다
   */
  cleanup() {
    if (this.counter) {
      this.counter.cleanup();
    }
    if (this.tracker) {
      this.tracker.cleanup();
    }
    if (this.reporter) {
      this.reporter.cleanup();
    }
    if (this.monitor) {
      this.monitor.stopMonitoring();
    }
  }
}

/**
 * 토큰 추적 명령어 팩토리
 */
export function createTokenTrackingCommands() {
  return new TokenTrackingCommands();
}

export default TokenTrackingCommands;