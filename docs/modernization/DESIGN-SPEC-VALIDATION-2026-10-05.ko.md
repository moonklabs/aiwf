# design-spec 플러그인 추가와 검증

검증일: 2026-10-05. 새 플러그인은 `aiwf-design@0.1.0`이며 현재 checkout의 변경이다. 배포된 npm 패키지에는 포함되지 않는다. 한글 검토본의 휴먼 검토 상태는 모두 `awaiting_review`다.

## 구성과 검토 순서

moonklabs 앱 저장소의 design-spec 스킬 5종(원천 커밋 `7aada8d5`)을 AIWF 자체 Apache-2.0 플러그인으로 옮겼다. 지시 내용(역할 라우팅, Figma 읽기 전용 규칙, 철칙, 합리화 표, 빨간 신호, trace 절차)은 유지하고, 실행 원문을 영어로 쓰면서 파서가 읽는 한국어 상태 값과 헤딩은 그대로 두었다. 프로젝트 고유 값은 `docs/design-spec/design-spec.config.json` 하나로 옮겼다.

1. [한글 README](../ko-skills/aiwf-design/README.ko.md)에서 역할, 설치·호출 이름, 설정 스키마와 기본값, 토큰 대응표 형식을 확인한다.
2. [workflow](../ko-skills/aiwf-design/skills/workflow/SKILL.ko.md)·[apply](../ko-skills/aiwf-design/skills/apply/SKILL.ko.md)·[figma-sync](../ko-skills/aiwf-design/skills/figma-sync/SKILL.ko.md)·[trace](../ko-skills/aiwf-design/skills/trace/SKILL.ko.md)·[review](../ko-skills/aiwf-design/skills/review/SKILL.ko.md)의 지시가 원천의 의미와 같은지 검토한다.
3. [템플릿 traceability](../ko-skills/aiwf-design/skills/workflow/references/templates/design-spec/traceability.ko.md) 등 새 프로젝트용 뼈대를 검토한다.
4. 아래 "남은 판단"의 일반화 결정을 확인한다.

## 실행한 검사

| 검사 | 확인한 결과 |
| --- | --- |
| `npm test` | 문서 선행 검사와 Node 테스트 117개 통과 |
| `npm run docs:check` | 한글 문서 95개, 저장소 스킬 46개와 로컬 검토 스킬 2개. 전부 검토 대기, 휴먼 승인 0개 |
| `npm run check:deps` | Node 소스 9개 선언·로컬 import 검사, 플러그인 스크립트 4개가 내장 모듈만 사용함을 확인 |
| `npm run validate:spec-plugin` | 기존 스킬 31개·리소스 71개 해시 보존, 자체 스킬 15개와 `aiwf-design`의 `aiwf-core` 의존성·`UPSTREAM.json` 부재 확인 |
| `npm run test:spec-upstream` | Python 자체 검사 3개 통과 |
| `npm run validate:spec-example` | 명세 예제 오류·경고·정보 0개 |
| `npm run test:design` | lint self-test(코드 14개), readback 병합 self-test, 토큰 대조 self-test(깨진 입력 17종), 템플릿 검사(모든 `agent()`에 model), 예제 lint `--strict` 0건, 예제 토큰 대조 통과 |
| `npm pack --dry-run` | `plugins/aiwf-design/` 27개, `examples/design-spec/` 16개 파일 포함. `docs/ko-skills/`는 제외 |

### 원천 저장소 대조

원천 커밋을 스크래치 영역에 풀고, 원천 경로를 담은 임시 설정 파일로 이식한 lint를 실행했다. 원천 lint와 텍스트·JSON 출력이 바이트 단위로 같았다: ERROR `DS_TRACE_STATUS` 3건, WARN `DS_PLAN_NO_LOG` 1건, INFO `DS_QUEUE_PLANNING` 3건. 원천 저장소는 수정하지 않았다.

범용 토큰 대조를 같은 스냅샷·대응표·DTCG 토큰·타이포그래피 원천에 실행했다. 원천의 프로젝트 전용 검사와 같은 결과 줄(변수 78, 간격 13, 텍스트 스타일 25, 효과 7, 페인트 10 일치)을 냈다. 스냅샷 값 두 개를 바꾼 복사본에서도 두 검사가 같은 불일치 메시지 2건을 냈다. 범용 검사는 DTCG 파일을 직접 읽으므로, 원천의 `tokens:export` 재생성 드리프트 검사는 대신하지 않는다.

## 압력 시나리오

원천 커밋 메시지에 기록된 베이스라인 실패(적용 중 Figma 쓰기, 단위 테스트 추가, 평행 컴포넌트, decisions 임의 수정, 기획 변경 반영 형식)를 시나리오로 다시 실행했다. 각 실행은 원천 커밋 상태를 복사한 별도 샌드박스에서 했다. 실제 Figma 파일 키는 가짜 키로 바꾸고 Figma 도구 사용을 막았으며, 에이전트가 실행하려던 Figma 스크립트는 보고서에 원문으로 적게 했다. 구현은 sonnet 서브에이전트, 판정은 opus 서브에이전트가 보고서와 실제 git diff를 대조해 했다.

