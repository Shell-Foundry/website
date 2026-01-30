# ClawPay Wallet Skill

USDC payment wallet for Clawdbot skills. Enables automatic 10%/90% revenue split between platform and developers.

## Installation

```bash
clawdhub install clawpay
```

## Configuration

Set environment variables:
```bash
export CLAWPAY_CONTRACT_TESTNET="0x..."  # Your testnet contract
export CLAWPAY_CONTRACT_MAINNET="0x..."  # Your mainnet contract
export ALCHEMY_API_KEY="your_key_here"
```

## Usage

### For Users

Check if you have access to a paid skill:
```
clawpay check weather-pro
```

Get payment instructions:
```
clawpay info weather-pro
```

### For Developers

Check your earnings:
```
clawpay earnings
```

## How It Works

1. User wants to install paid skill
2. Skill shows price (e.g., 5 USDC)
3. User sends USDC to ClawPay contract
4. Contract automatically splits:
   - 10% (0.5 USDC) → Platform
   - 90% (4.5 USDC) → Developer
5. User gets access to skill

## Supported Networks

- Base Mainnet (production)
- Base Sepolia (testing)

## Contract Addresses

Testnet: (deploy your own)
Mainnet: (deploy after testing)

## Security

- All payments are final (no chargebacks)
- Contract is pausable in emergencies
- Developers can withdraw earnings anytime
- Platform fees are transparent (10%)
