# AIWF 메타데이터 관리 시스템 PRD

_(GitHub Issue 사용 옵션형 — 미사용 시에도 동작하도록 설계)_

## 목차

1. 제품 개요
2. 참고 서비스 및 도입 근거
3. 핵심 기능 및 상세 사양
4. 추가 제안 기능
5. 타깃 유저 페르소나 & 사용 시나리오
6. 기술 스택 제안
7. 부록 – 저장·동기화 전략(옵션별)

---

## 1. 제품 개요

> **문제**  
> AIWF 프로젝트는 마일스톤·스프린트·태스크 정보를 Markdown 파일에 분산 저장한다. 여러 사람이 동시 작업할 때  
> • 어떤 ID가 이미 존재하는지  
> • 누가 어떤 태스크를 맡았는지  
> • 상태가 최신인지  
> 를 파악하기 위해 매번 디렉터리를 전수 검색해야 한다.

> **해결**  
> `index.json` 단일 진실 소스(SSOT)를 자동 생성·검증하고, **Git 브랜치 + 잠금 필드**로 동시 편집 충돌을 차단한다.  
> GitHub Issue 연동은 **옵션**으로 제공하여, 오프라인·사내 Git 서버에서도 동일한 워크플로를 유지한다.

---

## 2. 참고 서비스 및 도입 근거

| 레퍼런스 서비스        | 핵심 기능                        | 도입 근거                                          |
| ---------------------- | -------------------------------- | -------------------------------------------------- |
| **GitHub Projects V2** | 칸반·타임라인 · Issue/PR 연동    | GitHub 저장소 기반 협업일 때 시각화·알림이 우수    |
| **Atlassian Jira**     | 워크플로/상태 전이 · 강력한 필터 | 대규모 팀이 복잡한 워크플로를 모델링하는 사례 참고 |
| **Notion Database**    | 자유로운 속성 추가 · 뷰 전환     | Markdown 유사 환경 + 메타데이터 확장성 참고        |
| **Linear**             | 빠른 키보드 UX · 흐름 최소화     | 개발자 생산성을 높이는 경량 UI 아이디어 차용       |

---

## 3. 핵심 기능 및 상세 사양

| 분류                | 기능                        | 사양                                                                                     |
| ------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| 메타데이터          | **index.json 생성**         | `npm run aiwf:sync` → Markdown front-matter 파싱 후 마일스톤·스프린트·태스크 맵 생성     |
| 검증                | **validate-index**          | 중복 ID, 잠금 충돌, 규칙 위반 CI 차단<br/>`npm run validate-index` & GitHub Actions      |
| 동시 작업           | **lockedBy 필드**           | `moon lock TS01` → `lockedBy`·`lockTime` 기록, 병행 작업 충돌 시 git merge conflict 유도 |
| Git 통합            | **브랜치 네이밍 규칙**      | `feat/MS01-SP02-implement-login-api` 식으로 범위 명시                                    |
| CI/CD               | **validate-index.yml**      | PR 시 `aiwf:sync` → `validate-index` 자동 실행                                           |
| CLI                 | **moon lock/unlock** (단축) | commander 기반 CLI; 잠금/해제 & 상태 변경                                                |
| 옵션형 GitHub Issue | **Issue ↔ index 싱크**      | (선택) `moon sync issues` 커맨드: Issue Label ↔ ID 매핑 후 index 갱신                    |

### 데이터 스키마 요약

```jsonc
{
  "tasks": {
    "TS01": {
      "type": "task", // task|sprint|milestone
      "status": "in-progress",
      "sprint": "SP01",
      "milestone": "MS01",
      "lockedBy": "drumcap", // null ⇒ free
      "lockTime": "2025-06-29T08:15:03Z"
    }
  }
}
```

---

## 4. 추가 제안 기능

| 기능                | 설명                                         | 기대 효과                               |
| ------------------- | -------------------------------------------- | --------------------------------------- |
| VSCode 확장         | `index.json` 시각화 Tree View + 잠금 UI      | 실시간 상태 확인 & 클릭 한 번 잠금/해제 |
| 간트 차트 HTML      | `moon gantt` 명령으로 HTML 산출              | 프로젝트 진행률 리포트 공유             |
| Git pre-commit hook | 자동 `sync` & `validate` → 실패 시 커밋 차단 | 규칙 위반 사전 방지                     |
| Slack/Bot 알림      | 태스크 락/언락, 상태 변경 시 알림            | 투명한 협업, 병렬 작업 충돌 최소화      |

---

## 5. 타깃 유저 페르소나 & 사용 시나리오

| 페르소나          | 목표                          | Pain Point                            |
| ----------------- | ----------------------------- | ------------------------------------- |
| **Backend Dev A** | API 기능 구현 완료 후 빠른 PR | 누가 같은 태스크 작업 중인지 불명확   |
| **PM B**          | 스프린트 진척률 리포트        | 여러 Markdown 파일을 열어 진척률 합산 |
| **DevOps C**      | CI 실패 최소화                | 메타데이터 오류로 PR 병합 지연        |

### 핵심 시나리오 ① — 개발자 작업 예약

1. `moon lock TS14`로 태스크 잠금
2. 기능 개발 후 `moon unlock TS14 --status=done`
3. PR → CI 통과 → 병합

### 핵심 시나리오 ② — PM 진척률 확인

1. `moon gantt --export`
2. HTML 레포트 Slack 공유 → 팀 회의에서 진행 상황 검토

---

## 6. 기술 스택 제안

| 범주   | 선택                                                         | 비고                           |
| ------ | ------------------------------------------------------------ | ------------------------------ |
| 런타임 | **Node.js ≥18**                                              | ES Module, async fs            |
| 언어   | **TypeScript** (추가 권장)                                   | 타입 안전, CLI/라이브러리 공유 |
| 패키지 | `commander`, `ora`, **`gray-matter`**, **`fast-glob`**       | front-matter 파싱 & 파일 찾기  |
| CI     | **GitHub Actions**                                           | PR 검증 · 배포 파이프라인      |
| 저장   | **Markdown + index.json** (기본)<br/>**GitHub Issue** (옵션) | 오프라인 OK / 클라우드 확장    |
| 배포   | npm package (`aiwf-cli`)                                     | 사내 NPM 레지스트리 배포 가능  |

---

## 7. 부록 – 저장·동기화 전략

| 시나리오            | 기본 동작                                   | GitHub Issue 미사용 시     |
| ------------------- | ------------------------------------------- | -------------------------- |
| **로컬 오프라인**   | Markdown edit → `sync-index` → `index.json` | 동일 – 모든 기능 100% 동작 |
| **GitHub PR**       | CI `validate-index` → PR 머지               | 동일 – Issue API 호출 생략 |
| **Issue 연동 필요** | `moon sync issues` → Label ↔ ID 매핑        | (사용 안 함) 옵션 스킵     |

> ⚠️ **GitHub Issue 연동은 전 과정에서 선택적**이며, 미사용 시에도 동시 편집 차단·진척률 통계 등 핵심 기능은 그대로 제공됩니다.
