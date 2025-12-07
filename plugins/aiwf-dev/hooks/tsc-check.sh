#!/bin/bash
# AIWF TypeScript Check Hook
# Runs TypeScript type checking when session stops

# Check if tsconfig.json exists in project
if [ -f "tsconfig.json" ]; then
    # Check if npx is available
    if command -v npx &> /dev/null; then
        # Run TypeScript check silently
        npx tsc --noEmit 2>/dev/null || true
    fi
fi

exit 0
