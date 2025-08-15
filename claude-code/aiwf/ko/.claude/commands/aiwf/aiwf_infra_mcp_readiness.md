# MCP Infra Readiness & SaaS Preflight (Vibe Coding)

이 규칙은 글로벌 SaaS를 빠르게 출시하기 위한 인프라·MCP 사전 점검 게이트야. Next.js + Vercel + Supabase + Stripe + LemonSqueezy 등 외부 SaaS를 최대 활용하고, 인증/결제/웹훅/배포에 필요한 핵심 설정을 흔들림 없이 고정해. 모든 출력은 Markdown, 한국어.

> 권장: 이 프리플라이트를 통과한 뒤 `aiwf_pmf_validate_saas.md`(PRD→Design→Market Validation→Implementation→Kickoff)로 진행해.

---

## 0) 결과 형식
- 최종 출력은 PASS / WARN / FAIL 요약표와 세부 리포트.
- FAIL이 있으면 다음 단계로 진행 금지. 즉시 수정 가이드 제공.

---

## 1) 질문 단계(필수 최소 입력)
한 줄 요약으로 아래 8개 입력을 수집해.
1. `<vercel-project>` (예: hooklabs)
2. `<app-url>` (예: https://app.example.com)
3. `<supabase-org-id>` / `<supabase-project-id>`
4. `<auth-providers>` (예: Kakao, Naver, Google, Apple, Email)
5. `<auth-platform>` (Clerk | Supabase Auth + Auth.js | Firebase Auth | Auth0) — 아래 '인증 스택 비교 가이드'를 참고해 선택. 선택 시, AI는 비교표와 권장안을 함께 제시해야 함.
6. `<billing-stack>` (Stripe, LemonSqueezy 둘 다 or 하나)
7. `<env-scope>` (dev/preview/prod 운용 계획)
8. `<constraints>` (기간/예산/인력)

### 인증 스택 비교 가이드(출력 규칙)
- 비교 후보: Clerk, Supabase Auth + Auth.js, Firebase Auth, Auth0
- 평가축: B2B/B2C 비중, Kakao/Naver 필요 여부, 시트 과금/팀/조직, SSO(SAML/SCIM), 비용/MAU 과금, 벤더 락인, 구현 속도, 데이터 레지던시
- 출력 형식:
  - 옵션 비교 표(옵션/강점/약점/적합도)
  - 권장안 1개와 근거(2–3 bullets), 보완책/마이그레이션 경로 포함
- Clerk
  - 장점: 조직/팀·SSO/SAML/SCIM 내장, B2B 기능 빠른 탑재, 세션/보안 기능 성숙
  - 단점: MAU 기반 비용, Kakao/Naver는 커스텀 OAuth 수동 설정, 락인 리스크
  - 적합: B2B-heavy, 엔터프라이즈 SSO 필요
- Supabase Auth + Auth.js
  - 장점: Postgres 네이티브, Kakao/Naver 연동 용이(Auth.js), 비용 유연/셀프호스팅 가능, 어댑터로 락인 완화
  - 단점: SAML/SCIM은 별도 구현/추가 서비스 필요, 어드민 UX는 직접 구성
  - 적합: B2C-first, 한국 소셜 우선, 비용/데이터 통제
- Firebase Auth
  - 장점: 모바일/클라이언트 SDK 강력, 빠른 MVP, 전화 인증 등 편의
  - 단점: B2B 조직/시트/SSO 부족, 락인 높음, RDB 중심 도메인과 미스매치 가능
  - 적합: 모바일 우선 MVP, 단기 검증
- Auth0
  - 장점: 엔터프라이즈급 SSO/SAML/OIDC, 규정 준수/확장성 좋음
  - 단점: 비용 높음/복잡도, KR 소셜은 커스텀, 초기 과설계 위험
  - 적합: 엔터프라이즈 딜, 보안/컴플라이언스 최우선
- 권장안 산출 규칙:
  - B2B-heavy 또는 SSO/SCIM 필수: Clerk 우선 제안(복잡한 엔터프라이즈는 Auth0 검토)
  - B2C-first + Kakao/Naver 필수: Supabase Auth + Auth.js 제안
  - 혼합 전략: Supabase + Auth.js로 시작(어댑터 패턴) → B2B 요구 커지면 Clerk 추가 도입, 서버 권한/DB는 고정

---

## 2) 환경변수 체크리스트(.env.example 생성)
다음 키들을 점검하고 없으면 .env.example 초안을 출력해.
- Next.js 기본
  - `NEXT_PUBLIC_APP_URL`
  - `NEXTAUTH_URL` (Auth.js 사용 시)
  - `NEXTAUTH_SECRET` (Auth.js 사용 시)
- Supabase
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only, never ships to client)
- Auth Providers(필요한 것만)
  - `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
  - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`
