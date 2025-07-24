# AIWF Troubleshooting Guide

This guide helps you resolve common issues when using AIWF (AI Workflow Framework). If you can't find a solution here, please check our [GitHub Issues](https://github.com/moonklabs/aiwf/issues) or create a new issue.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Command Execution Problems](#command-execution-problems)
3. [Performance Issues](#performance-issues)
4. [Git Integration Problems](#git-integration-problems)
5. [AI Persona Issues](#ai-persona-issues)
6. [Context Compression Problems](#context-compression-problems)
7. [Test Failures](#test-failures)
8. [Language and Localization](#language-and-localization)
9. [Common Error Messages](#common-error-messages)
10. [Advanced Debugging](#advanced-debugging)

---

## Installation Issues

### Problem: Installation fails with "EACCES: permission denied"

**Symptoms:**
```bash
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /usr/local/lib/node_modules/aiwf
```

**Solutions:**

1. **Use npx instead of global install (Recommended):**
   ```bash
   npx aiwf
   ```

2. **Fix npm permissions:**
   ```bash
   # Option 1: Change npm's default directory
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   
   # Option 2: Use a Node version manager
   # Install nvm and use it to manage Node installations
   ```

3. **Use sudo (Not recommended):**
   ```bash
   sudo npm install -g aiwf
   ```

### Problem: "Cannot find module" errors during installation

**Symptoms:**
```bash
Error: Cannot find module 'chalk'
Error: Cannot find module 'ora'
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version:**
   ```bash
   node --version  # Should be 14.0.0 or higher
   ```

### Problem: Installation hangs or times out

**Symptoms:**
- Installation process freezes
- Network timeout errors

**Solutions:**

1. **Check internet connection**

2. **Use different npm registry:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

3. **Increase timeout:**
   ```bash
   npm config set timeout 60000
   ```

4. **Try offline installation:**
   ```bash
   npx aiwf --offline
   ```

---

## Command Execution Problems

### Problem: Commands not recognized in Claude Code

**Symptoms:**
```
Command not found: /project:aiwf:initialize
```

**Solutions:**

1. **Verify installation:**
   ```bash
   ls -la .claude/commands/aiwf/
   ```

2. **Reinstall AIWF commands:**
   ```bash
   npx aiwf --force
   ```

3. **Check Claude Code settings:**
   - Ensure custom commands are enabled
   - Restart Claude Code after installation

### Problem: Commands execute but produce no output

**Symptoms:**
- Command runs without errors
- No visible changes or output

**Solutions:**

1. **Check command syntax:**
   ```bash
   # Correct
   /project:aiwf:initialize
   
   # Incorrect
   /project:aiwf initialize
   ```

2. **Verify working directory:**
   ```bash
   pwd  # Should be in project root
   ```

3. **Check permissions:**
   ```bash
   ls -la .aiwf/
   # Ensure write permissions
   ```

### Problem: Korean commands not working

**Symptoms:**
```
Command not found: /프로젝트:aiwf:초기화
```

**Solutions:**

1. **Verify Korean language installation:**
   ```bash
   aiwf-lang status
   ```

2. **Switch to Korean:**
   ```bash
   aiwf-lang set ko
   ```

3. **Use alternative command format:**
   ```bash
   /project:aiwf:initialize_kr
   ```

---

## Performance Issues

### Problem: Slow command execution

**Symptoms:**
- Commands take several seconds to complete
- High CPU/memory usage

**Solutions:**

1. **Enable caching:**
   ```javascript
   // In .aiwf/config.json
   {
     "performance": {
       "enableCache": true,
       "cacheSize": 100
     }
   }
   ```

2. **Reduce file scanning scope:**
   ```bash
   # Add to .aiwfignore
   node_modules/
   dist/
   coverage/
   *.log
   ```

3. **Use batch operations:**
   ```javascript
   // Instead of individual operations
   await processor.addReadOperation(file1);
   await processor.addReadOperation(file2);
   await processor.processBatch();
   ```

### Problem: Out of memory errors

**Symptoms:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solutions:**

1. **Increase Node.js memory:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. **Use memory profiler:**
   ```javascript
   const profiler = new MemoryProfiler();
   profiler.startProfiling();
   // ... operations ...
   const report = profiler.generateReport();
   ```

3. **Process files in chunks:**
   ```javascript
   const processor = new FileBatchProcessor({
     maxConcurrency: 5,
     batchSize: 10
   });
   ```

### Problem: Token limit exceeded quickly

**Symptoms:**
- Context overflow errors
- Conversation resets frequently

**Solutions:**

1. **Use aggressive compression:**
   ```bash
   /project:aiwf:compress_context:aggressive
   ```

2. **Exclude unnecessary files:**
   ```javascript
   // In persona context rules
   {
     "exclude": ["test/**", "docs/**", "*.md"]
   }
   ```

3. **Monitor token usage:**
   ```javascript
   const tracker = new TokenTracker();
   const stats = tracker.getSessionStats();
   console.log(`Tokens used: ${stats.percentageUsed}%`);
   ```

---

## Git Integration Problems

### Problem: Commits not linking to features

**Symptoms:**
- Feature progress not updating
- Commits missing from feature ledger

**Solutions:**

1. **Check commit message format:**
   ```bash
   # Good formats
   git commit -m "feat(FL001): implement login"
   git commit -m "[FL001] fix validation bug"
   git commit -m "FL001: update styles"
   
   # Bad format
   git commit -m "implement login for FL001"
   ```

2. **Install Git hooks:**
   ```bash
   /project:aiwf:install_git_hooks
   ```

3. **Manually link commits:**
   ```bash
   /project:aiwf:link_feature_commit FL001 abc123def
   ```

### Problem: Git hooks not executing

**Symptoms:**
- No automatic feature updates
- Hooks exist but don't run

**Solutions:**

1. **Check hook permissions:**
   ```bash
   chmod +x .git/hooks/post-commit
   chmod +x .git/hooks/pre-commit
   ```

2. **Verify hook content:**
   ```bash
   cat .git/hooks/post-commit
   ```

3. **Test hooks manually:**
   ```bash
   ./.git/hooks/post-commit
   ```

### Problem: Branch naming conflicts

**Symptoms:**
- Cannot create feature branches
- Branch names already exist

**Solutions:**

1. **Use unique feature IDs:**
   ```bash
   git checkout -b feature/FL001-unique-description
   ```

2. **Clean up old branches:**
   ```bash
   /project:aiwf:clean_feature_branches
   ```

3. **Check existing branches:**
   ```bash
   git branch -a | grep FL
   ```

---

## AI Persona Issues

### Problem: Persona not switching properly

**Symptoms:**
- Behavior doesn't change after switch
- Wrong context being applied

**Solutions:**

1. **Verify current persona:**
   ```bash
   /project:aiwf:ai_persona:status
   ```

2. **Reset to default:**
   ```bash
   /project:aiwf:ai_persona:reset
   ```

3. **Wait for switch to complete:**
   ```javascript
   await manager.switchPersona('architect');
   // Wait 2-3 seconds for context update
   await new Promise(r => setTimeout(r, 3000));
   ```

### Problem: Persona context rules not applying

**Symptoms:**
- All files included despite exclusions
- Wrong priorities applied

**Solutions:**

1. **Check persona configuration:**
   ```bash
   cat .aiwf/personas/architect.json
   ```

2. **Validate context rules:**
   ```javascript
   const rules = manager.getPersonaContext('architect');
   console.log(rules);
   ```

3. **Clear persona cache:**
   ```bash
   rm -rf .aiwf/cache/personas/
   ```

---

## Context Compression Problems

### Problem: Compression failing with large files

**Symptoms:**
```
Error: Maximum file size exceeded
Error: Compression timeout
```

**Solutions:**

1. **Process files individually:**
   ```javascript
   const compressor = new ContextCompressor();
   for (const file of largeFiles) {
     await compressor.compressFile(file, 'aggressive');
   }
   ```

2. **Increase timeout:**
   ```javascript
   const compressor = new ContextCompressor({
     timeout: 300000  // 5 minutes
   });
   ```

3. **Split large files:**
   ```bash
   split -l 1000 largefile.js part_
   ```

### Problem: Poor compression quality

**Symptoms:**
- Important code removed
- Logic broken after compression

**Solutions:**

1. **Use conservative mode:**
   ```bash
   /project:aiwf:compress_context:conservative
   ```

2. **Exclude critical files:**
   ```javascript
   await compressor.compressDirectory('./src', 'balanced', {
     exclude: ['critical.js', 'config.js']
   });
   ```

3. **Review compression rules:**
   ```javascript
   const result = compressor.compressContext(content, 'balanced');
   console.log(result.compressionRatio);
   ```

---

## Test Failures

### Problem: Integration tests failing

**Symptoms:**
```
19 tests failing
Module not found errors
```

**Solutions:**

1. **Install test dependencies:**
   ```bash
   npm install --include=dev
   ```

2. **Run tests individually:**
   ```bash
   npm test -- --testNamePattern="specific test"
   ```

3. **Check test environment:**
   ```bash
   npm run test:env
   ```

### Problem: Coverage below threshold

**Symptoms:**
```
Jest: "global" coverage threshold for statements (80%) not met: 0%
```

**Solutions:**

1. **Generate coverage report:**
   ```bash
   npm run test:coverage
   ```

2. **Identify uncovered code:**
   ```bash
   npx jest --coverage --coverageReporters=html
   open coverage/index.html
   ```

3. **Add missing tests:**
   ```javascript
   describe('NewFeature', () => {
     test('should work correctly', () => {
       // Add test implementation
     });
   });
   ```

---

## Language and Localization

### Problem: Wrong language detected

**Symptoms:**
- English interface when expecting Korean
- Mixed language content

**Solutions:**

1. **Check system locale:**
   ```bash
   echo $LANG
   locale
   ```

2. **Force language selection:**
   ```bash
   aiwf-lang set ko  # For Korean
   aiwf-lang set en  # For English
   ```

3. **Reset language detection:**
   ```bash
   aiwf-lang reset
   rm ~/.aiwf-lang
   ```

### Problem: Missing translations

**Symptoms:**
- Some text appears in English only
- Untranslated placeholders

**Solutions:**

1. **Update language files:**
   ```bash
   npx aiwf --update-lang
   ```

2. **Check translation files:**
   ```bash
   ls .aiwf/i18n/
   ```

3. **Report missing translations:**
   ```bash
   /project:aiwf:report_translation_issue
   ```

---

## Common Error Messages

### "ENOENT: no such file or directory"

**Cause:** Required file or directory missing

**Solution:**
```bash
# Recreate AIWF structure
npx aiwf --repair
```

### "EPERM: operation not permitted"

**Cause:** Permission issues

**Solution:**
```bash
# Fix permissions
chmod -R u+rw .aiwf/
```

### "EEXIST: file already exists"

**Cause:** Trying to create existing file

**Solution:**
```bash
# Force overwrite
npx aiwf --force
```

### "ValidationError: Invalid feature ID"

**Cause:** Wrong feature ID format

**Solution:**
```bash
# Use correct format: FL001, FL002, etc.
/project:aiwf:create_feature "My Feature"
```

---

## Advanced Debugging

### Enable Debug Mode

```bash
# Set debug environment variable
export AIWF_DEBUG=true

# Run with verbose output
npx aiwf --verbose
```

### Check System Information

```bash
# Create diagnostic report
/project:aiwf:diagnostic_report
```

### Analyze Performance

```javascript
// Enable performance monitoring
const benchmark = new PerformanceBenchmark({
  memoryProfiling: true
});

const suite = BenchmarkSuites.fullSystem();
const report = await benchmark.run(suite);
await benchmark.generateHTMLReport('./performance.html');
```

### Trace Command Execution

```bash
# Enable command tracing
export AIWF_TRACE=true

# View execution logs
tail -f .aiwf/logs/commands.log
```

---

## Getting Help

If you can't resolve your issue:

1. **Search existing issues:**
   - [GitHub Issues](https://github.com/moonklabs/aiwf/issues)

2. **Create a new issue with:**
   - AIWF version: `npx aiwf --version`
   - Node.js version: `node --version`
   - Operating system
   - Error messages
   - Steps to reproduce

3. **Join the community:**
   - Discord: [discord.gg/aiwf](https://discord.gg/aiwf)
   - Discussions: [GitHub Discussions](https://github.com/moonklabs/aiwf/discussions)

4. **Emergency support:**
   - Email: support@aiwf.dev (for critical issues only)

---

## Prevention Tips

1. **Keep AIWF updated:**
   ```bash
   npx aiwf --check-updates
   ```

2. **Regular backups:**
   ```bash
   /project:aiwf:backup
   ```

3. **Monitor system health:**
   ```bash
   /project:aiwf:health_check
   ```

4. **Follow best practices:**
   - Use appropriate compression modes
   - Commit regularly
   - Keep documentation updated
   - Test changes before deploying