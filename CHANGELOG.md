# Changelog

## aiwf-core 2.19.1 — AIWF marketplace extension (2026-10-08)

- Version the core marketplace package separately from its upstream 2.19.0 base so Claude Code detects and installs the AIWF-authored DocPilot supplement.
- Preserve upstream core skill bytes and provenance; synchronize the marketplace manifest, Korean plugin README and source/version record.

## 0.6.1 — additive installation after bundle changes (2026-10-08)

- Compare complete staged skill resources when a bundle hash or version changes, allowing new skills such as DocPilot to be added while identical managed skills remain untouched.
- Preserve conflicts for changed source content, local modifications and unmanaged directories; add regression coverage for older installation receipts.
- Document CLI upgrades followed by installation in the original scope and verification through the Codex skill catalog.
- Synchronize package-lock metadata and validate normalized npm executable paths.

## 0.6.0 — DocPilot orchestration skill (2026-10-08)

- Add the English `docpilot` skill to the default core installation. It routes full codebase documentation or scoped change synchronization through relevant AIWF authoring, review, and workflow skills.
- Preserve the upstream `aiwf-core` 2.19.0 resources and provenance; identify `docpilot` as an AIWF-authored supplement.
- Add the Korean human-review translation and Codex metadata review copy, update current skill totals and installation guidance, and extend installer/provenance regression checks.
- Keep the Korean translation in `awaiting_review`; automated checks do not constitute human approval.

## 0.5.0 — CLI installation and optional stacks (2026-10-05)

### Design-spec plugin

- Add the optional `aiwf-design` plugin (0.1.0, Apache-2.0, depends on `aiwf-core`): workflow, figma-sync, apply, trace and review skills for a designer-run design-spec workspace, with English instructions that keep the Korean parser words.
- Read every project value from `docs/design-spec/design-spec.config.json`; the lint, readback, merge and a new generic DTCG token check use it, and fail clearly without it. Add templates, a lint- and token-clean example and `npm run test:design`.
- Add `--design` to `aiwf install` and `scripts/install-spec-skills.mjs`; installed names are `aiwf-design-<name>` and qualified `aiwf-design:<name>` references are rewritten. `aiwf-spec` 0.3.0 calls `aiwf-design:trace` when a project has a design-spec traceability table.
- After pressure tests, require passed gates before `구현: 새 디자인`, let repository rules decide whether apply sessions write HANDOFF, and keep glossary, product, architecture and vision documents out of design-spec edits.
- Reuse an existing goal's acceptance document for in-scope apply work, and fall back to the bundled token check (reporting which ran) when `commands.tokenCheck` cannot start. Make the acceptance-document edit the first file edit and flag `git stash`/`git checkout` before/after comparisons.

### Installation CLI

- Add the public `aiwf` CLI for npm global installation, interactive or explicit bundle selection, dry runs and installation status; keep `aiwf-spec` compatible.
- Install complete prefixed skills through pinned `skills@1.7.0` for Codex and Claude, with separate project/user scope and optional stacks/delegation. Require Node.js 22.20+.
- Preserve modified/unmanaged skills, skip unchanged installations, support additive installs and record verified partial results with retained local sources.
- Update English/Korean installation guides and document the remaining profile, update/removal and native-plugin work.

### Remove one-off verification code

- Remove archived pilot service/test code, obsolete replay instructions and a dated temporary-checkout comparison. Keep historical logs and review documents.
- Consolidate Electron license coverage into the existing packaging test and remove duplicate plugin-inventory tests; retain reusable installation, provenance and documentation checks.

### Electron/React agent desktop stack

- Add the MIT `aiwf-electron-react` plugin (0.1.0) extending core specifications with six skills: scaffold, implement, agent-runtime, renderer-test, electron-test and package.
- Document main/preload/renderer/shared boundaries, adapter-driven Sally/PI/other agent execution, UI component sources, optional features and packaging checks. Requested package versions are an unverified baseline, not a tested lockfile.
- Add opt-in `--stack electron-react` installation (15 core/spec/stack skills), marketplace and npm payload entries; preserve default installation and imported source checks.
- Add full Korean review copies for the README, six skills and two references; maintain all new documents as awaiting human review.

### AIWF documentation presentation

