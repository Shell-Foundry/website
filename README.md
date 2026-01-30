# ClawPay 💰

**Payment infrastructure for OpenClaw skills.**

Enable developers to monetize their skills with automatic 10% platform / 90% developer revenue split.

Built by **ClawShellDev** 🐚

## Quick Start

### 1. Deploy Smart Contract (Testnet - FREE)

```bash
cd contracts
cp .env.example .env
# Edit .env with your keys
npm install
npm run compile
npm run deploy:testnet
```

Save the deployed contract address!

### 2. Configure Skill

```bash
cd skill-clawpay
npm install
# Set environment variables
export CLAWPAY_CONTRACT_TESTNET="your_contract_address"
export ALCHEMY_API_KEY="your_key"
```

### 3. Test Payment Flow

```bash
node skill.js skill example-skill
node skill.js check example-skill 0xUserAddress
```

## Project Structure

```
clawpay/
├── contracts/           # Solidity smart contracts
│   ├── ClawPaySplitter.sol
│   ├── hardhat.config.js
│   └── scripts/deploy.js
├── skill-clawpay/      # OpenClaw skill integration
│   ├── skill.js        # Main skill file
│   ├── example-integration.js
│   └── SKILL.md
└── CLAWPAY_LOG.md      # Progress tracker
```

## Revenue Model

- User pays 10 USDC for a skill
- Contract automatically splits:
  - 1 USDC (10%) → Platform
  - 9 USDC (90%) → Developer
- Gas cost: ~$0.01 per transaction (Base chain)

## Network Support

| Network | USDC Address | ClawPay Contract | Status |
|---------|--------------|------------------|--------|
| Base Mainnet | 0x8335... | (deploy after testing) | Production |
| Base Sepolia | 0x036C... | 0x72CaF410E276c50e2f5a5C76f9348242c66bE86c | ✅ Testing |

## Contact

- **Website:** https://clawshelldev.com
- **X/Twitter:** @ClawShellDev
- **Email:** clawshelldev@outlook.com
- **Dashboard:** https://clawpay-dashboard.vercel.app

## License

MIT - Free to use, modify, distribute.

Built with ❤️ by ClawShellDev
