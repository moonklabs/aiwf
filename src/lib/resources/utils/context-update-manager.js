/**
 * 컨텍스트 실시간 업데이트 관리자
 * 페르소나 컨텍스트 파일의 변경을 감지하고 실시간으로 반영하는 모듈
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const chokidar = require('chokidar');
const ContextRuleParser = require('./context-rule-parser');

class ContextUpdateManager extends EventEmitter {
  constructor() {
    super();
    this.contextParser = new ContextRuleParser();
    this.watchers = new Map();
    this.updateQueue = [];
    this.isProcessing = false;
    this.pollingInterval = null;
    this.lastUpdateTimes = new Map();
  }

  /**
   * 컨텍스트 파일 감시 시작
   * @param {Array} personas - 감시할 페르소나 목록
   * @param {Object} options - 감시 옵션
   */
  startWatching(personas = ['architect', 'frontend', 'backend', 'data_analyst', 'security'], options = {}) {
    const watchOptions = {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      },
      ...options
    };

    personas.forEach(persona => {
      const contextPath = path.join(
        process.cwd(),
        '.aiwf',
        '07_AI_PERSONAS',
        persona,
        'context_rules.md'
      );

      try {
        // 파일이 존재하는지 확인
        if (!fs.existsSync(contextPath)) {
          this.createDefaultContextFile(persona, contextPath);
        }

        // Chokidar 감시자 생성
        const watcher = chokidar.watch(contextPath, watchOptions);

        watcher
          .on('change', () => this.handleFileChange(persona, contextPath))
          .on('add', () => this.handleFileAdd(persona, contextPath))
          .on('unlink', () => this.handleFileRemove(persona, contextPath))
          .on('error', error => this.handleWatchError(persona, error));

        this.watchers.set(persona, watcher);
        console.log(`컨텍스트 감시 시작: ${persona}`);
      } catch (error) {
        console.error(`감시 설정 실패 (${persona}):`, error);
        // 폴백: 폴링 방식으로 전환
        this.startPolling(persona, contextPath);
      }
    });

    // 이벤트 리스너 설정
    this.setupEventHandlers();
  }

  /**
   * 기본 컨텍스트 파일 생성
   * @param {string} persona - 페르소나 이름
   * @param {string} filePath - 파일 경로
   */
  createDefaultContextFile(persona, filePath) {
    const defaultContexts = {
      architect: `---
persona_name: architect
analysis_approach: 시스템 설계 중심
design_principles:
  - 확장성
  - 유지보수성
  - 성능
communication_style: 구조적이고 논리적
---

# 아키텍트 페르소나 컨텍스트

## 핵심 역할
시스템 전체 구조를 설계하고 기술적 결정을 내리는 역할을 수행합니다.

## 분석 접근법
- 전체 시스템 관점에서 문제 분석
- 컴포넌트 간 상호작용 고려
- 장기적 확장성과 유지보수성 중시

## 소통 스타일
- 다이어그램과 구조도를 활용한 설명
- 기술적 트레이드오프 명확히 제시
- 단계별 구현 계획 제공`,

      frontend: `---
persona_name: frontend
analysis_approach: UI/UX 중심
design_principles:
  - 사용성
  - 접근성
  - 반응성
communication_style: 시각적이고 직관적
---

# 프론트엔드 페르소나 컨텍스트

## 핵심 역할
사용자 인터페이스와 경험을 설계하고 구현하는 역할을 수행합니다.

## 분석 접근법
- 사용자 관점에서 문제 접근
- 시각적 요소와 인터랙션 중시
- 다양한 디바이스와 브라우저 고려

## 소통 스타일
- 목업과 프로토타입 활용
- 사용자 시나리오 기반 설명
- 직관적이고 이해하기 쉬운 표현`,

      backend: `---
persona_name: backend
analysis_approach: API 및 데이터 처리 중심
design_principles:
  - 보안
  - 효율성
  - 확장성
communication_style: 기술적이고 정확함
---

# 백엔드 페르소나 컨텍스트

## 핵심 역할
서버 사이드 로직과 데이터 처리를 담당하는 역할을 수행합니다.

## 분석 접근법
- 데이터 흐름과 처리 로직 중심
- 성능과 보안 최적화 고려
- API 설계와 데이터베이스 구조 중시

## 소통 스타일
- API 문서와 데이터 스키마 제공
- 기술적 세부사항 명확히 전달
- 성능 지표와 보안 고려사항 강조`,

      data_analyst: `---
persona_name: data_analyst
analysis_approach: 데이터 기반 의사결정
design_principles:
  - 정확성
  - 통찰력
  - 시각화
communication_style: 분석적이고 통계적
---

# 데이터 분석가 페르소나 컨텍스트

## 핵심 역할
데이터를 분석하여 인사이트를 도출하고 의사결정을 지원하는 역할을 수행합니다.

## 분석 접근법
- 정량적 데이터 분석 우선
- 통계적 방법론 적용
- 시각화를 통한 인사이트 전달

## 소통 스타일
- 차트와 그래프 활용
- 데이터 기반 근거 제시
- 객관적이고 중립적인 관점`,

      security: `---
persona_name: security
analysis_approach: 보안 취약점 중심
design_principles:
  - 보안성
  - 무결성
  - 기밀성
communication_style: 신중하고 방어적
---

# 보안 페르소나 컨텍스트

## 핵심 역할
시스템의 보안 취약점을 식별하고 보호 방안을 제시하는 역할을 수행합니다.

## 분석 접근법
- 위협 모델링과 취약점 분석
- 보안 모범 사례 적용
- 컴플라이언스 요구사항 고려

## 소통 스타일
- 위험도 평가와 우선순위 제시
- 구체적인 보안 대책 제안
- 예방적 접근과 지속적 모니터링 강조`
    };

    const content = defaultContexts[persona] || `---
persona_name: ${persona}
analysis_approach: 일반적 접근
design_principles:
  - 품질
  - 효율성
communication_style: 표준적
---

# ${persona} 페르소나 컨텍스트

기본 페르소나 컨텍스트입니다.`;

    // 디렉토리 생성
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 파일 생성
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`기본 컨텍스트 파일 생성: ${persona}`);
  }

  /**
   * 파일 변경 처리
   * @param {string} persona - 페르소나 이름
   * @param {string} filePath - 파일 경로
   */
  async handleFileChange(persona, filePath) {
    console.log(`컨텍스트 변경 감지: ${persona}`);
    
    // 업데이트 큐에 추가
    this.updateQueue.push({
      type: 'change',
      persona,
      filePath,
      timestamp: new Date().toISOString()
    });

    // 큐 처리
    this.processUpdateQueue();
  }

  /**
   * 파일 추가 처리
   * @param {string} persona - 페르소나 이름
   * @param {string} filePath - 파일 경로
   */
  handleFileAdd(persona, filePath) {
    console.log(`컨텍스트 파일 추가: ${persona}`);
    
    this.updateQueue.push({
      type: 'add',
      persona,
      filePath,
      timestamp: new Date().toISOString()
    });

    this.processUpdateQueue();
  }

  /**
   * 파일 제거 처리
   * @param {string} persona - 페르소나 이름
   * @param {string} filePath - 파일 경로
   */
  handleFileRemove(persona, filePath) {
    console.log(`컨텍스트 파일 제거: ${persona}`);
    
    this.updateQueue.push({
      type: 'remove',
      persona,
      filePath,
      timestamp: new Date().toISOString()
    });

    this.processUpdateQueue();
  }

  /**
   * 감시 오류 처리
   * @param {string} persona - 페르소나 이름
   * @param {Error} error - 오류 객체
   */
  handleWatchError(persona, error) {
    console.error(`감시 오류 (${persona}):`, error);
    
    // 폴링으로 전환
    const contextPath = path.join(
      process.cwd(),
      '.aiwf',
      '07_AI_PERSONAS',
      persona,
      'context_rules.md'
    );
    this.startPolling(persona, contextPath);
  }

  /**
   * 폴링 방식으로 파일 감시
   * @param {string} persona - 페르소나 이름
   * @param {string} filePath - 파일 경로
   */
  startPolling(persona, filePath) {
    const pollInterval = 5000; // 5초마다 확인

    const checkFile = async () => {
      try {
        const stats = await fs.promises.stat(filePath);
        const lastModified = stats.mtimeMs;
        const previousModified = this.lastUpdateTimes.get(persona);

        if (previousModified && lastModified !== previousModified) {
          this.handleFileChange(persona, filePath);
        }

        this.lastUpdateTimes.set(persona, lastModified);
      } catch (error) {
        // 파일이 없으면 생성
        if (error.code === 'ENOENT') {
          this.createDefaultContextFile(persona, filePath);
        }
      }
    };

    // 기존 인터벌 정리
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // 새 인터벌 설정
    this.pollingInterval = setInterval(checkFile, pollInterval);
    console.log(`폴링 모드로 전환: ${persona}`);
  }

  /**
   * 업데이트 큐 처리
   */
  async processUpdateQueue() {
    if (this.isProcessing || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.updateQueue.length > 0) {
      const update = this.updateQueue.shift();
      
      try {
        await this.processUpdate(update);
      } catch (error) {
        console.error('업데이트 처리 오류:', error);
        this.emit('error', { update, error });
      }
    }

    this.isProcessing = false;
  }

  /**
   * 개별 업데이트 처리
   * @param {Object} update - 업데이트 정보
   */
  async processUpdate(update) {
    const { type, persona, filePath, timestamp } = update;

    switch (type) {
      case 'change':
      case 'add':
        // 컨텍스트 다시 파싱
        const newContext = await this.contextParser.parseContextRules(persona);
        
        // 캐시 무효화
        this.contextParser.clearCache();
        
        // 이벤트 발생
        this.emit('contextUpdated', {
          persona,
          context: newContext,
          updateType: type,
          timestamp
        });
        
        console.log(`컨텍스트 업데이트 완료: ${persona}`);
        break;

      case 'remove':
        // 기본 컨텍스트로 복원
        this.createDefaultContextFile(persona, filePath);
        
        this.emit('contextRemoved', {
          persona,
          timestamp
        });
        break;
    }
  }

  /**
   * 이벤트 핸들러 설정
   */
  setupEventHandlers() {
    // 컨텍스트 업데이트 시 로깅
    this.on('contextUpdated', (data) => {
      console.log(`[이벤트] 컨텍스트 업데이트: ${data.persona} (${data.updateType})`);
    });

    // 오류 발생 시 로깅
    this.on('error', (data) => {
      console.error(`[이벤트] 오류 발생:`, data.error);
    });
  }

  /**
   * 모든 감시 중지
   */
  stopWatching() {
    // Chokidar 감시자 정리
    this.watchers.forEach((watcher, persona) => {
      watcher.close();
      console.log(`감시 중지: ${persona}`);
    });
    this.watchers.clear();

    // 폴링 인터벌 정리
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    // 큐 초기화
    this.updateQueue = [];
    this.isProcessing = false;
  }

  /**
   * 특정 페르소나 감시 중지
   * @param {string} persona - 페르소나 이름
   */
  stopWatchingPersona(persona) {
    const watcher = this.watchers.get(persona);
    if (watcher) {
      watcher.close();
      this.watchers.delete(persona);
      console.log(`감시 중지: ${persona}`);
    }
  }

  /**
   * 감시 상태 확인
   * @returns {Object} 감시 상태 정보
   */
  getWatchStatus() {
    const activeWatchers = Array.from(this.watchers.keys());
    const queueLength = this.updateQueue.length;
    const isPolling = this.pollingInterval !== null;

    return {
      activeWatchers,
      watcherCount: activeWatchers.length,
      queueLength,
      isProcessing: this.isProcessing,
      isPolling,
      lastUpdateTimes: Object.fromEntries(this.lastUpdateTimes)
    };
  }

  /**
   * 강제 업데이트 트리거
   * @param {string} persona - 페르소나 이름
   */
  forceUpdate(persona) {
    const contextPath = path.join(
      process.cwd(),
      '.aiwf',
      '07_AI_PERSONAS',
      persona,
      'context_rules.md'
    );

    this.handleFileChange(persona, contextPath);
  }

  /**
   * 모든 페르소나 강제 업데이트
   */
  forceUpdateAll() {
    const personas = Array.from(this.watchers.keys());
    personas.forEach(persona => this.forceUpdate(persona));
  }
}

module.exports = ContextUpdateManager;