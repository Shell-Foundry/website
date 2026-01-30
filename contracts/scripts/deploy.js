const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // USDC on Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  // USDC on Base Mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  let usdcAddress;
  if (chainId === 84532n) {
    usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia
    console.log('Deploying to Base Sepolia Testnet');
  } else if (chainId === 8453n) {
    usdcAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base Mainnet
    console.log('Deploying to Base Mainnet');
  } else {
    throw new Error('Unknown network');
  }

  // Platform wallet (your wallet address)
  const platformWallet = deployer.address; // You can change this

  console.log('USDC Address:', usdcAddress);
  console.log('Platform Wallet:', platformWallet);

  // Deploy contract
  const ClawPaySplitter = await ethers.getContractFactory('ClawPaySplitter');
  const contract = await ClawPaySplitter.deploy(usdcAddress, platformWallet);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log('ClawPaySplitter deployed to:', contractAddress);
  console.log('');
  console.log('Save this address! You will need it for the skill integration.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Verify contract on Basescan');
  console.log('2. Register your first skill');
  console.log('3. Test payment flow');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
