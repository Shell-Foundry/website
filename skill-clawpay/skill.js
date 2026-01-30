/**
 * ClawPay Wallet Skill for Clawdbot
 * 
 * Enables USDC payments for skills with automatic 10%/90% split
 * Network: Base (mainnet) or Base Sepolia (testnet)
 */

const { ethers } = require('ethers');
require('dotenv').config();
const { verifyContractAddress } = require('./verification.js');

// Contract ABI (Application Binary Interface)
const CONTRACT_ABI = [
  "function payForSkill(string calldata skillId) external",
  "function checkAccess(string calldata skillId, address user) external view returns (bool)",
  "function getPendingEarnings(address developer) external view returns (uint256)",
  "function withdrawEarnings() external",
  "function registerSkill(string calldata skillId, address developer, uint256 price, string calldata name) external",
  "function skills(string calldata skillId) external view returns (address developer, uint256 price, bool active, string memory name)",
  "event PaymentProcessed(string skillId, address user, uint256 platformAmount, uint256 devAmount)"
];

// Configuration
const CONFIG = {
  // Base Mainnet
  mainnet: {
    contractAddress: process.env.CLAWPAY_CONTRACT_MAINNET || '',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY
  },
  // Base Sepolia Testnet
  testnet: {
    contractAddress: process.env.CLAWPAY_CONTRACT_TESTNET || '',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    rpcUrl: 'https://base-sepolia.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY
  }
};

class ClawPaySkill {
  constructor(network = 'testnet') {
    this.network = network;
    this.config = CONFIG[network];
    
    // Verify this is an official ClawPay contract
    verifyContractAddress(this.config.contractAddress, network);
    
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
    this.contract = new ethers.Contract(this.config.contractAddress, CONTRACT_ABI, this.provider);
  }

  /**
   * Check if user has paid for a skill
   */
  async checkAccess(skillId, userAddress) {
    try {
      const hasAccess = await this.contract.checkAccess(skillId, userAddress);
      return { success: true, hasAccess };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get skill details (price, developer, active status)
   */
  async getSkillDetails(skillId) {
    try {
      const skill = await this.contract.skills(skillId);
      return {
        success: true,
        developer: skill.developer,
        price: ethers.formatUnits(skill.price, 6), // USDC has 6 decimals
        active: skill.active,
        name: skill.name
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate payment instructions for user
   */
  async generatePaymentInstructions(skillId, userAddress) {
    const skill = await this.getSkillDetails(skillId);
    
    if (!skill.success) {
      return { success: false, error: 'Skill not found' };
    }

    if (!skill.active) {
      return { success: false, error: 'Skill is not active' };
    }

    const hasAccess = await this.checkAccess(skillId, userAddress);
    if (hasAccess.hasAccess) {
      return { success: false, error: 'You already have access to this skill', hasAccess: true };
    }

    return {
      success: true,
      skillId,
      skillName: skill.name,
      price: skill.price,
      priceInCents: Math.round(parseFloat(skill.price) * 100),
      contractAddress: this.config.contractAddress,
      developer: skill.developer,
      instructions: {
        manual: `Send ${skill.price} USDC to contract: ${this.config.contractAddress}`,
        contractCall: `Call payForSkill("${skillId}") with ${skill.price} USDC`
      }
    };
  }

  /**
   * Get developer earnings
   */
  async getDevEarnings(devAddress) {
    try {
      const earnings = await this.contract.getPendingEarnings(devAddress);
      return {
        success: true,
        earnings: ethers.formatUnits(earnings, 6),
        earningsRaw: earnings.toString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export for Clawdbot
module.exports = { ClawPaySkill };

// CLI interface for testing
if (require.main === module) {
  const skill = new ClawPaySkill('testnet');
  
  // Test commands
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  (async () => {
    switch (command) {
      case 'check':
        const access = await skill.checkAccess(arg1, arg2);
        console.log(access);
        break;
      case 'skill':
        const details = await skill.getSkillDetails(arg1);
        console.log(details);
        break;
      case 'earnings':
        const earnings = await skill.getDevEarnings(arg1);
        console.log(earnings);
        break;
      default:
        console.log('Usage: node skill.js [check|skill|earnings] [args...]');
    }
    process.exit(0);
  })();
}
