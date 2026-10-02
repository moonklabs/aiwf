# Spec Workflow Example: 지출 내역 제출

AIUP(AI Unified Process) 명세 산출물을 최소 구성으로 끝까지 보여주는 예제다.
헤딩, 라벨, 상태 토큰, 식별자는 파서 호환을 위해 영어를 유지하고, 서술 내용은 한국어로 적는다.

## 구성

| 경로 | 내용 |
|------|------|
| `docs/vision.md` | 제품 비전, 문제, 결과, 범위 밖 |
| `docs/requirements.md` | 기능 요구사항 FR-001 |
| `docs/glossary.md` | 도메인 용어와 금지 동의어 |
| `docs/entity_model.md` | 엔터티와 속성 |
| `docs/use_cases.puml` | 유스케이스 다이어그램 |
| `docs/use_cases/UC-001-submit-expense.md` | 유스케이스 명세 |
| `docs/test_cases/TC-001-submit-expense.md` | 테스트 케이스 |

## 상태

- 유스케이스 UC-001: Reviewed
- 테스트 케이스 TC-001: Reviewed
- 요구사항 FR-001: Open
- 비전, 요구사항, 용어집, 엔터티 모델: Reviewed

식별자와 파일 이름은 도구 호환을 위해 영어 슬러그(`UC-001-submit-expense`, `TC-001-submit-expense`)를 쓰고,
화면에 보이는 유스케이스 이름과 본문 서술은 한국어를 쓴다. 추적의 기준 키는 한국어 제목이 아니라 ID(UC-001, TC-001)다.

## 검증

저장소 루트에서 다음을 실행한다.

```bash
python3 plugins/aiwf-core/skills/spec-review/scripts/spec_lint.py \
  --docs examples/spec-workflow/docs --strict --no-baseline

python3 plugins/aiwf-core/skills/use-case-spec/scripts/validate_use_case.py --strict \
  examples/spec-workflow/docs/use_cases/UC-001-submit-expense.md

python3 plugins/aiwf-core/skills/spec-review/scripts/spec_lint.py \
  --docs examples/spec-workflow/docs --trace
```

## 이 예제가 증명하는 것과 증명하지 않는 것

이 예제는 명세 문서가 파서의 구조 규칙과 문서 사이의 상호 참조 규칙을 통과함을 보여준다.
린트 통과는 다음을 뜻하지 않는다.

- 비즈니스 수용: 실제 이해관계자가 내용과 범위를 검토해 승인했다는 증거가 아니다.
- 한국어 의미 완전성: 린터는 영어 기준의 구조와 어휘를 검사하므로, 한국어 서술의 누락, 모호함, 문서 사이의 모순을 탐지하지 않는다.
- 구현 일치: 코드가 이 명세를 구현했는지는 별도의 검증 대상이다.

따라서 `Status: Reviewed`는 문서 상태이지 승인, 완료, 비즈니스 수용의 선언이 아니다.

지출 제출은 설명을 위한 가상 제품이다. 실제 회사 규정이나 고객 요구사항을 근거로 작성한 문서가 아니다.
