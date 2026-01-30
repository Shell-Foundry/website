# Developer Quick-Start Guide

## You're About to Launch a Skill. Add Payments in 5 Minutes.

### What You Need

Just 3 things:
1. **Wallet address** (where you want to receive money)
2. **Price** (in USDC, e.g., 5 = $5)
3. **Skill ID** (what users type, e.g., "weather-pro")

### What You DON'T Need

❌ Private keys  
❌ Bank account  
❌ Business registration  
❌ Tax forms  
❌ Upfront payment  

### The 3-Step Process

#### Step 1: Send Info (30 seconds)

DM me:
```
Wallet: 0xYourWalletAddressHere
Price: 5
Skill ID: your-skill-name
```

#### Step 2: I Register It (2 minutes)

I run one command, send you back:
```
✅ Skill registered!
Transaction: https://sepolia.basescan.org/tx/0x...
```

#### Step 3: Add 3 Lines of Code

In your skill file:

```javascript
// At the top
const { ClawPaySkill } = require('./skill.js');
const clawpay = new ClawPaySkill();

// In your main function
async function yourSkill(userRequest, userAddress) {
  // Check if user paid
  const hasAccess = await clawpay.checkAccess('your-skill-id', userAddress);
  
  if (!hasAccess) {
    return {
      error: 'This skill requires payment',
      price: '5 USDC',
      instructions: 'Send 5 USDC to: 0x72CaF410E276c50e2f5a5C76f9348242c66bE86c'
    };
  }
  
  // User paid - provide the service
  return doYourSkillLogic(userRequest);
}
```

**That's it.**

### What Happens When Someone Buys

```
User pays 5 USDC
    ↓
Smart contract automatically splits:
    ├── 0.50 USDC (10%) → Platform
    └── 4.50 USDC (90%) → YOUR WALLET
    ↓
You see it in your dashboard
    ↓
Click "Withdraw" anytime → Money sent to your wallet instantly
```

### Your Earnings

| Skill Price | You Keep | Platform Fee | Per 100 Sales |
|-------------|----------|--------------|---------------|
| $1 USDC | $0.90 | $0.10 | $90 |
| $5 USDC | $4.50 | $0.50 | $450 |
| $10 USDC | $9.00 | $1.00 | $900 |

### Safety Check

**Can I lose money?**  
No. You only give your public wallet address. Like giving someone your email - they can send you money, but can't access your account.

**Can the platform steal my earnings?**  
No. The smart contract automatically sends 90% to you. I never touch it.

**What if the platform shuts down?**  
You keep all your earnings. The smart contract lives forever on the blockchain.

**Can I leave anytime?**  
Yes. Withdraw your earnings and stop using it. No penalties.

### Test It First (Recommended)

Before launching your real skill:

1. **Register test skill** ($1 price)
2. **Pay yourself $1** from another wallet
3. **See $0.90 arrive** in your wallet
4. **Verify it works**
5. **Launch real skill** with confidence

Total cost: $1 (and you get $0.90 back)

### Questions?

- **Contract:** https://sepolia.basescan.org/address/0x72CaF410E276c50e2f5a5C76f9348242c66bE86c
- **Dashboard:** (coming soon)
- **Support:** DM me

### Ready?

Send me your wallet address and let's get you paid! 💰
