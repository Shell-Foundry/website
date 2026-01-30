# ClawPay Migration Guide

When you're ready to move to a production server, follow these steps.

## Current Location
All files are in: `/root/clawd/`

## Backup (Before Migration)

```bash
# On current machine
cd /root
zip -r clawpay-backup-$(date +%Y%m%d).zip clawd/

# Download this file to your local machine
# Then upload to new server
```

## What to Backup

### ✅ MUST Backup
- `/root/clawd/contracts/` - Smart contract code
- `/root/clawd/skill-clawpay/` - Skill integration
- `/root/clawd/CLAWPAY_LOG.md` - Progress tracker
- `/root/clawd/README.md` - Documentation

### ⚠️ CRITICAL - Store Securely (NEVER in backups)
- MetaMask seed phrase (12-24 words)
- Private keys
- `.env` files (contain API keys)

### ❌ DON'T Need to Backup
- `node_modules/` folders (can reinstall)
- Contract build artifacts (can recompile)
- Test files

## Restore on New Machine

```bash
# 1. Upload backup
scp clawpay-backup.zip user@new-server:/root/

# 2. Unzip
unzip /root/clawpay-backup.zip -d /

# 3. Reinstall dependencies
cd /root/clawd/contracts && npm install
cd /root/clawd/skill-clawpay && npm install

# 4. Recreate .env files (fill in your keys)
cp .env.example .env
nano .env  # Add your keys

# 5. Done!
```

## Important Notes

1. **Smart Contract**: Lives on blockchain (Base), not on server
   - Testnet Contract: 0x72CaF410E276c50e2f5a5C76f9348242c66bE86c
   - Mainnet Contract: (deploy after testing)
   - Your server just *talks* to it, doesn't host it

2. **Wallet**: Same wallet works everywhere
   - Just install MetaMask on new machine
   - Import with seed phrase
   - All funds/balances preserved

3. **Contract Ownership**: 
   - Owned by your wallet address
   - Ownership can be transferred if needed
   - Deployer address: (fill in after deployment)

## Quick Reference

| Item | Location | Backup? |
|------|----------|---------|
| Smart contract code | `/root/clawd/contracts/` | ✅ Yes |
| Skill integration | `/root/clawd/skill-clawpay/` | ✅ Yes |
| Log/progress | `/root/clawd/CLAWPAY_LOG.md` | ✅ Yes |
| Private keys | MetaMask only | ❌ No (NEVER) |
| API keys | `.env` files | ⚠️ Secure backup only |
| Deployed contract | Blockchain (0x...) | ✅ Write it down |

## Emergency Recovery

If this server dies RIGHT NOW:

1. **Contract is SAFE** - on blockchain forever
2. **Code is in GitHub** - (you should push it)
3. **Your wallet** - reinstall MetaMask, import seed phrase
4. **API keys** - regenerate at Alchemy (free)
5. **Skills continue working** - they use contract on-chain

## Recommended Next Steps

1. Push code to GitHub (free private repo)
2. Document contract addresses
3. Screenshot important configs
4. Test restore process on new VM before you need it
