# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 📚 **S01 Sprint: Documentation and Project Structure**
  - Created ARCHITECTURE.md with comprehensive system overview
  - Established M01 milestone: "AIWF 안정화 및 확산"
  - Updated PROJECT_MANIFEST.md with actual project status
  - Enhanced project documentation structure and organization

- 💾 **S02 Sprint: Enhanced Installation System** (Complete)
  - **T01_S02**: Multi-step installation flow with user-friendly interface
  - **T02_S02**: Tool selection interface for customized installations
  - **T03_S02**: Selective installation logic for optional components
  - **T04_S02**: Installation validation with comprehensive tool checking
  - **T05_S02**: Installation validation and rollback system with automatic recovery

- 🔧 **Advanced Installation Features**
  - Comprehensive tool validation for aiwf, cursor, windsurf, and claude-code
  - Automatic rollback mechanism for failed installations
  - Interactive prompts for handling installation failures
  - Progress display optimization during installation process
  - Enhanced error handling and user feedback

- 📝 **Command System Enhancements**
  - New `update_docs` command to replace deprecated `prime_context`
  - Enhanced command file structure and naming conventions
  - Improved command documentation and descriptions

### Changed
- 🔧 **Project Management Transition**
  - Transitioned from template to active project management
  - Documented current project status and comprehensive roadmap
  - Identified and documented known issues for resolution

- 🌐 **Internationalization Improvements**
  - Enhanced multilingual message system
  - Improved backup-related messages in both Korean and English
  - Consolidated AIWF branding and CLI English localization
  - Better Korean/English command integration

### Fixed
- ⚠️ **Command File Issues Resolution**
  - Resolved missing and duplicate command files
  - Fixed command file inconsistency across language versions
  - Removed outdated documentation update command files
  - Enhanced command loading and execution reliability

### Technical Implementation
- feat(installer): implement T05_S02 installation validation and rollback system
- feat(commands): resolve command file inconsistency issues  
- feat(commands): replace prime_context with update_docs command
- feat(messages): 다국어 메시지 추가 및 백업 관련 메시지 개선
- refactor: AIWF 브랜딩 정리 및 CLI 영문화

### Sprint Progress
- ✅ **Sprint S02 Complete**: All 5 installation system tasks implemented and committed
- 🚧 **Sprint S01 Active**: Documentation and project structure improvements ongoing

## [0.3.0] - 2024-12-20

### Added
- 🌍 **Multi-language Support**
  - Interactive language selection during installation (English/Korean)
  - Language-specific command and documentation installation
  - Localized content for both Korean and English users
  
- 📝 **Changelog Command** (`aiwf_changelog`)
  - Automatic CHANGELOG.md generation from git history
  - Semantic versioning support
  - Categorization by commit type (feat, fix, docs, etc.)
  - Integration with commit workflow
  
- 🔔 **Developer Experience Hooks**
  - Stop hook: Audio notification on task completion (Glass.aiff)
  - PostToolUse hook: Automatic test execution after file edits
  - Enhanced development workflow automation

### Changed
- 📚 **Documentation Updates**
  - Added NPM badges to README
  - Improved structure and readability
  - Unified English and Korean documentation
  - Added installation options documentation
  - Enhanced command guide with language-specific details

- 🔧 **Settings Configuration**
  - Added pre-commit hooks for linting and testing
  - Integrated automation hooks for better developer experience

### Technical Details
- feat(settings): Stop 및 PostToolUse hooks 설정 추가
- feat(commands): changelog 자동 생성 명령어 추가  
- docs(readme,guides): 다국어 지원 및 설치 옵션 문서화
- feat(hooks): add automatic lint and formatting hooks
- refactor(i18n): remove redundant Korean command variants
- feat(i18n): localize English command titles and content
