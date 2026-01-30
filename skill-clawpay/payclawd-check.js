/**
 * ClawPay Integration - Drop this into your skill
 * 
 * Just copy-paste this at the top of your skill file,
 * then add the payment check in your main function.
 */

const { ethers } = require('ethers');

// CONFIGURATION - Only change these 3 values
const SKILL_ID = 'your-skill-name';     // <-- Change this
const SKILL_PRICE = 5;                   // <-- Change this (USDC)
const CONTRACT_ADDRESS = '0x72CaF410E276c50e2f5a5C76f9348242c66bE86c';

// Don't touch below this line
const ABI = [
  "function checkAccess(string calldata skillId, address user) external view returns (bool)"
];

const provider = new ethers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/demo');
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

/**
 * Check if user has paid for this skill
 * @param {string} userAddress - The user's wallet address
 * @returns {Promise<boolean>} - True if they paid, false if not
 */
async function checkPayment(userAddress) {
  try {
    return await contract.checkAccess(SKILL_ID, userAddress);
  } catch (error) {
    console.error('Payment check failed:', error);
    return false;
  }
}

/**
 * Get payment instructions for user
 * @returns {Object} - Instructions object
 */
function getPaymentInstructions() {
  return {
    requiresPayment: true,
    price: SKILL_PRICE,
    currency: 'USDC',
    contractAddress: CONTRACT_ADDRESS,
    instructions: `Send ${SKILL_PRICE} USDC to: ${CONTRACT_ADDRESS}`,
    skillId: SKILL_ID
  };
}

module.exports = { checkPayment, getPaymentInstructions };

// ============================================================================
// EXAMPLE USAGE - Add this to your skill's main function:
// ============================================================================

/*
const { checkPayment, getPaymentInstructions } = require('./clawpay-check.js');

async function mySkill(userRequest, userAddress) {
  
  // STEP 1: Check if user paid (ADD THIS LINE)
  const hasPaid = await checkPayment(userAddress);
  
  // STEP 2: If not paid, return payment instructions (ADD THIS BLOCK)
  if (!hasPaid) {
    return {
      success: false,
      ...getPaymentInstructions()
    };
  }
  
  // STEP 3: User paid - do your skill logic (YOUR EXISTING CODE)
  return {
    success: true,
    result: 'Your skill output here'
  };
}
*/
