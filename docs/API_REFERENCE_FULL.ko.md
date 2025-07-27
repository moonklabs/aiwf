# AIWF 전체 API 참조

[Read in English](API_REFERENCE_FULL.md)

## 목차

1. [핵심 API](#핵심-api)
   - [리소스 로더](#리소스-로더)
   - [상태 관리](#상태-관리)
   - [템플릿 시스템](#템플릿-시스템)
2. [명령어 API](#명령어-api)
   - [AI 도구 명령어](#ai-도구-명령어)
   - [압축 명령어](#압축-명령어)
   - [프로젝트 생성](#프로젝트-생성)
   - [평가 명령어](#평가-명령어)
   - [기능 명령어](#기능-명령어)
   - [페르소나 명령어](#페르소나-명령어)
   - [상태 명령어](#상태-명령어)
   - [토큰 명령어](#토큰-명령어)
   - [YOLO 설정](#yolo-설정)
3. [유틸리티 API](#유틸리티-api)
   - [체크포인트 관리자](#체크포인트-관리자)
   - [Git 유틸리티](#git-유틸리티)
   - [토큰 카운터](#토큰-카운터)
   - [텍스트 프로세서](#텍스트-프로세서)
4. [플러그인 API](#플러그인-api)
   - [플러그인 인터페이스](#플러그인-인터페이스)
   - [훅 시스템](#훅-시스템)
5. [AI 통합 API](#ai-통합-api)
   - [페르소나 관리자](#페르소나-관리자)
   - [압축 엔진](#압축-엔진)
   - [평가 시스템](#평가-시스템)

---

## 핵심 API

### 리소스 로더

리소스 로더는 모든 프레임워크 리소스를 관리하며, 번들된 리소스와 사용자 리소스에 대한 통합 인터페이스를 제공합니다.

#### 클래스: `ResourceLoader`

```javascript
import { ResourceLoader } from 'aiwf/lib/resource-loader';
```

##### 생성자

```javascript
new ResourceLoader(options?: ResourceLoaderOptions)
```

**옵션:**
```typescript
interface ResourceLoaderOptions {
  bundledPath?: string;      // 번들된 리소스 경로
  userPath?: string;         // 사용자 리소스 경로
  preferUserResources?: boolean; // 사용자 리소스 우선 (기본값: true)
}
```

##### 메서드

###### `resolvePath(resourceType, resourceName)`

리소스 경로를 확인합니다. 사용자 디렉토리를 먼저 확인한 후 번들된 리소스를 확인합니다.

```javascript
async resolvePath(resourceType: string, resourceName: string): Promise<string>
```

**예제:**
```javascript
const loader = new ResourceLoader();
const personaPath = await loader.resolvePath('personas', 'analyst.json');
```

###### `loadResource(resourceType, resourceName)`

리소스 파일을 로드하고 파싱합니다.

```javascript
async loadResource(resourceType: string, resourceName: string): Promise<any>
```

**지원 형식:**
- JSON (`.json`)
- YAML (`.yaml`, `.yml`)
- JavaScript 모듈 (`.js`)
- Markdown (`.md`)

###### `listResources(resourceType)`

특정 유형의 모든 사용 가능한 리소스를 나열합니다.

```javascript
async listResources(resourceType: string): Promise<string[]>
```

###### `copyResource(resourceType, resourceName, destination)`

리소스를 지정된 위치로 복사합니다.

```javascript
async copyResource(
  resourceType: string, 
  resourceName: string, 
  destination: string
): Promise<void>
```

### 상태 관리

체크포인트와 원자적 업데이트를 지원하는 애플리케이션 및 프로젝트 상태를 관리합니다.

#### 클래스: `StateIndexManager`

```javascript
import { StateIndexManager } from 'aiwf/lib/state/state-index';
```

##### 생성자

```javascript
new StateIndexManager(aiwfPath: string)
```

##### 메서드

###### `loadState()`

디스크에서 현재 상태를 로드합니다.

```javascript
async loadState(): Promise<StateIndex>
```

**반환값:**
```typescript
interface StateIndex {
  version: string;
  last_updated: string;
  last_updated_by: string;
  project_info: ProjectInfo;
  milestones: Milestone[];
  sprints: Sprint[];
  tasks: Task[];
  workflow_mode: WorkflowMode;
}
```

###### `saveState(state)`

자동 백업과 함께 상태를 디스크에 저장합니다.

```javascript
async saveState(state: StateIndex): Promise<void>
```

###### `updateProjectInfo(updates)`

프로젝트 정보를 업데이트합니다.

```javascript
async updateProjectInfo(updates: Partial<ProjectInfo>): Promise<void>
```

###### `addMilestone(milestone)`

프로젝트에 새 마일스톤을 추가합니다.

```javascript
async addMilestone(milestone: Milestone): Promise<void>
```

### 템플릿 시스템

프로젝트 템플릿과 코드 생성을 관리합니다.

#### 클래스: `TemplateEngine`

```javascript
import { TemplateEngine } from 'aiwf/lib/template-engine';
```

##### 메서드

###### `listTemplates()`

사용 가능한 모든 프로젝트 템플릿을 나열합니다.

```javascript
async listTemplates(): Promise<TemplateInfo[]>
```

###### `createFromTemplate(templateName, targetPath, variables)`

템플릿에서 새 프로젝트를 생성합니다.

```javascript
async createFromTemplate(
  templateName: string,
  targetPath: string,
  variables: Record<string, string>
): Promise<void>
```

**예제:**
```javascript
const engine = new TemplateEngine();
await engine.createFromTemplate('api-server', './my-api', {
  projectName: '내 API',
  author: '홍길동',
  description: '멋진 API 서버'
});
```

---

## 명령어 API

### AI 도구 명령어

AI 도구 통합과 구성을 관리합니다.

#### 클래스: `AIToolCommand`

```javascript
import AIToolCommand from 'aiwf/commands/ai-tool';
```

##### 메서드

###### `execute(args)`

AI 도구 명령을 실행합니다.

```javascript
async execute(args: string[]): Promise<void>
```

**하위 명령어:**
- `list` - 사용 가능한 모든 AI 도구 나열
- `activate <tool>` - AI 도구 활성화
- `configure <tool>` - AI 도구 구성
- `status` - 현재 AI 도구 상태 표시

### 압축 명령어

컨텍스트 최적화를 위한 다양한 압축 전략을 제공합니다.

#### 함수

###### `compress(mode, content, options)`

지정된 전략을 사용하여 콘텐츠를 압축합니다.

```javascript
async compress(
  mode: CompressionMode,
  content: string,
  options?: CompressionOptions
): Promise<string>
```

**압축 모드:**
- `simple` - 기본 공백 및 주석 제거
- `moderate` - 균형 잡힌 압축
- `aggressive` - 최대 압축
- `custom` - 사용자 정의 규칙

**옵션:**
```typescript
interface CompressionOptions {
  preserveComments?: boolean;
  preserveWhitespace?: boolean;
  maxLineLength?: number;
  customRules?: CompressionRule[];
}
```

### 프로젝트 생성

템플릿에서 새 AIWF 프로젝트를 생성합니다.

#### 함수: `createProject`

```javascript
async createProject(options: CreateProjectOptions): Promise<void>
```

**옵션:**
```typescript
interface CreateProjectOptions {
  template: string;
  name: string;
  path?: string;
  variables?: Record<string, string>;
  skipInstall?: boolean;
  gitInit?: boolean;
}
```

### 평가 명령어

AI 응답과 코드 품질을 평가합니다.

#### 클래스: `EvaluateCommand`

##### 메서드

###### `evaluateResponse(file, options)`

AI 응답의 품질을 평가합니다.

```javascript
async evaluateResponse(
  file: string, 
  options?: EvaluationOptions
): Promise<EvaluationResult>
```

###### `evaluateCode(file, options)`

코드 품질과 모범 사례를 평가합니다.

```javascript
async evaluateCode(
  file: string,
  options?: CodeEvaluationOptions
): Promise<CodeEvaluationResult>
```

### 기능 명령어

기능 추적과 개발 워크플로우를 관리합니다.

#### 함수

###### `createFeature(name, description)`

새 기능 항목을 생성합니다.

```javascript
async createFeature(
  name: string, 
  description?: string
): Promise<FeatureEntry>
```

###### `updateFeatureStatus(id, status)`

기능의 상태를 업데이트합니다.

```javascript
async updateFeatureStatus(
  id: string,
  status: FeatureStatus
): Promise<void>
```

**기능 상태:**
- `planned` - 계획됨
- `in-progress` - 진행 중
- `testing` - 테스트 중
- `completed` - 완료됨
- `deployed` - 배포됨

### 페르소나 명령어

AI 페르소나와 구성을 관리합니다.

#### 클래스: `PersonaCommand`

##### 메서드

###### `listPersonas()`

사용 가능한 모든 페르소나를 나열합니다.

```javascript
async listPersonas(): Promise<PersonaInfo[]>
```

###### `activatePersona(name)`

특정 페르소나를 활성화합니다.

```javascript
async activatePersona(name: string): Promise<void>
```

###### `createPersona(name, config)`

커스텀 페르소나를 생성합니다.

```javascript
async createPersona(
  name: string,
  config: PersonaConfig
): Promise<void>
```

### 상태 명령어

프로젝트 상태와 워크플로우 전환을 관리합니다.

#### 클래스: `StateCommand`

##### 메서드

###### `showStatus()`

현재 프로젝트 상태를 표시합니다.

```javascript
async showStatus(): Promise<StateStatus>
```

###### `checkpoint(name, description)`

상태 체크포인트를 생성합니다.

```javascript
async checkpoint(
  name: string,
  description?: string
): Promise<CheckpointInfo>
```

###### `restore(checkpointId)`

체크포인트에서 복원합니다.

```javascript
async restore(checkpointId: string): Promise<void>
```

### 토큰 명령어

AI 토큰 사용량을 모니터링하고 관리합니다.

#### 함수

###### `trackUsage(input, output, model)`

토큰 사용량을 기록합니다.

```javascript
async trackUsage(
  input: string,
  output: string,
  model?: string
): Promise<UsageRecord>
```

###### `getUsageReport(period)`

사용량 보고서를 생성합니다.

```javascript
async getUsageReport(
  period?: 'day' | 'week' | 'month'
): Promise<UsageReport>
```

### YOLO 설정

YOLO 모드 구성을 관리합니다.

#### 함수

###### `createYoloConfig(options)`

YOLO 구성 파일을 생성합니다.

```javascript
async createYoloConfig(options?: YoloOptions): Promise<void>
```

###### `createInteractiveYoloConfig()`

대화형 프롬프트를 통해 구성을 생성합니다.

```javascript
async createInteractiveYoloConfig(): Promise<void>
```

---

## 유틸리티 API

### 엔지니어링 가드

자율 실행 중 오버엔지니어링을 방지하고 코드 품질을 유지합니다.

#### 클래스: `EngineeringGuard`

```javascript
import { EngineeringGuard } from 'aiwf/utils/engineering-guard';
```

##### 생성자

```javascript
new EngineeringGuard(configPath?: string)
```

##### 메서드

###### `checkFileComplexity(filePath)`

단일 파일의 복잡성 위반을 검사합니다.

```javascript
async checkFileComplexity(filePath: string): Promise<void>
```

###### `checkProject(projectPath, filePatterns)`

프로젝트 전체의 포괄적인 복잡성 분석을 수행합니다.

```javascript
async checkProject(
  projectPath: string,
  filePatterns?: string[]
): Promise<GuardReport>
```

**반환값:**
```typescript
interface GuardReport {
  passed: boolean;
  violations: Violation[];
  warnings: Warning[];
  summary: {
    total_violations: number;
    high_severity: number;
    medium_severity: number;
    warnings: number;
  };
  recommendations: string[];
}
```

###### `provideFeedback(filePath, content)`

개발 중 실시간 피드백을 제공합니다.

```javascript
async provideFeedback(
  filePath: string,
  content?: string
): Promise<Feedback[]>
```

###### `generateReport()`

포괄적인 분석 리포트를 생성합니다.

```javascript
generateReport(): GuardReport
```

### 체크포인트 관리자

상태 체크포인트와 복구를 관리합니다.

#### 클래스: `CheckpointManager`

```javascript
import { CheckpointManager } from 'aiwf/utils/checkpoint-manager';
```

##### 생성자

```javascript
new CheckpointManager(projectRoot: string)
```

##### 메서드

###### `startSession(sprintId, mode)`

추적과 함께 새 YOLO 세션을 시작합니다.

```javascript
async startSession(sprintId: string, mode?: string): Promise<void>
```

###### `startTask(taskId, taskInfo)`

특정 태스크 추적을 시작합니다.

```javascript
async startTask(taskId: string, taskInfo?: any): Promise<void>
```

###### `completeTask(taskId, result)`

태스크를 결과와 함께 완료된 것으로 표시합니다.

```javascript
async completeTask(taskId: string, result?: any): Promise<void>
```

###### `createCheckpoint(type, metadata)`

새 체크포인트를 생성합니다.

```javascript
async createCheckpoint(
  type?: string,
  metadata?: CheckpointMetadata
): Promise<string>
```

###### `listCheckpoints()`

사용 가능한 모든 체크포인트를 나열합니다.

```javascript
async listCheckpoints(): Promise<CheckpointInfo[]>
```

###### `restoreFromCheckpoint(checkpointId)`

특정 체크포인트에서 복원합니다.

```javascript
async restoreFromCheckpoint(checkpointId: string): Promise<RestoreResult>
```

**반환값:**
```typescript
interface RestoreResult {
  success: boolean;
  checkpoint: Checkpoint;
  tasks_to_resume: {
    completed: string[];
    current: string | null;
    next_task_hint: string;
  };
}
```

###### `generateProgressReport()`

포괄적인 진행률 리포트를 생성합니다.

```javascript
async generateProgressReport(): Promise<ProgressReport>
```

**반환값:**
```typescript
interface ProgressReport {
  session: {
    id: string;
    started: string;
    sprint: string;
    mode: string;
  };
  progress: {
    completed: number;
    failed: number;
    skipped: number;
    current: string;
  };
  performance: {
    total_time: string;
    avg_task_time: string;
    success_rate: string;
  };
  checkpoints: CheckpointInfo[];
  recommendations: string[];
}
```

###### `endSession(summary)`

현재 세션을 종료하고 최종 리포트를 생성합니다.

```javascript
async endSession(summary?: any): Promise<ProgressReport>
```

### Git 유틸리티

Git 통합 유틸리티를 제공합니다.

#### 함수

###### `parseCommitMessage(message)`

구조화된 커밋 메시지를 파싱합니다.

```javascript
parseCommitMessage(message: string): ParsedCommit
```

**반환값:**
```typescript
interface ParsedCommit {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  features?: string[];
  tasks?: string[];
}
```

###### `getRecentCommits(limit)`

최근 커밋 기록을 가져옵니다.

```javascript
async getRecentCommits(limit?: number): Promise<Commit[]>
```

### 토큰 카운터

다양한 AI 모델의 토큰을 계산합니다.

#### 함수

###### `countTokens(text, model)`

텍스트의 토큰을 계산합니다.

```javascript
countTokens(text: string, model?: string): number
```

**지원 모델:**
- `gpt-3.5-turbo`
- `gpt-4`
- `claude`
- `claude-instant`

###### `estimateCost(tokens, model)`

토큰 수를 기반으로 비용을 추정합니다.

```javascript
estimateCost(tokens: number, model: string): number
```

### 텍스트 프로세서

다양한 텍스트 처리 유틸리티입니다.

#### 함수

###### `summarizeText(text, maxLength)`

텍스트의 요약을 생성합니다.

```javascript
async summarizeText(
  text: string,
  maxLength?: number
): Promise<string>
```

###### `extractKeywords(text)`

텍스트에서 키워드를 추출합니다.

```javascript
extractKeywords(text: string): string[]
```

###### `normalizeWhitespace(text)`

텍스트의 공백을 정규화합니다.

```javascript
normalizeWhitespace(text: string): string
```

---

## 플러그인 API

### 플러그인 인터페이스

AIWF 플러그인의 표준 인터페이스입니다.

#### 인터페이스: `AIWFPlugin`

```typescript
interface AIWFPlugin {
  name: string;
  version: string;
  description?: string;
  
  // 생명주기 훅
  init?(context: PluginContext): Promise<void>;
  destroy?(): Promise<void>;
  
  // 명령어 훅
  commands?: Record<string, CommandHandler>;
  
  // 이벤트 훅
  hooks?: Record<string, HookHandler>;
}
```

#### 플러그인 컨텍스트

```typescript
interface PluginContext {
  aiwfPath: string;
  projectRoot: string;
  config: AIWFConfig;
  logger: Logger;
  
  // 핵심 서비스
  resourceLoader: ResourceLoader;
  stateManager: StateIndexManager;
  templateEngine: TemplateEngine;
}
```

### 훅 시스템

이벤트 기반 확장 시스템입니다.

#### 사용 가능한 훅

##### 명령어 생명주기

```javascript
hooks: {
  'before-command': async (command, args) => { /* ... */ },
  'after-command': async (command, result) => { /* ... */ },
  'command-error': async (command, error) => { /* ... */ }
}
```

##### 상태 관리

```javascript
hooks: {
  'before-state-change': async (oldState, newState) => { /* ... */ },
  'after-state-change': async (oldState, newState) => { /* ... */ },
  'state-checkpoint': async (checkpoint) => { /* ... */ }
}
```

##### 리소스 로딩

```javascript
hooks: {
  'before-resource-load': async (type, name) => { /* ... */ },
  'after-resource-load': async (type, name, content) => { /* ... */ },
  'resource-not-found': async (type, name) => { /* ... */ }
}
```

---

## AI 통합 API

### 페르소나 관리자

AI 페르소나 구성과 컨텍스트를 관리합니다.

#### 클래스: `AIPersonaManager`

```javascript
import { AIPersonaManager } from 'aiwf/lib/ai-persona-manager';
```

##### 메서드

###### `loadPersona(name)`

페르소나 구성을 로드합니다.

```javascript
async loadPersona(name: string): Promise<Persona>
```

###### `applyPersona(content, persona)`

콘텐츠에 페르소나 컨텍스트를 적용합니다.

```javascript
applyPersona(content: string, persona: Persona): string
```

###### `validatePersona(persona)`

페르소나 구성을 검증합니다.

```javascript
validatePersona(persona: Persona): ValidationResult
```

### 압축 엔진

지능적인 콘텐츠 압축을 제공합니다.

#### 클래스: `CompressionEngine`

##### 메서드

###### `compress(content, strategy)`

지정된 전략을 사용하여 콘텐츠를 압축합니다.

```javascript
async compress(
  content: string,
  strategy: CompressionStrategy
): Promise<CompressedContent>
```

###### `decompress(compressed)`

콘텐츠를 압축 해제합니다.

```javascript
async decompress(compressed: CompressedContent): Promise<string>
```

###### `analyzeCompression(content)`

잠재적인 압축 절감 효과를 분석합니다.

```javascript
analyzeCompression(content: string): CompressionAnalysis
```

### 평가 시스템

AI 응답과 코드 품질을 평가합니다.

#### 클래스: `EvaluationSystem`

##### 메서드

###### `evaluateQuality(content, criteria)`

콘텐츠 품질을 평가합니다.

```javascript
async evaluateQuality(
  content: string,
  criteria?: EvaluationCriteria
): Promise<QualityScore>
```

###### `compareResponses(responses)`

여러 AI 응답을 비교합니다.

```javascript
compareResponses(responses: string[]): ComparisonResult
```

###### `generateReport(evaluations)`

평가 보고서를 생성합니다.

```javascript
generateReport(evaluations: Evaluation[]): EvaluationReport
```

---

## 오류 처리

모든 AIWF API는 일관된 오류 처리 패턴을 따릅니다:

```javascript
try {
  const result = await aiwfApi.someMethod();
} catch (error) {
  if (error.code === 'RESOURCE_NOT_FOUND') {
    // 누락된 리소스 처리
  } else if (error.code === 'VALIDATION_ERROR') {
    // 검증 오류 처리
    console.error(error.details);
  } else {
    // 예상치 못한 오류 처리
    throw error;
  }
}
```

### 오류 코드

- `RESOURCE_NOT_FOUND` - 요청한 리소스를 찾을 수 없음
- `VALIDATION_ERROR` - 입력 검증 실패
- `STATE_CONFLICT` - 상태 작업 충돌
- `PERMISSION_DENIED` - 권한 부족
- `NETWORK_ERROR` - 네트워크 작업 실패
- `TIMEOUT` - 작업 시간 초과

---

## 모범 사례

### 리소스 관리

1. 프레임워크 리소스 접근 시 항상 ResourceLoader 사용
2. I/O 작업에는 비동기 메서드 선호
3. 리소스를 찾을 수 없는 오류를 우아하게 처리
4. 가능한 경우 비용이 많이 드는 작업을 캐시

### 상태 관리

1. 충돌 방지를 위해 원자적 상태 업데이트 사용
2. 주요 작업 전에 체크포인트 생성
3. 상태 전환 검증
4. 동시 수정 처리

### 오류 처리

1. 다양한 시나리오에 대한 구체적인 오류 코드 사용
2. 의미 있는 오류 메시지 제공
3. 오류 세부 정보에 컨텍스트 포함
4. 적절한 오류 로깅

### 성능

1. 대용량 파일에는 스트리밍 사용
2. 목록에 페이지네이션 구현
3. 자주 액세스하는 데이터 캐시
4. 메모리 사용량 모니터링

---

## 예제

### 커스텀 명령어 생성

```javascript
import { ResourceLoader } from 'aiwf/lib/resource-loader';
import { StateIndexManager } from 'aiwf/lib/state/state-index';

export default class CustomCommand {
  constructor() {
    this.loader = new ResourceLoader();
    this.stateManager = new StateIndexManager('.aiwf');
  }

  async execute(args) {
    // 현재 상태 로드
    const state = await this.stateManager.loadState();
    
    // 작업 수행
    // ...
    
    // 업데이트된 상태 저장
    await this.stateManager.saveState(state);
  }
}
```

### 플러그인 생성

```javascript
export default {
  name: 'my-plugin',
  version: '1.0.0',
  
  async init(context) {
    this.logger = context.logger;
    this.logger.info('내 플러그인이 초기화되었습니다');
  },
  
  commands: {
    'my-command': {
      description: '내 커스텀 명령어',
      handler: async (args, options) => {
        // 명령어 구현
      }
    }
  },
  
  hooks: {
    'after-state-change': async (oldState, newState) => {
      this.logger.info('상태가 변경되었습니다', { 
        from: oldState.workflow_mode,
        to: newState.workflow_mode 
      });
    }
  }
};
```

### 압축 엔진 사용

```javascript
import { CompressionEngine } from 'aiwf/utils/compression-engine';

const engine = new CompressionEngine();

// 압축 전 분석
const analysis = engine.analyzeCompression(largeContent);
console.log(`잠재적 절감: ${analysis.savingsPercent}%`);

// 특정 전략으로 압축
const compressed = await engine.compress(largeContent, {
  strategy: 'aggressive',
  preserveStructure: true
});

// 나중에 압축 해제
const original = await engine.decompress(compressed);
```

---

## 버전 히스토리

- **v0.3.x** - 현재 안정 버전
  - 완전한 API 재설계
  - 플러그인 시스템 도입
  - 향상된 상태 관리
  
- **v0.2.x** - 레거시 버전
  - 기본 명령어 구조
  - 초기 리소스 로더
  
- **v0.1.x** - 초기 릴리스
  - 핵심 프레임워크 설정

자세한 변경 로그는 [CHANGELOG.md](../CHANGELOG.md)를 참조하세요.