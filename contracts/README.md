# ClawPay Smart Contracts

Payment splitting contract for Clawdbot skills.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your keys
```

3. **Compile contracts:**
```bash
npm run compile
```

4. **Deploy to testnet (FREE):**
```bash
npm run deploy:testnet
```

5. **Deploy to mainnet ($20-50 gas):**
```bash
npm run deploy:mainnet
```

## Contract Functions

### For Platform Owner (You)
- `registerSkill(skillId, developer, price, name)` - Add new skill
- `updateSkillPrice(skillId, newPrice)` - Change price
- `deactivateSkill(skillId)` - Remove skill
- `withdrawPlatformFees()` - Collect your 10%
- `pause()` / `unpause()` - Emergency stop

### For Users
- `payForSkill(skillId)` - Pay for skill access
- `checkAccess(skillId, user)` - Verify if paid

### For Developers
- `withdrawEarnings()` - Collect their 90%
- `getPendingEarnings(developer)` - Check balance

## Testnet Addresses

- USDC (Base Sepolia): `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- ClawPaySplitter: `0x72CaF410E276c50e2f5a5C76f9348242c66bE86c`

## Mainnet Addresses

- USDC (Base): `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- ClawPaySplitter: (deploy after testing)
