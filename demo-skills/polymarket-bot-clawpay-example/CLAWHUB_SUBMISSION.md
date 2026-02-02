# ClawHub Submission - Polymarket Bot ClawPay Example

## Skill Information

**Name:** Polymarket Bot — ClawPay Example  
**ID:** polymarket-bot-clawpay-example  
**Version:** 1.0.0  
**Category:** Finance / Trading  
**Price:** 1.00 USDC  
**License:** MIT  

## Description

Premium Polymarket analysis bot with AI-powered trading signals. This is a demonstration skill showing how developers can integrate ClawPay monetization into their existing skills.

**Key Features:**
- AI-powered market analysis
- Trading signals (BUY, SELL, HOLD)
- Confidence scoring
- Risk assessment
- **Powered by ClawPay** - instant USDC payments on Base

## Why This Skill Exists

This skill demonstrates the ClawPay payment infrastructure for skill developers. It shows how easy it is to:
1. Add payment verification to an existing skill (7 lines of code)
2. Set your own price in USDC
3. Receive 90% of earnings instantly
4. Process payments on Base Mainnet

## Integration Example

```javascript
const CLAWPAY_API = 'https://shellfoundry.com/api/check-access';
const SKILL_ID = 'polymarket-bot-clawpay-example';

async function analyze(userAddress, marketId) {
  // Check payment
  const response = await fetch(`${CLAWPAY_API}?user=${userAddress}&skill=${SKILL_ID}`);
  const data = await response.json();
  
  if (!data.paid) {
    return `This skill costs ${data.skillInfo.price} USDC. Pay at: https://shellfoundry.com/clawpay.html?skill=${SKILL_ID}`;
  }
  
  // Run skill logic
  return generateAnalysis(marketId);
}
```

## Technical Details

**Contract:** 0xbdC1C409df2e7Dda728366A44Cb10D3C7c1d5D2d  
**Network:** Base Mainnet  
**Payment Token:** USDC  
**Fee Split:** 90% Developer / 10% Platform  

## Files Included

- `skill.js` - Main skill implementation
- `SKILL.md` - Full documentation
- `package.json` - Metadata

## Developer Information

**Developer:** ShellFoundry  
**Website:** https://shellfoundry.com  
**Email:** ShellFoundry@gmail.com  
**GitHub:** https://github.com/Shell-Foundry  
**X/Twitter:** https://x.com/ShellFoundry  

## Usage

```bash
# Analyze a market (requires payment)
analyze market btc-2024

# If not paid, user sees payment instructions
# After payment, user gets premium analysis
```

## Payment Flow

1. User requests skill
2. Skill checks ClawPay API for payment status
3. If not paid → Show payment link
4. User pays at shellfoundry.com/clawpay.html
5. Skill runs and returns premium analysis
6. Developer receives 90% instantly

## Tags

polymarket, trading, finance, clawpay, premium, demo, example, monetization

## ClawPay Integration

This skill uses ClawPay for monetization. ClawPay is a payment infrastructure for OpenClaw skills that allows developers to:
- Charge USDC for skill access
- Receive instant payouts on Base Mainnet
- Keep 90% of all revenue

Learn more: https://shellfoundry.com/clawpay

## Support

For questions about this skill or ClawPay integration:
- Website: https://shellfoundry.com/clawpay
- Email: ShellFoundry@gmail.com
- Documentation: https://shellfoundry.com/clawpay/SKILL.md

---

**This is a demonstration skill showcasing ClawPay payment infrastructure.**
