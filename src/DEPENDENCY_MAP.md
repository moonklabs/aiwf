# AIWF 모듈 의존성 매트릭스

## 📊 CLI 명령어별 의존성

| 명령어 | 직접 의존성 | 간접 의존성 | 특수 사용 |
|--------|-------------|-------------|-----------|
| `aiwf install` | installer.js | backup-manager.js, file-downloader.js, rollback-manager.js, validator.js | - |
| `aiwf persona` | persona.js, ai-persona-manager.js | context-engine.js, metrics-collector.js, task-analyzer.js, token-optimizer.js | - |
| `aiwf compress` | compress.js, resource-loader.js | - | - |
| `aiwf token` | token.js, resource-loader.js | - | - |
| `aiwf evaluate` | evaluate.js, resource-loader.js | - | - |
| `aiwf state` | state.js | - | - |
| `aiwf create-project` | create-project.js, resource-loader.js | - | - |
| `aiwf ai-tool` | ai-tool.js | - | - |
| `aiwf sprint-task` | sprint-task.js | - | - |
| `aiwf sprint` | sprint-independent.js | - | - |
| `aiwf yolo-config` | yolo-config.js | - | - |
| `aiwf checkpoint` | checkpoint-manager.js | - | ⚠️ YOLO 전용 |
| `aiwf-checkpoint` | checkpoint-manager.js | - | ⚠️ YOLO 전용 |
| `aiwf cache` | cache-cli.js | template-cache-system.js, offline-detector.js, template-downloader.js, template-version-manager.js | - |
| `aiwf github` | github-integration.js | state/state-index.js | - |
| `YOLO 모드` | engineering-guard.js | - | ⚠️ 동적 import |

## 🏗️ 모듈 분류

### 🔧 핵심 유틸리티 (삭제 금지)
- **paths.js** - 경로 관리 (8곳에서 사용)
- **messages.js** - 다국어 메시지 시스템 (5곳에서 사용)
- **language-utils.js** - 언어 설정 관리 (3곳에서 사용)

### 🚀 YOLO 시스템 (삭제 금지)
- **engineering-guard.js** - 오버엔지니어링 방지 ⚠️ 동적 로드
- **checkpoint-manager.js** - 체크포인트 관리

### 🎯 명령어별 전용 모듈

#### AI Persona 시스템
- **ai-persona-manager.js** → persona 명령어
- **context-engine.js** → ai-persona-manager가 사용
- **metrics-collector.js** → ai-persona-manager가 사용  
- **task-analyzer.js** → ai-persona-manager가 사용
- **token-optimizer.js** → context-engine이 사용

#### 설치/백업 시스템
- **installer.js** → install 명령어
- **backup-manager.js** → installer가 사용
- **file-downloader.js** → installer가 사용
- **rollback-manager.js** → installer가 사용
- **validator.js** → installer가 사용

#### 캐시 시스템
- **template-cache-system.js** → cache 명령어
- **offline-detector.js** → cache 명령어
- **template-downloader.js** → cache 명령어
- **template-version-manager.js** → cache 명령어

#### GitHub 통합
- **github-integration.js** → github 명령어
- **state/state-index.js** → github-integration이 사용

#### 공통 리소스
- **resource-loader.js** → 5개 명령어에서 사용

## ⚠️ 삭제 위험 모듈

### 동적 로드 모듈 (CLI에서 직접 참조되지 않음)
- **engineering-guard.js** - YOLO 템플릿에서 `import()`로 로드
- **state/priority-calculator.js** - github-integration에서 사용
- **state/task-scanner.js** - github-integration에서 사용

### 간접 의존성 모듈
- AI Persona 시스템의 하위 모듈들
- 설치 시스템의 백업/복구 모듈들

## 🚨 삭제하기 전 확인사항

1. **이 파일에서 모듈 위치 확인**
2. **`@warning 삭제 금지` 주석 확인**
3. **YOLO 전용 모듈인지 확인**
4. **동적 import 사용 여부 확인**
5. **간접 의존성 체인 확인**

## 📁 미사용 모듈 (삭제 가능)

현재 완전히 미사용되는 모듈은 없습니다. 모든 모듈이 직간접적으로 CLI 시스템에서 사용됩니다.

---

**마지막 업데이트**: 2024-01-27  
**검증 방법**: `grep -r "모듈명" src/` 으로 사용처 확인