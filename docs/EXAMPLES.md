# AIWF Real-World Examples and Use Cases

This document provides practical examples and use cases for AIWF, demonstrating how to leverage the framework for various development scenarios.

## Table of Contents

1. [Starting a New Project](#starting-a-new-project)
2. [Feature Development Workflow](#feature-development-workflow)
3. [Team Collaboration Scenarios](#team-collaboration-scenarios)
4. [Performance Optimization](#performance-optimization)
5. [Large Codebase Management](#large-codebase-management)
6. [CI/CD Integration](#cicd-integration)
7. [Multi-Language Projects](#multi-language-projects)
8. [Emergency Debugging](#emergency-debugging)

---

## Starting a New Project

### Scenario: E-commerce Platform Development

You're starting a new e-commerce platform project with Claude Code.

#### Step 1: Project Initialization

```bash
# Create project directory
mkdir my-ecommerce
cd my-ecommerce

# Initialize AIWF
aiwf install

# Initialize project with AIWF
/project:aiwf:initialize
```

#### Step 2: Define Project Vision

```bash
/project:aiwf:create_project_doc "E-commerce Platform" "Modern e-commerce solution with AI-powered recommendations"
```

#### Step 3: Plan First Milestone

```bash
/project:aiwf:plan_milestone "MVP Core Features"
```

**Claude Code will help you define:**
- User authentication system
- Product catalog
- Shopping cart
- Order management
- Payment integration

#### Step 4: Generate Sprints

```bash
/project:aiwf:create_sprints_from_milestone M01
```

**Result:** 3 sprints created
- S01: Authentication & User Management
- S02: Product Catalog & Search
- S03: Cart & Checkout

#### Step 5: Start Development

```bash
# Switch to architect persona for system design
/project:aiwf:ai_persona:architect

# Design the system architecture
"Please design the overall architecture for our e-commerce platform"

# Create feature for authentication
/project:aiwf:create_feature_ledger "User Authentication System"
# Returns: FL001

# Create Git branch
git checkout -b feature/FL001-user-authentication

# Start coding with appropriate persona
/project:aiwf:ai_persona:developer
```

---

## Feature Development Workflow

### Scenario: Implementing Real-time Notifications

#### Step 1: Create Feature Entry

```bash
/project:aiwf:create_feature_ledger "Real-time Notification System"
# Returns: FL002

# Create detailed feature specification
/project:aiwf:feature_spec FL002
```

#### Step 2: Design Phase

```bash
# Use architect persona
/project:aiwf:ai_persona:architect

"Design a scalable real-time notification system using WebSockets"
```

#### Step 3: Implementation

```bash
# Create feature branch
git checkout -b feature/FL002-realtime-notifications

# Implement with balanced context compression
/project:aiwf:compress_context:balanced

# Start implementation
"Implement the WebSocket server for notifications"
```

#### Step 4: Testing and Debugging

```bash
# Switch to debugger persona
/project:aiwf:ai_persona:debugger

"Debug the connection dropping issue in WebSocket implementation"

# Run tests
npm test

# Create test task
/project:aiwf:create_task "Write integration tests for notification system"
```

#### Step 5: Code Review

```bash
# Switch to reviewer persona
/project:aiwf:ai_persona:reviewer

"Review the notification system implementation for security and performance"

# Address review feedback
/project:aiwf:do_task T15_S02
```

#### Step 6: Documentation

```bash
# Switch to documenter persona
/project:aiwf:ai_persona:documenter

"Create API documentation for the notification endpoints"

# Generate feature changelog
/project:aiwf:feature_changelog FL002
```

#### Step 7: Complete Feature

```bash
# Commit with feature reference
git add .
git commit -m "feat(FL002): implement real-time notification system"

# Create pull request
gh pr create --title "[FL002] Real-time Notification System" \
  --body "Implements WebSocket-based real-time notifications"

# Update feature status
/project:aiwf:update_feature_status FL002 completed
```

---

## Team Collaboration Scenarios

### Scenario: Distributed Team Working on Microservices

#### Setting Up Team Workflow

```bash
# Team lead creates project structure
/project:aiwf:initialize

# Define team conventions in CLAUDE.md
cat > CLAUDE.md << 'EOF'
# Team Conventions

## Commit Message Format
- feat(FLXXX): New features
- fix(FLXXX): Bug fixes
- docs(FLXXX): Documentation
- test(FLXXX): Tests
- refactor(FLXXX): Code refactoring

## Code Review Process
1. All PRs require 2 approvals
2. Must pass CI/CD pipeline
3. Must include tests
4. Must update documentation

## Persona Usage
- Architects: System design decisions
- Developers: Implementation
- Reviewers: PR reviews
- Documenters: API docs
EOF
```

#### Parallel Development

**Developer A: Authentication Service**
```bash
# Create feature
/project:aiwf:create_feature_ledger "Authentication Microservice"
# FL003

# Work on auth service
cd services/auth
/project:aiwf:ai_persona:developer
git checkout -b feature/FL003-auth-service
```

**Developer B: Product Service**
```bash
# Create feature
/project:aiwf:create_feature_ledger "Product Catalog Microservice"
# FL004

# Work on product service
cd services/products
/project:aiwf:ai_persona:developer
git checkout -b feature/FL004-product-service
```

#### Daily Sync

```bash
# Generate team status report
/project:aiwf:team_status_report

# Check all active features
/project:aiwf:list_features --status=in_progress

# Review sprint progress
/project:aiwf:sprint_status S02
```

#### Code Review Process

```bash
# Reviewer switches persona
/project:aiwf:ai_persona:reviewer

# Review specific PR
gh pr checkout 42
/project:aiwf:code_review --pr=42

# Add review comments
gh pr review 42 --comment -b "Please add error handling for auth failures"
```

---

## Performance Optimization

### Scenario: Optimizing a Slow API Endpoint

#### Step 1: Performance Profiling

```bash
# Switch to optimizer persona
/project:aiwf:ai_persona:optimizer

# Create performance task
/project:aiwf:create_task "Optimize /api/search endpoint performance"
```

#### Step 2: Benchmark Current Performance

```javascript
// benchmark-search.js
import { PerformanceBenchmark } from '@aiwf/performance';

const benchmark = new PerformanceBenchmark({
  iterations: 100,
  memoryProfiling: true
});

const searchBenchmark = {
  name: 'Search API Benchmark',
  tests: [{
    name: 'Complex search query',
    fn: async () => {
      await fetch('/api/search?q=laptop&filters=price:100-1000');
    }
  }]
};

const baseline = await benchmark.run(searchBenchmark);
await benchmark.saveReport('./baseline-performance.json');
```

#### Step 3: Analyze with Memory Profiler

```javascript
// memory-analysis.js
import { MemoryProfiler } from '@aiwf/memory';

const profiler = new MemoryProfiler({
  heapThreshold: 100 * 1024 * 1024 // 100MB
});

profiler.startProfiling();

// Run search operations
for (let i = 0; i < 1000; i++) {
  await performSearch('test query');
}

const report = profiler.generateReport();
const suggestions = profiler.getOptimizationSuggestions();

console.log('Memory optimization suggestions:', suggestions);
```

#### Step 4: Implement Optimizations

```bash
# Use optimizer persona for suggestions
"Analyze this search implementation and suggest optimizations"

# Implement caching
/project:aiwf:implement_caching search-results
```

#### Step 5: Verify Improvements

```javascript
// Compare performance
const optimized = await benchmark.run(searchBenchmark);
const regression = benchmark.detectPerformanceRegression(optimized, baseline);

if (regression.hasRegression) {
  console.error('Performance regression detected!');
} else {
  console.log(`Performance improved by ${regression.improvement}%`);
}
```

---

## Large Codebase Management

### Scenario: Working with a 100K+ LOC Legacy System

#### Step 1: Initial Analysis

```bash
# Use aggressive compression for overview
/project:aiwf:compress_context:aggressive

# Get project structure
"Analyze the overall architecture of this codebase"
```

#### Step 2: Create Modernization Plan

```bash
# Create milestone for modernization
/project:aiwf:plan_milestone "Legacy System Modernization"

# Break down into features
/project:aiwf:create_feature_ledger "Database Migration"      # FL005
/project:aiwf:create_feature_ledger "API Modernization"       # FL006
/project:aiwf:create_feature_ledger "Frontend Refactoring"    # FL007
```

#### Step 3: Incremental Refactoring

```bash
# Work on specific modules with balanced compression
/project:aiwf:compress_context:balanced

# Focus on one module at a time
"Refactor the user management module to use modern patterns"
```

#### Step 4: Track Progress

```javascript
// progress-tracker.js
import { FeatureLedger } from '@aiwf/features';

const ledger = new FeatureLedger();
await ledger.init();

// Generate modernization report
const features = await ledger.searchFeatures({
  tags: ['modernization'],
  dateRange: {
    start: '2024-01-01',
    end: '2024-12-31'
  }
});

features.forEach(feature => {
  console.log(`${feature.id}: ${feature.name} - ${feature.progress}%`);
});
```

---

## CI/CD Integration

### Scenario: Automated Quality Gates

#### Step 1: Setup GitHub Actions

```yaml
# .github/workflows/aiwf-quality.yml
name: AIWF Quality Check

on:
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install AIWF
      run: |
        npm install -g aiwf
        aiwf install --ci
    
    - name: Run Performance Benchmark
      run: |
        node scripts/run-benchmarks.js
        
    - name: Check Feature Completion
      run: |
        aiwf check-feature-status ${{ github.event.pull_request.title }}
        
    - name: Generate Reports
      run: |
        aiwf generate-ci-report
        
    - name: Comment on PR
      uses: actions/github-script@v6
      with:
        script: |
          const report = require('./aiwf-ci-report.json');
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `## AIWF Quality Report\n\n${report.summary}`
          });
```

#### Step 2: Pre-commit Hooks

```bash
# Install hooks
/project:aiwf:install_git_hooks

# Custom pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Check feature references
feature_id=$(git diff --cached --name-only | xargs grep -l "FL[0-9]\{3\}" | head -1)

if [ -z "$feature_id" ]; then
  echo "Warning: No feature reference found in changes"
  echo "Add feature ID (FLXXX) to your code or commit message"
fi

# Run quick tests
npm run test:quick

# Check code quality
aiwf code-quality-check
EOF

chmod +x .git/hooks/pre-commit
```

---

## Multi-Language Projects

### Scenario: Korean Team with International Clients

#### Step 1: Setup Dual Language Environment

```bash
# Install AIWF with Korean as primary
aiwf-lang set ko

# Create bilingual documentation structure
mkdir -p docs/{ko,en}
```

#### Step 2: Team Communication in Korean

```bash
# Use Korean commands
/프로젝트:aiwf:초기화

# Create Korean task
/프로젝트:aiwf:태스크_생성 "사용자 인증 시스템 구현"

# Korean commit messages
git commit -m "기능(FL001): JWT 토큰 생성 구현"
```

#### Step 3: Client Documentation in English

```bash
# Switch to documenter persona
/project:aiwf:ai_persona:documenter

# Generate English API docs
"Generate English API documentation from the Korean codebase"

# Create bilingual feature summary
/project:aiwf:feature_summary FL001 --lang=en,ko
```

#### Step 4: Automated Translation Workflow

```javascript
// bilingual-docs.js
import { DocumentProcessor } from '@aiwf/utils';

async function generateBilingualDocs() {
  const processor = new DocumentProcessor();
  
  // Process Korean docs
  const koreanDocs = await processor.loadDirectory('./docs/ko');
  
  // Generate English versions
  for (const doc of koreanDocs) {
    const englishVersion = await processor.translate(doc, 'ko', 'en');
    await processor.save(`./docs/en/${doc.name}`, englishVersion);
  }
}
```

---

## Emergency Debugging

### Scenario: Production Issue at 3 AM

#### Step 1: Quick Context Loading

```bash
# Use aggressive compression for speed
/project:aiwf:compress_context:aggressive

# Load only critical files
"Load only the payment processing module and recent error logs"
```

#### Step 2: Rapid Diagnosis

```bash
# Switch to debugger persona
/project:aiwf:ai_persona:debugger

# Analyze error
"Analyze this stack trace and identify the root cause"

# Check recent changes
git log --oneline -10 -- src/payments/
```

#### Step 3: Emergency Fix

```bash
# Create hotfix branch
git checkout -b hotfix/payment-processing-error

# Quick fix with validation
"Fix the null pointer exception in payment processor with proper validation"

# Test fix
npm run test:payments
```

#### Step 4: Deploy and Document

```bash
# Commit with clear message
git commit -m "hotfix: fix null pointer in payment processor

- Add null check for payment method
- Add defensive programming
- Add unit test for edge case

Fixes #456"

# Create emergency PR
gh pr create --title "HOTFIX: Payment Processing Error" \
  --body "Emergency fix for production issue" \
  --label "hotfix,urgent"

# Document incident
/project:aiwf:create_incident_report "Payment Processing Failure"
```

#### Step 5: Post-Mortem

```bash
# Switch to architect persona for analysis
/project:aiwf:ai_persona:architect

"Analyze this incident and suggest architectural improvements to prevent similar issues"

# Create improvement task
/project:aiwf:create_task "Implement payment processing safeguards"
```

---

## Best Practices Summary

### 1. Persona Usage Pattern
```bash
Design → Architect
Code → Developer  
Debug → Debugger
Review → Reviewer
Document → Documenter
Optimize → Optimizer
```

### 2. Compression Mode Selection
```bash
Overview/Exploration → Aggressive
Normal Development → Balanced
Critical/Debugging → Conservative
```

### 3. Feature-Git Workflow
```bash
Feature → Branch → Commits → PR → Merge → Complete
FL001 → feature/FL001-desc → feat(FL001): msg → PR#42 → main → ✓
```

### 4. Token Management
- Monitor usage regularly
- Use compression proactively
- Exclude unnecessary files
- Clear context between major tasks

### 5. Team Collaboration
- Consistent commit format
- Regular status updates
- Clear feature ownership
- Documented conventions

---

## Conclusion

These examples demonstrate AIWF's flexibility and power in real-world scenarios. The key to success is:

1. **Right tool for the job**: Use appropriate personas and compression modes
2. **Consistent workflow**: Follow established patterns
3. **Clear communication**: Use feature references and structured commits
4. **Proactive management**: Monitor tokens, performance, and progress
5. **Team alignment**: Document and share conventions

For more examples and community contributions, visit our [GitHub repository](https://github.com/moonklabs/aiwf/tree/main/examples).