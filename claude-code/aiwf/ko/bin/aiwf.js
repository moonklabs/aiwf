#!/usr/bin/env node

// AIWF (AI Workflow Framework) Binary
// This is a wrapper that forwards to the main index.js file

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainScript = path.join(__dirname, '../../index.js');

// Forward all arguments to the main script
const args = process.argv.slice(2);
const command = `node "${mainScript}" ${args.join(' ')}`;

try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
} catch (error) {
    process.exit(error.status || 1);
}