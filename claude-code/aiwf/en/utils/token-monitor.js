import fs from 'fs';
import path from 'path';
import { TokenStorage } from './token-storage.js';

/**
 * 토큰 사용량 모니터링 및 임계값 알림을 관리하는 클래스
 */
export class TokenMonitor {
  constructor() {
    this.storage = new TokenStorage();
    this.configFile = '.aiwf/token-data/monitor-config.json';
    this.alertsFile = '.aiwf/token-data/alerts.json';
    this.isEnabled = false;
    this.thresholds = this.loadConfig();
    this.alerts = this.loadAlerts();
    
    this.ensureConfigExists();
  }

  /**
   * 모니터링 설정을 로드합니다
   * @returns {Object} 모니터링 설정
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        this.isEnabled = config.enabled || false;
        return config.thresholds || this.getDefaultThresholds();
      }
    } catch (error) {
      console.error('모니터링 설정 로드 중 오류 발생:', error);
    }
    
    return this.getDefaultThresholds();
  }

  /**
   * 기본 임계값 설정을 반환합니다
   * @returns {Object} 기본 임계값
   */
  getDefaultThresholds() {
    return {
      dailyTokenLimit: 10000,
      sessionTokenLimit: 2000,
      warningThreshold: 80, // 80%에서 경고
      criticalThreshold: 95, // 95%에서 위험 경고
      sessionsPerDayLimit: 20,
      tokensPerCommandLimit: 500
    };
  }

  /**
   * 알림 히스토리를 로드합니다
   * @returns {Array<Object>} 알림 목록
   */
  loadAlerts() {
    try {
      if (fs.existsSync(this.alertsFile)) {
        return JSON.parse(fs.readFileSync(this.alertsFile, 'utf8'));
      }
    } catch (error) {
      console.error('알림 히스토리 로드 중 오류 발생:', error);
    }
    
    return [];
  }

  /**
   * 설정 파일이 존재하는지 확인하고 생성합니다
   */
  ensureConfigExists() {
    try {
      const configDir = path.dirname(this.configFile);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      if (!fs.existsSync(this.configFile)) {
        this.saveConfig();
      }
    } catch (error) {
      console.error('설정 파일 생성 중 오류 발생:', error);
    }
  }

  /**
   * 설정을 저장합니다
   */
  saveConfig() {
    try {
      const config = {
        enabled: this.isEnabled,
        thresholds: this.thresholds,
        lastUpdated: Date.now()
      };
      
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('설정 저장 중 오류 발생:', error);
    }
  }

  /**
   * 알림을 저장합니다
   */
  saveAlerts() {
    try {
      fs.writeFileSync(this.alertsFile, JSON.stringify(this.alerts, null, 2));
    } catch (error) {
      console.error('알림 저장 중 오류 발생:', error);
    }
  }

