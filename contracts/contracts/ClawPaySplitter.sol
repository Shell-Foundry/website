// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ClawPaySplitter
 * @dev Payment routing for Clawdbot skills. 10% platform fee, 90% to developer.
 */
contract ClawPaySplitter is ReentrancyGuard, Pausable, Ownable {
    
    // USDC on Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
    IERC20 public usdc;
    
    // Platform wallet (receives 10%)
    address public platformWallet;
    
    // Platform fee percentage (100 = 1%)
    uint256 public platformFeePercent = 1000; // 10%
    
    // Skill registry
    struct Skill {
        address developer;
        uint256 price; // in USDC (6 decimals)
        bool active;
        string name;
    }
    
    mapping(string => Skill) public skills;
    mapping(address => uint256) public devEarnings;
    mapping(string => mapping(address => bool)) public hasPaid;
    
    // Events
    event SkillRegistered(string skillId, address developer, uint256 price, string name);
    event PaymentProcessed(string skillId, address user, uint256 platformAmount, uint256 devAmount);
    event EarningsWithdrawn(address developer, uint256 amount);
    event SkillPriceUpdated(string skillId, uint256 newPrice);
    event SkillDeactivated(string skillId);
    
    constructor(address _usdc, address _platformWallet) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        platformWallet = _platformWallet;
    }
    
    /**
     * @dev Register a new skill (only owner)
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
     */
    function payForSkill(string calldata skillId) external nonReentrant whenNotPaused {
        Skill storage skill = skills[skillId];
        
        require(skill.active, "Skill not active");
        require(skill.developer != address(0), "Skill not found");
        require(!hasPaid[skillId][msg.sender], "Already paid for this skill");
        
        uint256 price = skill.price;
        uint256 platformFee = (price * platformFeePercent) / 10000;
        uint256 devAmount = price - platformFee;
        
        // Transfer USDC from user to this contract
        require(usdc.transferFrom(msg.sender, address(this), price), "Payment failed");
        
        // Update dev earnings (they withdraw later)
        devEarnings[skill.developer] += devAmount;
        
        // Mark user as paid
        hasPaid[skillId][msg.sender] = true;
        
        emit PaymentProcessed(skillId, msg.sender, platformFee, devAmount);
    }
    
    /**
     * @dev Developer withdraws their earnings
     */
    function withdrawEarnings() external nonReentrant {
        uint256 amount = devEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");
        
        devEarnings[msg.sender] = 0;
        
        require(usdc.transfer(msg.sender, amount), "Withdrawal failed");
        
        emit EarningsWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Platform withdraws accumulated fees
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        uint256 devOwed = getTotalDevOwed();
        uint256 platformFees = balance - devOwed;
        
        require(platformFees > 0, "No fees to withdraw");
        require(usdc.transfer(platformWallet, platformFees), "Fee withdrawal failed");
    }
    
    /**
     * @dev Check if user has paid for skill
     */
    function checkAccess(string calldata skillId, address user) external view returns (bool) {
        return hasPaid[skillId][user];
    }
    
    /**
     * @dev Get developer's pending earnings
     */
    function getPendingEarnings(address developer) external view returns (uint256) {
        return devEarnings[developer];
    }
    
    /**
     * @dev Get total amount owed to all developers
     */
    function getTotalDevOwed() public view returns (uint256) {
        // This is tracked in devEarnings mapping
        return usdc.balanceOf(address(this)); // Simplified - assumes all balance is owed to devs or platform
    }
    
    /**
     * @dev Update skill price
     */
    function updateSkillPrice(string calldata skillId, uint256 newPrice) external onlyOwner {
        require(skills[skillId].developer != address(0), "Skill not found");
        require(newPrice > 0, "Price must be > 0");
        
        skills[skillId].price = newPrice;
        emit SkillPriceUpdated(skillId, newPrice);
    }
    
    /**
     * @dev Deactivate skill
     */
    function deactivateSkill(string calldata skillId) external onlyOwner {
        require(skills[skillId].developer != address(0), "Skill not found");
        skills[skillId].active = false;
        emit SkillDeactivated(skillId);
    }
    
    /**
     * @dev Update platform fee (max 25%)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 2500, "Fee too high (max 25%)");
        platformFeePercent = newFeePercent;
    }
    
    /**
     * @dev Update platform wallet
     */
    function updatePlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        platformWallet = newWallet;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