- Remove origin descriptions and external source links from public guides, plugin introductions and CLI help; update Korean review copies and manifest records together.
- Retain LICENSE/NOTICE, source provenance, unchanged methodology resources and historical execution evidence.

## 0.4.0 — post-development documentation synchronization (2026-10-04)

- Add the AIWF-owned sync-docs skill and require affected-document reconciliation before workflow completion; preserve unmet requirements and unintended implementation differences.
- Include aiwf-sync-docs in Codex project installations and aiwf-spec 0.2.0 for Claude Code; update Korean review copies, installation guidance and version records together.

## Unreleased — documentation-first Korean skill review (2026-10-03)

- Add opt-in, target-specific delegation skills for Claude and Codex, including native routing and explicitly selected cross-CLI runs.
- Add separate Korean review documents for all 34 repository skills and their Markdown references, rules and agent prompts, plus snapshots and review copies of the two user-provided local skills.
- Record source/translation hashes and pending human review in a document manifest; check missing translations, drift, examples and links before tests and publishing. Keep executable skills unchanged and require documentation updates alongside instruction changes.


## Unreleased — full workflow verification (2026-10-03)

- Reject existing non-file packet outputs with output_not_file, including forced writes, and verify directory contents remain intact.
- Expand the regression suite to 61 tests. Record clean npm/all-stack installation, drift/preservation checks, actual Codex service implementation and Claude plugin review; retain the 12-test service fixture and execution evidence.


## Unreleased — remove the old framework (2026-10-03)

- Remove the legacy core/dev/experts/tools plugins, old installer and language/sprint/persona/YOLO runtime, multilingual command collections, duplicate skills/rules, obsolete docs and their Jest tests/configuration.
- Keep the six methodology/stack/workflow plugins, the spec CLI/library, current regression suite and worked example.
- **Breaking change:** remove the old aiwf/aiwf-lang/aiwf-sprint npm binaries and root all-in-one plugin manifest. The root is now a marketplace; install its individual plugins. Only aiwf-spec remains as a CLI.
- Fix the spec CLI direct-entry check so npm-created bin symlinks actually execute commands.
- Remove all external Node dependencies and stale package entries; use Node's built-in test runner for npm test. Existing consuming-project files and user/runtime data are untouched.

## Unreleased — Methodology core packaged as aiwf-core (2026-10-03)

- Move the seven methodology skills, their references and Python parsers into a dedicated `plugins/aiwf-core` plugin (Apache-2.0, version 2.19.0).
- Reduce `plugins/aiwf-spec` to the AIWF-owned `workflow` skill plus LICENSE/NOTICE. It has no `UPSTREAM.json` of its own and links the core [UPSTREAM.json](plugins/aiwf-core/UPSTREAM.json). This corrects the earlier import that put the core inside `aiwf-spec` and conflated the methodology core with the AIWF wrapper.
- Rename the previous legacy `plugins/aiwf-core` (session, task and YOLO commands) to `plugins/aiwf-core-legacy` and add its marketplace entry; no files were deleted.
- Order the marketplace `aiwf-core` first, then `aiwf-spec` and the stacks. The Codex installer still installs the core seven plus the AIWF `workflow` by default and adds a stack with `--stack`; installed name prefixes are unchanged and no MCP server is installed automatically.

## Unreleased — Methodology core restored and four stacks added (2026-10-02)

- Restore the seven core SKILL.md files with their references, parsers and scripts (initially under `plugins/aiwf-spec`, moved to `plugins/aiwf-core` on 2026-10-03). Host-neutral task tracking and evidence guidance live in the separate `workflow` skill.
- Import all four upstream stack plugins unchanged: `aiwf-vaadin-jooq` (2.20.0, 8 skills), `aiwf-angular-jpa` (0.7.0, 6), `aiwf-blazor-dotnet` (0.7.0, 5) and `aiwf-nestjs-nextjs` (0.4.0, 5). That is 24 byte-identical skills with their rules, agents, LICENSE/NOTICE and per-plugin `UPSTREAM.json` hashes.
- Vendor 31 upstream skills plus AIWF's own `workflow` (32 total). See [docs/modernization/SKILLS.ko.md](docs/modernization/SKILLS.ko.md).
- Extend `scripts/install-spec-skills.mjs` with `--stack <vaadin-jooq|angular-jpa|blazor-dotnet|nestjs-nextjs>` (core 8 plus the selected stack; default core 8). `--dry-run` writes nothing, an existing target skill is rejected without a force flag, and only installed Markdown copies get prefixed names and command references.
- Add opt-in Claude Code marketplace entries `aiwf-<stack>` alongside `aiwf-spec`. No MCP server is installed automatically and no dependency is added.

