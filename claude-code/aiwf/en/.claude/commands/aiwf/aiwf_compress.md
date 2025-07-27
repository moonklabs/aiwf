# /compress - Unified Context Compression Command

A unified compression command to optimize token usage. Provides various compression modes and persona-specific optimizations.

## Usage

```
/compress [type] [options]
```

### Compression Types

#### 1. **context** - Basic Context Compression
```
/compress context [mode] [path]
```
- `mode`: aggressive | balanced | minimal (default: balanced)
- `path`: file/directory path (default: main project documents)

#### 2. **persona** - Persona-based Compression
```
/compress persona [persona_name] [level]
```
- `persona_name`: architect | developer | security | frontend | data
- `level`: 1-5 (1=minimal, 5=maximum compression)

#### 3. **stats** - Compression Statistics & Analysis
```
/compress stats [period]
```
- `period`: today | week | month | all

#### 4. **auto** - Automatic Optimization
```
/compress auto
```
- Analyzes current context and persona to apply optimal compression

## Compression Mode Features

### 🔴 Aggressive (50-70% compression)
- Keeps only Critical/High priority
- Minimizes code examples
- Removes history/logs
- **When to use**: Near token limit, only core info needed

### 🟡 Balanced (30-50% compression)
- Keeps Critical/High/Medium priority
- Preserves main code examples
- Keeps recent history only
- **When to use**: General work, balanced compression

### 🟢 Minimal (10-30% compression)
- Keeps all priorities
- Optimizes formatting
- Removes only obvious duplicates
- **When to use**: Detailed info needed, safe compression

## Persona-Specific Optimization

### 👷 Architect Persona
- Prioritizes architecture diagrams
- Compresses implementation details
- Preserves design decisions

### 👨‍💻 Developer Persona
- Maximally preserves code examples
- Maintains API documentation
- Compresses design documents

### 🔒 Security Persona
- Prioritizes security-related info
- Preserves vulnerability analysis
- Compresses general implementation

### 🎨 Frontend Persona
- Prioritizes UI/UX information
- Preserves component structure
- Compresses backend logic

### 📊 Data Analyst Persona
- Prioritizes data schemas
- Preserves analysis results
- Compresses UI-related info

## Execution Steps

### 1. Determine Compression Type
```bash
# Check type parameter
TYPE="${1:-context}"  # default: context

case "$TYPE" in
  context|persona|stats|auto)
    echo "✅ Compression type: $TYPE"
    ;;
  *)
    echo "❌ Invalid type. Available: context, persona, stats, auto"
    exit 1
    ;;
esac
```

### 2. Execute Context Compression
```bash
if [[ "$TYPE" == "context" ]]; then
  MODE="${2:-balanced}"
  TARGET="${3:-.}"
  
  echo "🗜️ Starting context compression..."
  echo "📊 Mode: $MODE"
  echo "📁 Target: $TARGET"
  
  # Token count before compression
  BEFORE_TOKENS=$(find "$TARGET" -name "*.md" -exec wc -w {} + | tail -1 | awk '{print $1 * 0.75}')
  echo "📈 Estimated tokens before: $BEFORE_TOKENS"
  
  # Execute compression
  aiwf compress "$MODE" "$TARGET"
  
  # Token count after compression
  AFTER_TOKENS=$(find "$TARGET" -name "*.md" -exec wc -w {} + | tail -1 | awk '{print $1 * 0.75}')
  SAVED_PERCENT=$(( (BEFORE_TOKENS - AFTER_TOKENS) * 100 / BEFORE_TOKENS ))
  
  echo "📉 Estimated tokens after: $AFTER_TOKENS"
  echo "💰 Savings: ${SAVED_PERCENT}%"
fi
```

