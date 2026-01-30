const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ABI = [
  "function registerSkill(string calldata skillId, address developer, uint256 price, string calldata name) external",
  "function skills(string calldata skillId) external view returns (address developer, uint256 price, bool active, string memory name)",
  "function payForSkill(string calldata skillId) external",
  "function checkAccess(string calldata skillId, address user) external view returns (bool)"
];

const CONFIG = {
  testnet: {
    contractAddress: '0x72CaF410E276c50e2f5a5C76f9348242c66bE86c',
    rpcUrl: 'https://base-sepolia.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY
  }
};

async function main() {
  const network = 'testnet';
  const config = CONFIG[network];
  
  // Connect to provider
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  
  // Connect wallet (owner)
  const privateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY not found in environment');
    console.error('Add PRIVATE_KEY to .env file');
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Connected with wallet:', wallet.address);
  
  // Connect to contract
  const contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, wallet);
  
  // Check if command line args provided
  const action = process.argv[2];
  
  if (action === 'register') {
    // Register a new skill
    const skillId = process.argv[3] || 'test-weather-pro';
    const developer = process.argv[4] || wallet.address;
    const price = process.argv[5] || '5'; // 5 USDC
    const name = process.argv[6] || 'Test Weather Pro Skill';
    
    console.log('\nRegistering skill:');
    console.log('  Skill ID:', skillId);
    console.log('  Developer:', developer);
    console.log('  Price:', price, 'USDC');
    console.log('  Name:', name);
    
    try {
      // Price in USDC has 6 decimals
      const priceInWei = ethers.parseUnits(price, 6);
      
      const tx = await contract.registerSkill(skillId, developer, priceInWei, name);
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('✅ Skill registered successfully!');
      
      // Verify
      const skill = await contract.skills(skillId);
      console.log('\nRegistered skill details:');
      console.log('  Developer:', skill.developer);
      console.log('  Price:', ethers.formatUnits(skill.price, 6), 'USDC');
      console.log('  Active:', skill.active);
      console.log('  Name:', skill.name);
      
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
    }
    
  } else if (action === 'check') {
    // Check skill details
    const skillId = process.argv[3] || 'test-weather-pro';
    
    try {
      const skill = await contract.skills(skillId);
      console.log('\nSkill details for:', skillId);
      console.log('  Developer:', skill.developer);
      console.log('  Price:', ethers.formatUnits(skill.price, 6), 'USDC');
      console.log('  Active:', skill.active);
      console.log('  Name:', skill.name);
      
      if (skill.developer === '0x0000000000000000000000000000000000000000') {
        console.log('\n⚠️  Skill not found - needs to be registered');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    
  } else if (action === 'check-access') {
    // Check if user has access
    const skillId = process.argv[3] || 'test-weather-pro';
    const userAddress = process.argv[4] || wallet.address;
    
    try {
      const hasAccess = await contract.checkAccess(skillId, userAddress);
      console.log('\nAccess check:');
      console.log('  Skill:', skillId);
      console.log('  User:', userAddress);
      console.log('  Has access:', hasAccess);
    } catch (error) {
      console.error('Error:', error.message);
    }
    
  } else {
    console.log('Usage:');
    console.log('  node admin.js register [skillId] [developer] [price] [name]');
    console.log('  node admin.js check [skillId]');
    console.log('  node admin.js check-access [skillId] [userAddress]');
    console.log('');
    console.log('Examples:');
    console.log('  node admin.js register test-weather-pro 0xYourWallet 5 "Weather Pro"');
    console.log('  node admin.js check test-weather-pro');
    console.log('  node admin.js check-access test-weather-pro 0xUserWallet');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
