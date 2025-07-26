# AIWF Architecture

> A comprehensive overview of the AI Workflow Framework's system architecture

[한국어](ARCHITECTURE.ko.md) | [English](ARCHITECTURE.md)

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [Plugin Architecture](#plugin-architecture)
6. [Security Considerations](#security-considerations)
7. [Performance Architecture](#performance-architecture)
8. [Scalability and Future Extensions](#scalability-and-future-extensions)

## System Overview

AIWF (AI Workflow Framework) is built on a modular, layered architecture designed to provide a flexible and extensible platform for AI-assisted software development workflows.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLI Interface Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   aiwf CLI   │  │ aiwf-lang   │  │   Hooks     │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼──────────────────┐
│         │          Core Engine Layer        │                   │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐           │
│  │   Command    │  │  Resource   │  │    State    │           │
│  │  Processor   │  │   Loader    │  │   Manager   │           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │
│         │                 │                 │                   │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐           │
│  │  Template    │  │   Plugin    │  │    Token    │           │
│  │   Engine     │  │   System    │  │   Manager   │           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼──────────────────┐
│         │      Storage & Persistence Layer  │                   │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐           │
│  │    File      │  │    JSON     │  │    Git      │           │
│  │   System     │  │   Storage   │  │ Integration │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼──────────────────┐
│                    AI Integration Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Persona    │  │ Compression │  │  Evaluation │           │
│  │   Manager    │  │   Engine    │  │   System    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Layers

### 1. CLI Interface Layer
The entry point for all user interactions with AIWF.

- **aiwf CLI**: Main command-line interface built with Commander.js
- **aiwf-lang**: Language management CLI for internationalization
- **Hooks**: Git hooks and system integration points

### 2. Core Engine Layer
The heart of AIWF's functionality.

- **Command Processor**: Routes and executes commands
- **Resource Loader**: Manages bundled and user resources
- **State Manager**: Handles workflow state and transitions
- **Template Engine**: Processes project templates
- **Plugin System**: Enables extensibility
- **Token Manager**: Tracks and optimizes AI token usage

### 3. Storage & Persistence Layer
Manages all data storage and retrieval.

- **File System**: Direct file operations and caching
- **JSON Storage**: Structured data persistence
- **Git Integration**: Version control system integration

### 4. AI Integration Layer
Provides intelligent features and AI assistance.

- **Persona Manager**: AI behavior customization
- **Compression Engine**: Context optimization for AI models
- **Evaluation System**: Code and response quality assessment

## Core Components

### Resource Loader

The Resource Loader is a critical component that manages resources in both development and production environments.

```javascript
// Resource loading priority
1. User resources (~/.aiwf/)
2. Project resources (./.aiwf/)
3. Bundled resources (npm package)
```

Key features:
- Dynamic resource discovery
- Fallback mechanism
- Template and persona management
- Hot-reloading in development

### State Manager

Implements a sophisticated workflow-based state management system.

```javascript
// State structure
{
  "version": "1.0.0",
  "lastUpdated": "ISO-8601 timestamp",
  "workflow": {
    "currentPhase": "development",
    "currentTask": "task-id",
    "transitions": []
  },
  "tasks": {
    "task-id": {
      "status": "in-progress",
      "dependencies": [],
      "priority": 0.8
    }
  }
}
```

Features:
- Dependency tracking
- Priority calculation
- Circular dependency detection
- State validation
- Transition management

### Command Processor

Handles command routing and execution with a modular design.

```javascript
// Command structure
export default async function commandName(options) {
  // Validation
  // Execution
  // State update
  // Result formatting
}
```

### Template Engine

Provides project scaffolding with AIWF integration built-in.

Supported templates:
- `api-server`: Express.js API with TypeScript
- `npm-library`: NPM package with Rollup
- `web-app`: React application with Vite

### Plugin System

Enables extensibility through a hook-based architecture.

```javascript
// Plugin interface
export interface AIWFPlugin {
  name: string;
  version: string;
  hooks: {
    beforeCommand?: (command: string, args: any) => void;
    afterCommand?: (command: string, result: any) => void;
    beforeStateChange?: (oldState: State, newState: State) => State;
    afterStateChange?: (state: State) => void;
  };
}
```

## Data Flow

### Command Execution Flow

```
User Input → CLI Parser → Command Processor → Command Implementation
     ↓                                                    ↓
Token Tracking ← State Update ← Result Processing ← Execution
     ↓
User Output
```

### Resource Loading Flow

```
Resource Request → Check User Resources → Found? → Return
                           ↓ Not Found
                   Check Project Resources → Found? → Return
                           ↓ Not Found
                   Load Bundled Resources → Return
```

### State Management Flow

```
Command Execution → Pre-validation → State Lock → Update State
                                                       ↓
                                              Post-validation
                                                       ↓
                                              Notify Subscribers
                                                       ↓
                                              Release Lock
```

## Plugin Architecture

AIWF's plugin system allows for extending functionality without modifying core code.

### Plugin Loading

1. Scan for plugins in:
   - `~/.aiwf/plugins/`
   - `./node_modules/aiwf-plugin-*/`
   - Explicit plugin paths

2. Validate plugin structure
3. Register hooks
4. Initialize plugin

### Hook Points

- **Lifecycle Hooks**: `init`, `destroy`
- **Command Hooks**: `beforeCommand`, `afterCommand`
- **State Hooks**: `beforeStateChange`, `afterStateChange`
- **Resource Hooks**: `beforeResourceLoad`, `afterResourceLoad`

## Security Considerations

### Input Validation

All user inputs are validated before processing:
- Command arguments sanitization
- Path traversal prevention
- Injection attack prevention

### Resource Isolation

- User resources are isolated from system resources
- Sandboxed template execution
- Limited file system access

### Token Security

- Token counts stored locally only
- No sensitive data in token tracking
- Configurable privacy settings

## Performance Architecture

### Optimization Strategies

1. **Lazy Loading**: Commands and resources loaded on-demand
2. **Caching**: Frequently accessed resources cached in memory
3. **Parallel Processing**: Independent operations run concurrently
4. **Incremental Updates**: Only changed state portions updated

### Memory Management

- Resource pooling for templates
- Automatic cache eviction
- Memory usage monitoring
- Garbage collection optimization

### Performance Monitoring

Built-in performance tracking:
- Command execution time
- Resource loading time
- State operation metrics
- Token usage efficiency

## Scalability and Future Extensions

### Planned Extensions

1. **Cloud Sync**: Synchronize state across devices
2. **Team Collaboration**: Shared workflows and states
3. **Custom AI Models**: Support for self-hosted models
4. **Advanced Analytics**: Detailed productivity metrics

### Extension Points

- Custom command development
- New template types
- Additional AI personas
- Alternative storage backends
- Custom compression strategies

### API Stability

AIWF follows semantic versioning:
- Core APIs stable from v1.0.0
- Plugin APIs versioned separately
- Deprecation notices for breaking changes
- Migration guides for major versions

## Conclusion

AIWF's architecture is designed to be modular, extensible, and performant. The layered approach ensures separation of concerns while the plugin system enables customization without compromising core stability. This architecture supports both current features and future expansions while maintaining backward compatibility.