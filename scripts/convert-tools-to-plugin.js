#!/usr/bin/env node

/**
 * Convert development tool commands from claude-code/ko to plugin format
 * Adds YAML frontmatter with English descriptions for plugin discovery
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../claude-code/aiwf/ko/.claude/commands/tools');
const TARGET_DIR = path.join(__dirname, '../plugin/commands/tools');

// Mapping of filenames to English descriptions
const DESCRIPTIONS = {
  'accessibility-audit.md': 'Audit web application for accessibility compliance',
  'ai-assistant.md': 'AI-powered development assistant',
  'ai-review.md': 'AI code review and quality assessment',
  'api-mock.md': 'Create API mock server for development',
  'api-scaffold.md': 'Generate API scaffolding and boilerplate',
  'code-explain.md': 'Explain code functionality and behavior',
  'code-migrate.md': 'Migrate code between versions or frameworks',
  'compliance-check.md': 'Check code compliance with standards',
  'config-validate.md': 'Validate configuration files',
  'context-restore.md': 'Restore development context from previous session',
  'context-save.md': 'Save current development context',
  'cost-optimize.md': 'Optimize cloud infrastructure costs',
  'data-pipeline.md': 'Create data pipeline architecture',
  'data-validation.md': 'Validate data structures and schemas',
  'db-migrate.md': 'Database migration management',
  'debug-trace.md': 'Debug trace and analysis',
  'deploy-checklist.md': 'Pre-deployment checklist verification',
  'deps-audit.md': 'Audit project dependencies for vulnerabilities',
  'deps-upgrade.md': 'Upgrade project dependencies safely',
  'doc-generate.md': 'Generate project documentation',
  'docker-optimize.md': 'Optimize Docker configuration and images',
  'error-analysis.md': 'Analyze error patterns and root causes',
  'error-trace.md': 'Trace and analyze runtime errors',
  'issue.md': 'Track and manage project issues',
  'k8s-manifest.md': 'Generate Kubernetes manifests and configs',
  'langchain-agent.md': 'Create LangChain agent implementation',
  'monitor-setup.md': 'Set up monitoring and observability',
  'multi-agent-optimize.md': 'Optimize multi-agent system performance',
  'multi-agent-review.md': 'Review multi-agent architecture',
  'onboard.md': 'Onboard new team members to project',
  'pr-enhance.md': 'Enhance pull request quality and description',
  'prompt-optimize.md': 'Optimize AI prompts for better results',
  'refactor-clean.md': 'Clean code refactoring',
  'security-scan.md': 'Run comprehensive security vulnerability scan',
  'slo-implement.md': 'Implement SLO monitoring and alerting',
  'smart-debug.md': 'Smart debugging with AI assistance',
  'standup-notes.md': 'Generate daily standup notes',
  'tdd-green.md': 'Implement code to pass TDD tests (green phase)',
  'tdd-red.md': 'Write failing tests following TDD red phase',
  'tdd-refactor.md': 'Refactor code in TDD refactor phase',
  'tech-debt.md': 'Track and manage technical debt',
  'test-harness.md': 'Create comprehensive test harness'
};

/**
 * Extract frontmatter from markdown content
 */
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (match) {
    return {
      frontmatter: match[1],
      body: match[2]
    };
  }

  return {
    frontmatter: null,
    body: content
  };
}

/**
 * Parse YAML frontmatter into object
 */
function parseFrontmatter(frontmatterText) {
  const lines = frontmatterText.split('\n');
  const result = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      result[key] = value;
    }
  }

  return result;
}

/**
 * Convert frontmatter object to YAML string
 */
function stringifyFrontmatter(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

/**
 * Process a single markdown file
 */
function processFile(filename, sourcePath, targetPath) {
  console.log(`Processing: ${filename}`);

  // Read source file
  const content = fs.readFileSync(sourcePath, 'utf-8');

  // Extract existing frontmatter and body
  const { frontmatter, body } = extractFrontmatter(content);

  // Parse existing frontmatter or create new object
  let frontmatterObj = {};
  if (frontmatter) {
    frontmatterObj = parseFrontmatter(frontmatter);
  }

  // Add or update description
  const description = DESCRIPTIONS[filename];
  if (!description) {
    console.warn(`  ⚠ Warning: No description defined for ${filename}`);
    frontmatterObj.description = `TODO: Add description for ${filename}`;
  } else {
    frontmatterObj.description = description;
  }

  // Construct new content with frontmatter
  const newFrontmatter = stringifyFrontmatter(frontmatterObj);
  const newContent = `---\n${newFrontmatter}\n---\n${body}`;

  // Write to target location
  fs.writeFileSync(targetPath, newContent, 'utf-8');
  console.log(`  ✓ Converted to: ${targetPath}`);
}

/**
 * Main conversion function
 */
function convertTools() {
  console.log('Converting development tool commands to plugin format...\n');

  // Ensure target directory exists
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log(`Created target directory: ${TARGET_DIR}\n`);
  }

  // Read all .md files from source directory
  const files = fs.readdirSync(SOURCE_DIR)
    .filter(file => file.endsWith('.md'))
    .sort();

  console.log(`Found ${files.length} markdown files to convert\n`);

  let converted = 0;
  let errors = 0;

  // Process each file
  for (const file of files) {
    const sourcePath = path.join(SOURCE_DIR, file);
    const targetPath = path.join(TARGET_DIR, file);

    try {
      processFile(file, sourcePath, targetPath);
      converted++;
    } catch (error) {
      console.error(`  ✗ Error processing ${file}:`, error.message);
      errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`Conversion complete!`);
  console.log(`  ✓ Successfully converted: ${converted} files`);
  if (errors > 0) {
    console.log(`  ✗ Errors: ${errors} files`);
  }
  console.log(`  → Target directory: ${TARGET_DIR}`);
  console.log('='.repeat(60));
}

// Run conversion
convertTools();
