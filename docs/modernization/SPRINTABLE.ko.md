# Sprintable 연동 계약 초안

2026-10-02, Sprintable 로컬 코드 HEAD `3998f00a4`와 이 세션의 MCP 도구 선언을 읽어서 작성했다. 배포 서버를 호출하거나 프로젝트 데이터를 수정하지 않았다. 아래는 연결 설계이며 현재 AIWF에는 업로드/동기화 구현이 없다.

## 확인된 현재 기능

| 기능 | 확인한 계약 | AIWF에서 사용할 방법 |
|---|---|---|
| 문서 | `sprintable_create_doc`: project_id, slug, title, content, content_format | packet을 사람이 읽을 Markdown Doc으로 등록 |
| 문서 변경 | `sprintable_update_doc`: expected_updated_at | 최신 문서를 읽고 동시 수정 충돌 방지 |
| 증거 | `sprintable_add_evidence`: work_item_id, work_item_type story/task, type report, ref, source, note, payload | 작업에 해당 Doc와 packet 버전 연결 |
| 승인 상신 | `sprintable_submit_for_approval`: doc_id, gate_type doc_approval/concept_approval, work_item_id/type, approver_member_id | 실제 필요한 승인 요청 생성; 승인 결정을 대신하지 않음 |
| 시각 자료 spec pin | ArtifactSpecPin: 노드 또는 좌표에 연결되는 주석 | 저장소 명세 pin과 별도 개념 |

로컬 backend의 concept approval은 `doc.content` UTF-8의 SHA256을 봉인한다. AIWF 파일들의 byte SHA256과 같은 값이 아니다. Doc에 저장소 명세 digest를 포함하고, 승인 시점의 Doc 본문 hash와 함께 연결해야 한다.

근거 경로: `backend/sprintable_mcp/tools/docs.py`, `tools/evidence.py`, `backend/app/models/doc.py`, `models/visual_artifact.py`, `services/doc.py`, `routers/evidence.py`, `services/evidence_service.py`. 이 경로들은 별도 Sprintable 저장소에 있으며, AIWF 구현을 의미하지 않는다.

## 제안하는 최소 어댑터

1. 사용자 설정으로 `project_id`, story/task ID, 저장소 원격 주소를 연결한다. 임의의 기본 프로젝트로 업로드하지 않는다.
2. 현재 명세가 pin과 같은지 확인하고, 실제 Git commit/head 및 수정 여부를 수집한다. packet에는 개별 파일 digest, 검사 명령, 보고 결과, 로그, 미검증 사항을 포함한다.
3. 안정적인 packet ID와 버전을 부여하고, 동일 전송 재시도에서 기존 문서를 먼저 읽는다. slug만으로 멱등성을 보장한다고 가정하지 않는다. 로컬 전송 기록에는 doc_id와 content hash를 보관한다.
4. `create_doc`로 검토 문서를 등록하고 `get_doc`로 실제 저장된 본문을 확인한다.
5. `add_evidence`에 `type: report`, Doc 참조와 메타데이터를 넣고 evidence_id를 보관한다. payload의 임의 `kind: review_packet`은 현재 backend 등록형에 없어서 거부될 수 있다. kind 없는 버전 명시 메타데이터 또는 별도 backend 스키마 확장이 필요하다.
6. 필요한 경우 문서를 concept approval로 상신해 gate_id를 기록한다. 문서 작성자/구현자와 승인자, 업무 수용을 별도로 기록한다.
7. 명세 digest 또는 리뷰 문서가 변경되면 기존 승인을 재사용하지 않는다. 재상신/무효화 동작은 실제 backend와 종단간 검증한 뒤 활성화한다.

예상 메타데이터는 다음과 같다. 이것은 제안이며 기존 Sprintable 전용 검증 스키마가 아니다.

```json
{
  "schema": "aiwf.review_packet.v1",
  "doc": "entity:doc:<doc-id>",
  "packet_id": "<stable-id>",
  "repo": "<repository-url>",
  "commit_sha": "<commit>",
  "spec_digest": "<manifest-sha256>",
  "specs": [
    { "id": "UC-001", "path": "docs/use_cases/UC-001-submit-expense.md", "sha256": "<file-sha256>" }
  ]
}
```

## 종단간 성공 조건

실제 선택된 테스트 프로젝트에서 Doc 생성·본문 readback·evidence 연결·승인 게이트 생성이 모두 확인되어야 한다. 같은 전송을 재시도해 중복이 없는지 확인한다. 명세가 바뀌었을 때 오래된 packet/승인으로 완료 처리되지 않아야 한다. 업로드 실패를 성공으로 표시하지 않아야 한다. 이 검증 전에는 동기화 완료 또는 승인 안전성을 주장하지 않는다.
