---
description: Restore project state from AIWF checkpoint for session recovery
---

# AIWF 상태 복구

세션이 중단되거나 오류가 발생한 경우 이전 체크포인트로 프로젝트 상태를 복원합니다.

## 개요

Anthropic 장시간 에이전트 패턴의 핵심 원칙 중 하나는 **복구 가능성**입니다.
모든 태스크 완료 시 체크포인트를 생성하여 언제든 안전한 상태로 돌아갈 수 있습니다.

## 복구 옵션

### 옵션 1: 마지막 체크포인트로 복구

가장 최근의 성공적인 태스크 완료 시점으로 복구합니다.

```bash
# 마지막 체크포인트 찾기
git tag -l "aiwf-checkpoint-*" | sort -V | tail -1

# 해당 체크포인트로 복구
git checkout <checkpoint-tag>
```

### 옵션 2: 특정 체크포인트로 복구

특정 태스크 완료 시점으로 복구합니다.

```bash
# 모든 체크포인트 목록
git tag -l "aiwf-checkpoint-*"

# 특정 체크포인트로 복구
git checkout aiwf-checkpoint-T01-20240115-1500
```

### 옵션 3: 진행 파일 기반 복구

Git 체크포인트 없이 진행 파일만으로 상태 복원합니다.

## 복구 절차

다음 단계를 **순서대로** 실행하세요:

### 1. 현재 상태 확인

```bash
# 현재 브랜치 및 상태
git status

# 미커밋 변경사항 확인
git diff --stat

# 현재 HEAD 위치
git log --oneline -5
```

### 2. 체크포인트 목록 확인

```bash
# AIWF 체크포인트 목록
git tag -l "aiwf-checkpoint-*" --sort=-creatordate

# 상세 정보와 함께
git tag -l "aiwf-checkpoint-*" --sort=-creatordate --format='%(refname:short) - %(creatordate:short) - %(subject)'
```

### 3. 현재 상태 백업 (선택)

복구 전 현재 상태를 백업합니다:

```bash
# 현재 변경사항 stash
git stash save "복구 전 백업 - $(date +%Y%m%d-%H%M)"

# 또는 임시 브랜치 생성
git checkout -b backup-before-restore-$(date +%Y%m%d-%H%M)
git add .
git commit -m "[AIWF] 복구 전 백업"
git checkout main  # 또는 원래 브랜치
```

### 4. 체크포인트로 복구

**방법 A: 소프트 복구 (권장)**

작업 디렉토리는 유지하고 특정 커밋 상태를 확인:

```bash
# 체크포인트 내용 확인
git show aiwf-checkpoint-T01-20240115-1500

# 특정 파일만 복구
git checkout aiwf-checkpoint-T01-20240115-1500 -- path/to/file
```

**방법 B: 하드 복구**

완전히 체크포인트 상태로 되돌리기:

```bash
# 주의: 모든 미커밋 변경사항이 사라집니다
git checkout aiwf-checkpoint-T01-20240115-1500

# 새 브랜치로 분기
git checkout -b recovery-branch
```

### 5. 진행 파일 복원

체크포인트 시점의 진행 파일로 복원:

```bash
# 진행 파일 복구
git show aiwf-checkpoint-T01-20240115-1500:.aiwf/aiwf-progress.md > .aiwf/aiwf-progress.md.recovered

# 또는 직접 덮어쓰기
git checkout aiwf-checkpoint-T01-20240115-1500 -- .aiwf/aiwf-progress.md
```

### 6. 태스크 상태 업데이트

복구된 상태에 맞게 태스크 파일 업데이트:

```markdown
## Status
- status: in_progress (복구됨)
- restored_from: aiwf-checkpoint-T01-20240115-1500
- restored_at: [현재 시간]

## Recovery Notes
- 복구 사유: [중단 사유]
- 복구 시점: [체크포인트 시점]
- 다음 작업: [재개할 작업]
```

### 7. 복구 커밋

```bash
git add .
git commit -m "[AIWF] 상태 복구: aiwf-checkpoint-T01-20240115-1500에서 복원"
```

## 긴급 복구

세션이 갑자기 중단된 경우:

### Git Stash 확인

```bash
# stash 목록 확인
git stash list

# 가장 최근 stash 내용 확인
git stash show -p

# stash 복원
git stash pop
```

### Reflog 사용

최근 HEAD 이동 기록에서 복구:

```bash
# reflog 확인
git reflog

# 특정 시점으로 복구
git checkout HEAD@{2}
```

## 체크포인트 관리

### 체크포인트 생성 (수동)

```bash
# 현재 상태로 체크포인트 생성
git tag "aiwf-checkpoint-manual-$(date +%Y%m%d-%H%M)"
```

### 오래된 체크포인트 정리

```bash
# 30일 이상 된 체크포인트 목록
git tag -l "aiwf-checkpoint-*" | while read tag; do
    TAG_DATE=$(git log -1 --format=%ai "$tag" | cut -d' ' -f1)
    if [[ "$TAG_DATE" < "$(date -d '30 days ago' +%Y-%m-%d)" ]]; then
        echo "$tag ($TAG_DATE)"
    fi
done

# 특정 체크포인트 삭제
git tag -d aiwf-checkpoint-old-tag
```

## 복구 체크리스트

```yaml
Pre-Recovery:
  - [ ] 현재 상태 확인 (git status)
  - [ ] 미커밋 변경사항 백업
  - [ ] 복구할 체크포인트 확인

Recovery:
  - [ ] 체크포인트로 복구
  - [ ] 진행 파일 복원
  - [ ] 파일 무결성 확인

Post-Recovery:
  - [ ] 태스크 상태 업데이트
  - [ ] 복구 커밋 생성
  - [ ] 세션 재시작 (/aiwf:session-start)
```

## 복구 완료 메시지

```
✅ AIWF 상태 복구 완료!

🔄 복구 정보:
- 복구 시점: aiwf-checkpoint-T01-20240115-1500
- 복구된 태스크: T01
- 복구 시간: [현재 시간]

📋 현재 상태:
- 현재 태스크: T01 (in_progress)
- 완료된 서브태스크: 2/5
- 진행 파일: 복원됨

💡 다음 단계:
1. /aiwf:session-start 로 세션 재시작
2. 또는 @work-loop-agent 로 작업 계속

⚠️ 백업 위치:
- Stash: stash@{0} (복구 전 백업)
- 브랜치: backup-before-restore-20240115-1600 (해당되는 경우)
```

## 문제 해결

### 체크포인트를 찾을 수 없음

```bash
# 모든 태그 확인
git tag -l

# 원격에서 태그 가져오기
git fetch --tags
```

### 복구 후 충돌 발생

```bash
# 충돌 파일 확인
git status

# 충돌 해결 후
git add .
git commit -m "[AIWF] 복구 충돌 해결"
```

### 진행 파일 손상

```bash
# 템플릿에서 새로 생성
cp .aiwf/99_TEMPLATES/aiwf-progress-template.md .aiwf/aiwf-progress.md

# 수동으로 상태 기록
```

## 주의사항

- **복구 전 항상 백업**: stash 또는 임시 브랜치 사용
- **하드 복구 주의**: 미커밋 변경사항 손실 가능
- **팀 작업 시**: 원격 브랜치 상태 확인 필요
- **복구 후 검증**: 모든 파일이 정상인지 확인