### 3. Execute Persona Compression
```bash
if [[ "$TYPE" == "persona" ]]; then
  PERSONA="${2:-developer}"
  LEVEL="${3:-3}"
  
  echo "🎭 Starting persona-based compression..."
  echo "👤 Persona: $PERSONA"
  echo "📊 Compression level: $LEVEL/5"
  
  # Apply persona-specific compression rules
  case "$PERSONA" in
    architect)
      PRIORITIES="architecture,design,decisions"
      COMPRESS="implementation,code-details"
      ;;
    developer)
      PRIORITIES="code,api,implementation"
      COMPRESS="architecture,ui-details"
      ;;
    security)
      PRIORITIES="security,vulnerabilities,auth"
      COMPRESS="ui,styling,non-critical"
      ;;
    frontend)
      PRIORITIES="ui,components,styling"
      COMPRESS="backend,database,infrastructure"
      ;;
    data)
      PRIORITIES="schema,queries,analysis"
      COMPRESS="ui,frontend,styling"
      ;;
  esac
  
  echo "✅ Prioritize: $PRIORITIES"
  echo "🗜️ Compress: $COMPRESS"
  
  # Execute persona-based compression
  aiwf compress --persona "$PERSONA" --level "$LEVEL"
fi
```

### 4. Display Compression Statistics
```bash
if [[ "$TYPE" == "stats" ]]; then
  PERIOD="${2:-today}"
  
  echo "📊 Analyzing compression statistics..."
  echo "📅 Period: $PERIOD"
  
  # Collect and display statistics
  aiwf token report "$PERIOD" | grep -E "compression|saved|tokens"
  
  # Compression history
  echo -e "\n📜 Recent compression history:"
  tail -10 .aiwf/logs/compression.log 2>/dev/null || echo "No compression history"
  
  # Recommendations
  echo -e "\n💡 Recommendations:"
  CURRENT_USAGE=$(aiwf token status | grep "percentage" | awk '{print $2}')
  if (( CURRENT_USAGE > 80 )); then
    echo "⚠️ High token usage. Aggressive mode recommended"
  elif (( CURRENT_USAGE > 50 )); then
    echo "📊 Appropriate usage. Maintain balanced mode"
  else
    echo "✅ Plenty of tokens available. Minimal mode possible"
  fi
fi
```

### 5. Automatic Optimization
```bash
if [[ "$TYPE" == "auto" ]]; then
  echo "🤖 Starting automatic compression optimization..."
  
  # Detect current persona
  ACTIVE_PERSONA=$(aiwf persona status | grep "active" | awk '{print $2}')
  echo "👤 Active persona: ${ACTIVE_PERSONA:-none}"
  
  # Check token usage
  TOKEN_USAGE=$(aiwf token status | grep "percentage" | awk '{print $2}')
  echo "📊 Current token usage: ${TOKEN_USAGE}%"
  
  # Determine automatic mode
  if (( TOKEN_USAGE > 80 )); then
    AUTO_MODE="aggressive"
    AUTO_LEVEL="5"
  elif (( TOKEN_USAGE > 50 )); then
    AUTO_MODE="balanced"
    AUTO_LEVEL="3"
  else
    AUTO_MODE="minimal"
    AUTO_LEVEL="1"
  fi
  
  echo "🎯 Auto-selected: $AUTO_MODE mode (level $AUTO_LEVEL)"
  
  # Execute automatic compression
  if [[ -n "$ACTIVE_PERSONA" ]]; then
    /compress persona "$ACTIVE_PERSONA" "$AUTO_LEVEL"
  else
    /compress context "$AUTO_MODE"
  fi
fi
```

## Save Compression Results

```bash
# Log compression
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
LOG_ENTRY="$TIMESTAMP | Type: $TYPE | Mode: ${MODE:-$PERSONA} | Saved: ${SAVED_PERCENT:-N/A}%"
echo "$LOG_ENTRY" >> .aiwf/logs/compression.log

# Update state
aiwf state update
```

## Example Output

```
🗜️ AIWF Unified Compression Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Compression Analysis:
├─ Type: context
├─ Mode: balanced
├─ Target: .aiwf/
└─ Expected savings: 30-50%

⏳ Compressing...
[████████████████████████████████] 100%

✅ Compression complete!
├─ Before: 150,000 tokens
├─ After: 90,000 tokens
├─ Saved: 60,000 tokens (40%)
└─ Duration: 2.3s

💡 Next recommendations:
- Maintain current mode
- Next compression: in 24 hours
- Persona optimization available: architect
```

## Important Notes

- Compressed files create `.compressed` backups
- Critical information preserved in all modes
- Decompress: `aiwf compress --restore`
- Compression history saved to `.aiwf/logs/compression.log`

**Tip**: Running `auto` mode before starting work provides efficient optimization.