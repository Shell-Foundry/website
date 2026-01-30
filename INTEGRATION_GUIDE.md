# ClawPay Integration - Exact Code Changes

## What Devs Need to Change (Visual Guide)

### BEFORE (Free Skill)
```javascript
// Your current skill file

async function mySkill(userRequest, userAddress) {
  // Your skill logic here
  const result = await doSomething(userRequest);
  
  return {
    success: true,
    data: result
  };
}

module.exports = { mySkill };
```

### AFTER (Paid Skill with ClawPay)
```javascript
// Your skill file WITH ClawPay

// LINE 1: Import the payment checker (ADD THIS)
const { checkPayment, getPaymentInstructions } = require('./clawpay-check.js');

async function mySkill(userRequest, userAddress) {
  
  // LINE 2: Check if user paid (ADD THIS)
  const hasPaid = await checkPayment(userAddress);
  
  // LINE 3: If not paid, return payment instructions (ADD THIS)
  if (!hasPaid) {
    return {
      success: false,
      ...getPaymentInstructions()
    };
  }
  
  // BELOW: Your existing skill logic (UNCHANGED)
  const result = await doSomething(userRequest);
  
  return {
    success: true,
    data: result
  };
}

module.exports = { mySkill };
```

## What You Send to Devs

**Email/DM them this:**

---

**Subject: Add Payments to Your Skill - 3 Lines of Code**

Hey!

Your skill is ready to monetize. Here's exactly what to do:

**Step 1:** Save this file as `clawpay-check.js` in your skill folder:
[Attach clawpay-check.js]

**Step 2:** Edit your skill file (e.g., `weather-skill.js`):

Find this line at the top:
```javascript
// (nothing, or your existing imports)
```

Add this line below it:
```javascript
const { checkPayment, getPaymentInstructions } = require('./clawpay-check.js');
```

**Step 3:** Find your main function (the one that runs when users use your skill):

It looks like:
```javascript
async function mySkill(userRequest, userAddress) {
```

Add these 6 lines right after the opening bracket `{`:

```javascript
  // Check if user paid
  const hasPaid = await checkPayment(userAddress);
  
  if (!hasPaid) {
    return {
      success: false,
      ...getPaymentInstructions()
    };
  }
```

**Step 4:** Update the CONFIG in `clawpay-check.js`:

Change these 2 lines:
```javascript
const SKILL_ID = 'weather-pro';     // Your skill ID
const SKILL_PRICE = 5;               // Price in USDC ($5)
```

**That's it!** 

Now when users try your skill:
- If they paid → They get your skill output
- If they didn't → They get payment instructions

**Test it:**
```bash
node your-skill.js
```

---

## Real Example: Weather Skill

### Original Code (Free)
```javascript
const axios = require('axios');

async function getWeather(location, userAddress) {
  const response = await axios.get(`https://api.weather.com/v1/current?location=${location}`);
  return {
    success: true,
    temperature: response.data.temp,
    conditions: response.data.conditions
  };
}

module.exports = { getWeather };
```

### With ClawPay (Paid)
```javascript
const axios = require('axios');

// ADD THIS LINE ↓
const { checkPayment, getPaymentInstructions } = require('./clawpay-check.js');

async function getWeather(location, userAddress) {
  
  // ADD THESE 6 LINES ↓
  const hasPaid = await checkPayment(userAddress);
  
  if (!hasPaid) {
    return {
      success: false,
      ...getPaymentInstructions()
    };
  }
  
  // Your original code (unchanged) ↓
  const response = await axios.get(`https://api.weather.com/v1/current?location=${location}`);
  return {
    success: true,
    temperature: response.data.temp,
    conditions: response.data.conditions
  };
}

module.exports = { getWeather };
```

**Lines added:** 1 import + 6 lines of logic = **7 lines total**

**Lines changed in their existing code:** **0** (your logic stays exactly the same)

## User Experience

**Before (Free):**
```
User: "What's the weather in NYC?"
Bot: "72°F and sunny"
```

**After (Paid):**
```
User: "What's the weather in NYC?"
Bot: "This skill requires payment
      Price: 5 USDC
      Send 5 USDC to: 0x72CaF..."

[User pays 5 USDC]

User: "What's the weather in NYC?"
Bot: "72°F and sunny"
```

## FAQ

**Q: Do I need to change my skill logic?**  
A: No. Your existing code stays exactly the same.

**Q: What if they already paid?**  
A: `checkPayment()` returns true, they see your skill output immediately.

**Q: Can they pay once and use forever?**  
A: Yes. The blockchain remembers they paid.

**Q: What happens if the payment check fails?**  
A: It defaults to "not paid" (safe fallback).

## Files to Send Devs

1. `clawpay-check.js` - The payment checker (they save this)
2. This guide - Shows exactly where to add the 7 lines

**Total time for dev:** 5 minutes  
**Total code added:** 7 lines  
**Their existing code changed:** 0 lines
