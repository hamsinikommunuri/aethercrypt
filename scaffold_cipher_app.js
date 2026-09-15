#!/usr/bin/env node
/**
 * scaffold_cipher_app.js
 * CLI helper utility for the themed-cipher-studio agent skill.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PRESETS_PATH = path.join(__dirname, '..', 'references', 'cipher_presets.json');
const TOKENS_PATH = path.join(__dirname, '..', 'references', 'design_tokens.json');

function loadPresets() {
  if (!fs.existsSync(PRESETS_PATH)) {
    throw new Error(`Presets file not found at ${PRESETS_PATH}`);
  }
  return JSON.parse(fs.readFileSync(PRESETS_PATH, 'utf8'));
}

function loadTokens() {
  if (!fs.existsSync(TOKENS_PATH)) {
    throw new Error(`Design tokens file not found at ${TOKENS_PATH}`);
  }
  return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
}

function printUsage() {
  console.log(`
Themed Cipher Studio — Scaffolding & Utility CLI

Usage:
  node scaffold_cipher_app.js <subcommand> [options]

Subcommands:
  list-themes                List all 20 pre-packaged deterministic themes
  export-dict --theme <name> [--output <file>]
                             Export 26-letter substitution mapping for a theme
  tokens [--output <file>]   Export the 10/10 Observatory design tokens JSON
  verify --dir <path>        Execute crypto & API verification test suites

Examples:
  node scaffold_cipher_app.js list-themes
  node scaffold_cipher_app.js export-dict --theme pirate --output pirate_alphabet.json
  node scaffold_cipher_app.js verify --dir C:/my-cipher-app
`);
}

function handleListThemes() {
  const presets = loadPresets();
  console.log('\n=============================================================');
  console.log('  THEMED CIPHER STUDIO // 20 PRE-PACKAGED THEMES             ');
  console.log('=============================================================\n');
  
  Object.keys(presets).forEach((key, idx) => {
    const p = presets[key];
    const glyphPreview = p.glyphs.slice(0, 6).join(' ');
    console.log(`${String(idx + 1).padStart(2, '0')}. [${key.padEnd(18)}] ${p.name.padEnd(26)} : ${glyphPreview}...`);
    console.log(`    → ${p.description}`);
  });
  console.log('\nTotal themes available: ' + Object.keys(presets).length + '\n');
}

function handleExportDict(args) {
  const themeIndex = args.indexOf('--theme');
  if (themeIndex === -1 || !args[themeIndex + 1]) {
    console.error('Error: --theme <name> is required.');
    process.exit(1);
  }
  const themeKey = args[themeIndex + 1].toLowerCase().trim();
  const presets = loadPresets();

  if (!presets[themeKey]) {
    console.error(`Error: Unknown theme "${themeKey}". Use "list-themes" to see valid keys.`);
    process.exit(1);
  }

  const themeData = presets[themeKey];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const mapping = {};
  alphabet.forEach((letter, i) => {
    mapping[letter] = themeData.glyphs[i] || '•';
  });

  const outputObj = {
    theme_key: themeKey,
    theme_name: themeData.name,
    description: themeData.description,
    palette: themeData.palette,
    mapping: mapping,
    digits: themeData.digits
  };

  const outIndex = args.indexOf('--output');
  if (outIndex !== -1 && args[outIndex + 1]) {
    const outFile = path.resolve(args[outIndex + 1]);
    fs.writeFileSync(outFile, JSON.stringify(outputObj, null, 2), 'utf8');
    console.log(`Successfully exported theme mapping to: ${outFile}`);
  } else {
    console.log(JSON.stringify(outputObj, null, 2));
  }
}

function handleTokens(args) {
  const tokens = loadTokens();
  const outIndex = args.indexOf('--output');
  if (outIndex !== -1 && args[outIndex + 1]) {
    const outFile = path.resolve(args[outIndex + 1]);
    fs.writeFileSync(outFile, JSON.stringify(tokens, null, 2), 'utf8');
    console.log(`Design tokens written to: ${outFile}`);
  } else {
    console.log(JSON.stringify(tokens, null, 2));
  }
}

function handleVerify(args) {
  const dirIndex = args.indexOf('--dir');
  const targetDir = (dirIndex !== -1 && args[dirIndex + 1]) ? path.resolve(args[dirIndex + 1]) : process.cwd();

  console.log(`Running test verification in: ${targetDir}`);
  const cryptoTest = path.join(targetDir, 'tests', 'test-crypto.js');
  const apiTest = path.join(targetDir, 'tests', 'test-api.js');

  let passed = true;

  const nodeBin = `"${process.execPath}"`;

  if (fs.existsSync(cryptoTest)) {
    console.log('\n--> Executing tests/test-crypto.js ...');
    try {
      execSync(`${nodeBin} "${cryptoTest}"`, { stdio: 'inherit', cwd: targetDir });
    } catch (e) {
      console.error('Crypto test execution failed.');
      passed = false;
    }
  } else {
    console.warn(`[SKIP] ${cryptoTest} does not exist.`);
  }

  if (fs.existsSync(apiTest)) {
    console.log('\n--> Executing tests/test-api.js ...');
    try {
      execSync(`${nodeBin} "${apiTest}"`, { stdio: 'inherit', cwd: targetDir });
    } catch (e) {
      console.error('API test execution failed.');
      passed = false;
    }
  } else {
    console.warn(`[SKIP] ${apiTest} does not exist.`);
  }

  if (passed) {
    console.log('\n✔ All verified tests passed successfully!\n');
  } else {
    console.error('\n✖ One or more tests failed.\n');
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printUsage();
    process.exit(0);
  }

  switch (command) {
    case 'list-themes':
      handleListThemes();
      break;
    case 'export-dict':
      handleExportDict(args);
      break;
    case 'tokens':
      handleTokens(args);
      break;
    case 'verify':
      handleVerify(args);
      break;
    default:
      console.error(`Unknown subcommand "${command}".`);
      printUsage();
      process.exit(1);
  }
}

main();
