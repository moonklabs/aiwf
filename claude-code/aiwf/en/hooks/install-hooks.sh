#!/bin/bash

# AIWF Git Hooks 설치 스크립트

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 AIWF Git Hooks 설치 스크립트${NC}"
echo -e "${BLUE}=================================${NC}"

# Git 저장소 확인
if [ ! -d ".git" ]; then
  echo -e "${RED}❌ 현재 디렉토리는 Git 저장소가 아닙니다.${NC}"
  echo -e "${YELLOW}   Git 저장소의 루트 디렉토리에서 실행해주세요.${NC}"
  exit 1
fi

# AIWF 프로젝트 확인
if [ ! -d ".aiwf" ]; then
  echo -e "${RED}❌ 현재 디렉토리는 AIWF 프로젝트가 아닙니다.${NC}"
  echo -e "${YELLOW}   .aiwf 디렉토리가 있는 프로젝트에서 실행해주세요.${NC}"
  exit 1
fi

# Hooks 소스 디렉토리
HOOKS_SOURCE_DIR="claude-code/aiwf/ko/hooks"
if [ ! -d "$HOOKS_SOURCE_DIR" ]; then
  echo -e "${RED}❌ Hooks 소스 디렉토리를 찾을 수 없습니다: $HOOKS_SOURCE_DIR${NC}"
  exit 1
fi

# Git hooks 디렉토리
GIT_HOOKS_DIR=".git/hooks"

echo -e "\n${BLUE}📋 설치할 Git Hooks:${NC}"
echo -e "   - post-commit: Feature Ledger 자동 동기화"

# 사용자 확인
echo -e "\n${YELLOW}⚠️  주의사항:${NC}"
echo -e "   - 기존 Git hooks가 있다면 백업됩니다"
echo -e "   - AIWF_HOOKS_ENABLED 환경 변수로 활성화/비활성화 가능합니다"
echo -e ""
read -p "계속 진행하시겠습니까? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}설치가 취소되었습니다.${NC}"
  exit 0
fi

# post-commit hook 설치
POST_COMMIT_SRC="$HOOKS_SOURCE_DIR/post-commit"
POST_COMMIT_DST="$GIT_HOOKS_DIR/post-commit"

if [ -f "$POST_COMMIT_SRC" ]; then
  # 기존 hook 백업
  if [ -f "$POST_COMMIT_DST" ]; then
    BACKUP_FILE="$POST_COMMIT_DST.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$POST_COMMIT_DST" "$BACKUP_FILE"
    echo -e "${YELLOW}📦 기존 post-commit hook을 백업했습니다: $BACKUP_FILE${NC}"
  fi
  
  # Hook 복사
  cp "$POST_COMMIT_SRC" "$POST_COMMIT_DST"
  chmod +x "$POST_COMMIT_DST"
  echo -e "${GREEN}✅ post-commit hook 설치 완료${NC}"
else
  echo -e "${RED}❌ post-commit hook 소스 파일을 찾을 수 없습니다${NC}"
fi

# 환경 변수 설정 안내
echo -e "\n${GREEN}✨ Git Hooks 설치가 완료되었습니다!${NC}"
echo -e "\n${BLUE}📌 사용 방법:${NC}"
echo -e "   1. Hooks 활성화: ${YELLOW}export AIWF_HOOKS_ENABLED=true${NC}"
echo -e "   2. 상세 로그 활성화: ${YELLOW}export AIWF_HOOKS_VERBOSE=true${NC}"
echo -e "   3. 영구 설정을 위해 위 명령어를 ~/.bashrc 또는 ~/.zshrc에 추가하세요"
echo -e "\n${BLUE}💡 팁:${NC}"
echo -e "   - 커밋 메시지에 Feature ID (예: FL001)를 포함하면 자동으로 동기화됩니다"
echo -e "   - 예시: ${YELLOW}git commit -m \"feat(FL001): 사용자 인증 기능 구현\"${NC}"
echo -e "   - 여러 Feature ID도 지원됩니다: ${YELLOW}\"FL001, FL002 관련 수정\"${NC}"

# 현재 환경 변수 상태 확인
echo -e "\n${BLUE}🔍 현재 환경 변수 상태:${NC}"
if [ -z "$AIWF_HOOKS_ENABLED" ]; then
  echo -e "   AIWF_HOOKS_ENABLED: ${RED}미설정 (비활성화)${NC}"
else
  echo -e "   AIWF_HOOKS_ENABLED: ${GREEN}$AIWF_HOOKS_ENABLED${NC}"
fi

if [ -z "$AIWF_HOOKS_VERBOSE" ]; then
  echo -e "   AIWF_HOOKS_VERBOSE: ${YELLOW}미설정 (기본값: false)${NC}"
else
  echo -e "   AIWF_HOOKS_VERBOSE: ${GREEN}$AIWF_HOOKS_VERBOSE${NC}"
fi

echo -e "\n${GREEN}완료!${NC}"