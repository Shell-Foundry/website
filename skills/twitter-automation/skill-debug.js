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

async function debugLogin() {
  console.log('🚀 DEBUG MODE - Launching browser...');
  
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
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
  });

  const page = await context.newPage();
  
  console.log('🔐 Navigating to mobile.x.com/login...');
  await page.goto('https://mobile.x.com/login', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  
  // Screenshot 1: Login page
  await page.screenshot({ 
    path: path.join(SCREENSHOT_DIR, 'debug_01_login.png'),
    fullPage: true 
  });
  console.log('📸 Screenshot 1: Login page saved');
  
  // Enter username
  const username = process.env.TWITTER_USERNAME || 'testuser';
  console.log(`👤 Entering username: ${username}`);
  await page.fill('input[autocomplete="username"]', username);
  await page.waitForTimeout(1000);
  
  // Click Next
  await page.click('button[role="button"]:has-text("Next")');
  console.log('➡️ Clicked Next');
  await page.waitForTimeout(3000);
  
  // Screenshot 2: After clicking Next
  await page.screenshot({ 
    path: path.join(SCREENSHOT_DIR, 'debug_02_after_next.png'),
    fullPage: true 
  });
  console.log('📸 Screenshot 2: After Next clicked');
  
  // DEBUG: Capture full HTML
  const html = await page.content();
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'debug_02_page.html'), 
    html
  );
  console.log('📄 Full HTML saved to debug_02_page.html');
  
  // DEBUG: Find ALL inputs
  const inputs = await page.$$('input');
  console.log(`\n🔍 Found ${inputs.length} input elements:\n`);
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const info = await input.evaluate(el => ({
      type: el.type || 'no-type',
      name: el.name || 'no-name', 
      id: el.id || 'no-id',
      className: el.className || 'no-class',
      placeholder: el.placeholder || 'no-placeholder',
      autocomplete: el.autocomplete || 'no-autocomplete',
      visible: el.offsetParent !== null
    }));
    
    console.log(`Input #${i}:`);
    console.log(`  type: ${info.type}`);
    console.log(`  name: ${info.name}`);
    console.log(`  id: ${info.id}`);
    console.log(`  class: ${info.className.substring(0, 60)}`);
    console.log(`  placeholder: ${info.placeholder}`);
    console.log(`  autocomplete: ${info.autocomplete}`);
    console.log(`  visible: ${info.visible}`);
    console.log('---');
  }
  
  // Try to find password input
  console.log('\n🔑 Looking for password input...\n');
  
  const passwordInput = await page.$('input[type="password"]');
  if (passwordInput) {
    console.log('✅ Found input[type="password"]!');
    const passInfo = await passwordInput.evaluate(el => ({
      name: el.name,
      id: el.id,
      className: el.className
    }));
    console.log('Password field details:', passInfo);
  } else {
    console.log('❌ input[type="password"] NOT found');
  }
  
  // Check for alternative password fields
  const possiblePasswords = await page.$$('input');
  for (const input of possiblePasswords) {
    const attr = await input.evaluate(el => ({
      type: el.type,
      name: el.name?.toLowerCase() || '',
      id: el.id?.toLowerCase() || '',
      placeholder: el.placeholder?.toLowerCase() || ''
    }));
    
    if (attr.name.includes('pass') || attr.id.includes('pass') || 
        attr.placeholder.includes('pass')) {
      console.log(`⚠️  Possible password field found:`);
      console.log(`  type: ${attr.type}`);
      console.log(`  name: ${attr.name}`);
      console.log(`  id: ${attr.id}`);
    }
  }
  
  console.log('\n✅ Debug complete! Check screenshots/ folder');
  await browser.close();
}

debugLogin().catch(err => {
  console.error('❌ Debug failed:', err.message);
  process.exit(1);
});
