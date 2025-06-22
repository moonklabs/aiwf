# Moonklabs 프레임워크 동기화 가이드

## 개요

이 가이드는 개발 프로젝트(예: SellerKing)에서 Moonklabs 프레임워크 업데이트를 공식 `claude-moonklabs` 저장소로 동기화하는 방법을 설명합니다.

**중요**: 이것은 단방향(ONE-WAY) 동기화 프로세스입니다. 프레임워크 개선 사항은 활성 개발 프로젝트 → claude-moonklabs 방향으로만 흐르며 그 반대는 아닙니다.

## 현재 개발 상황

- **주요 개발**: SellerKing 프로젝트에서 진행
- **프레임워크 발전**: 새로운 명령어, 템플릿 및 개선 사항이 실제 사용 환경에서 테스트됨
- **동기화 방향**: SellerKing → claude-moonklabs (개선 사항이 안정화되었을 때)
- **수동 검토**: 각 동기화는 자동화하지 말고 신중하게 검토해야 함

## 동기화 시 고려 사항

동기화를 수행하기 전에 다음을 자문하세요:
1. 이 변경 사항이 Synapsa 전용인가, 아니면 모든 Moonklabs 사용자에게 도움이 되는가?
2. 실제 사용 환경에서 충분히 테스트되었는가?
3. 기존 워크플로를 깨뜨리지 않는가?
4. 변경 사항이 명확하게 문서화되었는가?

## 동기화 대상

### 프레임워크 핵심(항상 동기화)
```
/.claude/commands/moonklabs/     # 모든 명령 정의
/.moonklabs/99_TEMPLATES/        # 모든 템플릿
/.moonklabs/CLAUDE.MD           # 프레임워크 지침
/.moonklabs/README.md           # 프레임워크 문서
```

### 프레임워크 구조(구조만 동기화)
```
/.moonklabs/10_STATE_OF_PROJECT/  # 디렉터리만, 내용은 제외
```

### 프로젝트 전용(동기화 제외)
```
/.moonklabs/00_PROJECT_MANIFEST.md
/.moonklabs/01_PROJECT_DOCS/*
/.moonklabs/02_REQUIREMENTS/*
/.moonklabs/03_SPRINTS/*
/.moonklabs/04_GENERAL_TASKS/*
/.moonklabs/05_ARCHITECTURAL_DECISIONS/*
/.moonklabs/10_STATE_OF_PROJECT/* (contents)
```

## 수동 동기화 프로세스(SellerKing → claude-moonklabs)

1. **변경 사항 식별**
   ```bash
   # claude-moonklabs 디렉터리에서 실행
   # 명령어 비교
   diff -r ./.claude/commands/moonklabs/ ~/code/sellerking/.claude/commands/moonklabs/
   
   # 템플릿 비교
   diff -r ./.moonklabs/99_TEMPLATES/ ~/code/sellerking/.moonklabs/99_TEMPLATES/
   
   # 새로운 구조 요소 확인
   ls -la ~/code/sellerking/.moonklabs/
   ```

2. **각 변경 사항을 신중하게 검토**
   - Read through command changes - are they improvements or project-specific?
   - Check template modifications - are they more generic or more specific?
   - Look for new directories or conventions

3. **선택적 수동 복사**
   - Copy only framework improvements
   - Leave out Synapsa-specific adaptations
   - Preserve generic examples in claude-moonklabs

4. **claude-moonklabs 컨텍스트에서 테스트**
   - Ensure examples still make sense
   - Verify commands work with generic project structure
   - Check that documentation is project-agnostic

5. **사용자용 변경 사항 문서화**
   - Update README.md with new features or changes
   - Add usage examples for new commands
   - Note any breaking changes or migration needs
   - Consider creating a CHANGELOG.md for version history

6. **GitHub 푸시 준비**
   - Review all documentation for clarity
   - Ensure examples are helpful and generic
   - Check that getting started instructions still work
   - Commit with clear message about what's new

## 동기화 결정 트리

```
Is it a command file? → YES → Sync it
                     ↓ NO
Is it a template? → YES → Sync it
                 ↓ NO
Is it CLAUDE.MD or README.md in .moonklabs/? → YES → Sync it
                                          ↓ NO
Is it a new directory structure? → YES → Create directory only
                                ↓ NO
Don't sync (project-specific content)
```

## 충돌 처리

### 명령어 업데이트
- New commands: Add directly
- Modified commands: Review changes, ensure compatibility
- Removed commands: Keep if still used in project

### 템플릿 변경
- Always take latest version from claude-moonklabs
- Templates should be generic enough for all projects

### 구조 변경
- New directories: Add to all projects
- Directory renames: Carefully migrate with content preservation

## 모범 사례

1. **정기적인 동기화**: Sync framework updates monthly or when new features are announced
2. **동기화 후 테스트**: Run a few commands to ensure everything works
3. **맞춤 변경 사항 문서화**: If you modify framework files, document why
4. **기여 환영**: If you improve templates or commands, PR to claude-moonklabs

## 예시: Synapsa로 동기화

```bash
# sellerking 디렉터리에서 실행
cd ~/code/sellerking

# 먼저 드라이런
rsync -av --dry-run \
  --include='/.claude/commands/moonklabs/***' \
  --include='/.moonklabs/99_TEMPLATES/***' \
  --include='/.moonklabs/CLAUDE.MD' \
  --include='/.moonklabs/README.md' \
  --exclude='/*' \
  ~/code/claude-moonklabs/ ./

# 이상 없으면 --dry-run 없이 실행
rsync -av \
  --include='/.claude/commands/moonklabs/***' \
  --include='/.moonklabs/99_TEMPLATES/***' \
  --include='/.moonklabs/CLAUDE.MD' \
  --include='/.moonklabs/README.md' \
  --exclude='/*' \
  ~/code/claude-moonklabs/ ./

# 새 디렉터리 생성
mkdir -p .moonklabs/10_STATE_OF_PROJECT
```

## 문제 해결

### 누락된 디렉터리
수동으로 생성: `mkdir -p .moonklabs/10_STATE_OF_PROJECT`

### 명령어 작동 안 함
새로운 디렉터리 구조나 규약에 의존하는지 확인

### 병합 충돌
프레임워크 파일은 항상 claude-moonklabs 버전을 우선 사용

## 향후 개선사항

- [ ] 안전 검사 포함 자동 동기화 스크립트
- [ ] 프레임워크 구성 요소 버전 추적
- [ ] 다양한 Moonklabs 버전에 대한 호환 매트릭스
- [ ] 브레이킹 체인지용 마이그레이션 가이드