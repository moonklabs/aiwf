[Read in Korean (한국어로 보기)](context-compression-guide-ko.md)

# Context Compression Mode User Guide

## Overview

The Context Compression feature optimizes token usage in conversations with Claude Code, enabling longer conversations and processing of more information. Through 3 compression modes, you can select the optimal compression strategy suited to your project characteristics and work requirements.

## Need for Compression

### Token Limitation Issues
- Claude Code has per-conversation token limits
- Context overflow frequent when working with large codebases
- Possible information loss in long conversation sessions

### Benefits of Context Compression
- Average token usage reduction of 50% or more
- Simultaneous processing of more files and information
- Improved conversation continuity
- Increased cost efficiency

## Compression Mode Details

### 1. Aggressive Mode

**Compression Rate**: 70-80%  
**Quality Loss**: Medium-High  
**Processing Speed**: Fast

**Characteristics**:
- Maximum token savings
- Retains only core information
- Some loss of details and context
- Uses short and concise expressions

**Compression Strategy**:
- Remove comments and documentation
- Summarize repetitive code patterns
- Shorten variable names
- Minimize whitespace and formatting
- Remove duplicate information

**Suitable Situations**:
- Exploring very large codebases
- When general understanding is needed
- Fast prototyping
- When token budget is very limited

**Usage Example**:
```bash
/project:aiwf:compress_context:aggressive
# or
/프로젝트:aiwf:컨텍스트_압축:공격적
```

### 2. Balanced Mode

**Compression Rate**: 50-60%  
**Quality Loss**: Low  
**Processing Speed**: Medium

**Characteristics**:
- Balance between compression rate and quality
- Preserves important information
- Maintains readability
- Ensures structural integrity

**Compression Strategy**:
- Clean up duplicate comments
- Summarize long descriptions
- Remove unused code
- Smart whitespace management
- Context-based compression

**Suitable Situations**:
- General development tasks
- Code review and analysis
- Bug fixing tasks
- Feature implementation and modification

**Usage Example**:
```bash
/project:aiwf:compress_context:balanced
# or
/프로젝트:aiwf:컨텍스트_압축:균형
```

### 3. Conservative Mode

**Compression Rate**: 30-40%  
**Quality Loss**: Very Low  
**Processing Speed**: Slow

**Characteristics**:
- Minimal information loss
- Preserves all important details
- High similarity to original
- Enables precise work

**Compression Strategy**:
- Remove only obvious duplicates
- Maintain formatting
- Preserve comments and documentation
- Keep meaningful whitespace
- Apply only safe compression

**Suitable Situations**:
- Precise debugging
- Security audits
- Performance optimization
- Working with critical production code

**Usage Example**:
```bash
/project:aiwf:compress_context:conservative
# or
/프로젝트:aiwf:컨텍스트_압축:보수적
```

## Mode Selection Guide

### Decision Tree

```
What's the nature of the task?
├─ Exploration/Overview → Aggressive
├─ General development → Balanced
└─ Precise/Critical work → Conservative

Token budget?
├─ Very limited → Aggressive
├─ Normal → Balanced
└─ Abundant → Conservative

Required information level?
├─ Overview only → Aggressive
├─ Main logic → Balanced
└─ All details → Conservative
```

### Recommended Mode by Task Type

| Task Type | Recommended Mode | Reason |
|-----------|------------------|--------|
| Architecture Review | Aggressive | Overall structure understanding important |
| Bug Fixing | Balanced | Need balance of context and details |
| Performance Optimization | Conservative | All details important |
| Code Refactoring | Balanced | Need to maintain structure while improving |
| Security Audit | Conservative | Can't miss any details |
| Documentation Generation | Aggressive | Only core functionality needed |
| Test Writing | Balanced | Need to understand main logic |

## Usage Methods

### Basic Command Structure
```bash
/project:aiwf:compress_context[:<mode>]
```

### Usage Examples by Mode

