#!/usr/bin/env node

import { ContextCompressor } from '../utils/context-compressor.js';
import { TokenCounter } from '../utils/token-counter.js';
import { CompressionMetrics } from '../utils/compression-metrics.js';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Execute compress-context command
 */
export async function executeCompressContext(args = []) {
  const spinner = ora('Preparing context compression...').start();
  
  try {
    // Parse parameters
    const { mode, targetPath } = parseArguments(args);
    
    spinner.text = 'Analyzing compression targets...';
    
    // Determine target path
    const resolvedPath = await resolveTargetPath(targetPath);
    const files = await collectMarkdownFiles(resolvedPath);
    
    if (files.length === 0) {
      spinner.fail('No markdown files to compress.');
      return;
    }
    
    // Statistics before compression
    spinner.text = 'Calculating original token count...';
    const beforeStats = await calculateStats(files);
    
    // Start compression
    console.log('');
    console.log(chalk.cyan('🗜️  Starting Context Compression'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(`Compression mode: ${chalk.yellow(mode)}`);
    console.log(`Target: ${chalk.yellow(resolvedPath)}`);
    console.log('');
    
    console.log(chalk.cyan('📊 Statistics before compression:'));
    console.log(`- Total files: ${files.length}`);
    console.log(`- Original tokens: ${chalk.red(beforeStats.totalTokens.toLocaleString())}`);
    console.log(`- Original size: ${(beforeStats.totalSize / 1024).toFixed(1)} KB`);
    console.log('');
    
    spinner.text = 'Compressing...';
    
    // Perform compression
    const compressor = new ContextCompressor(mode);
    const compressionResults = [];
    const startTime = Date.now();
    
    console.log(chalk.cyan('⚙️  Compressing...'));
    
    for (const file of files) {
      const fileName = path.basename(file);
      const content = await fs.readFile(file, 'utf8');
      
      const result = await compressor.compress(content, {
        strategy: mode,
        preserveStructure: true,
        enableSummarization: mode === 'aggressive',
        enableNormalization: true,
        enableFiltering: mode !== 'minimal'
      });
      
      if (result.success) {
        const savedTokens = result.originalTokens - result.compressedTokens;
        const ratio = result.compressionRatio.toFixed(1);
        
        console.log(chalk.green(`✓ ${fileName} (${result.originalTokens.toLocaleString()} → ${result.compressedTokens.toLocaleString()} tokens, -${ratio}%)`));
        
        compressionResults.push({
          filePath: file,
          fileName,
          ...result
        });
      } else {
        console.log(chalk.red(`✗ ${fileName} (compression failed: ${result.error})`));
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // Statistics after compression
    const afterStats = calculateCompressedStats(compressionResults);
    const totalSaved = beforeStats.totalTokens - afterStats.totalTokens;
    const overallRatio = ((totalSaved / beforeStats.totalTokens) * 100).toFixed(1);
    
    // Save compressed files
    spinner.text = 'Saving compressed files...';
    const outputDir = await saveCompressedFiles(compressionResults, resolvedPath);
    
    // Generate compression report
    await generateReport(compressionResults, {
      mode,
      targetPath: resolvedPath,
      outputDir,
      beforeStats,
      afterStats,
      processingTime
    });
    
    spinner.stop();
    
    // Output results
    console.log('');
    console.log(chalk.cyan('📊 Statistics after compression:'));
    console.log(`- Compressed tokens: ${chalk.green(afterStats.totalTokens.toLocaleString())}`);
    console.log(`- Tokens saved: ${chalk.green(totalSaved.toLocaleString())}`);
    console.log(`- Token reduction: ${chalk.green(overallRatio + '%')}`);
    console.log(`- Processing time: ${(processingTime / 1000).toFixed(1)}s`);
    
    // Calculate average quality score
    const avgQuality = compressionResults.reduce((sum, r) => {
      return sum + (r.metadata?.validation?.qualityScore || 0);
    }, 0) / compressionResults.length;
    
    console.log(`- Quality score: ${chalk.green(avgQuality.toFixed(0) + '/100')}`);
    console.log('');
    
    console.log(chalk.green('✅ Compression complete!'));
    console.log(`Compressed files location: ${chalk.yellow(outputDir)}`);
    
    // Check if target achieved
    const targetRange = getTargetRange(mode);
    if (parseFloat(overallRatio) < targetRange.min) {
      console.log('');
      console.log(chalk.yellow(`⚠️  Warning: Compression rate below target range (${targetRange.min}-${targetRange.max}%).`));
      console.log('Try aggressive mode for higher compression rates.');
    }
    
    // Clean up resources
    compressor.cleanup();
    
  } catch (error) {
    spinner.fail(`Compression failed: ${error.message}`);
    console.error(error);
  }
}

/**
 * Parse command arguments
 * @param {Array<string>} args - Argument array
 * @returns {Object} Parsed options
 */
function parseArguments(args) {
  let mode = 'balanced';
  let targetPath = null;
  
  for (const arg of args) {
    if (['aggressive', 'balanced', 'minimal'].includes(arg)) {
      mode = arg;
    } else if (arg && !arg.startsWith('-')) {
      targetPath = arg;
    }
  }
  
  return { mode, targetPath };
}

/**
 * Determine target path
 * @param {string} targetPath - User specified path
 * @returns {string} Determined path
 */
async function resolveTargetPath(targetPath) {
  if (targetPath) {
    // Convert to absolute path if not already
    if (!path.isAbsolute(targetPath)) {
      targetPath = path.join(process.cwd(), targetPath);
    }
    return targetPath;
  }
  
  // Default: project's .aiwf directory
  const aiwfPath = path.join(process.cwd(), '.aiwf');
  try {
    await fs.access(aiwfPath);
    return aiwfPath;
  } catch {
    // If no .aiwf, use current directory
    return process.cwd();
  }
}

/**
 * Collect markdown files
 * @param {string} targetPath - Target path
 * @returns {Array<string>} File path array
 */
async function collectMarkdownFiles(targetPath) {
  const files = [];
  
  try {
    const stats = await fs.stat(targetPath);
    
    if (stats.isFile() && targetPath.endsWith('.md')) {
      files.push(targetPath);
    } else if (stats.isDirectory()) {
      await collectFromDirectory(targetPath, files);
    }
  } catch (error) {
    console.error(`Path access error: ${targetPath}`);
  }
  
  return files;
}

/**
 * Recursively collect markdown files from directory
 * @param {string} dirPath - Directory path
 * @param {Array<string>} files - File array
 */
async function collectFromDirectory(dirPath, files) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      await collectFromDirectory(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
}

/**
 * Calculate file statistics
 * @param {Array<string>} files - File path array
 * @returns {Object} Statistics information
 */
async function calculateStats(files) {
  const tokenCounter = new TokenCounter();
  let totalTokens = 0;
  let totalSize = 0;
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    totalTokens += tokenCounter.countTokens(content);
    totalSize += Buffer.byteLength(content, 'utf8');
  }
  
  tokenCounter.cleanup();
  
  return { totalTokens, totalSize };
}

/**
 * Calculate compressed statistics
 * @param {Array<Object>} results - Compression result array
 * @returns {Object} Statistics information
 */
function calculateCompressedStats(results) {
  const totalTokens = results.reduce((sum, r) => sum + r.compressedTokens, 0);
  const totalSize = results.reduce((sum, r) => sum + Buffer.byteLength(r.compressed, 'utf8'), 0);
  
  return { totalTokens, totalSize };
}

/**
 * Save compressed files
 * @param {Array<Object>} results - Compression result array
 * @param {string} targetPath - Original path
 * @returns {string} Output directory
 */
async function saveCompressedFiles(results, targetPath) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const outputDir = path.join(path.dirname(targetPath), `.aiwf_compressed`, timestamp);
  
  await fs.mkdir(outputDir, { recursive: true });
  
  for (const result of results) {
    const outputPath = path.join(outputDir, result.fileName);
    await fs.writeFile(outputPath, result.compressed);
  }
  
  return outputDir;
}

/**
 * Generate compression report
 * @param {Array<Object>} results - Compression result array
 * @param {Object} stats - Statistics information
 */
async function generateReport(results, stats) {
  const report = [];
  
  report.push('# Context Compression Report');
  report.push('');
  report.push(`**Generated**: ${new Date().toISOString()}`);
  report.push(`**Compression Mode**: ${stats.mode}`);
  report.push(`**Target Path**: ${stats.targetPath}`);
  report.push(`**Output Path**: ${stats.outputDir}`);
  report.push('');
  
  report.push('## Overall Statistics');
  report.push(`- **File Count**: ${results.length}`);
  report.push(`- **Original Tokens**: ${stats.beforeStats.totalTokens.toLocaleString()}`);
  report.push(`- **Compressed Tokens**: ${stats.afterStats.totalTokens.toLocaleString()}`);
  report.push(`- **Tokens Saved**: ${(stats.beforeStats.totalTokens - stats.afterStats.totalTokens).toLocaleString()}`);
  report.push(`- **Overall Compression Rate**: ${((stats.beforeStats.totalTokens - stats.afterStats.totalTokens) / stats.beforeStats.totalTokens * 100).toFixed(1)}%`);
  report.push(`- **Processing Time**: ${(stats.processingTime / 1000).toFixed(1)}s`);
  report.push('');
  
  report.push('## File Details');
  report.push('');
  report.push('| File Name | Original Tokens | Compressed Tokens | Compression Rate | Quality Score |');
  report.push('|--------|-----------|-----------|--------|-----------|');
  
  for (const result of results) {
    const qualityScore = result.metadata?.validation?.qualityScore || 0;
    report.push(
      `| ${result.fileName} | ${result.originalTokens.toLocaleString()} | ` +
      `${result.compressedTokens.toLocaleString()} | ${result.compressionRatio}% | ` +
      `${qualityScore}/100 |`
    );
  }
  
  const reportPath = path.join(stats.outputDir, 'compression-report.md');
  await fs.writeFile(reportPath, report.join('\n'));
}

/**
 * Get target range by compression mode
 * @param {string} mode - Compression mode
 * @returns {Object} Target range
 */
function getTargetRange(mode) {
  const ranges = {
    aggressive: { min: 50, max: 70 },
    balanced: { min: 30, max: 50 },
    minimal: { min: 10, max: 30 }
  };
  
  return ranges[mode] || { min: 0, max: 100 };
}

// When run directly from CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  executeCompressContext(args);
}

export default executeCompressContext;