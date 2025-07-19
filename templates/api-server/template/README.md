# {{projectName}}

AIWF가 통합된 Express + TypeScript RESTful API 서버입니다.

## 시작하기

### 개발 서버 실행

```bash
npm install
cp .env.example .env
npm run dev
```

서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### API 문서

Swagger UI: [http://localhost:3000/docs](http://localhost:3000/docs)

### 빌드

```bash
npm run build
npm start
```

## 기술 스택

- **Express 4** - 웹 프레임워크
- **TypeScript** - 타입 안정성
- **JWT** - 인증
- **Swagger** - API 문서화
- **Winston** - 로깅
- **Jest** - 테스팅
- **AIWF** - AI 지원 개발 워크플로우

## 프로젝트 구조

```
src/
├── config/         # 설정 파일
├── controllers/    # 요청 핸들러
├── middleware/     # Express 미들웨어
├── models/         # 데이터 모델
├── routes/         # API 라우트 정의
├── services/       # 비즈니스 로직
├── utils/          # 유틸리티 함수
└── types/          # TypeScript 타입 정의
```

## API 엔드포인트

### 인증

- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인

### 상태

- `GET /health` - 헬스체크
- `GET /api/v1/status` - API 상태

### AIWF

- `GET /api/aiwf/features` - Feature Ledger 조회
- `GET /api/aiwf/token-usage` - 토큰 사용량 조회
- `GET /api/aiwf/context` - Context 상태 조회

## AIWF 기능

### Feature Ledger

API 엔드포인트 개발을 자동으로 추적합니다.

```bash
npm run aiwf:feature list    # 기능 목록 보기
npm run aiwf:feature stats   # 통계 보기
```

### API 문서 자동화

```bash
npm run aiwf:api docs        # API 문서 업데이트
npm run aiwf:api validate    # API 스펙 검증
```

### AI 페르소나

- `backend-engineer` - 백엔드 개발 (기본값)
- `api-architect` - API 설계
- `database-specialist` - 데이터베이스
- `security-auditor` - 보안 감사
- `performance-optimizer` - 성능 최적화

## 개발 가이드

### 새 API 엔드포인트 추가

1. 라우트 정의 (`src/routes/`)
2. 컨트롤러 구현 (`src/controllers/`)
3. 서비스 로직 작성 (`src/services/`)
4. 입력 검증 추가
5. Swagger 문서 작성

### 미들웨어 추가

```typescript
// src/middleware/myMiddleware.ts
export const myMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 미들웨어 로직
  next();
};
```

### 환경 변수

`.env` 파일 설정:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
```

## 테스트

```bash
# 전체 테스트 실행
npm test

# 감시 모드
npm run test:watch

# 커버리지 리포트
npm test -- --coverage
```

## 보안

- Helmet.js로 보안 헤더 설정
- Rate limiting 적용
- JWT 토큰 인증
- 입력 검증 (express-validator)
- CORS 설정

## 배포

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2

```bash
npm run build
pm2 start dist/index.js --name {{projectName}}
```

## 라이선스

MIT