#!/bin/bash
# deploy-clawpay.sh - One-command deployment for ClawPay
# Run this script to deploy ClawPay to Base Mainnet

echo "🐚 ShellFoundry ClawPay Deployment"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo ""
    echo "Create a .env file with:"
    echo 'PRIVATE_KEY=your_rabby_private_key_here'
    echo ""
    echo "To get your private key:"
    echo "1. Open Rabby wallet"
    echo "2. Click your wallet"
    echo "3. Click the 3 dots → Export Private Key"
    echo "4. Copy the key (starts with 0x...)"
    echo "5. Paste it into .env file"
    exit 1
fi

# Load .env
export $(grep -v '^#' .env | xargs)

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ ERROR: PRIVATE_KEY not set in .env"
    exit 1
fi

# Check if it looks like a private key
if [[ ! $PRIVATE_KEY =~ ^0x[0-9a-fA-F]{64}$ ]]; then
    echo "⚠️  WARNING: PRIVATE_KEY doesn't look right"
    echo "It should be 66 characters starting with 0x"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Private key found"
echo ""

# Check wallet balance
echo "🔍 Checking wallet balance..."
BALANCE=$(npx hardhat run scripts/check-balance.js --network base 2>/dev/null || echo "ERROR")

if [ "$BALANCE" = "ERROR" ]; then
    echo "⚠️  Could not check balance automatically"
    echo "Make sure you have ETH on Base Mainnet for gas"
    echo "Need: ~0.01 ETH (~$25-30)"
fi

echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "Contract details:"
echo "  Platform wallet: 0x936ccd9Fe471571e767fb61aC845C57b3a48653E"
echo "  USDC on Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
echo "  Network: Base Mainnet"
echo ""
read -p "Deploy now? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "⛏️  Deploying..."
    npx hardhat run scripts/deploy-mainnet.js --network base
    echo ""
    echo "✅ Done! Save the contract address above."
else
    echo "❌ Cancelled"
    exit 0
fi
