# AIWF Complete API Reference

[한국어로 보기](API_REFERENCE_FULL.ko.md)

## Table of Contents

1. [Core APIs](#core-apis)
   - [Resource Loader](#resource-loader)
   - [State Management](#state-management)
   - [Template System](#template-system)
2. [Command APIs](#command-apis)
   - [AI Tool Command](#ai-tool-command)
   - [Compress Command](#compress-command)
   - [Create Project](#create-project)
   - [Evaluate Command](#evaluate-command)
   - [Feature Command](#feature-command)
   - [Persona Command](#persona-command)
   - [State Command](#state-command)
   - [Token Command](#token-command)
   - [YOLO Config](#yolo-config)
3. [Utility APIs](#utility-apis)
   - [Checkpoint Manager](#checkpoint-manager)
   - [Git Utilities](#git-utilities)
   - [Token Counter](#token-counter)
   - [Text Processors](#text-processors)
4. [Plugin APIs](#plugin-apis)
   - [Plugin Interface](#plugin-interface)
   - [Hook System](#hook-system)
5. [AI Integration APIs](#ai-integration-apis)
   - [Persona Manager](#persona-manager)
   - [Compression Engine](#compression-engine)
   - [Evaluation System](#evaluation-system)

---

## Core APIs

### Resource Loader

The Resource Loader manages all framework resources, providing a unified interface for accessing bundled and user resources.

#### Class: `ResourceLoader`

```javascript
import { ResourceLoader } from 'aiwf/lib/resource-loader';
```

##### Constructor

```javascript
new ResourceLoader(options?: ResourceLoaderOptions)
```

**Options:**
```typescript
interface ResourceLoaderOptions {
  bundledPath?: string;      // Path to bundled resources
  userPath?: string;         // Path to user resources
  preferUserResources?: boolean; // Prefer user over bundled (default: true)
}
```

##### Methods

###### `resolvePath(resourceType, resourceName)`

Resolves the path to a resource, checking user directory first, then bundled resources.

```javascript
async resolvePath(resourceType: string, resourceName: string): Promise<string>
```

**Example:**
```javascript
const loader = new ResourceLoader();
const personaPath = await loader.resolvePath('personas', 'analyst.json');
```

###### `loadResource(resourceType, resourceName)`

Loads and parses a resource file.

```javascript
async loadResource(resourceType: string, resourceName: string): Promise<any>
```

**Supported formats:**
- JSON (`.json`)
- YAML (`.yaml`, `.yml`)
- JavaScript modules (`.js`)
- Markdown (`.md`)

###### `listResources(resourceType)`

Lists all available resources of a given type.

```javascript
async listResources(resourceType: string): Promise<string[]>
```

###### `copyResource(resourceType, resourceName, destination)`

Copies a resource to a specified location.

```javascript
async copyResource(
  resourceType: string, 
  resourceName: string, 
  destination: string
): Promise<void>
```

### State Management

Manages application and project state with support for checkpoints and atomic updates.

#### Class: `StateIndexManager`

```javascript
import { StateIndexManager } from 'aiwf/lib/state/state-index';
```

##### Constructor

```javascript
new StateIndexManager(aiwfPath: string)
```

##### Methods

###### `loadState()`

Loads the current state from disk.

```javascript
async loadState(): Promise<StateIndex>
```

**Returns:**
```typescript
interface StateIndex {
  version: string;
  last_updated: string;
  last_updated_by: string;
  project_info: ProjectInfo;
  milestones: Milestone[];
  sprints: Sprint[];
  tasks: Task[];
  workflow_mode: WorkflowMode;
}
```

###### `saveState(state)`

Saves state to disk with automatic backup.

```javascript
async saveState(state: StateIndex): Promise<void>
```

###### `updateProjectInfo(updates)`

Updates project information.

```javascript
async updateProjectInfo(updates: Partial<ProjectInfo>): Promise<void>
```

###### `addMilestone(milestone)`

Adds a new milestone to the project.

```javascript
async addMilestone(milestone: Milestone): Promise<void>
```

### Template System

Manages project templates and code generation.

#### Class: `TemplateEngine`

```javascript
import { TemplateEngine } from 'aiwf/lib/template-engine';
```

##### Methods

###### `listTemplates()`

Lists all available project templates.

```javascript
async listTemplates(): Promise<TemplateInfo[]>
```

###### `createFromTemplate(templateName, targetPath, variables)`

Creates a new project from a template.

```javascript
async createFromTemplate(
  templateName: string,
  targetPath: string,
  variables: Record<string, string>
): Promise<void>
```

**Example:**
```javascript
const engine = new TemplateEngine();
await engine.createFromTemplate('api-server', './my-api', {
  projectName: 'My API',
  author: 'John Doe',
  description: 'My awesome API server'
});
```

---

## Command APIs

### AI Tool Command

Manages AI tool integrations and configurations.

#### Class: `AIToolCommand`

```javascript
import AIToolCommand from 'aiwf/commands/ai-tool';
```

##### Methods

###### `execute(args)`

Executes AI tool commands.

```javascript
async execute(args: string[]): Promise<void>
```

**Subcommands:**
- `list` - List all available AI tools
- `activate <tool>` - Activate an AI tool
- `configure <tool>` - Configure an AI tool
- `status` - Show current AI tool status

### Compress Command

Provides various compression strategies for optimizing context.

#### Functions

###### `compress(mode, content, options)`

Compresses content using specified strategy.

```javascript
async compress(
  mode: CompressionMode,
  content: string,
  options?: CompressionOptions
): Promise<string>
```

**Compression Modes:**
- `simple` - Basic whitespace and comment removal
- `moderate` - Balanced compression
- `aggressive` - Maximum compression
- `custom` - User-defined rules

**Options:**
```typescript
interface CompressionOptions {
  preserveComments?: boolean;
  preserveWhitespace?: boolean;
  maxLineLength?: number;
  customRules?: CompressionRule[];
}
```

### Create Project

Creates new AIWF projects from templates.

#### Function: `createProject`

```javascript
async createProject(options: CreateProjectOptions): Promise<void>
```

**Options:**
```typescript
interface CreateProjectOptions {
  template: string;
  name: string;
  path?: string;
  variables?: Record<string, string>;
  skipInstall?: boolean;
  gitInit?: boolean;
}
```

### Evaluate Command

Evaluates AI responses and code quality.

#### Class: `EvaluateCommand`

##### Methods

###### `evaluateResponse(file, options)`

Evaluates the quality of an AI response.

```javascript
async evaluateResponse(
  file: string, 
  options?: EvaluationOptions
): Promise<EvaluationResult>
```

###### `evaluateCode(file, options)`

Evaluates code quality and best practices.

```javascript
async evaluateCode(
  file: string,
  options?: CodeEvaluationOptions
): Promise<CodeEvaluationResult>
```

### Feature Command

Manages feature tracking and development workflow.

#### Functions

###### `createFeature(name, description)`

Creates a new feature entry.

```javascript
async createFeature(
  name: string, 
  description?: string
): Promise<FeatureEntry>
```

###### `updateFeatureStatus(id, status)`

Updates the status of a feature.

```javascript
async updateFeatureStatus(
  id: string,
  status: FeatureStatus
): Promise<void>
```

**Feature Statuses:**
- `planned`
- `in-progress`
- `testing`
- `completed`
- `deployed`

### Persona Command

Manages AI personas and their configurations.

#### Class: `PersonaCommand`

##### Methods

###### `listPersonas()`

Lists all available personas.

```javascript
async listPersonas(): Promise<PersonaInfo[]>
```

###### `activatePersona(name)`

Activates a specific persona.

```javascript
async activatePersona(name: string): Promise<void>
```

###### `createPersona(name, config)`

Creates a custom persona.

```javascript
async createPersona(
  name: string,
  config: PersonaConfig
): Promise<void>
```

### State Command

Manages project state and workflow transitions.

#### Class: `StateCommand`

##### Methods

###### `showStatus()`

Displays current project state.

```javascript
async showStatus(): Promise<StateStatus>
```

###### `checkpoint(name, description)`

Creates a state checkpoint.

```javascript
async checkpoint(
  name: string,
  description?: string
): Promise<CheckpointInfo>
```

###### `restore(checkpointId)`

Restores from a checkpoint.

```javascript
async restore(checkpointId: string): Promise<void>
```

### Token Command

Monitors and manages AI token usage.

#### Functions

###### `trackUsage(input, output, model)`

Records token usage.

```javascript
async trackUsage(
  input: string,
  output: string,
  model?: string
): Promise<UsageRecord>
```

###### `getUsageReport(period)`

Generates usage report.

```javascript
async getUsageReport(
  period?: 'day' | 'week' | 'month'
): Promise<UsageReport>
```

### YOLO Config

Manages YOLO mode configuration.

#### Functions

###### `createYoloConfig(options)`

Creates YOLO configuration file.

```javascript
async createYoloConfig(options?: YoloOptions): Promise<void>
```

###### `createInteractiveYoloConfig()`

Creates configuration through interactive prompts.

```javascript
async createInteractiveYoloConfig(): Promise<void>
```

---

## Utility APIs

### Checkpoint Manager

Manages state checkpoints and recovery.

#### Class: `CheckpointManager`

```javascript
import { CheckpointManager } from 'aiwf/utils/checkpoint-manager';
```

##### Methods

###### `createCheckpoint(state, metadata)`

Creates a new checkpoint.

```javascript
async createCheckpoint(
  state: any,
  metadata?: CheckpointMetadata
): Promise<string>
```

###### `listCheckpoints()`

Lists all available checkpoints.

```javascript
async listCheckpoints(): Promise<CheckpointInfo[]>
```

###### `restoreCheckpoint(checkpointId)`

Restores from a specific checkpoint.

```javascript
async restoreCheckpoint(checkpointId: string): Promise<any>
```

### Git Utilities

Provides Git integration utilities.

#### Functions

###### `parseCommitMessage(message)`

Parses structured commit messages.

```javascript
parseCommitMessage(message: string): ParsedCommit
```

**Returns:**
```typescript
interface ParsedCommit {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  features?: string[];
  tasks?: string[];
}
```

###### `getRecentCommits(limit)`

Gets recent commit history.

```javascript
async getRecentCommits(limit?: number): Promise<Commit[]>
```

### Token Counter

Counts tokens for various AI models.

#### Functions

###### `countTokens(text, model)`

Counts tokens in text.

```javascript
countTokens(text: string, model?: string): number
```

**Supported models:**
- `gpt-3.5-turbo`
- `gpt-4`
- `claude`
- `claude-instant`

###### `estimateCost(tokens, model)`

Estimates cost based on token count.

```javascript
estimateCost(tokens: number, model: string): number
```

### Text Processors

Various text processing utilities.

#### Functions

###### `summarizeText(text, maxLength)`

Creates a summary of text.

```javascript
async summarizeText(
  text: string,
  maxLength?: number
): Promise<string>
```

###### `extractKeywords(text)`

Extracts keywords from text.

```javascript
extractKeywords(text: string): string[]
```

###### `normalizeWhitespace(text)`

Normalizes whitespace in text.

```javascript
normalizeWhitespace(text: string): string
```

---

## Plugin APIs

### Plugin Interface

Standard interface for AIWF plugins.

#### Interface: `AIWFPlugin`

```typescript
interface AIWFPlugin {
  name: string;
  version: string;
  description?: string;
  
  // Lifecycle hooks
  init?(context: PluginContext): Promise<void>;
  destroy?(): Promise<void>;
  
  // Command hooks
  commands?: Record<string, CommandHandler>;
  
  // Event hooks
  hooks?: Record<string, HookHandler>;
}
```

#### Plugin Context

```typescript
interface PluginContext {
  aiwfPath: string;
  projectRoot: string;
  config: AIWFConfig;
  logger: Logger;
  
  // Core services
  resourceLoader: ResourceLoader;
  stateManager: StateIndexManager;
  templateEngine: TemplateEngine;
}
```

### Hook System

Event-driven extension system.

#### Available Hooks

##### Command Lifecycle

```javascript
hooks: {
  'before-command': async (command, args) => { /* ... */ },
  'after-command': async (command, result) => { /* ... */ },
  'command-error': async (command, error) => { /* ... */ }
}
```

##### State Management

```javascript
hooks: {
  'before-state-change': async (oldState, newState) => { /* ... */ },
  'after-state-change': async (oldState, newState) => { /* ... */ },
  'state-checkpoint': async (checkpoint) => { /* ... */ }
}
```

##### Resource Loading

```javascript
hooks: {
  'before-resource-load': async (type, name) => { /* ... */ },
  'after-resource-load': async (type, name, content) => { /* ... */ },
  'resource-not-found': async (type, name) => { /* ... */ }
}
```

---

## AI Integration APIs

### Persona Manager

Manages AI persona configurations and contexts.

#### Class: `AIPersonaManager`

```javascript
import { AIPersonaManager } from 'aiwf/lib/ai-persona-manager';
```

##### Methods

###### `loadPersona(name)`

Loads a persona configuration.

```javascript
async loadPersona(name: string): Promise<Persona>
```

###### `applyPersona(content, persona)`

Applies persona context to content.

```javascript
applyPersona(content: string, persona: Persona): string
```

###### `validatePersona(persona)`

Validates persona configuration.

```javascript
validatePersona(persona: Persona): ValidationResult
```

### Compression Engine

Provides intelligent content compression.

#### Class: `CompressionEngine`

##### Methods

###### `compress(content, strategy)`

Compresses content using specified strategy.

```javascript
async compress(
  content: string,
  strategy: CompressionStrategy
): Promise<CompressedContent>
```

###### `decompress(compressed)`

Decompresses content.

```javascript
async decompress(compressed: CompressedContent): Promise<string>
```

###### `analyzeCompression(content)`

Analyzes potential compression savings.

```javascript
analyzeCompression(content: string): CompressionAnalysis
```

### Evaluation System

Evaluates AI responses and code quality.

#### Class: `EvaluationSystem`

##### Methods

###### `evaluateQuality(content, criteria)`

Evaluates content quality.

```javascript
async evaluateQuality(
  content: string,
  criteria?: EvaluationCriteria
): Promise<QualityScore>
```

###### `compareResponses(responses)`

Compares multiple AI responses.

```javascript
compareResponses(responses: string[]): ComparisonResult
```

###### `generateReport(evaluations)`

Generates evaluation report.

```javascript
generateReport(evaluations: Evaluation[]): EvaluationReport
```

---

## Error Handling

All AIWF APIs follow consistent error handling patterns:

```javascript
try {
  const result = await aiwfApi.someMethod();
} catch (error) {
  if (error.code === 'RESOURCE_NOT_FOUND') {
    // Handle missing resource
  } else if (error.code === 'VALIDATION_ERROR') {
    // Handle validation error
    console.error(error.details);
  } else {
    // Handle unexpected error
    throw error;
  }
}
```

### Error Codes

- `RESOURCE_NOT_FOUND` - Requested resource not found
- `VALIDATION_ERROR` - Input validation failed
- `STATE_CONFLICT` - State operation conflict
- `PERMISSION_DENIED` - Insufficient permissions
- `NETWORK_ERROR` - Network operation failed
- `TIMEOUT` - Operation timed out

---

## Best Practices

### Resource Management

1. Always use ResourceLoader for accessing framework resources
2. Prefer async methods for I/O operations
3. Handle resource not found errors gracefully
4. Cache expensive operations when possible

### State Management

1. Use atomic state updates to prevent conflicts
2. Create checkpoints before major operations
3. Validate state transitions
4. Handle concurrent modifications

### Error Handling

1. Use specific error codes for different scenarios
2. Provide meaningful error messages
3. Include context in error details
4. Log errors appropriately

### Performance

1. Use streaming for large files
2. Implement pagination for lists
3. Cache frequently accessed data
4. Monitor memory usage

---

## Examples

### Creating a Custom Command

```javascript
import { ResourceLoader } from 'aiwf/lib/resource-loader';
import { StateIndexManager } from 'aiwf/lib/state/state-index';

export default class CustomCommand {
  constructor() {
    this.loader = new ResourceLoader();
    this.stateManager = new StateIndexManager('.aiwf');
  }

  async execute(args) {
    // Load current state
    const state = await this.stateManager.loadState();
    
    // Perform operations
    // ...
    
    // Save updated state
    await this.stateManager.saveState(state);
  }
}
```

### Creating a Plugin

```javascript
export default {
  name: 'my-plugin',
  version: '1.0.0',
  
  async init(context) {
    this.logger = context.logger;
    this.logger.info('My plugin initialized');
  },
  
  commands: {
    'my-command': {
      description: 'My custom command',
      handler: async (args, options) => {
        // Command implementation
      }
    }
  },
  
  hooks: {
    'after-state-change': async (oldState, newState) => {
      this.logger.info('State changed', { 
        from: oldState.workflow_mode,
        to: newState.workflow_mode 
      });
    }
  }
};
```

### Using the Compression Engine

```javascript
import { CompressionEngine } from 'aiwf/utils/compression-engine';

const engine = new CompressionEngine();

// Analyze before compression
const analysis = engine.analyzeCompression(largeContent);
console.log(`Potential savings: ${analysis.savingsPercent}%`);

// Compress with specific strategy
const compressed = await engine.compress(largeContent, {
  strategy: 'aggressive',
  preserveStructure: true
});

// Later, decompress
const original = await engine.decompress(compressed);
```

---

## Version History

- **v0.3.x** - Current stable release
  - Complete API redesign
  - Plugin system introduction
  - Enhanced state management
  
- **v0.2.x** - Legacy version
  - Basic command structure
  - Initial resource loader
  
- **v0.1.x** - Initial release
  - Core framework setup

For detailed changelog, see [CHANGELOG.md](../CHANGELOG.md).