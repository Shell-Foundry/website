// Deploy script for ClawPaySplitter to Base Mainnet
const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying ClawPaySplitter to Base Mainnet...');
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  // USDC on Base Mainnet
  const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  
  // Your platform wallet (receives 10%)
  const PLATFORM_WALLET = '0x936ccd9Fe471571e767fb61aC845C57b3a48653E';
  
  console.log('USDC:', USDC_ADDRESS);
  console.log('Platform wallet:', PLATFORM_WALLET);
  
  // Deploy contract
  const ClawPaySplitter = await ethers.getContractFactory('ClawPaySplitter');
  const contract = await ClawPaySplitter.deploy(USDC_ADDRESS, PLATFORM_WALLET);
  
  await contract.deployed();
  
  console.log('✅ ClawPaySplitter deployed!');
  console.log('Contract address:', contract.address);
  console.log('View on BaseScan: https://basescan.org/address/' + contract.address);
  
  // Verify contract (if API key set)
  console.log('\nTo verify on BaseScan:');
  console.log(`npx hardhat verify --network base ${contract.address} ${USDC_ADDRESS} ${PLATFORM_WALLET}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
