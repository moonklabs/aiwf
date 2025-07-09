# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/aiwf/aiwf/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/aiwf/aiwf/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/aiwf/aiwf/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/aiwf/aiwf/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/aiwf/aiwf/releases/tag/v0.1.0