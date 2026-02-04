# ClawPaySplitter v2 - Fresh Deployment Guide

## 🚀 Deploy New Contract

Since you lost access to the previous owner wallet, you'll deploy a fresh contract with full control.

---

## 📋 PREREQUISITES

### 1. Create New Wallet

**Option A: Rabby Wallet (Recommended)**
1. Open Rabby extension
2. Click your current account
3. Click "+" to add new account
4. **WRITE DOWN THE SEED PHRASE** (12-24 words)
5. Store it somewhere safe (NOT on computer)

**Option B: MetaMask**
1. Open MetaMask
2. Click account icon (top right)
3. "Create Account"
4. **WRITE DOWN THE SEED PHRASE**

### 2. Get ETH on Base Mainnet

You need ~0.01 ETH (~$25) for gas fees.

**Options:**
- **Bridge from Ethereum:** https://bridge.base.org
- **Buy on Coinbase:** Transfer to Base network
- **Transfer from another wallet:** Send to your new address

### 3. Verify You Have Funds

Check your new wallet on: https://basescan.org

---

## 🛠️ DEPLOYMENT STEPS

### Step 1: Setup Environment

```bash
cd ~/.openclaw/workspace/shellfoundry/contracts

# Install dependencies (if not already installed)
npm install
```

### Step 2: Create .env File

Create `contracts/.env` (this will NOT be committed to git):

```bash
echo "PRIVATE_KEY=your_new_private_key_here" > .env
```

**Get your private key:**
1. Open Rabby/MetaMask
2. Click the new wallet account
3. Click "Export Private Key"
4. Copy the key (starts with 0x...)
5. Paste into .env file

### Step 3: Deploy

```bash
npx hardhat run scripts/deploy-v2.js --network base
```

**Expected output:**
```
🐚 Deploying ClawPaySplitter v2...

Deploying with account: 0xYourNewAddress...
Account balance: 10000000000000000

📋 Configuration:
  USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  Platform Wallet (10% fees): 0xYourNewAddress...
  Fee Split: 90% developer / 10% platform

⛏️  Deploying contract...

✅ Contract deployed!
  Address: 0xNewContractAddress...
  Owner: 0xYourNewAddress...
  Network: Base Mainnet
  Explorer: https://basescan.org/address/0xNewContractAddress...
```

### Step 4: Save Contract Address

**CRITICAL:** Save the contract address shown in the output. You'll need it for the website.

---

## 📝 REGISTER YOUR FIRST SKILL

### Option A: Via Remix (Easiest)

1. Go to https://remix.ethereum.org
2. Create new file: `ClawPaySplitter.sol`
3. Copy the contract code from `contracts/ClawPaySplitter-v2.sol`
4. Compile (Solidity 0.8.19+)
5. At "Deploy & Run Transactions":
   - Environment: "Injected Provider" (connects Rabby/MetaMask)
   - At Address: Paste your new contract address
6. Expand the contract, find `registerSkill` function
7. Fill in:
   - `skillId`: `test-skill` (lowercase, no spaces)
   - `developer`: Your wallet address (receives 90%)
   - `price`: `1000000` (1 USDC = 1000000 with 6 decimals)
   - `name`: `Test Skill`
8. Click "Transact" and confirm in wallet

### Option B: Via Script

Create `register-skill.js`:

```javascript
const { ethers } = require('hardhat');

async function main() {
  const CONTRACT_ADDRESS = 'YOUR_NEW_CONTRACT_ADDRESS';
  
  const contract = await ethers.getContractAt('ClawPaySplitter', CONTRACT_ADDRESS);
  
  const tx = await contract.registerSkill(
    'test-skill',                    // skillId
    'YOUR_WALLET_ADDRESS',           // developer (receives 90%)
    1000000,                         // price (1 USDC)
    'Test Skill'                     // name
  );
  
  await tx.wait();
  console.log('Skill registered!');
}

main().catch(console.error);
```

Run: `npx hardhat run register-skill.js --network base`

---

## 🔄 UPDATE WEBSITE

After deploying, update these files with your new contract address:

### 1. Update Website Config

Edit these files and replace the old contract address:

- `website/api/check-access.js`
- `website/clawpay.html` (JavaScript section)
- `website/clawpaydashboard.html` (JavaScript section)
- `website/index.html` (contract info section)

**Find:** `0xbdC1C409df2e7Dda728366A44Cb10D3C7c1d5D2d`
**Replace with:** Your new contract address

### 2. Redeploy Website

```bash
cd website
vercel --prod
```

---

## ✅ VERIFY DEPLOYMENT

### Check on BaseScan:
1. Go to: https://basescan.org/address/YOUR_CONTRACT_ADDRESS
2. Verify:
   - Contract is verified
   - Owner is your new wallet
   - USDC address is correct

### Test Payment Flow:
1. Go to: https://shellfoundry.com/clawpay.html?skill=test-skill
2. Connect wallet
3. Pay 1 USDC
4. Check developer dashboard for earnings
5. Withdraw earnings

---

## 📊 CONTRACT DETAILS

### Constructor Parameters:
- **USDC Address:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (Base Mainnet)
- **Platform Wallet:** Your wallet address (receives 10% fees)
- **Fee Split:** 90% to developer, 10% to platform

### Key Functions:
- `registerSkill()` — Register new skill (owner only)
- `payForSkill()` — User pays for skill access
- `withdrawEarnings()` — Developer withdraws 90%
- `withdrawPlatformFees()` — Owner withdraws 10%
- `checkAccess()` — Verify if user paid
- `updateSkillPrice()` — Change skill price (owner only)

---

## 🔐 SECURITY REMINDERS

✅ **DO:**
- Save seed phrase offline (paper, safe)
- Use hardware wallet for large amounts
- Keep private key in .env only (gitignored)
- Test with small amounts first

❌ **DON'T:**
- Share private key with anyone
- Commit .env to GitHub
- Store seed phrase on computer/cloud
- Use same key for multiple projects

---

## 🆘 TROUBLESHOOTING

**"Insufficient funds" error:**
- You need ETH on Base Mainnet for gas
- Bridge ETH from Ethereum or buy on exchange

**"Contract deployment failed" error:**
- Check you have enough ETH (~0.01 ETH)
- Verify private key is correct in .env
- Make sure you're on Base Mainnet network

**"Cannot estimate gas" error:**
- Contract constructor parameters might be wrong
- Verify USDC address is correct

---

## 📞 SUPPORT

If you need help:
- Check BaseScan for transaction status
- Review this README carefully
- Contact: ShellFoundry@gmail.com

**Good luck with your deployment! 🐚**
