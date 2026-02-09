const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

chromium.use(stealth());

const SESSION_DIR = path.join(__dirname, 'twitter_session');
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// Human-like behavior helpers
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomSleep = (min, max) => sleep(Math.random() * (max - min) + min);

async function saveScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: path.join(SCREENSHOTS_DIR, `${timestamp}_${name}.png`),
    fullPage: false 
  });
  console.log(`📸 Screenshot: ${name}`);
}

async function saveSession(context) {
  const storage = await context.storageState();
  fs.writeFileSync(
    path.join(SESSION_DIR, 'storage.json'), 
    JSON.stringify(storage, null, 2)
  );
  console.log('💾 Session saved');
}

async function loadSession() {
  const sessionPath = path.join(SESSION_DIR, 'storage.json');
  if (fs.existsSync(sessionPath)) {
    console.log('📂 Loading saved session...');
    return JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
  }
  return null;
}

async function attemptLogin() {
  console.log('🔓 ATTEMPTING TWITTER LOGIN (Session Persistence Method)\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security'
    ]
  });

  // Try to load existing session
  const savedSession = await loadSession();
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    storageState: savedSession || undefined
  });

  // Add stealth scripts
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    window.chrome = { runtime: {} };
  });

  const page = await context.newPage();

  // Test if already logged in
  console.log('Step 1: Checking if already logged in...');
  await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await randomSleep(2000, 4000);
  await saveScreenshot(page, '01_check_login');

  // Check if we're logged in
  const homeLink = await page.$('a[href="/home"]');
  if (homeLink) {
    console.log('✅ ALREADY LOGGED IN!');
    await saveSession(context);
    await saveScreenshot(page, '02_logged_in');
    await browser.close();
    return true;
  }

  console.log('⚠️  Not logged in, attempting login...\n');

  // DESKTOP LOGIN FLOW
  console.log('Step 2: Going to desktop login...');
  await page.goto('https://x.com/i/flow/login', { 
    waitUntil: 'networkidle', 
    timeout: 60000 
  });
  await randomSleep(3000, 5000);
  await saveScreenshot(page, '02_login_page');

  // Step 3: Enter username with human behavior
  console.log('Step 3: Entering username...');
  const username = process.env.TWITTER_USERNAME;
  
  // Find username field
  const usernameField = await page.waitForSelector(
    'input[autocomplete="username"], input[name="text"], input[type="text"]', 
    { timeout: 10000 }
  );
  
  // Click and type slowly
  await usernameField.click();
  await randomSleep(300, 800);
  
  // Type with variable speed
  for (const char of username) {
    await usernameField.type(char, { delay: Math.random() * 150 + 50 });
  }
  await randomSleep(500, 1500);
  await saveScreenshot(page, '03_username_entered');

  // Step 4: Click Next with random click position
  console.log('Step 4: Clicking Next...');
  const nextButton = await page.$('button:has-text("Next"), span:has-text("Next")');
  if (nextButton) {
    const box = await nextButton.boundingBox();
    if (box) {
      // Click at random position within button
      await page.mouse.click(
        box.x + box.width * (0.3 + Math.random() * 0.4),
        box.y + box.height * (0.3 + Math.random() * 0.4)
      );
    } else {
      await nextButton.click();
    }
  }
  await randomSleep(3000, 5000);
  await saveScreenshot(page, '04_after_next');

  // Step 5: Enter password
  console.log('Step 5: Entering password...');
  const password = process.env.TWITTER_PASSWORD;
  
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[autocomplete="current-password"]'
  ];
  
  let passwordField = null;
  for (const sel of passwordSelectors) {
    passwordField = await page.$(sel);
    if (passwordField) {
      console.log(`Found password with: ${sel}`);
      break;
    }
  }
  
  if (!passwordField) {
    console.log('❌ Password field not found');
    await saveScreenshot(page, '05_error_no_password');
    await browser.close();
    return false;
  }
  
  await passwordField.click();
  await randomSleep(200, 500);
  await passwordField.fill(password);
  await randomSleep(500, 1500);
  await saveScreenshot(page, '05_password_entered');

  // Step 6: Log in with Enter key
  console.log('Step 6: Pressing Enter to login...');
  await passwordField.press('Enter');
  await randomSleep(5000, 8000);
  await saveScreenshot(page, '06_after_login');

  // Step 7: Check if logged in
  const newHomeLink = await page.$('a[href="/home"]');
  if (newHomeLink) {
    console.log('✅ LOGIN SUCCESSFUL!');
    await saveSession(context);
    await saveScreenshot(page, '07_success');
    await browser.close();
    return true;
  }

  // Check for challenges
  const pageContent = await page.content();
  if (pageContent.includes('verification') || pageContent.includes('challenge')) {
    console.log('⚠️  Verification/challenge detected!');
    await saveScreenshot(page, '07_challenge');
  } else {
    console.log('❌ Login may have failed');
    await saveScreenshot(page, '07_unknown_state');
  }

  await browser.close();
  return false;
}

// Run with retry
async function main() {
  const maxAttempts = 1;
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`\n=== ATTEMPT ${i + 1}/${maxAttempts} ===\n`);
    const success = await attemptLogin();
    if (success) {
      console.log('\n🎉 SUCCESS! Session saved for reuse.');
      process.exit(0);
    }
    if (i < maxAttempts - 1) {
      console.log('\n⏳ Waiting before retry...');
      await sleep(10000);
    }
  }
  console.log('\n❌ All attempts failed. Check screenshots/ for details.');
  process.exit(1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
