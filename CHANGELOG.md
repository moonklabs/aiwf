# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🌐 **S03 Sprint: Comprehensive Language Management System** (Latest)
  - **T03_S03**: Complete Korean commands standardization with unified terminology
  - Intelligent language detection and preference storage system
  - Interactive language management CLI (`aiwf-lang`) with status, set, and reset commands
  - Bilingual language management commands for both English and Korean
  - Auto-detect system language preferences with persistent storage
  - Command-line language management tools with comprehensive utilities

- 🧪 **Enhanced Testing Infrastructure**
  - Comprehensive test suite expansion with project structure validation
  - Coverage directory tracking for test coverage reports
  - Dedicated installer functionality tests with project structure validation
  - Enhanced Jest configuration for better test environment setup
  - Test coverage tracking and reporting capabilities

- 📖 **Documentation Enhancements**
  - Enhanced Installation Flow Design documentation (498 lines of comprehensive details)
  - Updated README with detailed language management documentation
  - Improved CLI documentation with enhanced language detection features

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
- 🌐 **Language Management Improvements**
  - Standardized TODO generation patterns across all Korean commands
  - Complete translation of remaining English sections to Korean
  - Improved language quality and consistency in Korean command files
  - Unified terminology usage (task, sprint, milestone) throughout commands
  - Enhanced multilingual message system with better Korean/English integration
  - Functional equivalence between English and Korean command versions

- 📦 **Project Configuration Enhancements**
  - Enhanced Jest configuration for better test environment setup
  - Improved package.json with enhanced scripts and metadata
  - Enhanced CLI with improved language detection and error handling
  - Better user experience with enhanced error handling capabilities

- 🔧 **Project Management Transition**
  - Transitioned from template to active project management
  - Documented current project status and comprehensive roadmap
  - Identified and documented known issues for resolution
  - Better test coverage tracking and reporting capabilities
  - Enhanced CLI user experience with improved error handling

- 🔧 **Project Management Transition**
  - Transitioned from template to active project management
  - Documented current project status and comprehensive roadmap
  - Identified and documented known issues for resolution

- 🌐 **Internationalization Improvements**
  - Enhanced multilingual message system
  - Improved backup-related messages in both Korean and English
  - Consolidated AIWF branding and CLI English localization
  - Better Korean/English command integration

- ⚙️ **Enhanced CLI Experience**
  - Improved CLI with enhanced language detection and error handling
  - Better user experience with enhanced error handling
  - Enhanced metadata and script configurations

- 📊 **Project Configuration Enhancements**
  - Enhanced CLI with improved language detection and error handling
  - Updated Jest configuration for better test environment setup
  - Improved package.json scripts and metadata for better development experience
  - Enhanced .gitignore with coverage directory for test reporting

- 📝 **Korean Commands Quality Improvements**
  - Standardized TODO generation patterns across all Korean commands
  - Improved language quality and consistency in 16 Korean command files
  - Unified terminology usage (task, sprint, milestone) throughout commands
  - Ensured functional equivalence with English command versions

### Fixed
- ⚠️ **Command File Issues Resolution**
  - Resolved missing and duplicate command files
  - Fixed command file inconsistency across language versions
  - Removed outdated documentation update command files
  - Enhanced command loading and execution reliability

### Technical Implementation
- feat(i18n): complete T03_S03 Korean commands standardization (889d66d)
- feat(i18n): implement comprehensive language management system (f509bd3)
- chore: enhance project configuration and testing infrastructure (fbd2110)
- feat(installer): implement T05_S02 installation validation and rollback system
- feat(commands): resolve command file inconsistency issues  
- feat(commands): replace prime_context with update_docs command
- feat(messages): 다국어 메시지 추가 및 백업 관련 메시지 개선
- refactor: AIWF 브랜딩 정리 및 CLI 영문화

### Sprint Progress
- ✅ **Sprint S03 Complete**: T03_S03 Korean commands standardization and comprehensive language management system completed
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
