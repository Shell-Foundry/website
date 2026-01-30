/**
 * Contract Verification Module
 * 
 * Prevents developers from using fake/pirated contracts
 */

const VERIFIED_CONTRACTS = {
  // Only these contract addresses are legitimate
  testnet: [
    '0x72CaF410E276c50e2f5a5C76f9348242c66bE86c' // Base Sepolia Testnet
  ],
  mainnet: [
    '0x0000000000000000000000000000000000000000' // Replace with mainnet contract after deployment
  ]
};

/**
 * Verify that a contract address is legitimate ClawPay contract
 */
function verifyContractAddress(address, network) {
  const normalized = address.toLowerCase();
  const valid = VERIFIED_CONTRACTS[network].map(a => a.toLowerCase());
  
  if (!valid.includes(normalized)) {
    throw new Error(`Invalid contract address: ${address}. This is not an official ClawPay contract.`);
  }
  
  return true;
}

/**
 * Verify contract code hash matches expected
 * This prevents devs from deploying modified versions
 */
async function verifyContractBytecode(provider, contractAddress, expectedBytecodeHash) {
  const code = await provider.getCode(contractAddress);
  const hash = require('crypto').createHash('sha256').update(code).digest('hex');
  
  if (hash !== expectedBytecodeHash) {
    throw new Error('Contract bytecode does not match official ClawPay contract');
  }
  
  return true;
}

module.exports = {
  verifyContractAddress,
  verifyContractBytecode,
  VERIFIED_CONTRACTS
};
