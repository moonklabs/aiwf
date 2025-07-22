# Context Compression - Token Optimization

Compresses project context to reduce token usage. Provides 3-tier compression modes with real-time token monitoring.

**Important:**
- Default mode is 'balanced' targeting 30-50% token savings
- Shows real-time token usage and savings rate before and after compression
- Critical information is preserved in all modes

## Usage

```
/project:aiwf:compress_context [mode] [target]
```

### Parameters

- `mode` (optional): Compression mode
  - `aggressive`: 50-70% token savings (keeps only critical/high information)
  - `balanced`: 30-50% token savings (default, keeps medium+ information)
  - `minimal`: 10-30% token savings (keeps all information, optimizes formatting only)

- `target` (optional): Compression target
  - File path: Compress specific file
  - Directory path: Compress all markdown files in directory
  - If omitted: Compress main project documents

## Compression Strategies

### Aggressive Mode (50-70% compression)
- Keeps only Critical/High importance sections
- Significantly reduces code examples
- Completely removes duplicates
- Removes output logs, history, etc.

### Balanced Mode (30-50% compression)
- Keeps Critical/High/Medium importance sections
- Selectively maintains code examples
- Partially removes duplicates
- Removes only old logs

### Minimal Mode (10-30% compression)
- Maintains all importance levels
- Cleans whitespace and formatting
- Removes only obvious duplicates
- Safe compression

## Execution Steps

1. **Identify Compression Targets**
   - Verify target files/directories
   - Calculate original token count

2. **Apply Compression Mode**
   - Execute compression strategy based on selected mode
   - Filter sections by importance
   - Apply compression algorithms

3. **Validate Compression Results**
   - Calculate post-compression token count
   - Display savings rate and quality score
   - Verify critical information preservation

4. **Generate Compressed Files**
   - Save compressed content to new files
   - Preserve original files
   - Record compression metadata

## Output Format

```
🗜️ Context Compression Starting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compression mode: balanced
Target: /workspace/project/.aiwf/

📊 Pre-compression stats:
- Total files: 15
- Original tokens: 45,320
- Original size: 125.4 KB

⚙️ Compressing...
✓ PROJECT_MANIFEST.md (5,320 → 2,890 tokens, -45.6%)
✓ ARCHITECTURE.md (8,210 → 4,105 tokens, -50.0%)
✓ M02_milestone_meta.md (3,450 → 2,070 tokens, -40.0%)
... [additional files]

📊 Post-compression stats:
- Compressed tokens: 27,192
- Saved tokens: 18,128
- Token savings rate: 40.0%
- Compression time: 2.3s
- Quality score: 92/100

✅ Compression complete!
Compressed files location: /workspace/project/.aiwf_compressed/
```

## Quality Assurance

- **Critical Information Preservation**: Goals, requirements, acceptance criteria always maintained
- **Structure Preservation**: Maintains logical document structure and hierarchy
- **Readability**: Remains readable after compression
- **Restorable**: Can be restored using compression metadata if needed

## Recommended Use Cases

1. **Large Project Reviews**: Use aggressive mode to quickly grasp essentials
2. **General Development**: Use balanced mode for efficient context management
3. **Debugging/Detailed Analysis**: Use minimal mode to keep all information while optimizing

## Important Notes

- Compressed files are saved in a separate directory; originals are preserved
- Some formatting or details may be lost during compression
- Information marked as Critical is preserved in all modes