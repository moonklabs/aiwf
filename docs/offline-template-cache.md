# AIWF 오프라인 템플릿 캐시 시스템

AIWF의 오프라인 템플릿 캐시 시스템은 네트워크 연결이 불안정하거나 오프라인 환경에서도 모든 AI 도구 템플릿과 프로젝트 템플릿을 완벽하게 사용할 수 있도록 지원합니다.

## 주요 기능

### 🔄 템플릿 캐시 관리
- **자동 압축**: 모든 템플릿을 gzip으로 압축하여 디스크 사용량 최적화
- **버전 관리**: 템플릿 버전 추적 및 자동 업데이트 지원
- **체크섬 검증**: 캐시 무결성 보장을 위한 SHA256 체크섬 검증
- **크기 제한**: 캐시 크기 제한 및 자동 정리 기능

### 🌐 네트워크 상태 감지
- **실시간 모니터링**: 네트워크 연결 상태 실시간 감지
- **자동 전환**: 오프라인 모드 자동 전환 및 캐시 폴백
- **연결 복구**: 네트워크 복구 시 자동 동기화

### 📦 선택적 다운로드
- **대화형 선택**: 필요한 템플릿만 선택적으로 다운로드
- **배치 처리**: 여러 템플릿을 효율적으로 병렬 다운로드
- **진행률 표시**: 다운로드 진행률 실시간 표시

## 사용법

### 캐시 상태 확인
```bash
# 캐시 시스템 전체 상태 확인
aiwf cache status

# 캐시된 템플릿 목록 조회
aiwf cache list

# 특정 타입 템플릿만 조회
aiwf cache list --type ai-tools
aiwf cache list --type projects
```

### 템플릿 다운로드
```bash
# 대화형 템플릿 선택 다운로드
aiwf cache download

# 모든 템플릿 다운로드
aiwf cache download --all

# 특정 타입 템플릿 다운로드
aiwf cache download --type ai-tools
aiwf cache download --type projects
```

### 캐시 관리
```bash
# 만료된 캐시 정리
aiwf cache clean

# 전체 캐시 초기화
aiwf cache clean --all

# 특정 기간 이상된 캐시 정리
aiwf cache clean --max-age 30  # 30일 이상된 캐시 정리
```

### 업데이트 확인
```bash
# 업데이트 확인
aiwf cache update

# 업데이트 자동 설치
aiwf cache update --install
```

## 캐시 구조

### 디렉토리 구조
```
~/.aiwf/cache/
├── templates/
│   ├── ai-tools/
│   │   ├── claude-code@1.0.0.tar.gz
│   │   ├── github-copilot@1.0.0.tar.gz
│   │   ├── cursor@1.0.0.tar.gz
│   │   ├── windsurf@1.0.0.tar.gz
│   │   ├── augment@1.0.0.tar.gz
│   │   └── metadata.json
│   └── projects/
│       ├── web-app@1.0.0.tar.gz
│       ├── api-server@1.0.0.tar.gz
│       ├── npm-library@1.0.0.tar.gz
│       └── metadata.json
├── github-api/          # S02 GitHub API 캐시
├── manifest.json        # 전체 캐시 메타데이터
├── versions.json        # 버전 관리 정보
└── lock.json           # 동시성 제어
```

### 메타데이터 형식
```json
{
  "version": "1.0.0",
  "templates": {
    "ai-tools": {
      "claude-code": {
        "version": "1.0.0",
        "cached_at": "2025-07-09T06:30:00Z",
        "size": 1024000,
        "checksum": "sha256:abc123...",
        "cache_file": "/home/user/.aiwf/cache/templates/ai-tools/claude-code@1.0.0.tar.gz"
      }
    },
    "projects": {
      "web-app": {
        "version": "1.0.0",
        "cached_at": "2025-07-09T06:30:00Z",
        "size": 2048000,
        "checksum": "sha256:def456...",
        "cache_file": "/home/user/.aiwf/cache/templates/projects/web-app@1.0.0.tar.gz"
      }
    }
  },
  "last_update_check": "2025-07-09T06:30:00Z"
}
```

## 지원되는 템플릿

### AI 도구 템플릿 (5개)
1. **claude-code**: Claude Code 공식 통합
2. **github-copilot**: GitHub Copilot 설정
3. **cursor**: Cursor IDE 통합
4. **windsurf**: Windsurf IDE 통합
5. **augment**: Augment Code 통합

### 프로젝트 템플릿 (3개)
1. **web-app**: React + TypeScript 웹 애플리케이션
2. **api-server**: Express + TypeScript API 서버
3. **npm-library**: NPM 라이브러리 패키지

## 오프라인 모드 동작

### 네트워크 상태 감지
- **다중 엔드포인트 체크**: 여러 공개 API를 통한 연결 상태 확인
- **타임아웃 처리**: 5초 타임아웃으로 빠른 응답성 보장
- **재시도 메커니즘**: 일시적 네트워크 오류에 대한 자동 재시도

