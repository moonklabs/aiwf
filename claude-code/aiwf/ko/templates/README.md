# AIWF 프로젝트 템플릿

이 디렉토리에는 AIWF 프로젝트 템플릿이 포함되어 있습니다.

## 사용 가능한 템플릿

### 1. web-app (웹 애플리케이션)
- React 18 + TypeScript
- Vite 빌드 도구
- Tailwind CSS
- React Router
- Zustand 상태 관리
- AIWF 대시보드 통합

### 2. api-server (API 서버)
- Express + TypeScript
- JWT 인증
- Swagger 문서화
- 에러 핸들링
- AIWF API 엔드포인트

### 3. npm-library (NPM 라이브러리)
- TypeScript 기반
- Rollup 번들링
- Jest 테스트
- 듀얼 모듈 시스템 (ESM/CJS)
- 자동 버전 관리

## 템플릿 사용법

```bash
# 대화형 모드
aiwf create

# 직접 지정
aiwf create web-app my-app

# 오프라인 모드
aiwf create --offline web-app my-app
```

## 템플릿 구조

각 템플릿은 다음 구조를 따릅니다:

```
template-name/
├── config.json       # 템플릿 메타데이터
└── template/         # 실제 프로젝트 파일
    ├── src/          # 소스 코드
    ├── .aiwf/        # AIWF 설정
    ├── package.json  # 의존성
    └── README.md     # 프로젝트 문서
```

## 템플릿 커스터마이징

템플릿의 플레이스홀더:
- `{{projectName}}` - 프로젝트 이름
- `{{description}}` - 프로젝트 설명
- `{{author}}` - 작성자
- `{{year}}` - 현재 연도
- `{{createdAt}}` - 생성 시간

## 캐시 관리

템플릿은 오프라인 사용을 위해 캐시될 수 있습니다:

```bash
# 캐시 생성
aiwf cache create

# 캐시 확인
aiwf cache check

# 캐시 삭제
aiwf cache clear
```