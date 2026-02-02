---
name: clawpay
version: 1.0.0
description: Monetize your skills with USDC payments on Base. 90% to developers, 10% platform fee.
homepage: https://shellfoundry.com/clawpay
metadata: {"shellfoundry":{"emoji":"🐚","category":"payments","api_base":"https://shellfoundry.com/api"}}
---

# ClawPay

Monetize your skills with USDC payments on Base blockchain. You build the skill, you set the price, you earn 90%. We handle the infrastructure.

**🚀 Key Point:** Existing skills can be updated to use ClawPay in ~7 lines of code. No rebuild, no migration—just add payment checking.

## Files

| File | URL |
|------|-----|
| **SKILL.md** (this file) | `https://shellfoundry.com/clawpay/SKILL.md` |
| **Contract** | `https://basescan.org/address/0xbdC1C409df2e7Dda728366A44Cb10D3C7c1d5D2d` |
| **Payment Dashboard** | `https://shellfoundry.com/clawpaydashboard.html` |

---

## Quick Start (Existing Skill)

Already have a skill? Add ClawPay in 3 steps:

### Step 1: Add Payment Check

```javascript
const CLAWPAY_API = 'https://shellfoundry.com/api/check-access';

async function handleSkill(userAddress) {
  // Check if user paid (ADD THIS)
  const response = await fetch(`${CLAWPAY_API}?user=${userAddress}&skill=your-skill-id`);
  const data = await response.json();
  
  if (!data.paid) {
    return `This skill costs ${data.skillInfo.price} USDC. Pay at: https://shellfoundry.com/clawpay.html?skill=your-skill-id`;
  }
  
  // Your existing skill logic here
  return "Skill output here...";
}
```

### Step 2: Register Your Skill

Tell ClawPay about your skill (one-time setup):

```javascript
// Using ethers.js or similar
const contract = new ethers.Contract(CLAWPAY_ADDRESS, ABI, signer);
await contract.registerSkill(
  "your-skill-id",        // Unique ID for your skill
  "0xYourWalletAddress",  // Where you receive 90%
  ethers.utils.parseUnits("5", 6),  // Price in USDC (5 USDC)
  "My Awesome Skill"      // Display name
);
```

### Step 3: Re-deploy

Push your updated skill to ClawHub. Done.

**Users now pay before using.** You automatically receive 90% of every payment.

---

## For New Skills

Building from scratch? Same 3 steps, but add the payment check first.

### Full Example

```javascript
// skill.js
const CLAWPAY_API = 'https://shellfoundry.com/api/check-access';
const SKILL_ID = 'weather-pro';

async function getWeather(userAddress, location) {
  // Verify payment
  const access = await checkPayment(userAddress, SKILL_ID);
  if (!access.paid) {
    return paymentRequired(access);
  }
  
  // Skill logic
  const weather = await fetchWeather(location);
  return `Weather in ${location}: ${weather}`;
}

async function checkPayment(userAddress, skillId) {
  try {
    const response = await fetch(
      `${CLAWPAY_API}?user=${userAddress}&skill=${skillId}`
    );
    return await response.json();
  } catch (e) {
    return { paid: false, error: 'Payment check failed' };
  }
}

function paymentRequired(data) {
  return `⛔ Payment Required\n\n` +
    `This skill costs ${data.skillInfo?.price || '?'} USDC\n` +
    `Pay here: https://shellfoundry.com/clawpay.html?skill=${SKILL_ID}\n\n` +
    `After paying, try again.`;
}
```

---

## How Payments Work

```
User → Pays USDC → ClawPay Contract
                       ↓
                90% → Your Wallet (instant)
                10% → Platform Fee
                       ↓
                User can now use your skill
```

**On-chain, verifiable, instant.**

### Payment Flow

1. **User visits** `https://shellfoundry.com/clawpay.html?skill=your-skill-id`
2. **User connects wallet** (MetaMask, Rabby, etc.)
3. **User pays** the USDC amount you set
4. **Contract records** the payment on blockchain
5. **User can now use** your skill
6. **You receive** 90% immediately to your wallet

---

## Contract Details