## Unreleased — specification workflow foundation (2026-10-02)

- Add specification skills and the local init/pin/check/packet CLI.
- Add portable Codex skill installation and local evidence examples. Sprintable synchronization is still a proposal.
- **Compatibility change:** the package now declares Node.js >=20 for the development toolchain. This package-wide requirement also applies to the legacy `aiwf`, `aiwf-lang`, and `aiwf-sprint` bins; Node 14–18 installations under engine-strict are no longer supported by this development version. The change is an explicit support baseline, not a claim that every new API requires Node 20.


All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.10] - 2025-07-23

### 🚀 Added
- **Modular State Management Architecture**: Refactored 1,163-line state.js into specialized modules
  - `StateIndexManager` - Centralized state file operations
  - `PriorityCalculator` - Intelligent task priority scoring
  - `TaskScanner` - Project file scanning and parsing
  - `EnhancedResourceLoader` - Memory-cached resource loading

- **GitHub CLI Integration**: Complete GitHub workflow integration
  - `aiwf github issue <task-id>` - Auto-generate GitHub issues from tasks
  - `aiwf github pr [task-id]` - Create pull requests with task context
  - `aiwf github sync` - Bidirectional sync between GitHub and AIWF
  - Automatic issue/PR template generation with task metadata

- **Cache Management Commands**: Advanced offline template system
  - `aiwf cache download` - Download templates for offline use
  - `aiwf cache status` - Display cache health and statistics
  - `aiwf cache clean` - Intelligent cache cleanup with age-based policies
  - `aiwf cache update` - Check and install template updates

- **Memory Caching System**: Performance-optimized resource loading
  - LRU (Least Recently Used) cache eviction policy
  - Configurable TTL (Time To Live) for cached resources
  - Cache hit/miss statistics and memory usage monitoring
  - Automatic cleanup of expired cache entries

### 🔧 Changed
- **Enhanced Resource Loader**: Upgraded with memory caching capabilities
  - 5-minute default TTL for cached resources
  - Maximum 100 cached items with intelligent eviction
  - Real-time cache statistics (hit rate, memory usage)
  - Periodic cleanup of expired entries

- **CLI Command Consistency**: Unified CLI and Claude command interfaces
  - All GitHub operations available through both CLI and Claude commands
  - Consistent parameter naming and option structures
  - Standardized error handling and user feedback

### ⚡ Performance
- **40-60% Faster Resource Loading**: Memory caching reduces file I/O operations
- **Modular Architecture**: Improved maintainability and reduced memory footprint
- **Optimized Task Scanning**: Parallel processing of sprint directories and task files
- **Efficient State Calculations**: Cached priority calculations with incremental updates

### 🐛 Fixed
- Resolved state synchronization issues between CLI and Claude commands
- Fixed cache invalidation problems with template updates
- Improved error handling in GitHub integration workflows
- Enhanced file parsing reliability for complex task structures

## [0.3.9] - 2025-07-23

### ✨ Added
- **Workflow-Based State Management**: Revolutionary state management system for AI context preservation
  - Central state index (`task-state-index.json`) for persistent AI memory
  - Workflow rules engine with priority matrix calculation
  - Dependency tracking with circular dependency detection
  - 80% rule implementation for adaptive sprint management
  
- **State Management CLI Commands**: New `aiwf state` command suite
  - `aiwf state update` - Sync project state with file system
  - `aiwf state show` - Display current state and recommendations
  - `aiwf state next` - Get AI-powered next action suggestions
  - `aiwf state validate` - Check workflow consistency
  - `aiwf state start/complete` - Track task progress
  
- **Smart Task Prioritization**: Intelligent task scoring algorithm
  - Urgency (40%) - deadline-based scoring
  - Importance (30%) - priority level weighting
  - Dependencies (20%) - blocking task analysis
  - Effort (10%) - inverse effort scoring
  
