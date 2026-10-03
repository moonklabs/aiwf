# 백엔드 모듈 레이아웃 감지

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-angular-jpa/skills/implement/references/module-layout.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

**식별자(name):** 파일명 `module-layout.md` (frontmatter 없음)

> 번역자 주: 본문에 나오는 상대 경로(`pom.xml`, `docs/...` 등)는 원문 설치 스킬 기준의 경로입니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

이것은 백엔드 코드를 작성하기 전에 `/implement`, `/flyway-migration`, `/spring-boot-test`가 사용하는 조회 절차입니다. 그 일은 한 가지 질문에 답하는 것입니다: **이 Spring Boot 백엔드는 헥사고날 계층을 별도 Maven 모듈로 나누는가, 아니면 하나의 평평한 모듈인가?** 절대 가정하지 말고 항상 이 감지를 먼저 실행하십시오. 평평한 스타일의 코드를 헥사고날 리액터에 생성하거나(또는 그 반대를) 하면 프로젝트의 모듈 의존 방향이 깨집니다(예: 프레임워크 의존성이 전혀 없는 `domain` 모듈에 JPA `@Entity`가 실수로 들어가는 경우).

## 1단계 — 실제 리액터 찾기

백엔드의 루트 `pom.xml`을 읽으십시오. 그것이 얇은 집계자 — `<packaging>pom</packaging>`, 형제 디렉터리를 가리키는 `<modules>` 목록, 자체 Java 소스 없음(저장소의 최상위 `pom.xml`이 프런트엔드 자리 표시자 모듈과 백엔드 디렉터리를 함께 집계할 때 흔합니다) — 라면, 나열된 모듈 중 그 자체가 추가 `<modules>`를 선언하는 모듈로 내려가서 *그* 중첩 `pom.xml`의 모듈 목록을 후보 리액터로 취급하십시오. 최상위 집계자가 단순한 래퍼라면 거기서 멈추지 마십시오.

## 2단계 — 키워드 버킷으로 각 모듈 분류

각 모듈의 디렉터리 이름 / `artifactId`(공통 프로젝트 이름 접두사를 제거한 뒤의, 대소문자 구분 없는 부분 문자열)를 다음 버킷과 대조하십시오:

| 버킷 | 키워드 |
|------|--------|
| 도메인(Domain) | `domain` |
| 비즈니스/애플리케이션(Business/Application) | `business`, `application`, `service`, `core` |
| 영속성 어댑터(Persistence adapter) | `postgres`, `jpa`, `persistence`, `db`, `infra*`, `data` |
| 인바운드 어댑터(Inbound adapter) | `api`, `web`, `rest`, `controller` |
| 조합 루트(Composition root) | `app`, `bootstrap`, `launcher`, `main`, `runner` |

## 3단계 — 신뢰 게이트

도메인 버킷 모듈이 존재하고 **그리고** {비즈니스/애플리케이션, 영속성 어댑터, 인바운드 어댑터} 중 최소 둘도 존재할 때만 **헥사고날 멀티모듈**로 분류하십시오. 단일 키워드 일치만으로 패턴을 바꾸지 마십시오.

그렇지 않으면 → **평평한 단일 모듈**입니다. 조용히 하나를 고르지 말고 응답에서 명시적으로 말하십시오("N개 모듈을 찾았지만 계층 분할로 확신 있게 분류하지 못했습니다 — `<module>`에 평평한 패턴으로 구현합니다; 이 프로젝트가 다른 계층 관례를 따른다면 알려 주십시오").

## 4단계 — 헥사고날인 경우, 새 코드를 쓰기 전에 기존 기능을 모방

분류된 모듈 전반에서 이미 구현된 엔티티/기능 하나를 찾아 그 정확한 형태를 복사하십시오 — 이 휴리스틱만으로 고립 상태에서 순수하게 생성하지 마십시오:

- **아웃바운드 포트 위치**: 저장소/포트 인터페이스가 서비스 클래스 옆의 평범한 형제 파일인가, 아니면 전용 `port`/`port.out` 하위 패키지에 있는가? 존재하는 쪽에 맞추십시오.
- **인바운드 포트**: 리액터 어디든 유스 케이스/인바운드 포트 인터페이스가 존재하는가(컨트롤러가 구체 서비스를 직접 호출하는 대신 그것에 대해 구현하는 것)? 프로젝트 전역에 없다면 새 기능을 위해 **새로 만들지 말고** 컨트롤러에서 구체 `@Service` 클래스를 직접 호출하여 기존의 비대칭 관례에 맞추십시오.
- **DTO 변환**: DTO 레코드 자체에 있는 정적 팩터리 메서드인가(예: `XxxDTO.fromBusiness(domainObject)`), 아니면 별도 매퍼 클래스인가? 존재하는 쪽에 맞추십시오. 요청 측과 응답 측이 다른 방식을 쓰는 것은 정상입니다 — 둘을 하나로 통일하지 말고 각 측의 관례를 복사하십시오.

## 5단계 — 최초의 헥사고날 유스 케이스 (아직 모방할 것이 없음)

리액터가 헥사고날 멀티모듈로 분류되었지만 복사할 기존 기능이 없으면, 교과서식 완전 헥사고날을 새로 발명하지 말고 이 문서화된 기본값으로 대체하십시오:

- 아웃바운드 포트는 business 모듈의 평범한 형제 인터페이스(`port` 하위 패키지 아님).
- 인바운드 포트/유스 케이스 인터페이스 없음 — 컨트롤러가 구체 서비스를 직접 호출.
- 응답 경로의 DTO→도메인 변환은 DTO 레코드 자체의 정적 팩터리 메서드로.

## 참조 체인 (헥사고날인 경우)

```
<Feature>Controller                    (inbound adapter module)
  → <Feature>Service                    (business module, concrete class — no interface)
    → <Feature>Factory / mapper         (business module — request DTO → domain, if the project uses one)
    → <Feature>Repository (interface)   (business module — the one real port)
      → <Feature>RepositoryImpl         (persistence adapter module, implements the port)
        → <Feature>EntityConverter      (persistence adapter module — domain → JPA entity)
        → <Feature>JpaRepository        (persistence adapter module — Spring Data JpaRepository<Entity, ID>)
        → <Feature>Converter            (persistence adapter module — JPA entity → domain, back-conversion)
  → <Feature>DTO.fromBusiness(...)      (business module — domain → response DTO)
  ← ResponseEntity<...DTO>
```

JPA `@Entity`, Spring 애너테이션, 영속성 임포트가 domain 모듈로 새어 들어가게 하지 마십시오 — 그 모듈의 존재 이유 전체가 프레임워크 의존성 제로입니다.
