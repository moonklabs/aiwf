# AIWF Spec 플러그인 안내

> 플러그인 README 한글 검토본입니다. 원문: [README](../../../plugins/aiwf-spec/README.md). 검토 상태와 원문 SHA256은 [관리 목록](../manifest.json)에서 확인합니다. 번역과 자동 검사는 승인을 뜻하지 않습니다.

AIWF workflow 래퍼는 AIUP 기반 방법론 core와 함께 사용합니다. 저장소 CLI를 사용하는 AIWF 자체 `workflow` 스킬을 추가하고, upstream 스킬은 함께 있는 [aiwf-core](../../../plugins/aiwf-core/README.md) 플러그인에 있습니다.

## 구성

- `skills/workflow`: 호스트에 종속되지 않는 작업 추적, 명시적인 검증 근거와 승인 경계, 향후 Sprintable 인계 지점을 다루는 AIWF 자체 스킬입니다. 이 플러그인에 있는 유일한 스킬이며 upstream 대응물은 없습니다.
- `LICENSE` 및 `NOTICE` (Apache-2.0).

upstream 스킬 7개(요구사항, 엔티티, 유스케이스, 여정, 역공학, 명세 검토)는 이 플러그인에서 빠졌습니다. 스킬은 변경 없이 [aiwf-core](../../../plugins/aiwf-core/README.md)로 옮겼습니다. 정확한 원본 커밋, 기존 해시, 유일한 NOTICE 출처 변경은 core의 [UPSTREAM.json](../../../plugins/aiwf-core/UPSTREAM.json)에 기록되어 있습니다. 이 플러그인 자체에는 `UPSTREAM.json`이 없습니다.

표준 프로젝트 산출물은 `docs/vision.md`, `requirements.md`, `glossary.md`, `entity_model.md`, `use_cases.puml`, `use_cases/UC-*.md`, `test_cases/TC-*.md`이며 `processes/*.bpmn`은 선택 사항입니다. 구조 헤딩과 상태 토큰은 영어로 유지하고 본문은 한국어로 작성할 수 있습니다. 구조 검사가 한국어 의미의 완전성을 보장하지는 않습니다. 구조 검사기는 `aiwf-core/skills/spec-review/scripts/spec_lint.py`입니다.

Claude Code에서는 마켓플레이스의 필수 `aiwf-core`와 래퍼인 `aiwf-spec`을 설치합니다. Codex는 `scripts/install-spec-skills.mjs`로 완전한 스킬 폴더를 복사하며, 기본적으로 core 7개와 이 플러그인의 `workflow`를 설치합니다. 설치된 이름에는 `aiwf-` 접두사가 붙습니다. 파일 설치 검증은 완료됐지만, 실제 호스트의 스킬 발견 및 모델 실행은 별도 검증 단계입니다. MCP 서버는 자동으로 설치하지 않습니다.

`workflow` 스킬은 초기화, 핀, 변경 감지, 검증 패킷을 위한 저장소 CLI `src/cli/spec-cli.js`(npm 실행 파일 `aiwf-spec`)를 사용합니다. 마켓플레이스 플러그인만 설치해도 이 바이너리는 설치되지 않습니다. CLI는 AI 모델을 호출하거나 애플리케이션 검사를 실행하거나 Sprintable에 게시하거나 승인을 부여하지 않습니다. [저장소 방향 문서](../../modernization/DIRECTION.ko.md)를 참고하세요.