- Billing
  - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - LemonSqueezy: `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_SIGNING_SECRET`
- 기타
  - `NODE_ENV`, `VERCEL_ENV`(자동), 필요 시 `SENTRY_DSN`

출력: 누락/형식 오류를 표로 정리하고, 보안 권장사항(서버 전용 키는 Vercel Server Env에만 설정)을 덧붙여.

---

## 3) MCP 서버 준비 점검(Smoke Tests)
아래 MCP 서버가 로드되었는지 확인하고, 각 서버별 최소 호출로 동작성을 검증해. 실패 시 원인과 재설정 가이드를 제공해.

### 검사 대상
- `context7` (라이브러리 문서)
- `supabase-mcp-server` (DB/프로젝트 연계)
- `mcp-playwright` (HTTP/브라우저 크롤/스크린샷)
- `llms-generator` (사이트 크롤/llms.txt)
- `sequential-thinking` (분석/체크리스트 산출)

### 샘플 프롬프트
```prompt
Perform MCP readiness checks and return a PASS/WARN/FAIL report:
- List available MCP servers
- context7: resolve "next.js" and fetch docs topic "routing"
- supabase-mcp-server: list_organizations, list_projects; if missing IDs, ask user; if project_id present, get_project_url and get_anon_key
- mcp-playwright: navigate to https://example.com then get_visible_text
- llms-generator: simple-crawl-website url=https://example.com depth=1
- sequential-thinking: run a short diagnostic thought
Return a markdown table of results with errors and remediation tips.
```

---

## 4) 배포/웹훅 경로 예약 & 네트워킹
- Next.js 라우트 예약: `/api/webhooks/stripe`, `/api/webhooks/lemonsqueezy`
- Vercel
  - 프로젝트 링크 확인(입력 `<vercel-project>` 기반)
  - Env 분리(dev/preview/prod) 및 Protected Env 적용
- Webhook 인바운드 방역
  - Stripe/LemonSqueezy 재시도 내성, 서명 검증(서명 비밀키 필수)
- CORS/i18n
  - `NEXT_PUBLIC_APP_URL` 기준 허용 도메인 점검

출력: 경로/환경과 연계된 체크리스트를 표로 요약.

---

## 5) SaaS 연동 사전 점검(비파괴·옵션 스모크)
- Stripe
  - 대안 A: 키 형식 검증만(접두사 sk_live_/sk_test_)
  - 대안 B(옵션): 대시보드 Webhook 시뮬레이터로 서명 검증(E2E 과금 호출 금지)
- LemonSqueezy
  - API Key/Signing Secret 형식 확인
  - Webhook 서명 검증 로직 존재 여부 확인
- Supabase
  - `anon key`와 DB 연결성(프로젝트 URL) 확인, 지역/레지던시 메모

출력: 각 서비스별 리스크/다음 단계(예: 가격/플랜 생성은 Market Validation 단계에서 처리)를 정리.

---

## 6) 권장 기본 스택 & 아키텍처 원칙(요약)
- 스택(default): Next.js(App Router) + Supabase(Postgres) + Auth.js(카카오/네이버/구글/애플) + LemonSqueezy
- 원칙: 인증은 Provider 위임, 권한은 서버 결정. `users/workspaces/memberships/subscriptions`은 우리 DB 소유. 어댑터 패턴으로 공급자 교체 가능.

---

## 7) 최종 게이트 판단
- 모든 항목을 PASS/WARN/FAIL로 집계하고, FAIL 시 차단 및 구체 수정 지시.
- PASS면 다음 커맨드 `aiwf_pmf_validate_saas.md`로 진행 권유.

---

### 사용 예
1) AI → 질문 단계 수행(7개 입력)
2) AI → .env 체크리스트 및 .env.example 출력
3) AI → MCP Smoke Tests 수행 및 리포트
4) AI → 배포/웹훅/네트워킹 체크리스트 출력
5) AI → 최종 PASS/WARN/FAIL 표 + 다음 단계 안내
