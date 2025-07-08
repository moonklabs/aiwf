import fs from 'fs';
import path from 'path';
import { TokenCounter } from './token-counter.js';

/**
 * 세션별 토큰 사용량을 추적하는 클래스
 */
export class TokenTracker {
  constructor(sessionDir = '.aiwf/sessions') {
    this.sessionDir = sessionDir;
    this.sessionId = this.generateSessionId();
    this.counter = new TokenCounter();
    this.usage = {
      total: 0,
      compressed: 0,
      saved: 0,
      ratio: 0
    };
    this.sessionData = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      totalTokens: 0,
      commands: [],
      lastUpdated: Date.now()
    };
    
    this.ensureSessionDirectory();
    this.loadSession();
  }

  /**
   * 세션 ID를 생성합니다
   * @returns {string} 세션 ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }

  /**
   * 세션 디렉토리를 생성합니다
   */
  ensureSessionDirectory() {
    try {
      if (!fs.existsSync(this.sessionDir)) {
        fs.mkdirSync(this.sessionDir, { recursive: true });
      }
    } catch (error) {
      console.error('세션 디렉토리 생성 중 오류 발생:', error);
    }
  }

  /**
   * 세션 데이터를 로드합니다
   */
  loadSession() {
    try {
      const sessionFile = path.join(this.sessionDir, `${this.sessionId}.json`);
      
      if (fs.existsSync(sessionFile)) {
        const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        this.sessionData = { ...this.sessionData, ...data };
      }
    } catch (error) {
      console.error('세션 로드 중 오류 발생:', error);
    }
  }

  /**
   * 세션 데이터를 저장합니다
   */
  saveSession() {
    try {
      const sessionFile = path.join(this.sessionDir, `${this.sessionId}.json`);
      this.sessionData.lastUpdated = Date.now();
      
      fs.writeFileSync(sessionFile, JSON.stringify(this.sessionData, null, 2));
    } catch (error) {
      console.error('세션 저장 중 오류 발생:', error);
    }
  }

  /**
   * 명령어 실행 토큰 사용량을 추적합니다
   * @param {string} command - 실행된 명령어
   * @param {string} input - 입력 텍스트
   * @param {string} output - 출력 텍스트
   */
  trackCommand(command, input = '', output = '') {
    try {
      const inputTokens = this.counter.countTokens(input);
      const outputTokens = this.counter.countTokens(output);
      const totalTokens = inputTokens + outputTokens;

      const commandEntry = {
        timestamp: Date.now(),
        command,
        inputTokens,
        outputTokens,
        totalTokens
      };

      this.sessionData.commands.push(commandEntry);
      this.sessionData.totalTokens += totalTokens;

      this.saveSession();
      
      return commandEntry;
    } catch (error) {
      console.error('명령어 토큰 추적 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 압축 전후 토큰 수를 기록합니다
   * @param {number} originalTokens - 원본 토큰 수
   * @param {number} compressedTokens - 압축된 토큰 수
   */
  trackCompression(originalTokens, compressedTokens) {
    try {
      this.usage.total = originalTokens;
      this.usage.compressed = compressedTokens;
      this.usage.saved = originalTokens - compressedTokens;
      this.usage.ratio = originalTokens > 0 ? (this.usage.saved / originalTokens) * 100 : 0;

      // 세션 데이터에 압축 정보 추가
      if (!this.sessionData.compressions) {
        this.sessionData.compressions = [];
      }

      this.sessionData.compressions.push({
        timestamp: Date.now(),
        originalTokens,
        compressedTokens,
        savedTokens: this.usage.saved,
        ratio: this.usage.ratio
      });

      this.saveSession();
    } catch (error) {
      console.error('압축 토큰 추적 중 오류 발생:', error);
    }
  }

  /**
   * 토큰 사용량 보고서를 생성합니다
   * @returns {Object} 토큰 사용량 보고서
   */
  generateReport() {
    try {
      const sessionDuration = Date.now() - this.sessionData.startTime;
      const avgTokensPerCommand = this.sessionData.commands.length > 0 
        ? this.sessionData.totalTokens / this.sessionData.commands.length 
        : 0;

      return {
        sessionId: this.sessionId,
        sessionDuration: this.formatDuration(sessionDuration),
        totalCommands: this.sessionData.commands.length,
        totalTokens: this.sessionData.totalTokens,
        avgTokensPerCommand: Math.round(avgTokensPerCommand),
        compressionStats: this.usage.total > 0 ? {
          originalTokens: this.usage.total,
          compressedTokens: this.usage.compressed,
          savedTokens: this.usage.saved,
          compressionRatio: this.usage.ratio.toFixed(2) + '%',
          efficiency: this.usage.ratio >= 50 ? 'High' : this.usage.ratio >= 25 ? 'Medium' : 'Low'
        } : null,
        recentCommands: this.sessionData.commands.slice(-5),
        startTime: new Date(this.sessionData.startTime).toLocaleString(),
        lastUpdated: new Date(this.sessionData.lastUpdated).toLocaleString()
      };
    } catch (error) {
      console.error('보고서 생성 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 시간 간격을 사람이 읽기 쉬운 형태로 변환합니다
   * @param {number} ms - 밀리초
   * @returns {string} 포맷된 시간
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    } else {
      return `${seconds}초`;
    }
  }

  /**
   * 세션 통계를 조회합니다
   * @returns {Object} 세션 통계
   */
  getSessionStats() {
    try {
      return {
        sessionId: this.sessionId,
        totalTokens: this.sessionData.totalTokens,
        commandCount: this.sessionData.commands.length,
        sessionDuration: Date.now() - this.sessionData.startTime,
        lastActivity: this.sessionData.lastUpdated
      };
    } catch (error) {
      console.error('세션 통계 조회 중 오류 발생:', error);
      return null;
    }
  }

  /**
   * 모든 세션 데이터를 조회합니다
   * @returns {Array<Object>} 세션 목록
   */
  getAllSessions() {
    try {
      const sessions = [];
      const files = fs.readdirSync(this.sessionDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const sessionData = JSON.parse(
            fs.readFileSync(path.join(this.sessionDir, file), 'utf8')
          );
          sessions.push(sessionData);
        }
      }
      
      return sessions.sort((a, b) => b.startTime - a.startTime);
    } catch (error) {
      console.error('세션 목록 조회 중 오류 발생:', error);
      return [];
    }
  }

  /**
   * 오래된 세션을 정리합니다
   * @param {number} daysToKeep - 보관할 일수 (기본: 7일)
   */
  cleanupOldSessions(daysToKeep = 7) {
    try {
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const files = fs.readdirSync(this.sessionDir);
      let deletedCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.sessionDir, file);
          const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          if (sessionData.startTime < cutoffTime) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
      }
      
      console.log(`${deletedCount}개의 오래된 세션을 정리했습니다.`);
    } catch (error) {
      console.error('세션 정리 중 오류 발생:', error);
    }
  }

  /**
   * 리소스를 정리합니다
   */
  cleanup() {
    this.saveSession();
    if (this.counter) {
      this.counter.cleanup();
    }
  }
}

export default TokenTracker;