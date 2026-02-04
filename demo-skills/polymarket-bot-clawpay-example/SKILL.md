---
name: polymarket-bot-clawpay-example
version: 1.0.0
description: Premium Polymarket analysis bot. AI-powered trading signals with ClawPay monetization. $1 USDC per use.
homepage: https://shellfoundry.com/clawpay
metadata: {"shellfoundry":{"emoji":"📈","category":"finance","price":"1.00","currency":"USDC","clawpay_enabled":true}}
---

# Polymarket Bot — ClawPay Example

**⚠️ This is a demo skill showcasing ClawPay integration.**

AI-powered Polymarket analysis and automated trading signals. Pay $1 USDC per use, get instant premium insights.

> 💡 **For Developers:** This skill demonstrates how to integrate ClawPay into your own skills. See the [Integration Guide](#integration-guide) below.

---

## What It Does

This premium skill analyzes Polymarket prediction markets and provides:

- **AI-Powered Analysis** — Natural language processing of market conditions
- **Trading Signals** — BUY, SELL, HOLD recommendations with confidence scores
- **Market Sentiment** — Aggregated social and on-chain indicators
- **Risk Assessment** — Position sizing suggestions

**Price:** 1 USDC per analysis  
**Network:** Base Mainnet  
**Payment:** Instant via ClawPay

---

## Quick Start

### For Users

```bash
# Analyze a market (requires payment)
analyze market btc-2024

# If not paid, you'll see:
# "Payment Required: 1.00 USDC"
# Pay at: https://shellfoundry.com/clawpay.html?skill=polymarket-bot-clawpay-example
```

### For Developers

Want to build something like this? See the [Integration Guide](#integration-guide).

---

## Example Output

**Before Payment:**
```json
{
  "error": "Payment Required",
  "message": "This is a premium skill powered by ClawPay.",
  "price": "1.00",
  "currency": "USDC",
  "payUrl": "https://shellfoundry.com/clawpay.html?skill=polymarket-bot-clawpay-example"
}
```

**After Payment:**
```json
{
  "success": true,
  "market": "btc-2024",
  "analysis": {
    "name": "Bitcoin Price 2024",
    "recommendation": "HOLD",
    "confidence": 0.78,
    "reasoning": "Technical indicators suggest consolidation phase. Premium signal generated."
  },
  "paid": true
}
```

---

## Integration Guide

### How This Skill Uses ClawPay

This is a complete working example. Copy this pattern for your own premium skills:

```javascript
const CLAWPAY_API = 'https://shellfoundry.com/api/check-access';
const SKILL_ID = 'your-skill-id';

async function handleSkill(userAddress, args) {
  // 1. Check if user paid
  const response = await fetch(`${CLAWPAY_API}?user=${userAddress}&skill=${SKILL_ID}`);
  const data = await response.json();
  
  if (!data.paid) {
    return {
      error: 'Payment Required',
      price: data.skillInfo.price,
      payUrl: `https://shellfoundry.com/clawpay.html?skill=${SKILL_ID}`
    };
  }
  
  // 2. Your skill logic here (only runs if paid)
  return doSkillWork(args);
}
```

### Setting Up Your Own Skill

**Step 1:** Copy the structure from `skill.js`  
**Step 2:** Change `SKILL_ID` to your unique identifier  
**Step 3:** Set your price (this example uses 1 USDC)  
**Step 4:** Deploy and register on ClawHub  
**Step 5:** Users pay, you earn 90% instantly

### Registration

Before users can pay, register your skill on the ClawPay contract:

```javascript
const contract = new ethers.Contract(CLAWPAY_ADDRESS, ABI, signer);
await contract.registerSkill(
  "your-skill-id",           // Unique ID
  "0xYourWalletAddress",     // Where you receive 90%
  ethers.utils.parseUnits("1", 6),  // Price: 1 USDC
  "Your Skill Name"          // Display name
);
```

---

## ClawPay Flow

```
User → Requests Skill
         ↓
    [Check Payment]
         ↓
    ┌─────────────┐
    │ Not Paid?   │──→ Show payment link
    └─────────────┘
         ↓ Paid
    [Run Skill]
         ↓
    [Return Result]
```

**Behind the scenes:**
1. Skill queries `shellfoundry.com/api/check-access`
2. API checks blockchain for payment
3. If paid → Skill runs
4. If not paid → User sees payment instructions

---

## Why This Model Works

**For Users:**
- Pay per use — no subscriptions
- Instant access after payment
- Transparent pricing
- Verified on blockchain

**For Developers:**
- 90% revenue share
- Instant payouts
- No chargebacks
- Global reach (Base Mainnet)

**For the Ecosystem:**
- Quality skills get rewarded
- Spam skills die (no one pays)
- Sustainable developer economy

---

## Contract Details

| Detail | Value |
|--------|-------|
| **ClawPay Contract** | `0x6c302FB0eabb0875088b07D80807a91BDa3c21AB` |
| **Network** | Base Mainnet |
| **Payment Token** | USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |
| **Fee Split** | 90% Developer / 10% Platform |
| **This Skill Price** | 1.00 USDC |
| **This Skill ID** | `polymarket-bot-clawpay-example` |

---

## Files

| File | Description |
|------|-------------|
| `skill.js` | Full working implementation |
| `SKILL.md` | This documentation |

---

## Support

- **ClawPay Docs:** https://shellfoundry.com/clawpay.html
- **Payment Dashboard:** https://shellfoundry.com/clawpaydashboard.html
- **Contract:** https://basescan.org/address/0x6c302FB0eabb0875088b07D80807a91BDa3c21AB
- **Email:** ShellFoundry@gmail.com

---

## About This Example

This skill was created by **ShellFoundry** to demonstrate ClawPay integration. It's a fully functional example that:

✅ Uses real ClawPay infrastructure  
✅ Processes real USDC payments on Base  
✅ Shows the complete developer integration pattern  
✅ Can be copied and adapted for any skill  

**Want to build your own?** Copy this skill, change the logic, set your price, deploy. That's it.

---

*Built with 🐚 by ShellFoundry. Powered by Base.*
