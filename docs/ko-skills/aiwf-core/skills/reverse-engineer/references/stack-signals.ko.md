# 스택 신호 — 액터, 유스케이스, 엔티티를 찾는 곳 (Stack signals)

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-core/skills/reverse-engineer/references/stack-signals.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

이것은 스크립트가 아니라 조회표다. 빌드 파일에서 프로젝트의 스택을 식별한 뒤 사용한다. 각 섹션은 독립적이므로, 앞에 있는 프로젝트와 맞는 것만 읽는다.

## Java / Spring Boot

- **빌드 파일**: `pom.xml`, `build.gradle(.kts)`. `spring-boot-starter-*` 의존성에서 사용 중인 모듈을 확인한다(`-web`, `-security`, `-data-jpa`, `-jooq`, `-thymeleaf` 등).
- **진입점**:
    - `@RestController`, `@Controller` 클래스.
    - Vaadin 뷰: `@Route(...)`가 붙은 클래스 또는 `Component` / `VerticalLayout`을 상속하고 라우터 레이아웃에서 도달 가능한 클래스.
    - 스케줄된 작업: `@Scheduled`.
    - 메시지 리스너: `@KafkaListener`, `@RabbitListener`, `@JmsListener`, `@EventListener`.
- **액터**:
    - `SecurityFilterChain` 구성 — `requestMatchers(...).hasRole("X")`, `.authenticated()`, `.permitAll()`.
    - 메서드 수준 `@RolesAllowed`, `@PreAuthorize`, `@Secured`.
    - 사용자 정의 `UserDetailsService`와 역할/권한 enum.
- **엔티티**:
    - JPA: `@Entity` 클래스(`@OneToMany`, `@ManyToOne`, `@OneToOne`, `@ManyToMany`에서 관계 도출).
    - jOOQ: 스키마가 애노테이션 클래스가 아니라 Flyway 마이그레이션(`src/main/resources/db/migration/V*.sql`)에 있다; 생성된 클래스가 DDL을 그대로 반영한다.
    - 검증: Bean Validation 애노테이션(`@NotNull`, `@Size`, `@Email`, `@Min`, `@Max`, `@Pattern`).
- **테스트**: `@SpringBootTest`, `@WebMvcTest`, Vaadin Browserless / Karibu 뷰 테스트, `src/test/` 아래 Playwright 테스트. 유스케이스 이름을 딴 테스트(예: `UC001NameOfUcTest`)는 금광이다 — 성공 시나리오와 대안 흐름을 이미 담고 있다.

## Python / Django

- **빌드 파일**: `requirements.txt`, `pyproject.toml`, `manage.py`.
- **진입점**: `urls.py`(URL conf), 뷰 함수와 클래스 기반 뷰(`View`, `ListView`, `CreateView` 등), DRF `ViewSet`과 `APIView`, Celery 작업(`@shared_task`).
- **액터**:
    - `auth` 앱의 그룹과 권한(`Group`, `Permission`).
    - `LoginRequiredMixin`, `PermissionRequiredMixin`, `@login_required`, `@permission_required`.
    - DRF 권한 클래스(`IsAuthenticated`, 사용자 정의 `BasePermission` 하위 클래스).
- **엔티티**: `models.py` 파일. `ForeignKey`, `OneToOneField`, `ManyToManyField`에서 관계 도출. `validators=[...]`, `null=`, `blank=`, `unique=`, `choices=`에서 검증 도출. 마이그레이션은 `<app>/migrations/` 아래에 있다.
- **테스트**: `tests.py` 또는 `tests/` 디렉터리; `TestCase` 하위 클래스.

## Python / Flask 또는 FastAPI

