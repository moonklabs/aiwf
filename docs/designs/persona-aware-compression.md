# 페르소나 인식 컨텍스트 압축

## 개요

AIWF의 페르소나 인식 압축 기능은 현재 활성화된 AI 페르소나의 특성을 고려하여 컨텍스트를 최적화합니다. 각 페르소나의 관심 영역과 중요 패턴을 보존하면서 효율적인 압축을 수행합니다.

## 주요 기능

### 1. 페르소나별 압축 전략

각 페르소나는 고유한 압축 전략을 가집니다:

#### Architect 페르소나
- **보존 패턴**: 시스템, 아키텍처, 설계, 구조, 패턴, 확장성
- **포커스**: 시스템 설계와 아키텍처 패턴
- **압축 가중치**:
  - 설계 개념: 90% 보존
  - 구현 세부사항: 30% 보존
  - 이론적 내용: 80% 보존

#### Security 페르소나
- **보존 패턴**: 보안, 취약점, 위협, 암호화, 인증, 권한
- **포커스**: 보안 위협과 취약점 분석
- **압축 가중치**:
  - 보안 경고: 100% 보존
  - 취약점 세부사항: 100% 보존
  - 일반 정보: 40% 압축

#### Frontend 페르소나
- **보존 패턴**: UI, UX, 사용자, 화면, 컴포넌트, 스타일
- **포커스**: 사용자 인터페이스와 경험
- **압축 가중치**:
  - 시각적 설명: 80% 보존
  - 스타일링 정보: 90% 보존
  - 백엔드 세부사항: 20% 보존

#### Backend 페르소나
- **보존 패턴**: API, 데이터베이스, 서버, 성능, 트랜잭션
- **포커스**: API 설계와 데이터 처리
- **압축 가중치**:
  - API 명세: 90% 보존
  - 데이터베이스 스키마: 80% 보존
  - 성능 지표: 90% 보존

#### Data Analyst 페르소나
- **보존 패턴**: 데이터, 분석, 통계, 지표, 시각화, 인사이트
- **포커스**: 데이터 분석과 인사이트 도출
- **압축 가중치**:
  - 인사이트: 100% 보존
  - 데이터 설명: 90% 보존
  - 원시 데이터: 30% 압축

### 2. 지능형 압축 알고리즘

#### 섹션 관련성 분석
- 페르소나 키워드 매칭
- 포커스 영역 확인
- 헤더 레벨 가중치 적용

#### 중요도 기반 압축
- 평균 이상 중요도: 전체 보존
- 평균 미만: 부분 압축
- 낮은 중요도: 요약으로 대체

#### 페르소나 특화 요약
Aggressive 모드에서 페르소나 관점의 요약 생성:
```markdown
---
### [페르소나명] 관점 요약

주요 내용 ([포커스 영역]):
- 핵심 포인트 1
- 핵심 포인트 2
---
```

## 사용 방법

### 기본 사용
```bash
# 페르소나 인식 압축 (balanced 모드)
aiwf compress-with-persona

# Aggressive 모드로 압축
aiwf compress-aggressive-persona

# Minimal 모드로 압축
aiwf compress-minimal-persona
```

### 프로그래매틱 사용
```javascript
import { PersonaAwareCompressor } from './utils/persona-aware-compressor.js';

const compressor = new PersonaAwareCompressor('balanced');
const result = await compressor.compress(content);

console.log(`압축률: ${result.compressionRatio}%`);
console.log(`페르소나: ${result.metadata.persona}`);
```

## 압축 결과 검증

### 패턴 보존율
페르소나별 중요 패턴이 얼마나 보존되었는지 확인:
```javascript
validation.patternPreservationRate // 예: "85.5%"
validation.personaAligned // true/false
```

### 품질 메트릭
- **구조 무결성**: 문서 구조 유지 여부
- **의미 보존**: 핵심 의미 유지 여부
- **가독성**: 압축 후 가독성 수준

## 통계 및 모니터링

### 압축 통계 확인
```bash
aiwf compress-stats
```

제공 정보:
- 현재 활성 페르소나
- 페르소나별 평균 압축률
- 압축 전략 상세
- 보존 패턴 목록

### 히스토리 분석
```javascript
const stats = compressor.getPersonaCompressionStats();
console.log(stats.averageRatioByPersona);
// { architect: "45.2", security: "35.8", ... }
```

## 최적화 팁

### 1. 페르소나 선택
작업에 맞는 페르소나를 선택하여 관련 정보 보존:
- 시스템 설계 문서 → Architect
- 보안 리포트 → Security
- UI 가이드 → Frontend
- API 문서 → Backend
- 분석 리포트 → Data Analyst

### 2. 압축 모드 선택
- **Minimal**: 중요 문서, 낮은 압축률
- **Balanced**: 일반 문서, 중간 압축률
- **Aggressive**: 대용량 문서, 높은 압축률

### 3. 사전 최적화
압축 전 문서 정리:
- 중복 내용 제거
- 구조화된 형식 사용
- 페르소나 관련 키워드 포함

## 주의사항

1. **백업 권장**: 중요 문서는 압축 전 백업
2. **압축률 확인**: 과도한 압축은 정보 손실 가능
3. **페르소나 적합성**: 문서와 페르소나 특성 일치 확인

## 향후 계획

- AI 기반 요약 기능 강화
- 다중 페르소나 압축 지원
- 압축 품질 자동 평가
- 커스텀 압축 전략 지원