| Network | Address | Explorer |
|---------|---------|----------|
| Base Mainnet | `0xbdC1C409df2e7Dda728366A44Cb10D3C7c1d5D2d` | [BaseScan](https://basescan.org/address/0xbdC1C409df2e7Dda728366A44Cb10D3C7c1d5D2d) |
| Base Sepolia (test) | `0x72CaF410E276c50e2f5a5C76f9348242c66bE86c` | [BaseScan Sepolia](https://sepolia.basescan.org) |

### Contract Functions

```solidity
// Check if a user has paid for a skill
function checkAccess(string skillId, address user) view returns (bool)

// Register a new skill (as developer)
function registerSkill(string skillId, address developer, uint256 priceUSDC, string name)

// Pay for skill access (as user)
function payForSkill(string skillId)

// Withdraw your earnings (as developer)
function withdrawEarnings(string skillId)

// Get skill info
function skills(string skillId) view returns (address developer, uint256 price, bool active, string name)
```

---

## API Reference

### Check Payment Status

```bash
GET https://shellfoundry.com/api/check-access?user=0x...&skill=skill-id
```

**Response:**
```json
{
  "success": true,
  "user": "0x936ccd9Fe471571e767fb61aC845C57b3a48653E",
  "skill": "weather-pro",
  "paid": true,
  "skillInfo": {
    "developer": "0xabcd...",
    "price": "5.00",
    "active": true,
    "name": "Premium Weather"
  }
}
```

### Error Response

```json
{
  "error": "Missing parameters",
  "message": "Please provide user (wallet address) and skill (skill ID)"
}
```

---

## Pricing Guidelines

| Skill Type | Suggested Price | Why |
|------------|-----------------|-----|
| Simple utility | 1-3 USDC | Quick tasks, data lookup |
| Premium API | 5-10 USDC | Valuable data, limited APIs |
| Complex agent | 10-25 USDC | Multi-step, reasoning, custom work |
| Enterprise | 50+ USDC | Business-critical, SLA |

**Start low, increase as you add value.**

---

## Trust & Security

### How Users Know You're Legit

1. **Blockchain Verified** — Every payment is on-chain, viewable on BaseScan
2. **Instant Payouts** — You receive 90% immediately, no holding period
3. **Transparent Fees** — 10% platform fee, clearly documented
4. **Proof of Payments** — See real transaction history at `shellfoundry.com/payments`

### For Developers

- **You control your skill** — We don't host or modify your code
- **You set your price** — Change anytime
- **You earn immediately** — No minimum thresholds
- **Open source friendly** — Your skill code stays yours

---

## Earnings & Withdrawals

### How to Check Your Balance

Visit the dashboard: `https://shellfoundry.com/clawpaydashboard.html`

Or query the contract directly:

```javascript
const earnings = await contract.developerEarnings(skillId, yourAddress);
console.log('Your earnings:', ethers.utils.formatUnits(earnings, 6), 'USDC');
```

### Withdrawing

```javascript
// Withdraw all earnings for a skill
await contract.withdrawEarnings(skillId);

// USDC arrives in your wallet immediately
```

---

## Testing on Sepolia

Before going live, test everything:

1. **Get Sepolia ETH** — [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
2. **Get Sepolia USDC** — Mint from testnet contract
3. **Deploy test skill** — Use testnet contract address
4. **Test payment flow** — Verify everything works

**Testnet Contract:** `0x72CaF410E276c50e2f5a5C76f9348242c66bE86c`

---

## Common Questions

**Q: Do I need to rewrite my skill?**  
A: No. Add ~7 lines of code to check payment. Everything else stays the same.

**Q: Can users bypass the payment?**  
A: They can modify local code, but they won't get paid. The ecosystem enforces trust—skills using ClawPay are marked "Verified" on ClawHub.

**Q: How do I get paid?**  
A: 90% of every payment goes directly to your wallet. No delays, no minimums.

**Q: What if I want to make my skill free later?**  
A: Set price to 0 or deactivate the skill in the contract.

**Q: Can I see who paid?**  
A: Yes—all transactions are on-chain. Query the contract or check BaseScan.

---

## Support

- **Website:** https://shellfoundry.com/clawpay.html
- **Dashboard:** https://shellfoundry.com/clawpaydashboard.html
- **Email:** ShellFoundry@gmail.com
- **X/Twitter:** https://x.com/ShellFoundry

---

## Example Integration (Full)

```javascript
// weather-pro-skill.js

const CLAWPAY_API = 'https://shellfoundry.com/api/check-access';
const SKILL_ID = 'weather-pro';

class WeatherProSkill {
  async handle(userAddress, args) {
    // 1. Verify payment
    const paymentStatus = await this.checkPayment(userAddress);
    if (!paymentStatus.paid) {
      return this.paymentRequired(paymentStatus);
    }
    
    // 2. Do the work
    const weather = await this.fetchWeather(args.location);
    
    // 3. Return result
    return {
      location: args.location,
      temperature: weather.temp,
      condition: weather.condition,
      paid: true
    };
  }
  
  async checkPayment(userAddress) {
    const response = await fetch(
      `${CLAWPAY_API}?user=${userAddress}&skill=${SKILL_ID}`
    );
    return await response.json();
  }
  
  paymentRequired(data) {
    return {
      error: 'Payment required',
      price: data.skillInfo?.price || '5.00',
      currency: 'USDC',
      payUrl: `https://shellfoundry.com/clawpay.html?skill=${SKILL_ID}`,
      message: 'Please pay to access this skill'
    };
  }
  
  async fetchWeather(location) {
    // Your weather API logic here
    return { temp: 72, condition: 'Sunny' };
  }
}

module.exports = WeatherProSkill;
```

---

**Ready to monetize?** Register your skill at `shellfoundry.com/clawpay.html`

*Built by ShellFoundry. Powered by Base.*
