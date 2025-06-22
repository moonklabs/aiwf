#!/bin/bash
# Simone 프레임워크 동기화 스크립트
# 
# 참고: 이 스크립트는 참조용으로 유지되지만 극도의 주의를 기울여 사용해야 합니다.
# 주요 동기화 흐름은: 활성 개발(Synapsa) → claude-simone 방향입니다.
# 반대 방향이 아닙니다. 자동화된 동기화보다 수동 검토가 강력히 권장됩니다.
#
# 원래 목적: claude-simone에서 프로젝트로 프레임워크 구성 요소 동기화
# 현재 현실: 개발은 Synapsa에서 이루어지고, claude-simone으로 다시 동기화됨

set -e

# 출력용 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # 색상 없음

# 기본 소스 경로(재정의 가능)
SOURCE_PATH="${SIMONE_SOURCE:-$HOME/code/claude-simone}"
TARGET_PATH="."

# 사용법
usage() {
    echo "사용법: $0 [옵션]"
    echo "옵션:"
    echo "  -s, --source PATH    소스 claude-simone 경로 (기본값: $SOURCE_PATH)"
    echo "  -t, --target PATH    대상 프로젝트 경로 (기본값: 현재 디렉토리)"
    echo "  -d, --dry-run        실제로 동기화하지 않고 어떤 것이 동기화될지 보여줌"
    echo "  -h, --help           이 도움말 메시지 표시"
    exit 1
}

# 인수 파싱
DRY_RUN=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--source)
            SOURCE_PATH="$2"
            shift 2
            ;;
        -t|--target)
            TARGET_PATH="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "알 수 없는 옵션: $1"
            usage
            ;;
    esac
done

# 소스가 존재하는지 확인
if [ ! -d "$SOURCE_PATH/.simone" ]; then
    echo -e "${RED}오류: 소스 경로가 claude-simone 저장소로 보이지 않습니다${NC}"
    echo "경로: $SOURCE_PATH"
    exit 1
fi

# 대상이 존재하는지 확인
if [ ! -d "$TARGET_PATH/.simone" ]; then
    echo -e "${RED}오류: 대상 경로에 Simone이 설치되어 있지 않은 것 같습니다${NC}"
    echo "경로: $TARGET_PATH"
    exit 1
fi

# 수행할 작업 표시
echo -e "${GREEN}Simone 프레임워크 동기화${NC}"
echo "소스: $SOURCE_PATH"
echo "대상: $TARGET_PATH"
if [ -n "$DRY_RUN" ]; then
    echo -e "${YELLOW}테스트 실행 모드 - 변경 사항이 적용되지 않습니다${NC}"
fi
echo ""

# 구성 요소를 동기화하는 함수
sync_component() {
    local component=$1
    local description=$2
    
    echo -e "${GREEN}$description 동기화 중...${NC}"
    
    # rsync 명령 구성
    if [[ "$component" == *"***" ]]; then
        # 내용이 있는 디렉토리
        rsync -av $DRY_RUN \
            --include="$component" \
            --exclude='/*' \
            "$SOURCE_PATH/" "$TARGET_PATH/"
    else
        # 단일 파일
        rsync -av $DRY_RUN \
            "$SOURCE_PATH/$component" "$TARGET_PATH/$component"
    fi
}

# 명령 동기화
sync_component "/.claude/commands/simone/***" "Claude 명령"

# 템플릿 동기화  
sync_component "/.simone/99_TEMPLATES/***" "프로젝트 템플릿"

# 프레임워크 문서 동기화
echo -e "${GREEN}프레임워크 문서 동기화 중...${NC}"
rsync -av $DRY_RUN \
    "$SOURCE_PATH/.simone/CLAUDE.MD" \
    "$SOURCE_PATH/.simone/README.md" \
    "$TARGET_PATH/.simone/"

# 필요한 경우 새 디렉토리 생성
echo -e "${GREEN}디렉토리 구조 확인 중...${NC}"
if [ -z "$DRY_RUN" ]; then
    mkdir -p "$TARGET_PATH/.simone/10_STATE_OF_PROJECT"
    echo "생성됨: .simone/10_STATE_OF_PROJECT/"
else
    echo "생성 예정: .simone/10_STATE_OF_PROJECT/"
fi

# 요약
echo ""
echo -e "${GREEN}동기화 완료!${NC}"
if [ -n "$DRY_RUN" ]; then
    echo -e "${YELLOW}이것은 테스트 실행이었습니다. 변경 사항을 적용하려면 -d 없이 실행하세요.${NC}"
else
    echo "프레임워크 구성 요소가 업데이트되었습니다."
    echo ""
    echo "다음 단계:"
    echo "1. 몇 가지 명령을 테스트하여 모든 것이 작동하는지 확인"
    echo "2. 수동 단계가 있는지 SYNC_GUIDE.md 검토"
    echo "3. 프레임워크 업데이트 커밋"
fi