- **진입점**: `@app.route(...)`(Flask), `@app.get/post/...`(FastAPI), Blueprint 등록, `APIRouter` 포함.
- **액터**: Flask-Login `@login_required`, 사용자를 해석하는 FastAPI 의존성(`Depends(get_current_user)`), 사용자 정의 데코레이터.
- **엔티티**: SQLAlchemy `Base` 하위 클래스, 영속화 계층으로 쓰이면 Pydantic 모델. 마이그레이션은 Alembic(`migrations/versions/`).

## Node.js / TypeScript / Express

- **빌드 파일**: `package.json`. `express`, `koa`, `fastify`, `nestjs`, `next`를 확인한다.
- **진입점**:
    - Express: `app.get/post/...`, `router.use(...)`.
    - NestJS: `@Controller(...)`, `@Get`, `@Post` 등; 마이크로서비스용 `@MessagePattern`.
    - Next.js: `pages/api/*`(pages router), `app/**/route.ts`(app router), `app/**/page.tsx`의 서버 액션.
- **액터**: `req.user`를 설정하는 미들웨어, `RolesGuard`와 함께 쓰는 NestJS `@UseGuards(...)`, NextAuth 세션 콜백, 사용자 정의 JWT 미들웨어.
- **엔티티**:
    - Prisma: `schema.prisma`가 엔티티와 관계의 진실 공급원이다.
    - TypeORM: `@Column`, `@OneToMany` 등이 붙은 `@Entity` 클래스.
    - Sequelize: `Model.init({...})` 호출.
    - Drizzle: `schema.ts`의 `pgTable(...)` 호출.
- **Prisma → AI Unified Process 타입 매핑** (Prisma/SQL 타입을 엔티티 모델에 결코 복사하지 말고 모든 열을 번역한다):

  | Prisma 타입                       | AI Unified Process Data Type | Length/Precision | Validation Rules                  |
  |-----------------------------------|----------------|------------------|-----------------------------------|
  | `Int @id @default(autoincrement())` | `Long`       | 19               | `Primary Key, Sequence`           |
  | `Int`                             | `Integer`      | 10               | `Not Null`                        |
  | `String`                          | `String`       | 255 (또는 실제값)  | `Not Null`                        |
  | `String @unique`                  | `String`       | 255              | `Not Null, Unique`                |
  | `String?` (선택)              | `String`       | 255              | `Optional`                        |
  | `Decimal @db.Decimal(10, 2)`      | `Decimal`      | 10,2             | `Not Null, Min: 0`                |
  | `Boolean`                         | `Boolean`      | —                | `Not Null`                        |
  | `DateTime @default(now())`        | `DateTime`     | —                | `Not Null`                        |
  | relation field `userId Int`       | `Long`         | 19               | `Not Null, Foreign Key (USER.id)` |

  `@db.Decimal`, `Decimal(10,2)`, `Int`, `String?`, `bigint`, `VARCHAR`, `TEXT`는 `entity_model.md` 어디에도 나타나서는 **안 된다** — 그것들은 구현 세부이며 AI Unified Process 어휘가 아니다. `String` 열의 `// "customer" or "admin"` 주석은 `Not Null, Values: customer, admin`으로 매핑된다.
- **검증**: class-validator 데코레이터, Zod 스키마, Joi 스키마, Yup 스키마 — Node 생태계에서 가장 풍부한 비즈니스 규칙 출처다.

## Angular 프런트엔드

Angular SPA의 "진입점"은 그것이 호출하는 백엔드 API만이 아니라 SPA 자체의 라우트다. 프로젝트가 Angular 프런트엔드와 별도 백엔드(예: `aiup-angular-jpa`의 Spring Boot API)를 함께 둘 때는 양쪽을 모두 읽는다: 프런트엔드 라우트에서 액터와 유스케이스를 복원하고, 백엔드의 도메인/DTO 형태에 대조하여 엔티티를 확인한다.

