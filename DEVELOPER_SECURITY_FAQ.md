# ClawPay Security FAQ for Developers

## Is ClawPay Safe?

**YES.** Here's why:

## What Information Do I Need to Provide?

**Only your public wallet address.**

This is like giving someone your email address — they can send you money, but they can NEVER access your account or steal your funds.

## What You DON'T Need to Share

❌ Private keys  
❌ Seed phrases  
❌ Passwords  
❌ Personal information  
❌ Bank accounts  

## How It Works

```
1. You give us your wallet address
   Example: 0x1234567890123456789012345678901234567890

2. We register your skill on the blockchain
   (Takes 2 minutes, costs us ~$0.01 in gas)

3. Users pay for your skill
   Example: User pays 10 USDC

4. Smart contract automatically splits:
   • 1 USDC (10%) → Platform
   • 9 USDC (90%) → YOUR wallet (instantly)

5. You can withdraw anytime
   No minimum, no fees, no delays
```

## Can ClawPay Steal My Money?

**NO.** Here's the proof:

1. **Smart Contract is Public**
   - Anyone can read the code
   - Verified on blockchain explorer
   - Logic: "Send 90% to developer wallet"

2. **You Control Your Wallet**
   - We never ask for private keys
   - We can't sign transactions for you
   - We can't move your funds

3. **Automatic Payments**
   - Money goes directly from user to you
   - We never hold your funds
   - Smart contract handles everything

## What's the Risk?

**Minimal:**
- Platform could stop operating (you still keep your earnings)
- Platform could raise fees (but existing skills locked at current rate)
- Smart contract bug (code is simple, battle-tested patterns)

**NOT POSSIBLE:**
- Platform stealing your money
- Platform accessing your wallet
- Platform changing your skill details without permission

## How to Verify It's Safe

1. **Read the contract yourself:**
   - Testnet: https://sepolia.basescan.org/address/0x72CaF410E276c50e2f5a5C76f9348242c66bE86c
   - Click "Contract" tab → Read the code

2. **Check the transaction:**
   - When you register, you get a transaction hash
   - Look it up on the blockchain explorer
   - See exactly what happened

3. **Start small:**
   - Register a test skill with $1 price
   - Have a friend buy it
   - See 90% arrive in your wallet
   - Then register your real skills

## What If I Want to Leave?

**You can leave anytime:**
- Withdraw all your earnings instantly
- Stop promoting your skill
- Users who already paid still have access
- You keep 100% of what you earned

## Still Have Concerns?

**Option 1: Use a new wallet**
- Create a new MetaMask wallet just for ClawPay
- Only keep earnings there, not your main funds
- Zero risk to your main crypto

**Option 2: Start with testnet**
- Test with fake money first
- See the system work
- Build trust before using real money

**Option 3: Ask questions**
- DM us on X: @clawpay
- Join our Discord: [link]
- Read the smart contract code yourself

## Summary

| Question | Answer |
|----------|--------|
| Can you steal my crypto? | **NO** - Never have access |
| Can you change my skill price? | **NO** - Only you can request changes |
| Can you withhold my earnings? | **NO** - You withdraw anytime |
| Is my wallet safe? | **YES** - We only have your public address |
| What's the worst case? | Platform shuts down, you keep earnings |

**Ready to start earning?** Register your first skill and test with $1!
