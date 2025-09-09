#!/usr/bin/env node

// Wrapper script to run TypeScript source directly for git installations
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsFile = join(__dirname, 'src', 'index.ts');

// Use tsx to execute the TypeScript file
const child = spawn('npx', ['tsx', tsFile], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});