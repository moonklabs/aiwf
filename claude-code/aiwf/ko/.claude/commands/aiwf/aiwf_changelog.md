# Git 커밋 히스토리 기반 Changelog 자동 생성

Git 커밋 히스토리를 분석하여 체계적인 changelog를 생성합니다.

## 작업 단계

### 1. Git 히스토리 분석
- 최근 커밋들을 분석하여 변경사항 파악
- 태그 정보 확인 (있는 경우)
- 커밋 메시지에서 conventional commit 형식 파싱

### 2. 변경사항 분류
다음 카테고리로 커밋들을 분류:
- ✨ Features (feat)
- 🐛 Bug Fixes (fix)
- 📝 Documentation (docs)
- 🎨 Code Style (style)
- ♻️ Refactoring (refactor)
- ⚡ Performance (perf)
- ✅ Tests (test)
- 🔧 Build/Config (build, chore)

### 3. Changelog 생성
- CHANGELOG.md 파일 생성 또는 업데이트
- 버전별로 섹션 구분 (태그 기반)
- 각 카테고리별로 변경사항 정리
- 커밋 SHA와 함께 표시

### 4. 실행 방법
```bash
# 기본 실행 (전체 히스토리)
/project:aiwf:changelog

# 특정 커밋 범위 지정
/project:aiwf:changelog v1.0.0..HEAD

# 특정 개수의 최근 커밋
/project:aiwf:changelog -n 50
```

### 5. 생성 예시
```markdown
# Changelog

## [Unreleased]

### ✨ Features
- feat(auth): 소셜 로그인 기능 추가 (abc1234)
- feat(api): RESTful API v2 구현 (def5678)

### 🐛 Bug Fixes
- fix(ui): 모바일 반응형 레이아웃 수정 (ghi9012)

### 📝 Documentation
- docs(readme): 설치 가이드 업데이트 (jkl3456)
```

## 구현 내용

1. Git 로그 파싱:
```bash
git log --pretty=format:"%h|%s|%an|%ad" --date=short
```

2. Conventional Commit 패턴 매칭:
```regex
^(feat|fix|docs|style|refactor|perf|test|build|chore)(\(.+\))?:\s+(.+)$
```

3. 태그 정보 활용:
```bash
git describe --tags --abbrev=0
```

4. Changelog 템플릿 적용 및 파일 생성

5. 기존 CHANGELOG.md가 있는 경우 적절히 병합

## 주의사항
- Conventional Commit 형식을 따르지 않는 커밋은 "기타 변경사항"으로 분류
- 병합 커밋은 기본적으로 제외
- 생성된 changelog는 검토 후 수동 편집 가능