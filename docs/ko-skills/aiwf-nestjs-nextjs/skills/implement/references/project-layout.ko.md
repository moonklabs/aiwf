# 프로젝트 레이아웃 감지

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-nestjs-nextjs/skills/implement/references/project-layout.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

이것은 코드를 작성하기 전에 `/implement`, `/drizzle-migration`, `/nest-test`, `/react-test`, `/playwright-test`가 사용하는 조회 절차입니다. 그 일은 한 가지 질문에 답하는 것입니다: **이 프로젝트의 두 애플리케이션은 어디에 있고, 새 코드가 맞춰야 할 관례는 무엇인가?**

절대 가정하지 말고 — 항상 이 감지를 먼저 실행하십시오. 그 답 중 두 가지는 용서가 없습니다:

- **ESM/NodeNext**를 틀리면 아무것도 컴파일되지 않습니다. NodeNext 프로젝트는 소스 파일이 `.ts`여도 모든 상대 임포트에 `.js` 접미사가 필요합니다. 빠뜨리면 빌드가 실패하고, NodeNext가 아닌 프로젝트에 넣으면 반대 방향으로 빌드가 실패합니다.
- **라우터 스타일**을 틀리면 조용히 두 번째의 충돌하는 라우터를 만듭니다. App Router 프로젝트의 `src/pages` 디렉터리는 무해하지 않습니다 — Next.js가 그것을 라우팅하려고 시도합니다.

나머지는 덜 극적이지만, 프로젝트에 이질적으로 읽히는 코드를 만듭니다: 잘못된 계층의 쿼리, 공유되지 않고 중복된 타입, 두 관례에 걸쳐 쪼개진 페이지.

## 감지 표

| # | 질문                  | 신호                                                                 | 틀렸을 때의 결과                          |
|---|----------------------|----------------------------------------------------------------------|------------------------------------------|
| 1 | API 앱 루트          | `package.json`의 `dependencies`에 `@nestjs/core`가 있는 워크스페이스   | 코드가 잘못된 앱에 들어감                  |
| 2 | 웹 앱 루트           | `package.json`의 `dependencies`에 `next`가 있는 워크스페이스          | 코드가 잘못된 앱에 들어감                  |
| 3 | ESM/NodeNext         | API의 `package.json`에 `"type": "module"` **그리고** 그 `tsconfig.json`에 `"module": "NodeNext"`(또는 `"Node16"`) | `.js` 접미사 누락; 아무것도 컴파일되지 않음 |
| 4 | Drizzle 구성         | API 루트의 `drizzle.config.ts` — `schema`와 `out` 읽기              | 잘못된 파일의 스키마 편집; 잘못된 디렉터리의 마이그레이션 |
| 5 | 라우터 스타일        | `src/app/` 존재 → App Router; `src/pages/` 존재 → Pages Router      | 두 번째의 충돌하는 라우터                   |
| 6 | 라우트 간접화        | 기존 `src/app/**/page.tsx` 파일이 페이지 마크업을 담는지 아니면 다른 곳의 컴포넌트를 재내보내는지 | 코드베이스 전반에 걸친 관례 분열            |
| 7 | 공유 계약 패키지     | 두 앱이 임포트하는, 요청/응답 타입을 내보내는 워크스페이스 패키지          | 중복되어 어긋나는 타입                      |

## 1단계 — 애플리케이션 찾기

리포지터리 루트 `package.json`을 읽고 `workspaces`를 찾습니다. 각 글롭을 펼치고 일치하는 모든 `package.json`을 읽어 질문 1과 2에 답하십시오.

```bash
node -e "console.log(require('./package.json').workspaces)"
```

모노레포는 보통 두 앱을 `apps/api`와 `apps/web`에 두지만, 이름은 임의입니다 — 디렉터리 이름이 아니라 의존성 신호에서 그것들을 해석하십시오.

`workspaces` 필드가 없으면 두 애플리케이션이 별도 리포지터리이거나 평범한 형제 디렉터리일 수 있습니다. 대신 `nest-cli.json`과 `next.config.*`를 검색하십시오. **무엇이든 작성하기 전에 어떤 루트를 찾았는지 명시하십시오**, 그래야 잘못된 추측이 열두 개 파일이 잘못된 곳에 들어간 뒤가 아니라 즉시 드러납니다.

## 2단계 — 임포트를 하나라도 쓰기 전에 ESM 질문 해결

```bash
node -e "const p=require('./<api>/package.json'); console.log(p.type)"
grep -E '"module"|"moduleResolution"' <api>/tsconfig.json
```

`"type": "module"`과 `"module": "NodeNext"`가 함께 있으면 **모든 상대 임포트 지정자가 `.js`로 끝납니다**:

```ts
import { ProductsService } from './products.service.js';   // correct — source is .ts
import { ProductsService } from './products.service';      // fails to resolve at runtime
```

가장 빠른 확인은 프로젝트 자체 코드입니다: 상대 임포트가 있는 기존 파일을 열어 그 방식대로 따라 하십시오. 기존 임포트가 `.js`를 가지면, 당신 것도 그래야 합니다.

## 3단계 — Drizzle 구성 찾기

API 루트의 `drizzle.config.ts`를 읽습니다. 두 필드가 중요합니다:

