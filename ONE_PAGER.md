# ClawPay - Quick Integration Summary

## For Developers Launching Skills

### What You Get
- Monetize your skill from day one
- Keep 90% of every sale
- Instant payments to your wallet
- Zero ongoing fees

### What You Do (5 Minutes)

**Step 1:** Save this file next to your skill: `clawpay-check.js`

**Step 2:** Add 1 line at the top of your skill:
```javascript
const { checkPayment, getPaymentInstructions } = require('./clawpay-check.js');
```

**Step 3:** Add 6 lines in your main function:
```javascript
const hasPaid = await checkPayment(userAddress);

if (!hasPaid) {
  return {
    success: false,
    ...getPaymentInstructions()
  };
}
```

**Done.** 

Your skill now:
- Checks if user paid
- Shows payment instructions if not
- Runs your skill if they paid

### What Users See

**First time:** "This skill costs 5 USDC. Send payment to: 0x72CaF..."

**After paying:** Your skill works normally forever

### Your Earnings

| Price | You Get | Example |
|-------|---------|---------|
| $1 | $0.90 | 100 sales = $90 |
| $5 | $4.50 | 100 sales = $450 |
| $10 | $9.00 | 100 sales = $900 |

### Safety

- ✅ You only give your public wallet address
- ✅ Smart contract sends 90% directly to you
- ✅ Platform never touches your funds
- ✅ Withdraw anytime, no minimum

### Need Help?

Contract: https://sepolia.basescan.org/address/0x72CaF410E276c50e2f5a5C76f9348242c66bE86c

DM for setup help!