- **빌드 파일**: `angular.json`, `package.json`(`@angular/core`, `@angular/router` 확인).
- **진입점**: `app.routes.ts`의 라우트 정의(평탄한 `Routes` 배열), 또는 큰 앱에서는 지연 로드 라우트 구성(`loadComponent`/`loadChildren`). 각 최상위 라우트는 보통 하나의 유스케이스에 대응한다; 생성/편집/삭제용 중첩 폼이나 대화상자가 있는 라우트도 여전히 세 개가 아니라 하나의 유스케이스("Manage X")일 수 있다.
- **액터**: 라우트 가드(`canActivate`, `canActivateChild`, 함수형 가드), 있으면 인증 서비스/인터셉터. 독립 컴포넌트(standalone component) 시대의 Angular 앱에는 이런 것이 아직 없는 경우가 많다 — 코드가 구분하지 않는 액터를 지어내지 않는다.
- **엔티티**: `*.model.ts` 파일의 TypeScript 인터페이스로, 보통 그것을 가져오는 서비스와 같은 위치에 있다(예: `services/<entity>.ts` + `services/<entity>.model.ts`) — 별도 `models/`/`dto/` 폴더가 아니다. 이것은 백엔드의 도메인/DTO 형태를 반영한다 — 둘 다 있으면 백엔드의 엔티티 모델을 우선하고, 프런트엔드만 있을 때 프런트엔드 타입을 대체로 쓴다.
- **테스트**: `src/**/*.spec.ts` 아래 Vitest 스펙(Angular의 최신 `@angular/build:unit-test` 빌더이며, 전통적인 Jasmine/Karma 기본값이 아니다 — 해당 프로젝트가 어느 것을 쓰는지 `angular.json`의 `test` architect 타깃으로 확인한다), `tests/e2e/` 또는 `e2e/` 아래 Playwright 스펙. 유스케이스 이름을 딴 테스트(예: `UC-010-browse-product-catalog.spec.ts`)나 `@UC-XXX` 태그가 붙은 테스트는 금광이다 — 성공 시나리오와 대안 흐름을 이미 담고 있다.

## Ruby / Rails

- **진입점**: `config/routes.rb`, `app/controllers/` 아래 컨트롤러, ActionMailer mailer, ActiveJob job.
- **액터**: `before_action :authenticate_user!`(Devise), Pundit 정책, CanCanCan ability, `users`의 사용자 정의 역할 열.
- **엔티티**: `app/models/*.rb`. `has_many`, `belongs_to`, `has_one`, `has_and_belongs_to_many`에서 관계 도출. `validates :field, ...`에서 검증 도출. 스키마는 `db/schema.rb`(정본)와 `db/migrate/`.

## Go

- **진입점**: `http.HandleFunc`로 등록한 HTTP 핸들러, 라우터 라이브러리(chi, gin, echo, fiber). 생성된 인터페이스를 구현하는 gRPC 서비스.
- **액터**: 요청 컨텍스트에 사용자 신원을 장식하는 미들웨어; 역할 검사는 보통 핸들러 안에 인라인으로 있다.
- **엔티티**: `sqlc` 생성 struct(스키마는 `query.sql` / `schema.sql`), 태그가 있는 GORM struct, `ent/schema/` 아래 Ent 스키마.

## C# / .NET

- **빌드 파일**: `*.csproj`, `*.sln`, `Program.cs`. 패키지 참조에서 사용 중인 구성 요소를 확인한다(`Microsoft.EntityFrameworkCore.*`, `Microsoft.AspNetCore.Components.Web`, `bunit`, `Microsoft.Playwright.Xunit` 등).
- **진입점**:
    - Blazor 컴포넌트: `@page "/..."` 지시문(과 선택적 `@rendermode`)이 있는 `.razor` 파일.
    - Web API / Minimal API: `app.MapGet(...)`, `app.MapPost(...)`, `[ApiController]` 클래스.
    - 백그라운드 서비스: `IHostedService` 또는 `BackgroundService` 구현.
