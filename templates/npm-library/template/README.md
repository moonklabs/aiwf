# {{projectName}}

{{description}}

## 설치

```bash
npm install {{projectName}}
```

## 사용법

### 기본 사용

```typescript
import { AiwfIntegration } from '{{projectName}}';

const aiwf = new AiwfIntegration({
  projectName: 'my-project',
  projectType: 'npm-library',
  features: {
    featureLedger: true,
    contextCompression: true,
    aiPersona: false,
  },
});

// Validate integration
const result = await aiwf.validate();
console.log(result);
```

### Feature Tracking

```typescript
const tracker = aiwf.getFeatureTracker();

// Add a new feature
const feature = tracker.addFeature({
  name: 'New API Endpoint',
  description: 'Add user authentication endpoint',
  type: 'feature',
  status: 'planned',
  tags: ['api', 'auth'],
});

// Update feature status
tracker.updateFeatureStatus(feature.id, 'in_progress');

// Get statistics
const stats = tracker.getStatistics();
console.log(stats); // { total: 1, completed: 0, inProgress: 1, planned: 0 }
```

### Context Compression

```typescript
const contextManager = aiwf.getContextManager();

// Compress content
const compressed = contextManager.compress(largeContent);

// Check token limit
const isWithinLimit = contextManager.checkTokenLimit(content);

// Get token usage
const usage = contextManager.getTokenUsage();
console.log(`Token usage: ${usage.percentage}%`);
```

## API 문서

### AiwfIntegration

메인 통합 클래스입니다.

#### Constructor

```typescript
new AiwfIntegration(config: AiwfConfig)
```

#### Methods

- `getConfig(): AiwfConfig` - 현재 설정 반환
- `getFeatureTracker(): FeatureTracker | undefined` - Feature Tracker 인스턴스
- `getContextManager(): ContextManager | undefined` - Context Manager 인스턴스
- `validate(): Promise<IntegrationResult>` - 통합 유효성 검사

### FeatureTracker

기능 추적을 관리합니다.

#### Methods

- `addFeature(feature: Omit<Feature, 'id' | 'createdAt'>): Feature` - 새 기능 추가
- `updateFeatureStatus(featureId: string, status: Feature['status']): Feature | undefined` - 상태 업데이트
- `getAllFeatures(): Feature[]` - 모든 기능 조회
- `getFeaturesByStatus(status: Feature['status']): Feature[]` - 상태별 기능 조회
- `getStatistics(): Record<string, number>` - 통계 조회
- `exportToJSON(): string` - JSON으로 내보내기

### ContextManager

컨텍스트 압축과 토큰 관리를 담당합니다.

#### Methods

- `compress(content: string): string` - 컨텐츠 압축
- `estimateTokens(content: string): number` - 토큰 수 추정
- `checkTokenLimit(content: string): boolean` - 토큰 한도 확인
- `updateTokenUsage(tokens: number): void` - 토큰 사용량 업데이트
- `getTokenUsage(): { used: number; limit: number; percentage: number }` - 사용량 조회
- `clearCache(): void` - 캐시 초기화
- `getCacheStats(): { size: number; entries: number }` - 캐시 통계

## 타입 정의

```typescript
interface AiwfConfig {
  projectName: string;
  projectType: 'web-app' | 'api-server' | 'npm-library' | 'custom';
  features: {
    featureLedger?: boolean;
    contextCompression?: boolean;
    aiPersona?: boolean;
  };
  options?: Record<string, unknown>;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  type: 'feature' | 'bugfix' | 'enhancement' | 'setup';
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  tags: string[];
  metadata?: Record<string, unknown>;
}
```

## 개발

### 설치

```bash
npm install
```

### 개발 모드

```bash
npm run dev
```

### 테스트

```bash
npm test
npm run test:coverage
```

### 빌드

```bash
npm run build
```

### 릴리즈

```bash
npm run release
```

## AIWF 기능

이 라이브러리는 AIWF와 완벽하게 통합되어 있습니다:

- **Feature Ledger**: 라이브러리 기능 개발 추적
- **Context Compression**: 토큰 사용 최적화
- **AI Persona**: 라이브러리 개발에 특화된 AI 어시스턴트

```bash
npm run aiwf:status    # 프로젝트 상태 확인
npm run aiwf:feature   # Feature 관리
npm run aiwf:version   # 버전 관리
```

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 라이선스

MIT License - see the [LICENSE](LICENSE) file for details