# AIWF 성능 가이드라인

[한국어](PERFORMANCE_GUIDELINES.ko.md) | [English](PERFORMANCE_GUIDELINES.md)

> AIWF 프로젝트의 성능을 최적화하기 위한 모범 사례와 가이드라인

## 📋 목차

1. [개요](#개요)
2. [토큰 최적화](#토큰-최적화)
3. [파일 시스템 성능](#파일-시스템-성능)
4. [상태 관리 최적화](#상태-관리-최적화)
5. [메모리 관리](#메모리-관리)
6. [명령어 실행 최적화](#명령어-실행-최적화)
7. [AI 상호작용 최적화](#ai-상호작용-최적화)
8. [모니터링과 프로파일링](#모니터링과-프로파일링)

## 개요

AIWF의 성능은 다음 요소들에 의해 결정됩니다:
- AI 모델과의 토큰 교환량
- 파일 시스템 작업 효율성
- 상태 관리 오버헤드
- 메모리 사용량
- 명령어 실행 시간

이 가이드는 각 영역에서 성능을 최적화하는 방법을 설명합니다.

## 토큰 최적화

### 컨텍스트 압축 전략

토큰 사용량을 줄이는 것은 비용과 성능 모두에 중요합니다.

#### 1. 적절한 압축 레벨 선택

```bash
# 최소 압축 (중요 정보 보존)
aiwf compress minimal

# 균형 압축 (권장)
aiwf compress balanced

# 공격적 압축 (최대 토큰 절약)
aiwf compress aggressive
```

#### 2. 페르소나 기반 압축

활성 페르소나에 맞춰 관련 정보만 보존:

```bash
# 백엔드 작업 시
aiwf persona apply backend
aiwf compress with-persona

# 프론트엔드 작업 시
aiwf persona apply frontend
aiwf compress with-persona
```

#### 3. 파일 필터링

불필요한 파일 제외:

```bash
# .aiwfignore 파일 생성
cat > .aiwfignore << EOF
# 빌드 산출물
dist/
build/
*.min.js
*.map

# 의존성
node_modules/
vendor/

# 로그 및 캐시
*.log
.cache/
coverage/

# 대용량 파일
*.jpg
*.png
*.mp4
*.zip
EOF
```

### 토큰 사용량 모니터링

```bash
# 현재 세션 토큰 사용량
aiwf token status

# 일일 리포트
aiwf token report daily

# 주간 리포트
aiwf token report weekly
```

### 토큰 한도 설정

```bash
# 세션당 한도 설정
aiwf token limit session 50000

# 일일 한도 설정
aiwf token limit daily 200000

# 경고 임계값 설정
aiwf token limit warning 0.8
```

## 파일 시스템 성능

### 인덱싱 최적화

#### 1. 선택적 인덱싱

```bash
# 특정 디렉토리만 인덱싱
aiwf index --include src/ docs/

# 특정 파일 타입만 인덱싱
aiwf index --types js,ts,md
```

#### 2. 인덱스 캐싱

```bash
# 인덱스 캐시 활성화
aiwf config set index.cache true

# 캐시 TTL 설정 (초 단위)
aiwf config set index.cacheTTL 3600
```

### 파일 감시 최적화

```bash
# 감시 제외 패턴 설정
aiwf config set watch.ignore "node_modules/**,dist/**"

# 디바운스 시간 설정 (밀리초)
aiwf config set watch.debounce 500
```

## 상태 관리 최적화

### 상태 파일 크기 관리

#### 1. 정기적인 정리

```bash
# 완료된 태스크 아카이브
aiwf state archive --older-than 30d

# 상태 파일 압축
aiwf state compact
```

#### 2. 증분 업데이트

```bash
# 전체 업데이트 대신 증분 업데이트 사용
aiwf state update --incremental

# 특정 스프린트만 업데이트
aiwf state update --sprint S01
```

### 상태 검증 최적화

```bash
# 빠른 검증 (기본 체크만)
aiwf state validate --quick

# 비동기 검증
aiwf state validate --async
```

## 메모리 관리

### Node.js 메모리 설정

```bash
# 힙 메모리 증가
export NODE_OPTIONS="--max-old-space-size=4096"

# 또는 .aiwf/config.json에 설정
{
  "performance": {
    "nodeOptions": "--max-old-space-size=4096"
  }
}
```

### 메모리 누수 방지

#### 1. 리소스 정리

```bash
# 임시 파일 정리
aiwf cleanup temp

# 오래된 체크포인트 제거
aiwf checkpoint prune --keep-last 5
```

#### 2. 캐시 관리

```bash
# 캐시 크기 제한
aiwf config set cache.maxSize "100MB"

# 캐시 정리
aiwf cache clear
```

## 명령어 실행 최적화

### 병렬 처리

```bash
# 병렬 태스크 실행
aiwf task run --parallel 4

# 독립적인 스프린트 병렬 실행
aiwf sprint run S01 S02 --parallel
```

### 배치 작업

```bash
# 여러 태스크 일괄 생성
aiwf task create-batch tasks.json

# 일괄 상태 업데이트
aiwf state update-batch
```

### 지연 로딩

```bash
# 필요시에만 리소스 로드
aiwf config set lazy.loading true

# 명령어별 지연 로딩
aiwf config set lazy.commands true
```

## AI 상호작용 최적화

### 효율적인 프롬프트

#### 1. 프롬프트 템플릿 사용

```bash
# 프롬프트 템플릿 생성
aiwf prompt create backend-api

# 템플릿 재사용
aiwf task create --prompt-template backend-api
```

#### 2. 컨텍스트 재사용

```bash
# 컨텍스트 캐싱 활성화
aiwf config set ai.contextCache true

# 캐시 수명 설정
aiwf config set ai.contextCacheTTL 1800
```

### 응답 최적화

```bash
# 응답 길이 제한
aiwf config set ai.maxResponseTokens 2000

# 스트리밍 응답 활성화
aiwf config set ai.streaming true
```

## 모니터링과 프로파일링

### 성능 메트릭

```bash
# 성능 모니터링 활성화
aiwf monitor start

# 실시간 메트릭 보기
aiwf monitor status

# 성능 리포트 생성
aiwf monitor report
```

### 프로파일링

```bash
# CPU 프로파일링
aiwf profile cpu --duration 30s

# 메모리 프로파일링
aiwf profile memory

# 프로파일 분석
aiwf profile analyze
```

### 벤치마크

```bash
# 기본 벤치마크 실행
aiwf benchmark

# 특정 명령어 벤치마크
aiwf benchmark --command "state update"

# 비교 벤치마크
aiwf benchmark --compare v0.3.0
```

## 모범 사례 체크리스트

### 일일 최적화
- [ ] 토큰 사용량 확인
- [ ] 임시 파일 정리
- [ ] 캐시 상태 확인

### 주간 최적화
- [ ] 상태 파일 압축
- [ ] 오래된 체크포인트 정리
- [ ] 성능 리포트 검토

### 월간 최적화
- [ ] 전체 인덱스 재구축
- [ ] 완료된 태스크 아카이브
- [ ] 성능 벤치마크 실행

## 성능 문제 해결

### 느린 시작 시간

1. **원인 파악**:
   ```bash
   aiwf debug startup
   ```

2. **해결책**:
   - 지연 로딩 활성화
   - 불필요한 플러그인 제거
   - 캐시 프리로드

### 높은 메모리 사용

1. **메모리 프로파일**:
   ```bash
   aiwf profile memory --heap-snapshot
   ```

2. **해결책**:
   - 캐시 크기 제한
   - 리소스 풀 크기 조정
   - 가비지 컬렉션 튜닝

### 느린 파일 작업

1. **I/O 분석**:
   ```bash
   aiwf debug io
   ```

2. **해결책**:
   - SSD 사용
   - 파일 감시 최적화
   - 배치 I/O 작업

---

💡 **프로 팁**: 성능 최적화는 지속적인 과정입니다. 정기적으로 모니터링하고 조정하세요!