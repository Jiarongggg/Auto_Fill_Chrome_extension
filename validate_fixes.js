#!/usr/bin/env node

/**
 * Validation Script for AutoFill Scout Chrome Extension
 * This script validates that all critical bugs have been fixed
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function testCase(description, condition, details = '') {
    totalTests++;
    if (condition) {
        console.log(`${colors.green}✓${colors.reset} ${description}`);
        passedTests++;
        return true;
    } else {
        console.log(`${colors.red}✗${colors.reset} ${description}`);
        if (details) {
            console.log(`  ${colors.yellow}→ ${details}${colors.reset}`);
        }
        failedTests++;
        return false;
    }
}

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading ${filePath}: ${error.message}`);
        return null;
    }
}

console.log(`${colors.bright}${colors.blue}========================================`);
console.log(`AutoFill Scout Extension Validation`);
console.log(`========================================${colors.reset}\n`);

// Test 1: Check IIFE wrapper in content.js
console.log(`${colors.bright}1. Testing content.js structure:${colors.reset}`);
const contentJs = readFile('content.js');
if (contentJs) {
    testCase(
        'content.js starts with IIFE opening',
        contentJs.startsWith('(function() {'),
        'File should start with (function() {'
    );
    
    testCase(
        'content.js ends with IIFE closing',
        contentJs.trim().endsWith('})();'),
        'File should end with })();'
    );
    
    testCase(
        'content.js has injection prevention check',
        contentJs.includes('if (window.__AF_CONTENT_READY__)') &&
        contentJs.includes('return;'),
        'Should check for previous injection'
    );
    
    testCase(
        'content.js has Chrome API error handling',
        contentJs.includes('try {') &&
        contentJs.includes('chrome.runtime?.id') &&
        contentJs.includes('Extension context invalidated'),
        'Should handle context invalidation'
    );
}

console.log(`\n${colors.bright}2. Testing crypto.js structure:${colors.reset}`);
const cryptoJs = readFile('crypto.js');
if (cryptoJs) {
    testCase(
        'crypto.js starts with IIFE opening',
        cryptoJs.startsWith('(function() {'),
        'File should start with (function() {'
    );
    
    testCase(
        'crypto.js ends with IIFE closing', 
        cryptoJs.trim().endsWith('})();'),
        'File should end with })();'
    );
    
    testCase(
        'crypto.js has injection prevention check',
        cryptoJs.includes('if (window.AF_CRYPTO)') &&
        cryptoJs.includes('return;'),
        'Should check for previous injection'
    );
}

console.log(`\n${colors.bright}3. Testing aws_service.js structure:${colors.reset}`);
const awsJs = readFile('aws_service.js');
if (awsJs) {
    testCase(
        'aws_service.js starts with IIFE opening',
        awsJs.startsWith('(function() {'),
        'File should start with (function() {'
    );
    
    testCase(
        'aws_service.js ends with IIFE closing',
        awsJs.trim().endsWith('})();'),
        'File should end with })();'
    );
    
    testCase(
        'aws_service.js has injection prevention check',
        awsJs.includes('if (window.SERVICE_CONFIG)') &&
        awsJs.includes('return;'),
        'Should check for previous injection'
    );
}

console.log(`\n${colors.bright}4. Testing popup.js updates:${colors.reset}`);
const popupJs = readFile('popup.js');
if (popupJs) {
    testCase(
        'popup.js no longer injects scripts manually',
        !popupJs.includes('files: ["crypto.js", "content.js"]'),
        'Should not inject scripts (handled by manifest)'
    );
    
    testCase(
        'popup.js has improved error messages',
        popupJs.includes('AutoFill Scout is not active on this page') ||
        popupJs.includes('Connection lost with the page'),
        'Should have helpful error messages'
    );
}

console.log(`\n${colors.bright}5. Testing manifest.json configuration:${colors.reset}`);
const manifestJson = readFile('manifest.json');
if (manifestJson) {
    try {
        const manifest = JSON.parse(manifestJson);
        
        testCase(
            'manifest.json has content_scripts defined',
            manifest.content_scripts && manifest.content_scripts.length > 0,
            'Content scripts should be defined'
        );
        
        testCase(
            'Content scripts load in correct order',
            manifest.content_scripts[0].js[0] === 'crypto.js' &&
            manifest.content_scripts[0].js[1] === 'aws_service.js' &&
            manifest.content_scripts[0].js[2] === 'content.js',
            'Order: crypto.js → aws_service.js → content.js'
        );
        
        testCase(
            'Content scripts run at document_idle',
            manifest.content_scripts[0].run_at === 'document_idle',
            'Should run at document_idle'
        );
    } catch (error) {
        console.error(`Error parsing manifest.json: ${error.message}`);
    }
}

console.log(`\n${colors.bright}6. Syntax Validation:${colors.reset}`);

function validateSyntax(filename) {
    const content = readFile(filename);
    if (!content) return false;
    
    // Check for common syntax errors
    const tests = [
        {
            name: `No global return statements in ${filename}`,
            check: () => {
                // Look for return statements not inside a function
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith('return') && i > 0 && i < lines.length - 1) {
                        // Check if it's inside a function by looking at context
                        const prevLines = lines.slice(Math.max(0, i - 10), i).join('\n');
                        if (!prevLines.includes('function') && !prevLines.includes('=>') && !prevLines.includes('{')) {
                            return false;
                        }
                    }
                }
                return true;
            }
        },
        {
            name: `Balanced braces in ${filename}`,
            check: () => {
                let braceCount = 0;
                for (const char of content) {
                    if (char === '{') braceCount++;
                    if (char === '}') braceCount--;
                }
                return braceCount === 0;
            }
        },
        {
            name: `Balanced parentheses in ${filename}`,
            check: () => {
                let parenCount = 0;
                for (const char of content) {
                    if (char === '(') parenCount++;
                    if (char === ')') parenCount--;
                }
                return parenCount === 0;
            }
        }
    ];
    
    let allPassed = true;
    for (const test of tests) {
        const passed = testCase(test.name, test.check());
        if (!passed) allPassed = false;
    }
    return allPassed;
}

validateSyntax('content.js');
validateSyntax('crypto.js');
validateSyntax('aws_service.js');

// Summary
console.log(`\n${colors.bright}========================================`);
console.log(`Validation Summary`);
console.log(`========================================${colors.reset}`);
console.log(`Total Tests: ${totalTests}`);
console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);

if (failedTests === 0) {
    console.log(`\n${colors.green}${colors.bright}✅ All tests passed! The extension should work correctly.${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Reload the extension in Chrome`);
    console.log(`2. Refresh any open tabs`);
    console.log(`3. Test the autofill functionality`);
} else {
    console.log(`\n${colors.red}${colors.bright}⚠️  Some tests failed. Please review the issues above.${colors.reset}`);
}

process.exit(failedTests > 0 ? 1 : 0);