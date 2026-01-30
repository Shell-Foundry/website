#!/usr/bin/env node
/**
 * ClawPay Self-Registration Tool
 * 
 * Developers can register their own skills without giving
 * any sensitive information to the platform owner.
 * 
 * Usage: node register-my-skill.js
 */

const readline = require('readline');
const { ethers } = require('ethers');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CONTRACT_ABI = [
  "function registerSkill(string calldata skillId, address developer, uint256 price, string calldata name) external"
];

const CONFIG = {
  testnet: {
    contractAddress: '0x72CaF410E276c50e2f5a5C76f9348242c66bE86c',
    rpcUrl: 'https://base-sepolia.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY,
    explorer: 'https://sepolia.basescan.org'
  },
  mainnet: {
    contractAddress: '', // Fill after mainnet deployment
    rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY,
    explorer: 'https://basescan.org'
  }
};

console.log('╔════════════════════════════════════════╗');
console.log('║     ClawPay Skill Registration        ║');
console.log('║                                        ║');
console.log('║  Register your skill and start         ║');
console.log('║  earning 90% of every sale!            ║');
console.log('╚════════════════════════════════════════╝\n');

console.log('⚠️  IMPORTANT: This tool requires the contract owner to execute.');
console.log('   You will generate a transaction that the platform owner will submit.\n');

const questions = [
  { name: 'skillId', question: 'Skill ID (lowercase, no spaces): ' },
  { name: 'name', question: 'Skill name (display name): ' },
  { name: 'price', question: 'Price in USDC (e.g., 5): ' },
  { name: 'wallet', question: 'Your wallet address (to receive payments): ' },
  { name: 'network', question: 'Network (testnet/mainnet): ' }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    generateTransaction();
    return;
  }
  
  const q = questions[index];
  rl.question(q.question, (answer) => {
    answers[q.name] = answer.trim();
    askQuestion(index + 1);
  });
}

async function generateTransaction() {
  console.log('\n📋 Review your submission:');
  console.log('   Skill ID:', answers.skillId);
  console.log('   Name:', answers.name);
  console.log('   Price:', answers.price, 'USDC');
  console.log('   Your wallet:', answers.wallet);
  console.log('   Network:', answers.network);
  
  const network = answers.network === 'mainnet' ? 'mainnet' : 'testnet';
  const config = CONFIG[network];
  
  console.log('\n🔐 Generating registration data...\n');
  
  // Create the transaction data (calldata)
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, provider);
  
  const priceInWei = ethers.parseUnits(answers.price, 6);
  
  // Encode the function call
  const data = contract.interface.encodeFunctionData('registerSkill', [
    answers.skillId,
    answers.wallet,
    priceInWei,
    answers.name
  ]);
  
  console.log('═══════════════════════════════════════════════════');
  console.log('SEND THIS TO CLAWPAY PLATFORM OWNER:');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('Registration Request:');
  console.log('───────────────────────────────────────────────────');
  console.log('Skill ID:', answers.skillId);
  console.log('Name:', answers.name);
  console.log('Price:', answers.price, 'USDC');
  console.log('Developer:', answers.wallet);
  console.log('Network:', network);
  console.log('\nTransaction Data (for platform owner):');
  console.log(data);
  console.log('\nContract Address:', config.contractAddress);
  console.log('───────────────────────────────────────────────────\n');
  
  console.log('📧 What happens next:');
  console.log('   1. Send this info to the platform owner');
  console.log('   2. They will submit the transaction (gas cost: ~$0.01)');
  console.log('   3. Your skill will be registered within 24 hours');
  console.log('   4. You start earning 90% of every sale!\n');
  
  console.log('✅ Safe because:');
  console.log('   • You never shared private keys');
  console.log('   • Platform owner can only REGISTER, not access your wallet');
  console.log('   • You receive payments directly to your wallet');
  console.log('   • Smart contract automatically splits 90% to you\n');
  
  console.log('Contract:', config.explorer + '/address/' + config.contractAddress);
  
  rl.close();
}

askQuestion(0);
