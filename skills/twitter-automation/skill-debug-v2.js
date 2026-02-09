const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

chromium.use(stealth());

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function debugLoginV2() {
  console.log('🚀 DEBUG V2 - Enhanced logging...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0'
  });

  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log(`   🌐 Console: ${msg.text()}`));
  page.on('pageerror', err => console.log(`   ❌ Page error: ${err.message}`));
  
  console.log('🔐 Step 1: Loading login page...');
  await page.goto('https://mobile.x.com/login', { waitUntil: 'networkidle', timeout: 60000 });
  
  const step1HTML = await page.content();
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'debug_v2_step1.html'), step1HTML);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'debug_v2_step1.png'), fullPage: true });
  console.log('   📸 Step 1 screenshot saved\n');
  
  // Analyze step 1
  console.log('🔍 Step 1 Analysis:');
  const step1Inputs = await page.$$('input');
  console.log(`   Found ${step1Inputs.length} inputs:`);
  for (let i = 0; i < step1Inputs.length; i++) {
    const info = await step1Inputs[i].evaluate(el => ({
      type: el.type,
      name: el.name,
      id: el.id,
      placeholder: el.placeholder,
      autocomplete: el.autocomplete
    }));
    console.log(`     #${i}: type=${info.type}, name=${info.name}, id=${info.id}`);
  }
  
  // Find username field
  console.log('\n👤 Step 2: Looking for username field...');
  const usernameSelectors = [
    'input[autocomplete="username"]',
    'input[name="username"]',
    'input[type="text"]',
    'input[inputmode="email"]'
  ];
  
  let usernameField = null;
  for (const sel of usernameSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        console.log(`   ✅ Found with: ${sel}`);
        usernameField = sel;
        break;
      }
    } catch {}
  }
  
  if (!usernameField) {
    // Try to find any visible text input
    for (const input of step1Inputs) {
      const visible = await input.evaluate(el => el.offsetParent !== null);
      if (visible) {
        console.log('   ✅ Using first visible input');
        usernameField = 'input[type="text"]';
        break;
      }
    }
  }
  
  if (!usernameField) {
    console.log('   ❌ Cannot find username field!');
    await browser.close();
    return;
  }
  
  // Enter username
  const username = process.env.TWITTER_USERNAME || 'testuser';
  console.log(`✍️  Typing username: ${username}`);
  await page.fill(usernameField, username);
  await page.waitForTimeout(1000);
  
  // Step 3: Click Next
  console.log('\n➡️  Step 3: Looking for Next button...');
  
  const nextSelectors = [
    'button:has-text("Next")',
    'button:has-text("Log in")',
    'div[role="button"]:has-text("Next")',
    'span:has-text("Next")',
    '[data-testid="ocfEnterTextNextButton"]'
  ];
  
  let nextButton = null;
  for (const sel of nextSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        console.log(`   ✅ Found Next with: ${sel}`);
        nextButton = sel;
        break;
      }
    } catch {}
  }
  
  if (!nextButton) {
    console.log('   ❌ Cannot find Next button!');
    
    // Debug: list all buttons
    const buttons = await page.$$('button, div[role="button"]');
    console.log(`\n   🕵️  Found ${buttons.length} clickable elements:`);
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      console.log(`     #${i}: "${text.substring(0, 50)}"`);
    }
    
    await browser.close();
    return;
  }
  
  // Capture URL before click
  const urlBefore = page.url();
  console.log(`   URL before click: ${urlBefore}`);
  
  // Click Next
  await page.click(nextButton);
  console.log('👆 Clicked Next');
  
  // Wait for navigation or timeout
  console.log('⏳ Waiting for page change (max 10s)...');
  try {
    await page.waitForTimeout(5000);
    
    // Check if URL changed
    const urlAfter = page.url();
    console.log(`   URL after click: ${urlAfter}`);
    
    if (urlBefore !== urlAfter) {
      console.log('   ✅ Page navigated!');
      await page.waitForLoadState('networkidle');
    } else {
      console.log('   ⚠️  URL did not change');
      await page.waitForTimeout(5000); // Extra wait
    }
  } catch {
    console.log('   ⏱️  Wait completed no navigation detected');
  }
  
  // Step 4: Analyze page after Next
  console.log('\n🔍 Step 4: Analyzing page after Next...');
  
  const step2HTML = await page.content();
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'debug_v2_step2.html'), step2HTML);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'debug_v2_step2.png'), fullPage: true });
  console.log('   📸 Step 2 screenshot saved\n');
  
  // Find all inputs again
  const step2Inputs = await page.$$('input');
  console.log(`   Found ${step2Inputs.length} inputs:`);
  
  for (let i = 0; i < step2Inputs.length; i++) {
    const info = await step2Inputs[i].evaluate(el => ({
      type: el.type,
      name: el.name,
      id: el.id,
      placeholder: el.placeholder,
      autocomplete: el.autocomplete
    }));
    console.log(`     #${i}: type=${info.type}, name=${info.name}, id=${info.id}`);
  }
  
  // Look for password field specifically
  console.log('\n🔑 Step 5: Looking for password field...');
  
  const passwordSelectors = [
    'input[type="password"]',
    'input[autocomplete="current-password"]',
    'input[name="password"]',
    'input[placeholder*="password" i]'
  ];
  
  let passwordField = null;
  for (const sel of passwordSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        console.log(`   ✅ Found password with: ${sel}`);
        passwordField = sel;
        break;
      }
    } catch {}
  }
  
  if (!passwordField) {
    console.log('   ❌ No password field found!');
    
    // Check if there's any challenge
    const challengeText = await page.$eval('body', el => el.innerText);
    if (challengeText.includes('verification') || challengeText.includes('code')) {
      console.log('   ⚠️  Possible verification challenge detected!');
    }
  }
  
  console.log('\n✅ Debug V2 complete!');
  console.log('📁 Check screenshots/ for:');
  console.log('   - debug_v2_step1.png (login page)');
  console.log('   - debug_v2_step2.png (after Next)');
  
  await browser.close();
}

debugLoginV2().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
