const { ethers } = require('ethers');
require('dotenv').config();

// USDC Contract ABI (minimal)
const USDC_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function faucet(uint256 amount) external" // Only on testnet
];

const PAYCLAWD_ABI = [
  "function payForSkill(string calldata skillId) external",
  "function checkAccess(string calldata skillId, address user) external view returns (bool)",
  "function skills(string calldata skillId) external view returns (address developer, uint256 price, bool active, string memory name)"
];

const CONFIG = {
  testnet: {
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    contractAddress: '0x72CaF410E276c50e2f5a5C76f9348242c66bE86c',
    rpcUrl: 'https://base-sepolia.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY
  }
};

async function main() {
  const network = 'testnet';
  const config = CONFIG[network];
  
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY not found');
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Wallet:', wallet.address);
  
  const usdc = new ethers.Contract(config.usdcAddress, USDC_ABI, wallet);
  const payclawd = new ethers.Contract(config.contractAddress, PAYCLAWD_ABI, wallet);
  
  const action = process.argv[2];
  const skillId = process.argv[3] || 'test-weather-pro';
  
  if (action === 'balance') {
    // Check USDC balance
    const balance = await usdc.balanceOf(wallet.address);
    console.log('\nUSDC Balance:', ethers.formatUnits(balance, 6), 'USDC');
    
    if (balance < ethers.parseUnits('10', 6)) {
      console.log('\n💡 Low balance! Get test USDC from:');
      console.log('   https://faucet.circle.com/');
      console.log('   Or use: node testpay.js faucet');
    }
    
  } else if (action === 'faucet') {
    // Request test USDC from faucet (if available)
    console.log('\n🚰 Requesting test USDC from faucet...');
    try {
      const tx = await usdc.faucet(ethers.parseUnits('100', 6));
      await tx.wait();
      console.log('✅ Received 100 USDC!');
      
      const balance = await usdc.balanceOf(wallet.address);
      console.log('New balance:', ethers.formatUnits(balance, 6), 'USDC');
    } catch (error) {
      console.log('❌ Faucet failed (expected on some testnets)');
      console.log('   Get USDC manually from: https://faucet.circle.com/');
      console.log('   Select "Base Sepolia" and enter your wallet:', wallet.address);
    }
    
  } else if (action === 'approve') {
    // Approve contract to spend USDC
    const amount = process.argv[4] || '100';
    const amountInWei = ethers.parseUnits(amount, 6);
    
    console.log('\nApproving contract to spend', amount, 'USDC...');
    const tx = await usdc.approve(config.contractAddress, amountInWei);
    console.log('Transaction:', tx.hash);
    await tx.wait();
    console.log('✅ Approved!');
    
    const allowance = await usdc.allowance(wallet.address, config.contractAddress);
    console.log('Allowance:', ethers.formatUnits(allowance, 6), 'USDC');
    
  } else if (action === 'pay') {
    // Pay for skill
    console.log('\n💳 Paying for skill:', skillId);
    
    const skill = await payclawd.skills(skillId);
    if (skill.developer === '0x0000000000000000000000000000000000000000') {
      console.log('❌ Skill not found');
      return;
    }
    
    console.log('Price:', ethers.formatUnits(skill.price, 6), 'USDC');
    console.log('Developer:', skill.developer);
    
    // Check if already paid
    const hasAccess = await payclawd.checkAccess(skillId, wallet.address);
    if (hasAccess) {
      console.log('✅ You already have access to this skill!');
      return;
    }
    
    // Check balance
    const balance = await usdc.balanceOf(wallet.address);
    if (balance < skill.price) {
      console.log('❌ Insufficient balance');
      console.log('   You have:', ethers.formatUnits(balance, 6), 'USDC');
      console.log('   Need:', ethers.formatUnits(skill.price, 6), 'USDC');
      return;
    }
    
    // Check allowance
    const allowance = await usdc.allowance(wallet.address, config.contractAddress);
    if (allowance < skill.price) {
      console.log('❌ Contract not approved to spend USDC');
      console.log('   Run: node testpay.js approve 100');
      return;
    }
    
    // Pay!
    console.log('\nSending payment...');
    const tx = await payclawd.payForSkill(skillId);
    console.log('Transaction:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Payment successful!');
    
    // Calculate split
    const platformFee = (skill.price * 10n) / 100n;
    const devAmount = skill.price - platformFee;
    
    console.log('\n💰 Payment split:');
    console.log('   Total:', ethers.formatUnits(skill.price, 6), 'USDC');
    console.log('   Platform (10%):', ethers.formatUnits(platformFee, 6), 'USDC →', wallet.address);
    console.log('   Developer (90%):', ethers.formatUnits(devAmount, 6), 'USDC →', skill.developer);
    
    // Verify access
    const nowHasAccess = await payclawd.checkAccess(skillId, wallet.address);
    console.log('\n🔓 Access granted:', nowHasAccess);
    
  } else if (action === 'check') {
    // Check access
    const hasAccess = await payclawd.checkAccess(skillId, wallet.address);
    console.log('\nAccess status for', skillId + ':');
    console.log('  Has access:', hasAccess);
    
  } else {
    console.log('Usage:');
    console.log('  node testpay.js balance              - Check USDC balance');
    console.log('  node testpay.js faucet               - Get test USDC (if available)');
    console.log('  node testpay.js approve [amount]     - Approve contract to spend USDC');
    console.log('  node testpay.js pay [skillId]        - Pay for a skill');
    console.log('  node testpay.js check [skillId]      - Check if you have access');
    console.log('');
    console.log('Example flow:');
    console.log('  1. node testpay.js balance');
    console.log('  2. (If low) Get USDC from https://faucet.circle.com/');
    console.log('  3. node testpay.js approve 100');
    console.log('  4. node testpay.js pay test-weather-pro');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