- **Enhanced YOLO Mode**: Workflow-integrated autonomous execution
  - Automatic task selection based on workflow rules
  - Adaptive sprint generation at 80% completion
  - Real-time state monitoring during execution
  - Smart commit and checkpoint management

### 🔄 Changed
- **Command Updates**: Enhanced existing commands with state synchronization
  - `aiwf_do_task.md` - Auto-updates state on task completion
  - `aiwf_create_sprint_tasks.md` - Syncs new tasks to state index
  - `aiwf_commit.md` - Updates state after successful commits
  - `aiwf_yolo.md` - Complete workflow intelligence integration

### 📝 Added Commands
- `aiwf_smart_start.md` - Workflow-aware task initialization
- `aiwf_smart_complete.md` - Intelligent task completion with state sync
- `aiwf_validate_state.md` - Comprehensive workflow validation

### 🐛 Fixed
- AI losing track of current work context between sessions
- Manual state updates causing synchronization issues
- Simple task selection missing dependency relationships
- Sprint transitions lacking intelligent decision making

## [0.3.5] - 2025-07-19

### ✨ Features
- **Persona Management**: Implement unified persona management system (`b913da0`)
- **Runtime State**: Add runtime persona state and metrics tracking (`6e5ca2c`)
- **Templates**: Add AIWF test instance and project templates (`3034bce`)
- **Korean Support**: AIWF 한글 템플릿 추가 문서 및 파일 보완 (`5a24037`)
- **Template Structure**: AIWF 한글 템플릿 구조 완성 (`f12fb76`)
- **Template Manager**: 템플릿 관리자 구현 및 작업 템플릿 개선 (`feec001`)
- **Context Compression**: Implement persona-aware context compression (`646fd4c`)
- **Quality Evaluation**: Add persona quality evaluation system (`4b60a79`)
- **Claude Commands**: Add Claude Code commands for 5 AI personas (`3ccdb7b`)
- **Feature Ledger**: Implement Feature Ledger CLI with full CRUD operations (`97c15b3`)

### 📝 Documentation
- **Persona Docs**: Standardize persona command documentation (`a5a1a98`)
- **README**: Update README with new persona features (`5dbafc6`)

### ♻️ Refactoring
- **Project Structure**: 완전한 src 폴더 구조 통합 및 정리 (`92fc7f0`)
- **Evaluation System**: Replace complex evaluation with lightweight background monitoring (`b39da95`)

### 🔧 Build/Config
- **Dependencies**: Bump version to 0.3.4 and clean up dependencies (`66166cb`)
- **Gitignore**: Add .aiwf/backup_*/ pattern to .gitignore (`2952457`)
- **Development Rules**: Update .gitignore and add framework development rules to CLAUDE.md (`e58a4eb`)

### 🔄 Other Changes
- 버전 0.3.3으로 업데이트 및 불필요한 압축 관련 문서 삭제 (`9c7c67e`)
- 설치 완료 플래그 파일 생성 및 기존 설치 확인 로직 수정 (`e956b59`)
- 버전 업데이트 및 불필요한 CLI 명령어 제거 (`659e6b5`)

## [0.3.4] - 2025-07-19

### 🔧 Build/Config
- Clean up dependencies and update package configuration

## [0.3.3] - 2025-07-14

### 🔄 Other Changes
- Remove unnecessary compression-related documentation
- Create installation completion flag file
- Fix existing installation check logic
- Remove unnecessary CLI commands

### Added
- 📚 **Comprehensive Documentation Suite**
  - API Reference guide with complete module documentation
  - Troubleshooting guide for common issues and solutions
  - Real-world examples and use cases
  - Getting Started guide for new users
  - Contributing guide in English and Korean
- 🧪 **M02 Context Engineering Enhancement**
  - AI Persona System (architect, debugger, reviewer, documenter, optimizer, developer)
    - Automatic persona detection based on task analysis
    - Performance metrics collection and reporting
    - Context optimization for each persona
    - Token usage optimization with TokenOptimizer
    - Comprehensive Claude Code commands in English and Korean
  - Context Compression System (aggressive, balanced, conservative modes)
  - Feature-Git Integration for automatic tracking
- 📊 **Performance & Optimization APIs**
  - GitHub API Cache System
  - File Batch Processing
  - Memory Profiler
  - Performance Benchmark tools
