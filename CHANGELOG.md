# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 📚 **Project Documentation Structure**
  - Created ARCHITECTURE.md with comprehensive system overview
  - Established M01 milestone: "AIWF 안정화 및 확산"
  - Created S01 sprint: "문서화 및 프로젝트 구조 정리"
  - Updated PROJECT_MANIFEST.md with actual project status

### Changed
- 🔧 **Project Management**
  - Transitioned from template to active project management
  - Documented current project status and roadmap
  - Identified and documented known issues

### Known Issues
- `update_docs` command file missing (only `aiwf_docs.md` exists)
- GitHub repository URL references unified to `aiwf/aiwf` across all files

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