### 캐시 폴백
```javascript
// 네트워크 연결 확인
const isOnline = await detector.isOnline();

if (!isOnline) {
    // 오프라인 모드: 캐시만 사용
    const template = await cache.getTemplate('ai-tools', 'claude-code');
    if (template) {
        await cache.extractToDirectory('ai-tools', 'claude-code', './project');
    } else {
        throw new Error('Template not available offline');
    }
}
```

### 자동 동기화
- **네트워크 복구 감지**: 연결 복구 시 자동 이벤트 발생
- **캐시 동기화**: 만료된 캐시 정리 및 새 데이터 가져오기
- **버전 체크**: 템플릿 업데이트 자동 확인

## 성능 최적화

### 압축 및 저장
- **Gzip 압축**: 평균 70% 크기 절약
- **증분 업데이트**: 변경된 파일만 업데이트
- **병렬 다운로드**: 최대 3개 동시 다운로드

### 메모리 및 디스크 관리
- **메모리 캐시**: 자주 사용되는 메타데이터 메모리 캐시
- **디스크 캐시**: 압축된 템플릿 파일 디스크 저장
- **자동 정리**: 크기 제한 도달 시 오래된 캐시 자동 정리

### 캐시 통계 예시
```
📦 Total templates: 8
💾 Total size: 15.2 MB
📈 Cache usage: 15.2% of 100 MB
🎯 Hit rate: 89.3%
🕒 Last update: 2025-07-09 06:30:00
```

## 문제 해결

### 일반적인 문제

#### 1. 캐시 손상
```bash
# 캐시 무결성 검증
aiwf cache status

# 손상된 캐시 초기화
aiwf cache clean --all

# 템플릿 재다운로드
aiwf cache download --all
```

#### 2. 네트워크 연결 문제
```bash
# 네트워크 상태 확인
aiwf cache status

# 오프라인 모드 강제 활성화
export AIWF_OFFLINE_MODE=true

# 캐시된 템플릿 확인
aiwf cache list
```

#### 3. 디스크 공간 부족
```bash
# 캐시 크기 확인
aiwf cache status

# 오래된 캐시 정리
aiwf cache clean --max-age 7

# 필요한 템플릿만 유지
aiwf cache clean --all
aiwf cache download --type ai-tools
```

### 로그 및 디버깅
```bash
# 자세한 로그 출력
DEBUG=aiwf:cache aiwf cache download

# 캐시 디렉토리 직접 확인
ls -la ~/.aiwf/cache/templates/

# 메타데이터 확인
cat ~/.aiwf/cache/manifest.json | jq .
```

## 설정 옵션

### 환경 변수
```bash
# 캐시 디렉토리 변경
export AIWF_CACHE_DIR=/custom/path/cache

# 최대 캐시 크기 (바이트)
export AIWF_MAX_CACHE_SIZE=209715200  # 200MB

# 오프라인 모드 강제 활성화
export AIWF_OFFLINE_MODE=true

# 업데이트 체크 간격 (밀리초)
export AIWF_UPDATE_CHECK_INTERVAL=86400000  # 24시간
```

### 설정 파일
```json
// ~/.aiwf/config.json
{
  "cache": {
    "maxSize": 209715200,
    "compressionLevel": 6,
    "updateCheckInterval": 86400000,
    "offlineMode": false,
    "autoCleanup": true
  },
  "network": {
    "timeout": 5000,
    "retryCount": 3,
    "checkInterval": 30000
  }
}
```

## 통합 시스템

### S02 캐시 시스템과의 통합
- **공유 캐시 디렉토리**: 동일한 `~/.aiwf/cache` 디렉토리 사용
- **통합 크기 관리**: 전체 캐시 크기 통합 관리
- **우선순위 기반 정리**: 템플릿 캐시 우선, GitHub API 캐시 보조

### 프로그래밍 인터페이스
```javascript
import { IntegratedCacheSystem } from './lib/cache-integration.js';

const cache = new IntegratedCacheSystem();
await cache.init();

// 템플릿 캐시
await cache.cacheTemplate('ai-tools', 'claude-code', './templates/claude-code');

// GitHub API 캐시
const data = await cache.getGitHubData('https://api.github.com/repos/user/repo');

// 통합 상태 확인
const stats = await cache.getIntegratedStats();
```

## 로드맵

### 향후 개선사항
- **P2P 캐시 공유**: 로컬 네트워크에서 캐시 공유
- **델타 업데이트**: 파일 변경 부분만 업데이트
- **암호화 지원**: 민감한 템플릿 암호화 저장
- **클라우드 백업**: 캐시 클라우드 백업 및 복원

### 성능 목표
- **캐시 히트율**: 95% 이상
- **다운로드 속도**: 평균 5MB/s
- **압축률**: 평균 70%
- **메모리 사용량**: 50MB 이하

## 참고 자료

- [AIWF 아키텍처 문서](./architecture.md)
- [S02 캐시 시스템](./s02-cache-system.md)
- [오프라인 지원 전략](./offline-support-strategy.md)
- [성능 최적화 가이드](./performance-optimization.md)

---

*AIWF Offline Template Cache System v1.0.0 - 2025-07-09*