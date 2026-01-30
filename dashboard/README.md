# ClawPay Developer Dashboard

Simple web dashboard for developers to view earnings and manage skills.

## Features

- ✅ Connect wallet (MetaMask, Coinbase, etc.)
- ✅ View total earnings
- ✅ Withdraw earnings to wallet
- ✅ View registered skills
- ✅ Track sales and transactions

## Quick Start

```bash
# Start the server
npm start

# Or directly
node server.js
```

Dashboard will be available at `http://localhost:3000`

## Screenshot

The dashboard shows:
- Total earnings (cumulative)
- Pending withdrawals (available now)
- Total number of sales
- List of your skills with prices and status
- Recent transaction history

## How Developers Use It

1. Visit dashboard URL
2. Click "Connect Wallet"
3. View earnings and skills
4. Click "Withdraw" to collect earnings

## Configuration

Edit `index.html` to update:
- Contract address (after mainnet deployment)
- Network settings
- Branding/colors

## Future Enhancements

- [ ] Real-time transaction updates
- [ ] Charts/graphs for earnings over time
- [ ] Skill performance analytics
- [ ] Bulk withdrawal
- [ ] Multi-chain support
