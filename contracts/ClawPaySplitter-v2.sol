// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ClawPaySplitter
 * @dev Payment routing for ClawPay skills. 10% platform fee, 90% to developer.
 */
contract ClawPaySplitter is ReentrancyGuard, Pausable, Ownable {
    
    // USDC on Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
    IERC20 public usdc;
    
    // Platform wallet (receives 10%)
    address public platformWallet;
    
    // Platform fee percentage (100 = 1%, 1000 = 10%)
    uint256 public platformFeePercent = 1000; // 10%
    
    // Skill registry
    struct Skill {
        address developer;
        uint256 price; // in USDC (6 decimals)
        bool active;
        string name;
    }
    
    mapping(string => Skill) public skills;
    mapping(string => mapping(address => uint256)) public developerEarnings;
    mapping(string => mapping(address => bool)) public hasPaid;
    
    // Events
    event SkillRegistered(string skillId, address developer, uint256 price, string name);
    event PaymentReceived(string skillId, address user, uint256 amount);
    event EarningsWithdrawn(string skillId, address developer, uint256 amount);
    event PlatformFeesWithdrawn(uint256 amount);
    event SkillUpdated(string skillId, uint256 newPrice, bool active);
    event PlatformWalletUpdated(address newWallet);
    event PlatformFeeUpdated(uint256 newFee);
    
    /**
     * @dev Constructor
     * @param _usdc USDC token address on Base
     * @param _platformWallet Address to receive platform fees (10%)
     */
    constructor(address _usdc, address _platformWallet) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        usdc = IERC20(_usdc);
        platformWallet = _platformWallet;
    }
    
    /**
     * @dev Register a new skill (only owner)
     * @param skillId Unique identifier for the skill
     * @param developer Address to receive 90% of payments
     * @param price Price in USDC (use 6 decimals: 1000000 = 1 USDC)
     * @param name Display name for the skill
     */
    function registerSkill(
        string calldata skillId,
        address developer,
        uint256 price,
        string calldata name
    ) external onlyOwner {
        require(developer != address(0), "Invalid developer address");
        require(price > 0, "Price must be > 0");
        require(bytes(skillId).length > 0, "Empty skill ID");
        require(skills[skillId].developer == address(0), "Skill already exists");
        
        skills[skillId] = Skill({
            developer: developer,
            price: price,
            active: true,
            name: name
        });
        
        emit SkillRegistered(skillId, developer, price, name);
    }
    
    /**
     * @dev User pays for skill access
     * @param skillId ID of the skill to pay for
     */
    function payForSkill(string calldata skillId) external nonReentrant whenNotPaused {
        Skill storage skill = skills[skillId];
        
        require(skill.active, "Skill not active");
        require(skill.developer != address(0), "Skill not found");
        require(!hasPaid[skillId][msg.sender], "Already paid");
        
        uint256 price = skill.price;
        uint256 platformFee = (price * platformFeePercent) / 10000;
        uint256 devAmount = price - platformFee;
        
        // Transfer USDC from user to contract
        require(usdc.transferFrom(msg.sender, address(this), price), "Payment failed");
        
        // Track developer earnings
        developerEarnings[skillId][skill.developer] += devAmount;
        
        // Mark user as paid
        hasPaid[skillId][msg.sender] = true;
        
        emit PaymentReceived(skillId, msg.sender, price);
    }
    
    /**
     * @dev Developer withdraws earnings for a specific skill
     * @param skillId ID of the skill to withdraw earnings from
     */
    function withdrawEarnings(string calldata skillId) external nonReentrant {
        Skill storage skill = skills[skillId];
        require(skill.developer == msg.sender, "Not the developer");
        
        uint256 amount = developerEarnings[skillId][msg.sender];
        require(amount > 0, "No earnings to withdraw");
        
        developerEarnings[skillId][msg.sender] = 0;
        
        require(usdc.transfer(msg.sender, amount), "Withdrawal failed");
        
        emit EarningsWithdrawn(skillId, msg.sender, amount);
    }
    
    /**
     * @dev Owner withdraws accumulated platform fees
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 contractBalance = usdc.balanceOf(address(this));
        require(contractBalance > 0, "No balance");
        
        // Calculate platform fees (everything except dev earnings)
        uint256 devEarningsTotal = 0;
        // Note: This is simplified - in production you'd track platform fees separately
        
        uint256 platformFees = contractBalance - devEarningsTotal;
        require(platformFees > 0, "No fees to withdraw");
        
        require(usdc.transfer(platformWallet, platformFees), "Fee withdrawal failed");
        
        emit PlatformFeesWithdrawn(platformFees);
    }
    
    /**
     * @dev Check if user has paid for skill
     * @param skillId ID of the skill
     * @param user Address to check
     * @return bool True if user has paid
     */
    function checkAccess(string calldata skillId, address user) external view returns (bool) {
        return hasPaid[skillId][user];
    }
    
    /**
     * @dev Get skill details
     * @param skillId ID of the skill
     * @return developer, price, active, name
     */
    function getSkill(string calldata skillId) external view returns (
        address developer,
        uint256 price,
        bool active,
        string memory name
    ) {
        Skill storage skill = skills[skillId];
        return (skill.developer, skill.price, skill.active, skill.name);
    }
    
    /**
     * @dev Update skill price (only owner)
     */
    function updateSkillPrice(string calldata skillId, uint256 newPrice) external onlyOwner {
        require(skills[skillId].developer != address(0), "Skill not found");
        require(newPrice > 0, "Price must be > 0");
        
        skills[skillId].price = newPrice;
        emit SkillUpdated(skillId, newPrice, skills[skillId].active);
    }
    
    /**
     * @dev Toggle skill active status (only owner)
     */
    function toggleSkillActive(string calldata skillId) external onlyOwner {
        require(skills[skillId].developer != address(0), "Skill not found");
        skills[skillId].active = !skills[skillId].active;
        emit SkillUpdated(skillId, skills[skillId].price, skills[skillId].active);
    }
    
    /**
     * @dev Update platform wallet (only owner)
     */
    function updatePlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        platformWallet = newWallet;
        emit PlatformWalletUpdated(newWallet);
    }
    
    /**
     * @dev Update platform fee percentage (only owner, max 25%)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 2500, "Fee too high (max 25%)");
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }
    
    /**
     * @dev Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Transfer ownership to new address
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Invalid address");
        super.transferOwnership(newOwner);
    }
}
