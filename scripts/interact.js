#!/usr/bin/env node

/**
 * Simple interaction script for Sui Yield Lotto
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load deployment info
let deploymentInfo = {};
try {
    const deploymentFile = path.join(__dirname, 'deployment.json');
    if (fs.existsSync(deploymentFile)) {
        deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    }
} catch (error) {
    console.log('⚠️  No deployment info found. Please deploy first.');
}

const PACKAGE_ID = deploymentInfo.packageId || '0x0';
const GAS_BUDGET = 100000000;

function execCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8' });
    } catch (error) {
        console.error('Command failed:', error.message);
        return null;
    }
}

console.log('🎲 Sui Yield Lotto Interaction Script\n');

if (PACKAGE_ID === '0x0') {
    console.log('❌ No package ID found. Please deploy first using deploy.js');
    process.exit(1);
}

console.log(`📦 Using package ID: ${PACKAGE_ID}\n`);

// Example: Create a staking pool
console.log('🏦 Creating Staking Pool...');
const createPoolCommand = `sui client call --package ${PACKAGE_ID} --module staking_protocol --function create_staking_pool --args "SUI" --gas-budget ${GAS_BUDGET}`;
console.log('Command:', createPoolCommand);
const result = execCommand(createPoolCommand);

if (result) {
    console.log('✅ Staking pool created successfully!');
    console.log(result);
} else {
    console.log('❌ Failed to create staking pool');
}