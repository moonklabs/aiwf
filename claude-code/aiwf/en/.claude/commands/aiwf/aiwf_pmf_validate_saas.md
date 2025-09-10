> 전제 조건: 이 커맨드를 실행하기 전에 반드시 `aiwf_infra_mcp_readiness.md`(MCP 프리플라이트)를 실행하여 PASS 상태여야 합니다. FAIL 항목이 있으면 본 플로우를 중단하고 수정 가이드를 먼저 적용하세요.

# Build & Validate SaaS (Revenue-First, Vibe Coding)

본 커맨드는 7–14일 내 글로벌 SaaS의 가설→구현→수익 검증을 일관된 문서 흐름으로 지원해. 출력은 Markdown, 한국어. 최소 입력만 받고, 실행 가능한 산출물만 생성해.

---

## 0) 출력 규칙
- 모든 섹션은 요약(3–5 bullets) + 실행 체크리스트(≤ 10개) 중심
- 보안/관측성/웹훅/다국어는 항상 포함
- 코드/구현 예시는 TypeScript 우선, 파일/디렉터리명은 케밥 케이스

---

## 1) 질문 단계(필수 최소 입력)
아래 10개를 짧게 받아 기본값을 고정해.
1. `<product-one-liner>`
2. `<primary-persona>` (B2B/B2C 비중 포함)
3. `<acquisition-channels>` (예: SEO, 커뮤니티, 파트너)
4. `<must-have-features>` (초기 핵심 3개)
5. `<pricing-hypothesis>` (Free/Pro/Team, 월/연, Trial)
6. `<key-metrics>` (전환/결제/활성: e.g., signup→checkout, D1/D7, ARPA)
7. `<constraints>` (기간/예산/인력)
8. `<stack-base>` (default: Next.js + Supabase + Auth.js + LemonSqueezy)
9. `<auth-providers>` (Kakao/Naver/Google/Apple/Email 조합)
10. `<billing-providers>` (LemonSqueezy, Stripe 중 선택/복수)

> 좌우 설정 토글: B2B-first 필요 시 Clerk/Auth0로 스위치(조직/SSO/SCIM 기본 포함). 소셜 로그인이 필수면 Supabase + Auth.js 기본 유지 권장.

---

## 2) Lean PRD (≤ 2p)
- 목표/문제·가치 제안/타깃 페르소나
- 핵심 시나리오(3개)/논외 범위/경쟁(대체)
- 성공 기준(수치): 예) 7일 내 첫 유효 결제 ≥ X건, Signup→Checkout ≥ Y%, Refund ≤ Z%
- 리스크/가설/불확실성(기술, 규제, 데이터 레지던시)

산출물: 요약 표 + 리스크별 대응(지연·제거·완화) 결정표

---

## 3) Design Spec (필수 화면/플로우)
- 화면: Landing, Auth, Dashboard, Billing, Team/Seats, Settings
- 플로우: 가입→소셜 로그인(Kakao/Naver 등)→온보딩→체크아웃→액세스 권한→팀 초대/시트 증감→업그레이드/취소
- 컴포넌트: 헤더/푸터/CTA/가격표/시트 카운터/토스트/로딩
- API 개요: `/api/webhooks/lemonsqueezy`, `/api/webhooks/stripe`(선택), `/api/teams`, `/api/seats`, `/api/billing` 등
- 상태/권한: 서버 발급 세션/권한 체크, 구독/시트 소유는 DB(우리) 관할

산출물: 화면-플로우 맵, 엔드포인트 표, 에러 핸들링 규칙

---

## 4) Market Validation (수익 중심)
- 실험셋: A/B 가격, 페이크 도어, 컨시어지 MVP
- 계량 지표: 방문→가입→체크아웃→결제→활성, CAC/LTV 가설
- 일일 체크리스트: 유입/전환/리텐션/리퍼럴/수익 지표 점검, 실험 로그
- 데이터 소스: Vercel Analytics, Supabase, 결제 이벤트(Webhooks)

산출물: 7–10일 실행 캘린더 + 각 실험의 종료 기준/다음 행동

---

## 5) Implementation Plan (7–10일)
- 백로그 쪼개기: 0. 인프라(프리플라이트 PASS) → 1. Auth → 2. Billing → 3. Seats/Org → 4. Paid Gate → 5. UX Polish → 6. Launch
- 보안: Env 분리, Webhook 서명 검증, RLS/권한, 입력 검증, 레이트 리밋
- 관측성: 로그 구조, 에러 알림, 핵심 KPI 대시보드
- DoD: 페이지/플로우별 검증 시나리오, E2E Happy Path

산출물: 업무 보드(태스크/담당/예상치/리스크), 위험-완화 매트릭스

---

## 6) Kickoff (스캐폴딩 가이드)
- 파일트리 제안(App Router, `api/webhooks/*`, `lib/auth/*`, `lib/billing/*` 등)
- Env 체크리스트: `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL/SECRET`, Supabase, Kakao/Naver, LemonSqueezy/Stripe 키
- 기본 스택(기본값): Next.js + Supabase + Auth.js + LemonSqueezy
- B2B-first 전환: Clerk 기본(Org/SSO/SCIM), 커스텀 OAuth로 Kakao/Naver 연동 지침

산출물: 생성할 파일/엔드포인트/환경변수 표, 최소 코드 스니펫 링크(옵션)

---

## 7) 동기화/진행
- `aiwf state update`와 스프린트/태스크 생성 연동
- 변경사항 커밋 메시지 규칙(Conventional Commits) 및 체크리스트 자동화 연결

---

### 샘플 실행 프롬프트
```prompt
[Step 1] 질문 단계(10개)만 물어봐줘. 짧은 보기에 맞춰 기본값을 추천하고, 불확실하면 안전한 기본값을 채워.
```
```prompt
[Step 2] 위 답변을 바탕으로 Lean PRD를 2페이지 이내로 생성해줘. 성공 기준은 모두 수치로.
```
```prompt
[Step 3] Design Spec을 필수 화면/플로우/엔드포인트 표 중심으로 만들어줘. 에러/보안/관측성 포함.
```
```prompt
[Step 4] 7–10일 Market Validation 플랜과 일일 체크리스트를 만들어줘. 수익 지표 우선.
```
```prompt
[Step 5] Implementation Plan(7–10일)과 DoD를 생성해줘. 작업 보드에 넣기 쉬운 단위로 쪼개줘.
```
```prompt
[Step 6] Kickoff용 파일트리/엔드포인트/환경변수 체크리스트를 출력해줘. 기본 스택은 B2C-first.
```