- **액터**:
    - 컨트롤러나 Razor 페이지의 `[Authorize(Roles = "...")]` 특성.
    - Blazor 템플릿의 `<AuthorizeView Roles="...">` 또는 `<AuthorizeView Policy="...">` 컴포넌트.
    - ASP.NET Identity 클레임/역할, 사용자 정의 `AuthorizationHandler<T>`, `Program.cs`의 정책 등록.
- **엔티티**:
    - EF Core: `DbSet<T>` 속성을 가진 `DbContext` 클래스.
    - `[Key]`, `[Required]`, `[ForeignKey]`, `[MaxLength]`가 붙은 엔티티 클래스, 또는 Fluent API(`IEntityTypeConfiguration<T>` 구현이나 `OnModelCreating`)로 구성된 클래스.
    - `Migrations/` 디렉터리 아래 마이그레이션.
- **C# → AI Unified Process 타입 매핑**:

  | C# / .NET 타입                       | AI Unified Process Data Type | Length/Precision | Validation Rules                  |
  |--------------------------------------|----------------|------------------|-----------------------------------|
  | `long` / `long?`                     | `Long`         | 19               | `Primary Key`(ID인 경우) / `Not Null`|
  | `int` / `int?`                       | `Integer`      | 10               | `Not Null`                        |
  | `string`                             | `String`       | 255 (또는 실제값)  | `Not Null`                        |
  | `decimal`                            | `Decimal`      | 10,2             | `Not Null, Min: 0`                |
  | `bool`                               | `Boolean`      | —                | `Not Null`                        |
  | `DateTime` / `DateTimeOffset`        | `DateTime`     | —                | `Not Null`                        |
  | `DateOnly`                           | `Date`         | —                | `Not Null`                        |
  | Foreign Key `long CustomerId`        | `Long`         | 19               | `Not Null, Foreign Key (CUSTOMER.id)` |

- **테스트**: `bUnit` 테스트(`TestContext`, `RenderComponent<T>`), `xUnit` / `NUnit` 스펙, 그리고 `*.Tests/` 또는 `*.Tests.E2E/` 아래 Playwright 테스트(`PageTest` 하위 클래스).

## 데이터베이스 전용 신호 (스택과 무관)

ORM이 모든 것을 담지 못할 때는 스키마로 폴백한다:

- **마이그레이션 디렉터리**: 보통 정본이다. 마이그레이션을 앞으로 거슬러 가며 각 표의 최신 상태를 찾는다.
- **외래 키 제약**: `REFERENCES` 절이 카디널리티를 준다. `ON DELETE CASCADE`는 흔히 합성(composition)을 뜻하고(자식이 부모 없이 존재할 수 없음 — 보통 `||--o{`), `ON DELETE SET NULL`은 더 약한 연관을 뜻한다.
- **고유 제약**: 고유 외래 키는 1:1 관계다.
- **CHECK 제약**: 비즈니스 규칙으로 바로 번역된다.
- **조회 표(lookup tables)**: `(id, code, label)` 형태의 작은 표는 흔히 열거 값을 나타낸다; 엔티티 모델에서 자체 수명주기가 없으면 별도 엔티티가 아니라 부모의 `Values: A, B, C` 검증이 될 수 있다.

## 무엇이 액터이고 무엇이 그냥 인증된 사용자인가

코드가 실제로 구분하는 것 이상으로 액터를 늘리지 않는다:

- 모든 인증 라우트가 사용자 속성과 무관하게 같은 일을 하면 액터는 하나다: "User"(또는 도메인이 부르는 대로 — "Customer", "Member", "Tenant").
- 라우트가 `hasRole(...)`로 분기하면 액터가 여럿이다. 역할 이름을 붙인다.
- 익명 라우트(가입, 공개 카탈로그)가 있으면 "Visitor" 또는 "Guest"를 액터로 추가한다.
- 시스템이 인바운드 웹훅, 스케줄된 작업, 메시지 큐 이벤트를 처리하면 업스트림 시스템이나 스케줄러에 대한 액터를 추가한다.
