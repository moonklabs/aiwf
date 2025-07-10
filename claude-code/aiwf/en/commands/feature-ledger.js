#!/usr/bin/env node

/**
 * Feature Ledger Management Command (English)
 * Provides feature creation, update, query, and linking functionality
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';

// Constants definition
const FEATURE_STATES = {
  active: 'Active',
  completed: 'Completed',
  paused: 'Paused',
  archived: 'Archived'
};

const PRIORITIES = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const CATEGORIES = {
  feature: 'Feature',
  enhancement: 'Enhancement',
  bugfix: 'Bug Fix',
  refactor: 'Refactoring'
};

// Helper functions
function getProjectRoot() {
  const cwd = process.cwd();
  return cwd.endsWith('.aiwf') ? path.dirname(cwd) : cwd;
}

function getFeatureLedgerPath() {
  return path.join(getProjectRoot(), '.aiwf', '06_FEATURE_LEDGERS');
}

function getNextFeatureId() {
  const ledgerPath = getFeatureLedgerPath();
  const activePath = path.join(ledgerPath, 'active');
  
  if (!fs.existsSync(activePath)) {
    fs.mkdirSync(activePath, { recursive: true });
  }
  
  const files = fs.readdirSync(activePath).filter(f => f.match(/^FL\d{3}/));
  if (files.length === 0) return 'FL001';
  
  const ids = files.map(f => parseInt(f.match(/FL(\d{3})/)[1]));
  const nextId = Math.max(...ids) + 1;
  return `FL${String(nextId).padStart(3, '0')}`;
}

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// Create Feature
async function createFeature(name) {
  try {
    // Interactive mode
    if (!name) {
      const response = await prompts([
        {
          type: 'text',
          name: 'title',
          message: 'Enter Feature title:',
          validate: value => value.length > 0 || 'Title is required'
        },
        {
          type: 'text',
          name: 'description',
          message: 'Enter Feature description:'
        },
        {
          type: 'select',
          name: 'priority',
          message: 'Select priority:',
          choices: Object.entries(PRIORITIES).map(([value, title]) => ({ 
            title: title, 
            value: value 
          }))
        },
        {
          type: 'select',
          name: 'category',
          message: 'Select category:',
          choices: Object.entries(CATEGORIES).map(([value, title]) => ({ 
            title: title, 
            value: value 
          }))
        }
      ]);
      
      if (!response.title) return;
      
      name = response.title;
      var { description, priority, category } = response;
    } else {
      // Default values
      var description = '';
      var priority = 'medium';
      var category = 'feature';
    }
    
    const featureId = getNextFeatureId();
    const filename = `${featureId}_${sanitizeFilename(name)}.md`;
    const filepath = path.join(getFeatureLedgerPath(), 'active', filename);
    
    // Feature file content
    const content = `# ${featureId}: ${name}

## Metadata

- **Feature ID**: ${featureId}
- **Title**: ${name}
- **Status**: active
- **Priority**: ${priority}
- **Category**: ${category}
- **Created**: ${new Date().toISOString()}
- **Updated**: ${new Date().toISOString()}

## Description

${description || '(Please add description)'}

## Progress

- **Progress**: 0%
- **Start Date**: ${new Date().toISOString().split('T')[0]}
- **Expected Completion**: TBD

## Milestone & Sprint

- **Milestone**: (Not assigned)
- **Sprint**: (Not assigned)

## Tasks

- [ ] Initial design
- [ ] Implementation
- [ ] Testing
- [ ] Documentation

## Tech Stack

(Please specify the tech stack to be used)

## Progress History

- [${new Date().toISOString().split('T')[0]}] Feature created

## Related Links

- Git Branch: \`feature/${featureId}-${sanitizeFilename(name)}\`
- PR: (Not created)
- Issue: (Not created)
`;
    
    // Create file
    fs.writeFileSync(filepath, content);
    
    // Update index
    updateFeatureIndex();
    
    console.log(chalk.green('🎯 Feature Ledger created successfully!'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(`Feature ID: ${chalk.yellow(featureId)}`);
    console.log(`Title: ${name}`);
    console.log(`Status: ${chalk.green('active')}`);
    console.log(`Priority: ${priority}`);
    console.log(`Category: ${category}`);
    console.log('');
    console.log(`📁 File location: ${chalk.blue(path.relative(getProjectRoot(), filepath))}`);
    console.log('');
    console.log(chalk.yellow('💡 Next steps:'));
    console.log(`git checkout -b feature/${featureId}-${sanitizeFilename(name)}`);
    
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
  }
}

// Update Feature Status
async function updateFeatureStatus(featureId, newStatus) {
  try {
    // Interactive mode
    if (!featureId) {
      const features = await getActiveFeatures();
      if (features.length === 0) {
        console.log(chalk.yellow('No active Features found.'));
        return;
      }
      
      const response = await prompts([
        {
          type: 'select',
          name: 'featureId',
          message: 'Select Feature:',
          choices: features.map(f => ({ 
            title: `${f.id} - ${f.title}`, 
            value: f.id 
          }))
        },
        {
          type: 'select',
          name: 'newStatus',
          message: 'Select new status:',
          choices: Object.entries(FEATURE_STATES).map(([value, title]) => ({ 
            title: title, 
            value: value 
          }))
        }
      ]);
      
      if (!response.featureId) return;
      
      featureId = response.featureId;
      newStatus = response.newStatus;
    }
    
    // Find Feature file
    const feature = await findFeature(featureId);
    if (!feature) {
      console.log(chalk.red(`❌ Feature ${featureId} not found.`));
      return;
    }
    
    // Validate state transition
    const validTransitions = {
      active: ['completed', 'paused', 'archived'],
      paused: ['active', 'archived'],
      completed: ['archived'],
      archived: []
    };
    
    if (!validTransitions[feature.status].includes(newStatus)) {
      console.log(chalk.red(`❌ Transition from ${feature.status} → ${newStatus} is not allowed.`));
      return;
    }
    
    // Move file if necessary
    const oldPath = feature.path;
    let newPath = oldPath;
    
    if (newStatus === 'archived') {
      const archivePath = path.join(getFeatureLedgerPath(), 'archived');
      if (!fs.existsSync(archivePath)) {
        fs.mkdirSync(archivePath, { recursive: true });
      }
      newPath = path.join(archivePath, path.basename(oldPath));
      fs.renameSync(oldPath, newPath);
    }
    
    // Update file content
    let content = fs.readFileSync(newPath, 'utf8');
    content = content.replace(/- \*\*Status\*\*: \w+/, `- **Status**: ${newStatus}`);
    content = content.replace(/- \*\*Updated\*\*: .+/, `- **Updated**: ${new Date().toISOString()}`);
    
    // Add progress history
    const historyMarker = '## Progress History';
    const historyIndex = content.indexOf(historyMarker);
    if (historyIndex !== -1) {
      const nextSection = content.indexOf('\n##', historyIndex + 1);
      const insertPoint = nextSection !== -1 ? nextSection : content.length;
      const historyEntry = `\n- [${new Date().toISOString().split('T')[0]}] Status changed: ${feature.status} → ${newStatus}`;
      content = content.slice(0, insertPoint) + historyEntry + content.slice(insertPoint);
    }
    
    fs.writeFileSync(newPath, content);
    
    // Update index
    updateFeatureIndex();
    
    console.log(chalk.green('✅ Feature status updated successfully'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(`Feature ID: ${featureId}`);
    console.log(`Previous status: ${feature.status} → New status: ${chalk.yellow(newStatus)}`);
    console.log(`Update time: ${new Date().toLocaleString('en-US')}`);
    
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
  }
}

// List Features
async function listFeatures(options = {}) {
  try {
    const features = await getAllFeatures();
    
    // Filtering
    let filtered = features;
    
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(f => f.status === options.status);
    }
    
    if (options.priority) {
      filtered = filtered.filter(f => f.priority === options.priority);
    }
    
    if (options.category) {
      filtered = filtered.filter(f => f.category === options.category);
    }
    
    // Sorting
    const sortBy = options.sort || 'id';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return a.id.localeCompare(b.id);
        case 'updated':
          return new Date(b.updated) - new Date(a.updated);
        case 'priority':
          const priorityOrder = ['critical', 'high', 'medium', 'low'];
          return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
        default:
          return 0;
      }
    });
    
    // Output
    const format = options.format || 'table';
    
    if (format === 'table') {
      console.log(chalk.cyan('📋 Feature Ledger List'));
      console.log(chalk.gray('━'.repeat(60)));
      console.log('ID    | Title                  | Status    | Priority | Progress');
      console.log('------+------------------------+-----------+----------+---------');
      
      filtered.forEach(f => {
        const statusColor = f.status === 'active' ? 'green' : 
                          f.status === 'completed' ? 'blue' : 'gray';
        console.log(
          `${f.id.padEnd(5)} | ${f.title.padEnd(22).slice(0, 22)} | ${
            chalk[statusColor](f.status.padEnd(9))
          } | ${f.priority.padEnd(8)} | ${f.progress || '0%'}`
        );
      });
      
      console.log(chalk.gray('━'.repeat(60)));
      
      // Statistics
      const stats = {
        total: filtered.length,
        active: filtered.filter(f => f.status === 'active').length,
        completed: filtered.filter(f => f.status === 'completed').length,
        paused: filtered.filter(f => f.status === 'paused').length
      };
      
      console.log(`\nTotal ${stats.total} Features | Active: ${stats.active} | Completed: ${stats.completed} | Paused: ${stats.paused}`);
      
    } else if (format === 'list') {
      filtered.forEach(f => {
        console.log(`\n${chalk.yellow(f.id)}: ${f.title}`);
        console.log(`  Status: ${f.status} | Priority: ${f.priority} | Progress: ${f.progress || '0%'}`);
      });
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
  }
}

// Feature Details
async function getFeatureDetails(featureId, options = {}) {
  try {
    if (!featureId) {
      const features = await getAllFeatures();
      if (features.length === 0) {
        console.log(chalk.yellow('No Features found.'));
        return;
      }
      
      const response = await prompts({
        type: 'select',
        name: 'featureId',
        message: 'Select Feature:',
        choices: features.map(f => ({ 
          title: `${f.id} - ${f.title}`, 
          value: f.id 
        }))
      });
      
      if (!response.featureId) return;
      featureId = response.featureId;
    }
    
    const feature = await findFeature(featureId);
    if (!feature) {
      console.log(chalk.red(`❌ Feature ${featureId} not found.`));
      return;
    }
    
    // Read file content
    const content = fs.readFileSync(feature.path, 'utf8');
    
    console.log(chalk.cyan('🎯 Feature Details'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(content);
    
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
  }
}

// Helper: Find Feature
async function findFeature(featureId) {
  const features = await getAllFeatures();
  return features.find(f => f.id === featureId);
}

// Helper: Get all Features
async function getAllFeatures() {
  const features = [];
  const ledgerPath = getFeatureLedgerPath();
  
  // active directory
  const activePath = path.join(ledgerPath, 'active');
  if (fs.existsSync(activePath)) {
    const files = fs.readdirSync(activePath).filter(f => f.endsWith('.md'));
    files.forEach(file => {
      const content = fs.readFileSync(path.join(activePath, file), 'utf8');
      const feature = parseFeatureFile(content, path.join(activePath, file));
      if (feature) features.push(feature);
    });
  }
  
  // archived directory
  const archivedPath = path.join(ledgerPath, 'archived');
  if (fs.existsSync(archivedPath)) {
    const files = fs.readdirSync(archivedPath).filter(f => f.endsWith('.md'));
    files.forEach(file => {
      const content = fs.readFileSync(path.join(archivedPath, file), 'utf8');
      const feature = parseFeatureFile(content, path.join(archivedPath, file));
      if (feature) features.push(feature);
    });
  }
  
  return features;
}

// Helper: Get active Features
async function getActiveFeatures() {
  const features = await getAllFeatures();
  return features.filter(f => f.status === 'active');
}

// Helper: Parse Feature file
function parseFeatureFile(content, filepath) {
  const idMatch = content.match(/- \*\*Feature ID\*\*: (FL\d{3})/);
  const titleMatch = content.match(/# FL\d{3}: (.+)/);
  const statusMatch = content.match(/- \*\*Status\*\*: (\w+)/);
  const priorityMatch = content.match(/- \*\*Priority\*\*: (\w+)/);
  const categoryMatch = content.match(/- \*\*Category\*\*: (\w+)/);
  const progressMatch = content.match(/- \*\*Progress\*\*: (\d+%)/);
  const updatedMatch = content.match(/- \*\*Updated\*\*: (.+)/);
  
  if (!idMatch || !titleMatch) return null;
  
  return {
    id: idMatch[1],
    title: titleMatch[1],
    status: statusMatch ? statusMatch[1] : 'active',
    priority: priorityMatch ? priorityMatch[1] : 'medium',
    category: categoryMatch ? categoryMatch[1] : 'feature',
    progress: progressMatch ? progressMatch[1] : '0%',
    updated: updatedMatch ? updatedMatch[1] : '',
    path: filepath
  };
}

// Helper: Update Feature index
function updateFeatureIndex() {
  const indexPath = path.join(getFeatureLedgerPath(), 'FEATURE_LEDGER_INDEX.md');
  const features = getAllFeatures();
  
  let content = `# Feature Ledger Index

Last updated: ${new Date().toISOString()}

## Active Features

| ID | Title | Status | Priority | Progress | Updated |
|----|-------|--------|----------|----------|---------|
`;
  
  const activeFeatures = features.filter(f => f.status !== 'archived');
  activeFeatures.forEach(f => {
    content += `| ${f.id} | ${f.title} | ${f.status} | ${f.priority} | ${f.progress} | ${f.updated.split('T')[0]} |\n`;
  });
  
  content += `\n## Archived Features\n\n`;
  content += `| ID | Title | Completed |\n`;
  content += `|----|-------|----------|\n`;
  
  const archivedFeatures = features.filter(f => f.status === 'archived');
  archivedFeatures.forEach(f => {
    content += `| ${f.id} | ${f.title} | ${f.updated.split('T')[0]} |\n`;
  });
  
  content += `\n## Statistics\n\n`;
  content += `- Total Features: ${features.length}\n`;
  content += `- Active: ${features.filter(f => f.status === 'active').length}\n`;
  content += `- Completed: ${features.filter(f => f.status === 'completed').length}\n`;
  content += `- Paused: ${features.filter(f => f.status === 'paused').length}\n`;
  content += `- Archived: ${features.filter(f => f.status === 'archived').length}\n`;
  
  fs.writeFileSync(indexPath, content);
}

// Command line argument processing
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'create':
    createFeature(args[0]);
    break;
    
  case 'update-status':
    updateFeatureStatus(args[0], args[1]);
    break;
    
  case 'list':
    const listOptions = {};
    args.forEach(arg => {
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        listOptions[key] = value || true;
      }
    });
    listFeatures(listOptions);
    break;
    
  case 'details':
    const detailsOptions = {};
    args.slice(1).forEach(arg => {
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        detailsOptions[key] = value || true;
      }
    });
    getFeatureDetails(args[0], detailsOptions);
    break;
    
  case 'link-milestone':
    console.log(chalk.yellow('Milestone linking feature is under development.'));
    break;
    
  default:
    console.log(chalk.yellow('Usage:'));
    console.log('  feature-ledger.js create [name]');
    console.log('  feature-ledger.js update-status [id] [status]');
    console.log('  feature-ledger.js list [options]');
    console.log('  feature-ledger.js details [id]');
    console.log('  feature-ledger.js link-milestone [id] [milestone]');
}