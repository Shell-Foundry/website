// Check wallet balance before deployment
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  const ethBalance = ethers.utils.formatEther(balance);
  
  console.log(`Wallet: ${deployer.address}`);
  console.log(`Balance: ${ethBalance} ETH`);
  
  if (parseFloat(ethBalance) < 0.01) {
    console.log('\n⚠️  WARNING: Low balance!');
    console.log('Need at least 0.01 ETH for deployment (~$25-30)');
    console.log('\nTo get ETH:');
    console.log('1. Buy on Coinbase');
    console.log('2. Bridge to Base Mainnet');
    console.log('3. Or transfer from another wallet');
    process.exit(1);
  }
  
  console.log('\n✅ Balance sufficient for deployment');
}

main().catch(console.error);