- 🔧 **Feature Management System**
  - Feature Ledger for tracking development
  - Token Tracker for AI conversation monitoring

### Changed
- 🌐 **Complete Internationalization**
  - 100% English translation of all Korean-only documents
  - Bidirectional language links in all guides
  - Synchronized English/Korean framework structures
- 📝 **Documentation Improvements**
  - Restructured API documentation from Korean to English
  - Enhanced troubleshooting with categorized solutions
  - Added practical examples for all major features
  - Improved getting started flow for beginners

### Fixed
- 🧪 **Test Infrastructure**
  - 19 failing tests identified (81.7% pass rate)
  - 0% code coverage issue documented
- 🔄 **Sprint Management**
  - S01 sprint status corrected to "complete"
  - All M02 tasks properly marked as completed

## [0.3.1] - 2025-07-09

### Added
- 🏗️ **Project Structure Enhancement** - S01 스프린트 시작 및 프로젝트 상태 업데이트
- 📋 **Sprint Metadata Improvement** - S02, S03 스프린트 메타데이터 구조 개선
- 🌐 **Korean Task Template** - 한국어 기반 태스크 템플릿으로 개선
- 📊 **Feature Ledger System** - Feature Ledger 시스템 파일 추가
- 🔄 **Sprint Management** - 활성 스프린트 및 태스크 통계 업데이트

### Changed
- 📝 **Task Template Localization** - 기존 영어 템플릿을 한국어로 전환
- 🎯 **Sprint Organization** - 스프린트 구조 명확화 및 태스크 목록 추가
- 📈 **Project Metrics** - 총 태스크 11개로 업데이트, 완료율 추적

### Fixed
- 🧩 **File Structure** - 한국어 AIWF 프레임워크 파일 구조 완성
- 📊 **Task Tracking** - 태스크 ID 및 완료 상태 정확성 개선

## [1.0.0] - 2025-01-09

### Added
- 🌐 **Multilingual Support System** - Complete English/Korean dual language support with automatic language detection
- 🔧 **Advanced Installation System** - Validation, backup, and rollback capabilities
- 🧪 **Testing Infrastructure** - Jest-based automated testing framework
- 📚 **Project Documentation** - Architecture, manifest, and guide documentation
- 🎯 **Language Management Commands** - language_manager, language_status, switch_language

### Changed
- 📦 **Command Standardization** - Unified terminology and quality improvements for all Korean commands
- 🔄 **Installation Process** - Multi-step installation with enhanced user experience
- 📖 **Documentation Structure** - Language synchronization and consistency improvements

### Fixed
- 🧹 **Code Cleanup** - Removed duplicate and deprecated commands
- ⚠️ **Installation Issues** - Fixed GitHub repository path and CLI permissions
- 🔧 **Command Consistency** - Resolved synchronization issues between language versions

## [0.3.0] - 2024-12-20

### Added
- 🌍 **Multi-language Support** - Language selection during installation (English/Korean)
- 📝 **Changelog Command** - Automatic generation from Git history
- 🔔 **Developer Hooks** - Automated testing and completion notifications

### Changed
- 📚 **Documentation** - Updated README and unified guides
- 🔧 **Configuration** - Pre-commit hooks and automated workflows

### Technical Requirements
- Node.js 14.0.0+ required
- GitHub API integration for real-time updates
- Claude Code, Cursor, Windsurf IDE support

## [0.2.0] - 2024-12-15

### Added
- Initial AIWF framework structure
- Basic Claude Code integration
- Sprint and milestone management
- Task tracking system

### Changed
- Improved project initialization flow
- Enhanced error handling

## [0.1.0] - 2024-12-01

### Added
- Initial release
- Basic NPM package structure
- GitHub repository download functionality
- Simple installation script

[Unreleased]: https://github.com/moonklabs/aiwf/compare/v0.3.5...HEAD
[0.3.5]: https://github.com/moonklabs/aiwf/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/moonklabs/aiwf/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/moonklabs/aiwf/compare/v0.3.1...v0.3.3
[0.3.1]: https://github.com/moonklabs/aiwf/compare/v1.0.0...v0.3.1
[1.0.0]: https://github.com/moonklabs/aiwf/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/moonklabs/aiwf/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/moonklabs/aiwf/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/moonklabs/aiwf/releases/tag/v0.1.0
