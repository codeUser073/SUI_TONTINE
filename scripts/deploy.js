#!/usr/bin/env node

/**
 * Deployment script for Sui Yield Lotto
 * Deploys all contracts and sets up initial configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PACKAGE_NAME = 'contracts';
const NETWORK = 'testnet'; // Change to 'mainnet' for production
const GAS_BUDGET = 100000000; // 0.1 SUI

console.log('🚀 Deploying Sui Yield Lotto Contracts...\n');

try {
    // Check if sui CLI is installed
    console.log('📋 Checking Sui CLI installation...');
    execSync('sui --version', { stdio: 'pipe' });
    console.log('✅ Sui CLI found\n');

    // Build the project
    console.log('🔨 Building Move contracts...');
    execSync('sui move build', { 
        cwd: path.join(__dirname, 'contracts'),
        stdio: 'inherit' 
    });
    console.log('✅ Build successful\n');

    // Deploy the package
    console.log('📦 Deploying package to', NETWORK, '...');
    const deployOutput = execSync(`sui client publish --gas-budget ${GAS_BUDGET}`, {
        cwd: path.join(__dirname, 'contracts'),
        encoding: 'utf8'
    });
    
    console.log('✅ Deployment successful!\n');
    console.log('📄 Deployment output:');
    console.log(deployOutput);

    // Extract package ID from output
    const packageIdMatch = deployOutput.match(/Published Objects:\s*(\w+)/);
    if (packageIdMatch) {
        const packageId = packageIdMatch[1];
        console.log(`\n🎉 Package deployed with ID: ${packageId}`);
        
        // Save deployment info
        const deploymentInfo = {
            packageId,
            network: NETWORK,
            timestamp: new Date().toISOString(),
            gasBudget: GAS_BUDGET
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'deployment.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('💾 Deployment info saved to deployment.json');
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Update your frontend configuration with the new package ID');
    console.log('2. Test the contracts using the interaction script');
    console.log('3. Set up your staking pool and create your first tontine');

} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}