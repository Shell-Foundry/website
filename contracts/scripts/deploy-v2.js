// Deploy script for ClawPaySplitter v2
// Run with: npx hardhat run scripts/deploy-v2.js --network base

const { ethers } = require('hardhat');

async function main() {
  console.log('🐚 Deploying ClawPaySplitter v2...\n');
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());
  
  // Configuration
  const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base Mainnet USDC
  const PLATFORM_WALLET = deployer.address; // You receive 10% platform fees
  
  console.log('\n📋 Configuration:');
  console.log('  USDC:', USDC_ADDRESS);
  console.log('  Platform Wallet (10% fees):', PLATFORM_WALLET);
  console.log('  Fee Split: 90% developer / 10% platform');
  
  // Deploy contract
  console.log('\n⛏️  Deploying contract...');
  const ClawPaySplitter = await ethers.getContractFactory('ClawPaySplitter');
  const contract = await ClawPaySplitter.deploy(USDC_ADDRESS, PLATFORM_WALLET);
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log('\n✅ Contract deployed!');
  console.log('  Address:', contractAddress);
  console.log('  Owner:', deployer.address);
  console.log('  Network: Base Mainnet');
  console.log('  Explorer: https://basescan.org/address/' + contractAddress);
  
  // Verify deployment
  console.log('\n🔍 Verifying deployment...');
  const usdc = await contract.usdc();
  const platformWallet = await contract.platformWallet();
  const owner = await contract.owner();
  
  console.log('  USDC token:', usdc);
  console.log('  Platform wallet:', platformWallet);
  console.log('  Owner:', owner);
  
  console.log('\n📝 Save this information:');
  console.log('==========================================');
  console.log('Contract Address:', contractAddress);
  console.log('Owner:', deployer.address);
  console.log('USDC:', USDC_ADDRESS);
  console.log('Platform Fee: 10%');
  console.log('==========================================');
  
  console.log('\n🚀 Next steps:');
  console.log('1. Save the contract address above');
  console.log('2. Update website/config with new address');
  console.log('3. Register your first skill via Remix or script');
  console.log('4. Test payment flow');
  console.log('5. Withdraw earnings!');
  
  console.log('\n⚠️  IMPORTANT: Save your private key and seed phrase securely!');
  console.log('   Never commit them to Git or share them!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
