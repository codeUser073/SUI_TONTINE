#!/bin/bash

# Darte Sui Frontend Setup Script
echo "🚀 Setting up Darte Sui Frontend..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.12.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"
echo "✅ pnpm version: $(pnpm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if the smart contract is deployed
echo "🔍 Checking smart contract deployment..."
PACKAGE_ID="0x24faeeea07a8c6077dfa1fd481f37947a5badb29731a912f4a21a06ddb8a4394"

if curl -s "https://fullnode.testnet.sui.io:443" > /dev/null; then
    echo "✅ Sui Testnet is accessible"
    echo "✅ Smart contract package ID: $PACKAGE_ID"
else
    echo "⚠️  Warning: Cannot reach Sui Testnet. Please check your internet connection."
fi

echo ""
echo "🎉 Setup complete! You can now start the frontend:"
echo "   pnpm dev"
echo ""
echo "📱 The frontend will be available at: http://localhost:3000"
echo "🔗 Make sure to connect your Sui wallet to interact with the smart contracts"
echo ""
echo "📚 For more information, see the README.md file"
