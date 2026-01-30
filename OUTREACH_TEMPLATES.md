# ClawPay Developer Outreach Templates

## Scenario: Dev About to Launch Skill

### The DM Template

```
Hey [Dev Name]! 👋

Saw you're launching [Skill Name] on ClawdHub tomorrow - looks awesome!

Quick question: Are you planning to charge for it? Built something that might help.

ClawPay = Stripe for Clawdbot skills
• You set the price (e.g., $5)
• Keep 90% of every sale
• I handle payments, you just code
• Users pay once, get permanent access
• You withdraw earnings anytime

Zero risk setup:
• I only need your public wallet address
• Never ask for private keys
• Smart contract is public/verified
• Test with $1 first if you want

Want to monetize [Skill Name] from day one? Takes 2 mins to set up.

Contract: https://sepolia.basescan.org/address/0x72CaF410E276c50e2f5a5C76f9348242c66bE86c

Let me know!
```

### The Follow-Up (If They Reply)

```
Awesome! Here's exactly what you need to do:

STEP 1: Give me 3 things
• Your wallet address (where you want payments)
• Price in USDC (e.g., 5 = $5)
• Skill ID (the name users will type)

Example:
Wallet: 0xD49533AE308c190e7823f1602ED58C9c8e02613f
Price: 5
Skill ID: weather-pro

STEP 2: I register it
• Takes 2 minutes
• Costs me ~$0.01 in gas
• You get a transaction link to verify

STEP 3: Update your skill
Add 3 lines of code to check payment:

const { ClawPaySkill } = require('@clawpay/sdk');
const clawpay = new ClawPaySkill();

// In your skill function:
const hasAccess = await clawpay.checkAccess('weather-pro', userAddress);
if (!hasAccess) {
  return { error: 'Pay 5 USDC to use this skill' };
}

STEP 4: Launch!
• Users pay, you earn 90%
• Automatic split, instant settlement
• You withdraw whenever you want

Want to try it with a $1 test skill first? Zero risk.
```

### The Demo Offer

```
Want to see it work before committing?

I can:
1. Register a test skill for you ($1 price)
2. You try the payment flow yourself
3. See 90% land in your wallet
4. Then decide if you want to use it for real

Takes 5 minutes. No obligations. What do you think?
```

### If They Say "Is It Safe?"

```
Great question! Here's the security breakdown:

WHAT I CAN DO:
✅ Register your skill on the contract
✅ Send you your 90% earnings

WHAT I CANNOT DO:
❌ Access your wallet
❌ Steal your crypto
❌ Change your skill after registration
❌ Withhold your earnings

WHY IT'S SAFE:
• Smart contract handles all payments (code is public)
• Money goes directly from user to you
• I never touch your funds
• You can withdraw anytime, no minimum

VERIFICATION:
Contract: https://sepolia.basescan.org/address/0x72CaF410E276c50e2f5a5C76f9348242c66bE86c
Read the code yourself - line 45 shows "devAmount = price * 90%"

Want to start with $1 test? Even safer.
```

### If They Say "I'll Think About It"

```
Totally understand! Quick note though:

If you launch free first, then switch to paid later:
• Users who got it free will complain
• Hard to change pricing after launch
• Miss revenue from day 1 hype

If you launch paid from start:
• Early adopters expect to pay
• No backlash when you monetize
• Revenue from day 1

Can always lower price later if needed, but hard to go free→paid.

Offer: I'll waive my 10% fee for first month if you launch with ClawPay. You keep 100%.

Think it over, but timing is tomorrow's launch 👀
```

### The Technical Quick-Start

```
INTEGRATION CODE (3 lines):

1. Install: npm install @clawpay/sdk

2. At top of your skill:
   const { ClawPaySkill } = require('@clawpay/sdk');
   const clawpay = new ClawPaySkill();

3. In your main function:
   const access = await clawpay.checkAccess('your-skill-id', userAddress);
   if (!access) {
     return { 
       error: 'This skill costs 5 USDC',
       paymentAddress: '0x72CaF...',
       instructions: 'Send 5 USDC to activate'
     };
   }

That's it. Everything else is automatic.
```

## What They Need to Provide

### Minimal Info (30 seconds):
```
Wallet: 0x...
Price: X USDC
Skill ID: name-here
```

### What Happens Next (2 minutes):
```
1. You receive their info
2. Run: node scripts/admin.js register skill-id wallet price "Name"
3. Send them the transaction hash
4. They verify on blockchain explorer
5. They add 3 lines of code to their skill
6. They launch
```

### After Launch (Automatic):
```
• User pays 5 USDC
• Contract splits: 0.50 to you, 4.50 to dev
• Dev sees earnings in dashboard
• Dev clicks "Withdraw" anytime
```

## Handling Objections

### "I don't have a wallet"
```
No problem! Takes 2 minutes:
1. Install MetaMask (metamask.io)
2. Create wallet (save the seed phrase!)
3. Copy your wallet address
4. Done

I can walk you through it.
```

### "I don't want to deal with crypto"
```
Fair! Two options:

Option 1: I handle everything
• You give me wallet address
• I register the skill
• You just check if users paid (1 line of code)
• I handle support/questions

Option 2: Wait for Stripe version
• I'm building card payments too
• Launch with crypto now, add cards later
• Same 90/10 split

Crypto version is ready now. Cards in ~1 month.
```

### "What if it doesn't work?"
```
Test it first!

1. I register a test skill ($0.10 price)
2. You pay $0.10 from another wallet
3. See $0.09 land in your wallet instantly
4. If it works, register the real skill
5. If not, you lost $0.10 and we fix it

Literally can't fail unless the blockchain breaks.
```

### "Why not just use Stripe?"
```
You could! But:

Stripe:
• 2.9% + $0.30 per transaction
• Chargebacks ($15 each)
• Micropayments expensive ($0.35 fee on $0.50 sale)
• Takes 7 days to get paid
• Need business entity, tax forms

ClawPay:
• 10% flat (I take 10%, you keep 90%)
• No chargebacks (crypto is final)
• Micropayments cheap ($0.01 fee)
• Instant settlement
• No paperwork needed

For a $5 skill:
Stripe: $5.00 - $0.45 fee = $4.55 to you
ClawPay: $5.00 - $0.50 fee = $4.50 to you

Basically same, but ClawPay is instant and global.
```