  /**
   * 모니터링을 활성화/비활성화합니다
   * @param {boolean} enabled - 활성화 여부
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.saveConfig();
    console.log(`토큰 모니터링이 ${enabled ? '활성화' : '비활성화'}되었습니다.`);
  }

  /**
   * 임계값을 설정합니다
   * @param {Object} newThresholds - 새 임계값 설정
   */
  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.saveConfig();
    console.log('임계값이 업데이트되었습니다.');
  }

  /**
   * 현재 토큰 사용량을 확인하고 임계값을 검사합니다
   * @returns {Array<Object>} 임계값 위반 목록
   */
  checkThresholds() {
    if (!this.isEnabled) {
      return [];
    }

    try {
      const violations = this.storage.checkThresholds(this.thresholds);
      
      // 새로운 위반사항에 대해 알림 생성
      for (const violation of violations) {
        if (!this.hasRecentAlert(violation.type)) {
          this.createAlert(violation);
        }
      }
      
      return violations;
    } catch (error) {
      console.error('임계값 확인 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 최근 알림이 있는지 확인합니다
   * @param {string} type - 알림 타입
   * @returns {boolean} 최근 알림 존재 여부
   */
  hasRecentAlert(type) {
    const oneHour = 60 * 60 * 1000;
    const cutoff = Date.now() - oneHour;
    
    return this.alerts.some(alert => 
      alert.type === type && alert.timestamp > cutoff
    );
  }

  /**
   * 새 알림을 생성합니다
   * @param {Object} violation - 위반 정보
   */
  createAlert(violation) {
    try {
      const alert = {
        id: this.generateAlertId(),
        type: violation.type,
        level: this.getAlertLevel(violation),
        message: violation.message,
        threshold: violation.threshold,
        current: violation.current,
        timestamp: Date.now(),
        acknowledged: false
      };
      
      this.alerts.push(alert);
      this.saveAlerts();
      
      // 알림 출력
      this.displayAlert(alert);
      
      // 중요한 알림의 경우 추가 처리
      if (alert.level === 'critical') {
        this.handleCriticalAlert(alert);
      }
    } catch (error) {
      console.error('알림 생성 중 오류 발생:', error);
    }
  }

  /**
   * 알림 ID를 생성합니다
   * @returns {string} 알림 ID
   */
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 알림 레벨을 결정합니다
   * @param {Object} violation - 위반 정보
   * @returns {string} 알림 레벨
   */
  getAlertLevel(violation) {
    const currentPercentage = (violation.current / violation.threshold) * 100;
    
    if (currentPercentage >= this.thresholds.criticalThreshold) {
      return 'critical';
    } else if (currentPercentage >= this.thresholds.warningThreshold) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  /**
   * 알림을 화면에 표시합니다
   * @param {Object} alert - 알림 정보
   */
  displayAlert(alert) {
    const levelEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨'
    };
    
    const emoji = levelEmoji[alert.level] || 'ℹ️';
    const timestamp = new Date(alert.timestamp).toLocaleString();
    
    console.log(`\n${emoji} [${alert.level.toUpperCase()}] ${timestamp}`);
    console.log(`${alert.message}`);
    console.log(`현재: ${alert.current.toLocaleString()}, 임계값: ${alert.threshold.toLocaleString()}`);
    
    if (alert.level === 'critical') {
      console.log('🛑 즉시 조치가 필요합니다!');
    }
    
    console.log('─'.repeat(50));
  }

  /**
   * 위험 알림을 처리합니다
   * @param {Object} alert - 알림 정보
   */
  handleCriticalAlert(alert) {
    try {
      // 위험 알림 로그 파일 생성
      const criticalLogFile = '.aiwf/token-data/critical-alerts.log';
      const logEntry = `[${new Date(alert.timestamp).toISOString()}] ${alert.message}\n`;
      
      fs.appendFileSync(criticalLogFile, logEntry);
      
      // 자동 압축 제안
      if (alert.type === 'daily_token_limit') {
        console.log('\n🔧 자동 압축을 실행하여 토큰 사용량을 줄이시겠습니까?');
        console.log('명령어: aiwf compress --mode aggressive');
      }
      
      // 세션 정리 제안
      if (alert.type === 'daily_session_limit') {
        console.log('\n🧹 오래된 세션을 정리하시겠습니까?');
        console.log('명령어: aiwf cleanup-sessions --older-than 7d');
      }
    } catch (error) {
      console.error('위험 알림 처리 중 오류 발생:', error);
    }
  }

  /**
   * 실시간 모니터링을 시작합니다
   * @param {number} interval - 모니터링 간격 (밀리초)
   */
  startMonitoring(interval = 60000) { // 기본 1분
    if (!this.isEnabled) {
      console.log('모니터링이 비활성화되어 있습니다.');
      return;
    }

    console.log(`토큰 모니터링을 시작합니다 (${interval/1000}초 간격)`);
    
    this.monitoringInterval = setInterval(() => {
      this.checkThresholds();
    }, interval);
  }

  /**
   * 실시간 모니터링을 중지합니다
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('토큰 모니터링을 중지했습니다.');
    }
  }

  /**
   * 알림을 확인 처리합니다
   * @param {string} alertId - 알림 ID
   */
  acknowledgeAlert(alertId) {
    try {
      const alert = this.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedAt = Date.now();
        this.saveAlerts();
        console.log(`알림 ${alertId}를 확인 처리했습니다.`);
      } else {
        console.log(`알림 ${alertId}를 찾을 수 없습니다.`);
      }
    } catch (error) {
      console.error('알림 확인 처리 중 오류 발생:', error);
    }
  }

  /**
   * 모든 알림을 확인 처리합니다
   */
  acknowledgeAllAlerts() {
    try {
      let count = 0;
      for (const alert of this.alerts) {
        if (!alert.acknowledged) {
          alert.acknowledged = true;
          alert.acknowledgedAt = Date.now();
          count++;
        }
      }
      
      this.saveAlerts();
      console.log(`${count}개의 알림을 확인 처리했습니다.`);
    } catch (error) {
      console.error('모든 알림 확인 처리 중 오류 발생:', error);
    }
  }

  /**
   * 미확인 알림을 조회합니다
   * @returns {Array<Object>} 미확인 알림 목록
   */
  getUnacknowledgedAlerts() {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  /**
   * 알림 히스토리를 조회합니다
   * @param {number} limit - 조회할 알림 수
   * @returns {Array<Object>} 알림 목록
   */
  getAlertHistory(limit = 50) {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * 알림 통계를 조회합니다
   * @returns {Object} 알림 통계
   */
  getAlertStats() {
    try {
      const stats = {
        total: this.alerts.length,
        byLevel: { info: 0, warning: 0, critical: 0 },
        byType: {},
        acknowledged: 0,
        recent: 0 // 최근 24시간
      };

      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);

      for (const alert of this.alerts) {
        stats.byLevel[alert.level]++;
        stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
        
        if (alert.acknowledged) {
          stats.acknowledged++;
        }
        
        if (alert.timestamp > dayAgo) {
          stats.recent++;
        }
      }

      return stats;
    } catch (error) {
      console.error('알림 통계 조회 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 오래된 알림을 정리합니다
   * @param {number} daysToKeep - 보관할 일수
   */
  cleanupOldAlerts(daysToKeep = 30) {
    try {
      const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const originalCount = this.alerts.length;
      
      this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
      
      const removedCount = originalCount - this.alerts.length;
      if (removedCount > 0) {
        this.saveAlerts();
        console.log(`${removedCount}개의 오래된 알림을 정리했습니다.`);
      }
    } catch (error) {
      console.error('알림 정리 중 오류 발생:', error);
    }
  }

  /**
   * 모니터링 상태를 조회합니다
   * @returns {Object} 모니터링 상태
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      thresholds: this.thresholds,
      unacknowledgedAlerts: this.getUnacknowledgedAlerts().length,
      totalAlerts: this.alerts.length,
      isRunning: !!this.monitoringInterval,
      lastCheck: this.lastCheck || null
    };
  }

  /**
   * 모니터링 대시보드를 출력합니다
   */
  displayDashboard() {
    console.log('\n=== 토큰 모니터링 대시보드 ===');
    
    const status = this.getStatus();
    const stats = this.getAlertStats();
    
    console.log(`상태: ${status.enabled ? '✅ 활성화' : '❌ 비활성화'}`);
    console.log(`실행 중: ${status.isRunning ? '✅ 예' : '❌ 아니오'}`);
    
    console.log('\n--- 임계값 설정 ---');
    console.log(`일일 토큰 한도: ${status.thresholds.dailyTokenLimit.toLocaleString()}`);
    console.log(`세션 토큰 한도: ${status.thresholds.sessionTokenLimit.toLocaleString()}`);
    console.log(`경고 임계값: ${status.thresholds.warningThreshold}%`);
    console.log(`위험 임계값: ${status.thresholds.criticalThreshold}%`);
    
    console.log('\n--- 알림 통계 ---');
    console.log(`총 알림: ${stats.total}`);
    console.log(`미확인 알림: ${status.unacknowledgedAlerts}`);
    console.log(`최근 24시간: ${stats.recent}`);
    console.log(`위험 알림: ${stats.byLevel.critical}`);
    console.log(`경고 알림: ${stats.byLevel.warning}`);
    
    const unacknowledged = this.getUnacknowledgedAlerts();
    if (unacknowledged.length > 0) {
      console.log('\n--- 미확인 알림 ---');
      unacknowledged.slice(0, 5).forEach(alert => {
        const emoji = alert.level === 'critical' ? '🚨' : 
                     alert.level === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${emoji} ${alert.message}`);
      });
    }
    
    console.log('\n========================\n');
  }
}

export default TokenMonitor;