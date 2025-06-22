#!/bin/bash
# Simone Framework Sync Script
# 
# NOTE: This script is kept for reference but should be used with extreme caution.
# The primary sync flow is: Active Development (Synapsa) → claude-simone
# Not the other way around. Manual review is strongly recommended over automated sync.
#
# Original purpose: Syncs framework components from claude-simone to a project
# Current reality: Development happens in Synapsa, syncs back to claude-simone

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default source path (can be overridden)
SOURCE_PATH="${SIMONE_SOURCE:-$HOME/code/claude-simone}"
TARGET_PATH="."

# Usage
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -s, --source PATH    Source claude-simone path (default: $SOURCE_PATH)"
    echo "  -t, --target PATH    Target project path (default: current directory)"
    echo "  -d, --dry-run        Show what would be synced without doing it"
    echo "  -h, --help           Show this help message"
    exit 1
}

# Parse arguments
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
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Verify source exists
if [ ! -d "$SOURCE_PATH/.simone" ]; then
    echo -e "${RED}Error: Source path doesn't appear to be a claude-simone repository${NC}"
    echo "Path: $SOURCE_PATH"
    exit 1
fi

# Verify target exists
if [ ! -d "$TARGET_PATH/.simone" ]; then
    echo -e "${RED}Error: Target path doesn't appear to have Simone installed${NC}"
    echo "Path: $TARGET_PATH"
    exit 1
fi

# Show what we're doing
echo -e "${GREEN}Simone Framework Sync${NC}"
echo "Source: $SOURCE_PATH"
echo "Target: $TARGET_PATH"
if [ -n "$DRY_RUN" ]; then
    echo -e "${YELLOW}DRY RUN MODE - No changes will be made${NC}"
fi
echo ""

# Function to sync a component
sync_component() {
    local component=$1
    local description=$2
    
    echo -e "${GREEN}Syncing $description...${NC}"
    
    # Build rsync command
    if [[ "$component" == *"***" ]]; then
        # It's a directory with contents
        rsync -av $DRY_RUN \
            --include="$component" \
            --exclude='/*' \
            "$SOURCE_PATH/" "$TARGET_PATH/"
    else
        # It's a single file
        rsync -av $DRY_RUN \
            "$SOURCE_PATH/$component" "$TARGET_PATH/$component"
    fi
}

# Sync commands
sync_component "/.claude/commands/simone/***" "Claude commands"

# Sync templates  
sync_component "/.simone/99_TEMPLATES/***" "Project templates"

# Sync framework docs
echo -e "${GREEN}Syncing framework documentation...${NC}"
rsync -av $DRY_RUN \
    "$SOURCE_PATH/.simone/CLAUDE.MD" \
    "$SOURCE_PATH/.simone/README.md" \
    "$TARGET_PATH/.simone/"

# Create new directories if needed
echo -e "${GREEN}Ensuring directory structure...${NC}"
if [ -z "$DRY_RUN" ]; then
    mkdir -p "$TARGET_PATH/.simone/10_STATE_OF_PROJECT"
    echo "Created: .simone/10_STATE_OF_PROJECT/"
else
    echo "Would create: .simone/10_STATE_OF_PROJECT/"
fi

# Summary
echo ""
echo -e "${GREEN}Sync complete!${NC}"
if [ -n "$DRY_RUN" ]; then
    echo -e "${YELLOW}This was a dry run. Run without -d to apply changes.${NC}"
else
    echo "Framework components have been updated."
    echo ""
    echo "Next steps:"
    echo "1. Test a few commands to ensure everything works"
    echo "2. Review SYNC_GUIDE.md for any manual steps"
    echo "3. Commit the framework updates"
fi