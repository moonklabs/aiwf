import fs from 'fs';
import path from 'path';

/**
 * 토큰 사용량 데이터를 저장하고 관리하는 클래스
 */
export class TokenStorage {
  constructor(baseDir = '.aiwf/token-data') {
    this.baseDir = baseDir;
    this.dataFile = path.join(baseDir, 'token-usage.json');
    this.sessionDir = path.join(baseDir, 'sessions');
    this.reportsDir = path.join(baseDir, 'reports');
    
    this.ensureDirectories();
    this.loadData();
  }

  /**
   * 필요한 디렉토리를 생성합니다
   */
  ensureDirectories() {
    try {
      const dirs = [this.baseDir, this.sessionDir, this.reportsDir];
      for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }
    } catch (error) {
      console.error('디렉토리 생성 중 오류 발생:', error);
    }
  }

  /**
   * 토큰 사용량 데이터를 로드합니다
   */
  loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.data = {
          totalTokens: 0,
          sessionsCount: 0,
          lastUpdated: Date.now(),
          dailyUsage: {},
          commandStats: {},
          compressionStats: {
            totalOriginal: 0,
            totalCompressed: 0,
            totalSaved: 0,
            avgRatio: 0
          },
          ...data
        };
      } else {
        this.data = {
          totalTokens: 0,
          sessionsCount: 0,
          lastUpdated: Date.now(),
          dailyUsage: {},
          commandStats: {},
          compressionStats: {
            totalOriginal: 0,
            totalCompressed: 0,
            totalSaved: 0,
            avgRatio: 0
          }
        };
      }
    } catch (error) {
      console.error('데이터 로드 중 오류 발생:', error);
      this.data = this.getDefaultData();
    }
  }

  /**
   * 기본 데이터 구조를 반환합니다
   * @returns {Object} 기본 데이터 구조
   */
  getDefaultData() {
    return {
      totalTokens: 0,
      sessionsCount: 0,
      lastUpdated: Date.now(),
      dailyUsage: {},
      commandStats: {},
      compressionStats: {
        totalOriginal: 0,
        totalCompressed: 0,
        totalSaved: 0,
        avgRatio: 0
      }
    };
  }

  /**
   * 데이터를 저장합니다
   */
  saveData() {
    try {
      this.data.lastUpdated = Date.now();
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
    }
  }

  /**
   * 세션 토큰 사용량을 기록합니다
   * @param {Object} sessionData - 세션 데이터
   */
  recordSessionUsage(sessionData) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 총 토큰 수 업데이트
      this.data.totalTokens += sessionData.totalTokens;
      this.data.sessionsCount++;
      
      // 일일 사용량 업데이트
      if (!this.data.dailyUsage[today]) {
        this.data.dailyUsage[today] = {
          tokens: 0,
          sessions: 0,
          commands: 0
        };
      }
      
      this.data.dailyUsage[today].tokens += sessionData.totalTokens;
      this.data.dailyUsage[today].sessions++;
      this.data.dailyUsage[today].commands += sessionData.commands.length;
      
      // 명령어별 통계 업데이트
      for (const command of sessionData.commands) {
        if (!this.data.commandStats[command.command]) {
          this.data.commandStats[command.command] = {
            count: 0,
            totalTokens: 0,
            avgTokens: 0
          };
        }
        
        const stats = this.data.commandStats[command.command];
        stats.count++;
        stats.totalTokens += command.totalTokens;
        stats.avgTokens = Math.round(stats.totalTokens / stats.count);
      }
      
      // 압축 통계 업데이트
      if (sessionData.compressions) {
        for (const compression of sessionData.compressions) {
          this.data.compressionStats.totalOriginal += compression.originalTokens;
          this.data.compressionStats.totalCompressed += compression.compressedTokens;
          this.data.compressionStats.totalSaved += compression.savedTokens;
        }
        
        // 평균 압축률 계산
        if (this.data.compressionStats.totalOriginal > 0) {
          this.data.compressionStats.avgRatio = 
            (this.data.compressionStats.totalSaved / this.data.compressionStats.totalOriginal) * 100;
        }
      }
      
      this.saveData();
    } catch (error) {
      console.error('세션 사용량 기록 중 오류 발생:', error);
    }
  }

  /**
   * 토큰 사용량 보고서를 생성합니다
   * @param {string} type - 보고서 타입 ('daily', 'weekly', 'monthly')
   * @returns {Object} 보고서 데이터
   */
  generateUsageReport(type = 'daily') {
    try {
      const report = {
        type,
        generatedAt: Date.now(),
        period: this.getPeriod(type),
        summary: {
          totalTokens: this.data.totalTokens,
          totalSessions: this.data.sessionsCount,
          avgTokensPerSession: this.data.sessionsCount > 0 ? 
            Math.round(this.data.totalTokens / this.data.sessionsCount) : 0
        },
        dailyUsage: this.getDailyUsageForPeriod(type),
        topCommands: this.getTopCommands(10),
        compressionStats: this.data.compressionStats,
        trends: this.calculateTrends(type)
      };
      
      // 보고서 저장
      const reportFile = path.join(this.reportsDir, `${type}_report_${Date.now()}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      
      return report;
    } catch (error) {
      console.error('보고서 생성 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 기간에 따른 일일 사용량을 조회합니다
   * @param {string} type - 기간 타입
   * @returns {Object} 일일 사용량 데이터
   */
  getDailyUsageForPeriod(type) {
    const days = type === 'weekly' ? 7 : type === 'monthly' ? 30 : 1;
    const result = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      result[dateStr] = this.data.dailyUsage[dateStr] || {
        tokens: 0,
        sessions: 0,
        commands: 0
      };
    }
    
    return result;
  }

  /**
   * 가장 많이 사용된 명령어를 조회합니다
   * @param {number} limit - 조회할 명령어 수
   * @returns {Array<Object>} 상위 명령어 목록
   */
  getTopCommands(limit = 10) {
    try {
      return Object.entries(this.data.commandStats)
        .sort((a, b) => b[1].totalTokens - a[1].totalTokens)
        .slice(0, limit)
        .map(([command, stats]) => ({
          command,
          count: stats.count,
          totalTokens: stats.totalTokens,
          avgTokens: stats.avgTokens
        }));
    } catch (error) {
      console.error('상위 명령어 조회 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 사용량 트렌드를 계산합니다
   * @param {string} type - 기간 타입
   * @returns {Object} 트렌드 데이터
   */
  calculateTrends(type) {
    try {
      const dailyUsage = this.getDailyUsageForPeriod(type);
      const values = Object.values(dailyUsage).map(day => day.tokens);
      
      if (values.length < 2) {
        return { trend: 'insufficient_data', change: 0 };
      }
      
      const recent = values.slice(0, Math.floor(values.length / 2));
      const older = values.slice(Math.floor(values.length / 2));
      
      const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
      const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
      
      const change = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
      
      return {
        trend: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
        change: Math.round(change),
        recentAvg: Math.round(recentAvg),
        olderAvg: Math.round(olderAvg)
      };
    } catch (error) {
      console.error('트렌드 계산 중 오류 발생:', error);
      return { trend: 'error', change: 0 };
    }
  }

  /**
   * 기간 정보를 반환합니다
   * @param {string} type - 기간 타입
   * @returns {Object} 기간 정보
   */
  getPeriod(type) {
    const now = new Date();
    const start = new Date(now);
    
    switch (type) {
      case 'weekly':
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
      default:
        start.setDate(now.getDate() - 1);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  }

  /**
   * 임계값을 확인합니다
   * @param {Object} thresholds - 임계값 설정
   * @returns {Array<Object>} 임계값 위반 목록
   */
  checkThresholds(thresholds) {
    const violations = [];
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = this.data.dailyUsage[today] || { tokens: 0, sessions: 0 };
    
    try {
      // 일일 토큰 한도 확인
      if (thresholds.dailyTokenLimit && todayUsage.tokens > thresholds.dailyTokenLimit) {
        violations.push({
          type: 'daily_token_limit',
          threshold: thresholds.dailyTokenLimit,
          current: todayUsage.tokens,
          message: `일일 토큰 한도(${thresholds.dailyTokenLimit})를 초과했습니다: ${todayUsage.tokens}`
        });
      }
      
      // 일일 세션 한도 확인
      if (thresholds.dailySessionLimit && todayUsage.sessions > thresholds.dailySessionLimit) {
        violations.push({
          type: 'daily_session_limit',
          threshold: thresholds.dailySessionLimit,
          current: todayUsage.sessions,
          message: `일일 세션 한도(${thresholds.dailySessionLimit})를 초과했습니다: ${todayUsage.sessions}`
        });
      }
      
      // 경고 임계값 확인
      if (thresholds.warningThreshold) {
        const warningLimit = thresholds.dailyTokenLimit * (thresholds.warningThreshold / 100);
        if (todayUsage.tokens > warningLimit) {
          violations.push({
            type: 'warning_threshold',
            threshold: warningLimit,
            current: todayUsage.tokens,
            message: `경고 임계값(${Math.round(warningLimit)})을 초과했습니다: ${todayUsage.tokens}`
          });
        }
      }
    } catch (error) {
      console.error('임계값 확인 중 오류 발생:', error);
    }
    
    return violations;
  }

  /**
   * 저장된 보고서 목록을 조회합니다
   * @returns {Array<Object>} 보고서 목록
   */
  getReportsList() {
    try {
      const reports = [];
      const files = fs.readdirSync(this.reportsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.reportsDir, file);
          const stats = fs.statSync(filePath);
          
          reports.push({
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          });
        }
      }
      
      return reports.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('보고서 목록 조회 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 오래된 보고서를 정리합니다
   * @param {number} daysToKeep - 보관할 일수
   */
  cleanupOldReports(daysToKeep = 30) {
    try {
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const files = fs.readdirSync(this.reportsDir);
      let deletedCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.reportsDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.birthtime.getTime() < cutoffTime) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
      }
      
      console.log(`${deletedCount}개의 오래된 보고서를 정리했습니다.`);
    } catch (error) {
      console.error('보고서 정리 중 오류 발생:', error);
    }
  }

  /**
   * 모든 데이터를 초기화합니다
   */
  resetData() {
    try {
      this.data = this.getDefaultData();
      this.saveData();
      console.log('토큰 사용량 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('데이터 초기화 중 오류 발생:', error);
    }
  }
}

export default TokenStorage;