- `schema` — 엔티티 모델이 바뀔 때 편집할 파일(보통 `./src/database/schema.ts`)
- `out` — 생성된 마이그레이션이 들어가는 디렉터리(보통 `./drizzle/migrations`)

둘 중 어느 것도 관례로 추측하지 마십시오. `schema/` 디렉터리 아래 여러 파일로 스키마를 나눠 두는 프로젝트는 정상이며, 설정이 가리키지 않는 단일 `schema.ts`에 쓰면 데이터베이스에 결코 도달하지 않는 테이블이 생깁니다.

## 4단계 — 프런트엔드의 라우팅 및 간접화 관례 파악

`src/app/`은 App Router를 뜻합니다. 그런 다음 라우트 파일이 실제로 무엇을 담는지 확인하십시오:

```tsx
// Direct — the route file holds the page
export default function ProductsPage() {
  return <main>…</main>;
}
```

```tsx
// Indirect — the route file is a thin wrapper
'use client';
import { ProductsPage } from '../../views/ProductsPage';
export default function Page() {
  return <ProductsPage />;
}
```

프로젝트가 간접화를 쓰는 곳에서는 새 페이지도 그것을 따릅니다: 라우트에 얇은 래퍼, 마크업은 형제들 옆의 컴포넌트에. 이것은 `/implement`를 넘어 중요합니다 — `/react-test`는 마크업을 담은 컴포넌트를 대상으로 해야 합니다. 래퍼를 렌더링하는 테스트는 아무것도 단언하지 않기 때문입니다.

`views`(또는 `screens`, `containers`)라는 디렉터리는 Pages Router가 차지할 `src/pages`를 피하기 위한 의도적 선택입니다. 그것을 `src/pages`로 "정리"하지 마십시오.

## 5단계 — 새 코드를 쓰기 전에 기존 기능을 모방하십시오

이미 구현된 기능 하나를 찾아, 이 표만으로 고립해서 생성하지 말고 그 정확한 형태를 복사하십시오. 표는 무엇이 어디에 있는지 알려 주고, 기존 기능은 이 팀이 그것을 어떻게 작성하는지 알려 줍니다.

- **리포지터리 소유**: 각 기능 폴더가 자체 `*.repository.ts`를 갖는가, 아니면 기능이 코어 모듈이 내보내는 공유 리포지터리를 소비하는가? 존재하는 쪽을 맞추십시오 — 공유 리포지터리가 있는 곳에서 그것을 임포트하는 것이 맞고, 그 쿼리를 새 파일로 중복하는 것은 틀립니다.
- **응답 형태**: 기능별로 `dto/` 아래에 손으로 작성하는가, 아니면 공유 계약 패키지에서 임포트하는가? 공유 패키지가 있으면 그것을 쓰십시오. 요점은 스택의 양쪽 절반이 함께 바뀌는 것입니다.
- **요청 검증**: 라우트 파라미터와 쿼리 문자열이 class-validator DTO로 바인딩되는가, 아니면 사용자 정의 파이프로 되는가? 사용자 정의 파이프는 보통 프로젝트가 그것이 만드는 정확한 오류 메시지를 중요시하기 때문에 존재합니다 — 일반 DTO로 대체하지 말고 보존하십시오.
- **프런트엔드 데이터 접근**: fetch 클라이언트 모듈(`apiGet`/`apiPost` 등)과 그것을 감싸는 훅이 있는가? 그것들을 쓰십시오. 클라이언트 모듈이 있는 프로젝트의 그냥 `fetch`는 그 오류 처리와 기본 경로 로직을 우회합니다.

## 6단계 — 최초의 기능(아직 모방할 것이 없음)

프로젝트에 복사할 구현된 기능이 없으면, 구조를 지어내지 말고 이 문서화된 기본값으로 되돌아가십시오:

- 기능 폴더 안의 기능 소유 `*.repository.ts`.
- 응답 형태는 기능의 `dto/` 디렉터리 아래 평범한 내보낸 타입.
- 쿼리와 본문에 class-validator DTO; 사용자 정의 파이프 없음.
- 페이지 컴포넌트는 `src/app/**/page.tsx`에 직접, 별도 뷰 디렉터리 없음.
- 상대 `/api/...` 경로에 대한 그냥 `fetch`.

어떤 기본값을 적용했는지 말하십시오, 그래야 첫 기능의 관례가 우연이 아니라 드러난 결정이 되고, 이후 코드베이스가 그것을 물려받지 않습니다.

## 참조 체인

```
src/app/<route>/page.tsx           (web — thin wrapper, or the page itself)
  → <view component>                (web — markup, state, data fetching)
    → fetch / apiGet('/api/<resource>')
      ⇢ rewrite in next.config.ts ⇢ http://<api-host>/api/<resource>

<Feature>Controller                 (api — routing, DTO binding; no logic)
  → <Feature>Service                (api — orchestration; throws domain errors)
    → <Feature>Repository           (api — every Drizzle query lives here)
      → schema.ts                   (api — the tables, owned by /drizzle-migration)
  ← <Feature>Response               (api — mapped shape, never a raw row)
```

Drizzle 쿼리가 리포지터리를 벗어나게 하지 말고, 원시 데이터베이스 행이 컨트롤러의 반환 타입에 도달하게 하지 마십시오 — 그 두 경계가 백엔드를 두 계층으로 테스트 가능하게 만듭니다.