**Compress entire project with Aggressive mode**:
```bash
/project:aiwf:compress_context:aggressive
"Please compress and show all JavaScript files in the src folder"
```

**Compress specific module with Balanced mode**:
```bash
/project:aiwf:compress_context:balanced
"Please compress and analyze the main logic of the authentication module"
```

**Compress important file with Conservative mode**:
```bash
/project:aiwf:compress_context:conservative
"Please compress payment.js file minimally and review for security vulnerabilities"
```

### Advanced Usage

**1. Selective Compression**
Compress only specific files or directories:
```bash
/project:aiwf:compress_context:balanced
"Please compress only the src/api folder and exclude the tests folder"
```

**2. Multi-stage Compression**
Compress large projects in stages:
```bash
# Stage 1: Understand overall structure
/project:aiwf:compress_context:aggressive
"Please show the overall project structure"

# Stage 2: Detailed analysis of areas of interest
/project:aiwf:compress_context:balanced
"Please analyze authentication-related modules in more detail"
```

**3. Compression Exclusion Settings**
Exclude important parts from compression:
```bash
/project:aiwf:compress_context:aggressive
"Please compress everything but don't compress security.js"
```

## Compression Quality Metrics

### Compression Rate Calculation
```
Compression Rate = (Original Tokens - Compressed Tokens) / Original Tokens × 100
```

### Quality Indicators

**Information Preservation Rate**:
- Aggressive: 60-70%
- Balanced: 85-90%
- Conservative: 95-98%

**Structural Integrity**:
- Aggressive: Basic structure only
- Balanced: Maintains overall structure
- Conservative: Complete preservation

**Readability Score**:
- Aggressive: Low (machine-friendly)
- Balanced: Medium (developer-friendly)
- Conservative: High (similar to original)

## Performance Considerations

### Processing Time
- Aggressive: Fastest (simple rule application)
- Balanced: Medium (includes context analysis)
- Conservative: Slow (requires detailed analysis)

### Memory Usage
- All modes: 1.5-2x original size memory required
- Large files processed in chunks

### Compression Caching
- Cache utilization when recompressing same files
- Cache validity period: 15 minutes
- Automatic refresh when files change

## Troubleshooting

### Excessive Information Loss
**Symptoms**: Important information is missing
**Solutions**:
1. Change to more conservative mode
2. Exclude important parts from compression
3. Use selective compression

### Minimal Compression Effect
**Symptoms**: Token savings don't meet expectations
**Solutions**:
1. Try more aggressive mode
2. Exclude unnecessary files
3. Manual cleanup before compression

### Compression Errors
**Symptoms**: Errors occur during compression
**Solutions**:
1. Check file encoding
2. Review special characters or formats
3. Compress in smaller units

## Best Practices

### 1. Select Mode Before Starting Work
- First understand the nature of the task
- Pre-select appropriate mode
- Change mid-way if necessary

### 2. Progressive Compression
- Use staged approach for large projects
- Start with Aggressive to understand overall
- Detailed analysis of needed parts with Balanced/Conservative

### 3. Utilize Compression Exclusion
- Exclude important configuration files
- Exclude security-related code
- Exclude complex algorithms

### 4. Mode Combination
```bash
# Example: Hybrid approach
1. Overall structure: Aggressive
2. Core modules: Balanced
3. Problem areas: Conservative
```

## Future Improvements

### Planned Features
1. **Smart Auto Mode**: AI determines task nature and automatically selects
2. **Custom Compression Rules**: Project-specific compression settings
3. **Compression Presets**: Save frequently used settings
4. **Real-time Compression Preview**: Preview compression results beforehand

### Performance Goals
- 30% improvement in compression speed
- 20% reduction in memory usage
- Additional 10% improvement in compression rate

## Conclusion

The Context Compression feature is an essential tool for efficient collaboration with Claude Code. By understanding the characteristics of each mode and selecting the appropriate mode for your tasks, you can develop smoothly even in large projects without token limitations.

We encourage you to develop compression strategies optimized for your projects through continuous use.