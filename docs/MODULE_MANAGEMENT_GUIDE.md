# AIWF Module Management Guide

> A comprehensive guide to understanding and managing AIWF's modular architecture and dependencies

[한국어](MODULE_MANAGEMENT_GUIDE.ko.md) | [English](MODULE_MANAGEMENT_GUIDE.md)

## Table of Contents

1. [Overview](#overview)
2. [Module Classification](#module-classification)
3. [Dependency Matrix](#dependency-matrix)
4. [Critical Modules](#critical-modules)
5. [Safe Module Management](#safe-module-management)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Overview

AIWF follows a modular architecture where functionality is distributed across specialized modules. Understanding the dependency relationships between these modules is crucial for:

- **Safe refactoring**: Knowing which modules can be modified without breaking others
- **Feature development**: Understanding where to place new functionality
- **Debugging**: Tracing issues through the dependency chain
- **Performance optimization**: Identifying bottlenecks in module loading

## Module Classification

### 🔧 Core Utilities (Critical - Never Delete)

These modules are foundational and used throughout the system:

#### `utils/paths.js`
- **Usage**: 8+ locations across CLI and commands
- **Purpose**: Centralized path management for cross-platform compatibility
- **Dependencies**: None
- **Critical for**: All file operations, template resolution, resource loading

#### `utils/messages.js`
- **Usage**: 5+ locations in CLI and user-facing commands
- **Purpose**: Multi-language message system
- **Dependencies**: `language-utils.js`
- **Critical for**: User interface, error messages, internationalization

#### `utils/language-utils.js`
- **Usage**: 3+ locations in language management
- **Purpose**: Language detection and configuration
- **Dependencies**: `paths.js`
- **Critical for**: Language switching, locale detection

### 🚀 YOLO System (Critical - Never Delete)

Specialized modules for autonomous execution:

#### `utils/engineering-guard.js`
- **Usage**: Dynamic import in YOLO templates
- **Purpose**: Prevents over-engineering during autonomous execution
- **Dependencies**: None (self-contained)
- **Critical for**: YOLO mode quality control
- **⚠️ Warning**: Loaded dynamically - won't show in static analysis

#### `utils/checkpoint-manager.js`
- **Usage**: YOLO commands and recovery systems
- **Purpose**: Progress tracking and recovery for autonomous execution
- **Dependencies**: None
- **Critical for**: YOLO session management, progress recovery

### 🎯 Command-Specific Modules

#### AI Persona System
```
ai-persona-manager.js (main)
├── context-engine.js
├── metrics-collector.js
├── task-analyzer.js
└── token-optimizer.js (used by context-engine)
```

#### Installation & Backup System
```
installer.js (main)
├── backup-manager.js
├── file-downloader.js
├── rollback-manager.js
└── validator.js
```

#### Cache System
```
template-cache-system.js (main)
├── offline-detector.js
├── template-downloader.js
└── template-version-manager.js
```

#### GitHub Integration
```
github-integration.js (main)
├── state/state-index.js
├── state/priority-calculator.js
└── state/task-scanner.js
```

### 🌐 Shared Resources

#### `lib/resource-loader.js`
- **Usage**: 5+ commands (compress, token, evaluate, etc.)
- **Purpose**: Unified resource management for bundled and user resources
- **Dependencies**: `paths.js`
- **Critical for**: Template loading, persona management, resource resolution

## Dependency Matrix

### CLI Command Dependencies

| Command | Direct Dependencies | Indirect Dependencies | Special Notes |
|---------|-------------------|---------------------|---------------|
| `aiwf install` | installer.js | backup-manager.js, file-downloader.js, rollback-manager.js, validator.js | - |
| `aiwf persona` | persona.js, ai-persona-manager.js | context-engine.js, metrics-collector.js, task-analyzer.js, token-optimizer.js | - |
| `aiwf compress` | compress.js, resource-loader.js | - | - |
| `aiwf token` | token.js, resource-loader.js | - | - |
| `aiwf evaluate` | evaluate.js, resource-loader.js | - | - |
| `aiwf checkpoint` | checkpoint-manager.js | - | ⚠️ YOLO only |
| `aiwf-checkpoint` | checkpoint-manager.js | - | ⚠️ YOLO only |
| `aiwf cache` | cache-cli.js | template-cache-system.js, offline-detector.js, template-downloader.js, template-version-manager.js | - |
| `YOLO Mode` | engineering-guard.js | - | ⚠️ Dynamic import |

## Critical Modules

### Modules with ⚠️ Dynamic Loading

These modules are loaded at runtime and won't appear in static dependency analysis:

1. **`engineering-guard.js`**: Loaded by YOLO templates using `import()`
2. **State system modules**: Used by GitHub integration
3. **Persona sub-modules**: Loaded based on active persona

### Deletion Risk Assessment

#### ❌ Never Delete
- `paths.js`, `messages.js`, `language-utils.js` (core utilities)
- `engineering-guard.js`, `checkpoint-manager.js` (YOLO system)
- `resource-loader.js` (shared by multiple commands)

#### ⚠️ Delete with Caution
- AI Persona system modules (check if persona commands are used)
- Cache system modules (affects offline functionality)
- GitHub integration modules (affects GitHub commands)

#### ✅ Conditional Deletion
- Command-specific modules can be deleted if the corresponding command is unused
- Template-specific resources can be removed if templates are not needed

## Safe Module Management

### Before Modifying Any Module

1. **Check the Dependency Map**: Review `src/DEPENDENCY_MAP.md`
2. **Search for Usage**: Use `grep -r "module-name" src/` to find all references
3. **Check for Dynamic Imports**: Search for `import()` statements
4. **Verify CLI Integration**: Check if module is used in CLI commands
5. **Test YOLO Functionality**: Ensure YOLO mode still works if modifying YOLO modules

### Safe Modification Steps

```bash
# 1. Check static dependencies
grep -r "your-module.js" src/

# 2. Check dynamic imports
grep -r "import.*your-module" src/

# 3. Check YOLO integration
grep -r "your-module" claude-code/

# 4. Verify CLI command mapping
grep -r "your-module" src/cli/

# 5. Test critical functionality
npm test
aiwf install --force
aiwf-checkpoint list
```

### Module Addition Guidelines

When adding new modules:

1. **Update Dependency Map**: Add entry to `src/DEPENDENCY_MAP.md`
2. **Add Warning Comments**: Include `@warning` comments for critical modules
3. **Document Usage**: Specify which commands or systems use the module
4. **Consider Dynamic Loading**: Mark if module uses `import()` for lazy loading
5. **Test Integration**: Verify module works in both development and production

## Troubleshooting

### Common Issues

#### "Module not found" Errors
```bash
# Check if module exists
ls -la src/utils/your-module.js

# Check if path is correct in imports
grep -r "your-module" src/

# Verify module exports
node -e "console.log(require('./src/utils/your-module.js'))"
```

#### YOLO Mode Failures
```bash
# Check engineering-guard availability
ls -la src/utils/engineering-guard.js

# Test dynamic import
node -e "import('./src/utils/engineering-guard.js').then(m => console.log('OK'))"

# Verify checkpoint system
aiwf checkpoint status
```

#### Circular Dependencies
```bash
# Detect circular dependencies
npm install -g madge
madge --circular src/
```

### Recovery Procedures

#### If Core Utility is Accidentally Deleted
1. Restore from git: `git checkout HEAD -- src/utils/paths.js`
2. Reinstall AIWF: `aiwf install --force`
3. Verify functionality: `aiwf --version`

#### If YOLO System is Broken
1. Check YOLO config: `cat .aiwf/yolo-config.yaml`
2. Restore checkpoint manager: `git checkout HEAD -- src/utils/checkpoint-manager.js`
3. Test YOLO mode: `aiwf-checkpoint status`

## Best Practices

### Module Development

1. **Single Responsibility**: Each module should have one clear purpose
2. **Minimal Dependencies**: Avoid unnecessary dependencies to reduce coupling
3. **Clear Interfaces**: Export only necessary functions/classes
4. **Documentation**: Include usage comments and dependency information
5. **Error Handling**: Gracefully handle missing dependencies

### Dependency Management

1. **Regular Audits**: Periodically review and update dependency map
2. **Impact Analysis**: Before changes, analyze potential impact on dependent modules
3. **Testing Strategy**: Test both direct and indirect dependencies
4. **Version Control**: Use git to track module changes and dependencies
5. **Documentation**: Keep dependency documentation up-to-date

### Performance Considerations

1. **Lazy Loading**: Use dynamic imports for non-critical modules
2. **Caching**: Cache frequently accessed modules
3. **Bundle Optimization**: Consider module size when adding dependencies
4. **Tree Shaking**: Ensure modules support dead code elimination

## Module Integration Checklist

When integrating new modules or modifying existing ones:

- [ ] Updated `src/DEPENDENCY_MAP.md`
- [ ] Added appropriate warning comments
- [ ] Documented usage patterns
- [ ] Tested in both CLI and YOLO modes
- [ ] Verified resource loading works
- [ ] Checked for circular dependencies
- [ ] Updated relevant documentation
- [ ] Added integration tests if needed

## Related Documents

- [DEPENDENCY_MAP.md](../src/DEPENDENCY_MAP.md) - Detailed dependency matrix
- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall system architecture
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Development guidelines
- [YOLO_SYSTEM_GUIDE.md](YOLO_SYSTEM_GUIDE.md) - YOLO system specifics

---

**Last Updated**: 2025-01-27  
**Verification Method**: Use `grep -r "module-name" src/` to verify usage patterns