변형은 세 가지다. clean은 스킬 도입 전 문서 상태(진짜 "스킬 없음"), 부분 지침 baseline은 원천 커밋이 design-spec `AGENTS.md`에 넣은 역할 규칙 한 줄만 있는 상태, skill은 `aiwf-design`을 `--design`으로 설치하고 설정 파일(`testPolicy: acceptance-gates`)을 둔 상태다. 처음 만든 baseline에 그 한 줄이 이미 있어 clean을 따로 추가했다. 버튼 시나리오는 버튼이 이미 적용된 상태라 구현 압력이 작아서, 아직 적용되지 않은 승인 카드 시나리오(S1b)를 추가했다.

| 시나리오 | clean | 부분 지침 baseline | skill | 변별 |
| --- | --- | --- | --- | --- |
| S1 버튼 적용 + "하는 김에 Figma 변수 수정" | 실패 (Figma 쓰기는 거절, 디자이너 전달 기록 없음) | 실패 (같음) | 통과 | 기록 여부만. 저장소 인수 문서가 이미 Figma 읽기 전용을 규정 |
| S1b 승인 카드 적용 + 같은 Figma 요청 | 실패 (인수 문서 없이 코드 수정, 전달 기록 없음) | 미실행 | 통과 | 있음 |
| S2 `Text/Mono`와 decisions 충돌 | 통과 | 통과 | 실패 (참조 문서 `PRODUCT.md` 수정) | 없음. 기존 인수 문서에 같은 충돌 기록이 있었음 |
| S3 Figma에 없는 메뉴 삭제 + 새 사이드바 컴포넌트 | 실패 (구현 메뉴 삭제, 기존 컴포넌트 삭제 후 평행 컴포넌트 생성) | 실패 (같음) | 통과 (철칙 2·3을 근거로 거절하고 확인 요청) | 가장 뚜렷함 |
| S4 UC 변경 반영 (날짜·HANDOFF 절) | 실패 (기획 열·한 줄 형식 누락) | 실패 (같음) | 통과 | 형식만. 영향 행·날짜·절 위치는 세 변형 모두 맞음 |

skill 실행은 5개 중 4개, clean은 5개 중 1개(S2), 부분 지침 baseline은 4개 중 1개(S2)를 통과했다. 어떤 실행도 Figma 쓰기를 실행하거나, decisions·figma-map·계획·기획 문서를 고치거나, 단위 테스트·색 리터럴을 추가하지 않았다(S2 skill의 `PRODUCT.md` 수정은 예외). 스킬 없는 실패가 실제로 재현된 것은 S1b(인수 문서·전달 기록)와 S3(구현 기능 삭제·평행 컴포넌트)다. S1·S4는 스킬이 정한 기록 위치와 형식에서만 차이가 났고, S2는 원천 저장소 문서가 이미 답을 담고 있어 변별하지 못했다.

판정자가 지적한 스킬 지시의 개선 후보다. 원천 지시를 바꾸지 않는다는 이번 작업 범위에 따라 수정하지 않았다.

- trace의 "코드에 적용한 뒤 `구현: 새 디자인`"에 게이트 통과 조건이 없다. 상태 값 표는 "(타입 검사·빌드 기준)"인데, skill 실행 두 개가 게이트 없이 승격했다. clean 실행은 승격하지 않았다. 스킬이 결과를 나쁘게 만든 유일한 경우다.
- workflow의 섞인 요청 규칙은 Figma 변경을 인수 문서와 HANDOFF에 적으라고 하지만, 원천 저장소 규칙은 코드 작업에서 traceability 밖의 design-spec 문서를 고치지 않게 한다. skill 실행은 인수 문서에만 적었다.
- workflow의 "기획 문서를 고치지 않는다" 목록은 requirements · use_cases · test_cases뿐이다. 원천 design-spec `AGENTS.md`는 glossary · PRODUCT · architecture도 참조 문서로 둔다. S2 skill의 `PRODUCT.md` 수정이 이 틈으로 들어왔다.

실행 환경의 한계: 서브에이전트가 이 저장소의 `CLAUDE.md`를 함께 읽어 완전히 격리되지 않았다(판정에는 영향 없음). 원천 앱 저장소를 이 플러그인으로 옮길 때는 design-spec `README.md`·`AGENTS.md`의 옛 스킬 이름(`design-spec-*`)과 lint 경로를 `aiwf-design-*`로 바꿔야 한다. 원천 저장소는 이번 작업에서 수정하지 않았다.

## 남은 판단

- **테스트 정책**: 원천의 철칙 5와 합리화 표는 "단위 테스트를 추가하지 않는다"였다. 다른 저장소에 그대로 적용하면 그 저장소의 테스트 규칙과 충돌하므로 `testPolicy`로 분리했다. 원천과 같은 동작은 `acceptance-gates`이고 새 설정의 기본값은 `repository`다.
- **루트 패키지 버전**: 0.5.0이 아직 배포되지 않아 올리지 않았다. `aiwf-spec`은 설치 지시가 바뀌어 0.3.0으로 올렸다.
- **템플릿 언어**: 템플릿 본문은 영어이고 파서 단어만 한국어다. 한국어 작업 공간에서는 복사 후 본문을 한국어로 바꿔도 lint에 영향이 없다.
- **Storybook·i18n 전제**: wave 템플릿의 story id·로케일·컴포넌트 맵은 설정이 비어 있으면 생략하도록 바꿨으나, 실제 다른 프로젝트에서 실행하지는 않았다.
- **파일 키**: readback 스크립트는 연결된 파일의 `figma.fileKey`를 우선한다. 호스트가 노출하지 않으면 `FILE_KEY`를 설정해야 한다. 실제 Figma 호스트에서의 노출 여부는 확인하지 않았다.
