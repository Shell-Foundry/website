// Vercel API endpoint to check if user has paid for a skill
// Route: /api/check-access?user=0x...&skill=skill-id

import { ethers } from 'ethers';

// ClawPay contract on Base Mainnet
const CONTRACT_ADDRESS = '0x6c302FB0eabb0875088b07D80807a91BDa3c21AB';

// Base Mainnet RPC
const RPC_URL = 'https://mainnet.base.org';

// Contract ABI (minimal for checkAccess function)
const CONTRACT_ABI = [
  "function checkAccess(string calldata skillId, address user) external view returns (bool)",
  "function skills(string calldata skillId) external view returns (address developer, uint256 price, bool active, string memory name)"
];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { user, skill } = req.query;

    // Validate inputs
    if (!user || !skill) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Please provide user (wallet address) and skill (skill ID)'
      });
    }

    // Validate Ethereum address format
    if (!user.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        error: 'Invalid address',
        message: 'User must be a valid Ethereum address (0x...)'
      });
    }

    // Connect to blockchain
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Check if user has paid
    const hasAccess = await contract.checkAccess(skill, user);
    
    // Get skill info (price, active status)
    const skillInfo = await contract.skills(skill);

    return res.status(200).json({
      success: true,
      user: user,
      skill: skill,
      paid: hasAccess,
      skillInfo: {
        developer: skillInfo.developer,
        price: ethers.utils.formatUnits(skillInfo.price, 6), // USDC has 6 decimals
        active: skillInfo.active,
        name: skillInfo.name
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal error',
      message: error.message
    });
  }
}
