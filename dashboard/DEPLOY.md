# Deploy ClawPay Dashboard to Vercel

## Method 1: Web Interface (Easiest)

### Step 1: Prepare Files
Create a zip file with these 2 files:
- `index.html`
- `vercel.json`

```bash
cd /root/clawd/dashboard
zip dashboard-deploy.zip index.html vercel.json
```

### Step 2: Deploy
1. Go to https://vercel.com
2. Sign up (free, use GitHub/Google)
3. Click "Add New Project"
4. Select "Import Git Repository" OR "Upload"
5. If upload: Drag your dashboard-deploy.zip
6. Click "Deploy"

### Step 3: Done!
- Vercel gives you a URL: `https://clawpay-dashboard-xyz.vercel.app`
- Share this URL with developers
- Free forever

## Method 2: GitHub + Vercel (Recommended for updates)

### Step 1: Create GitHub Repo
1. Go to https://github.com/new
2. Name: `clawpay-dashboard`
3. Make it Public or Private
4. Click "Create repository"

### Step 2: Upload Files
```bash
cd /root/clawd/dashboard
git init
git add index.html vercel.json
git commit -m "Initial dashboard"
git remote add origin https://github.com/YOUR_USERNAME/clawpay-dashboard.git
git push -u origin main
```

### Step 3: Connect to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Click "Deploy"
4. Done! Auto-updates when you push to GitHub

## Your Dashboard URL

After deployment, you'll have:
```
https://clawpay-dashboard.vercel.app
```

Share this with developers!

## Free Tier Limits

Vercel free tier includes:
- ✅ Unlimited static sites
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Perfect for your dashboard

More than enough for ClawPay!
