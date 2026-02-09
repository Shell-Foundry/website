const { chromium } = require('playwright');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

async function testApproach3() {
  console.log('TESTING APPROACH 3: Mobile + Enter Key\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  // Step 1: Load login page
  console.log('Step 1: Loading mobile.x.com/login...');
  await page.goto('https://mobile.x.com/login', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  await page.screenshot({ 
    path: path.join(SCREENSHOT_DIR, 'approach3_step1_initial.png'),
    fullPage: true 
  });
  console.log('Screenshot 1: Initial page saved\n');

  // Step 2: Fill username
  console.log('Step 2: Filling username...');
  const username = process.env.TWITTER_USERNAME;
  await page.fill('input[autocomplete="username"]', username);
  await page.waitForTimeout(3000);
  await page.screenshot({ 
    path: path.join(SCREENSHOT_DIR, 'approach3_step2_username.png'),
    fullPage: true 
  });
  console.log('Screenshot 2: After username entered\n');

  // Step 3: Look for password field
  console.log('Step 3: Looking for password field...');
  try {
    const passwordField = await page.waitForSelector('input[type="password"]', { 
      timeout: 10000 
    });
    const password = process.env.TWITTER_PASSWORD;
    await passwordField.fill(password);
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'approach3_step3_password.png'),
      fullPage: true 
    });
    console.log('Screenshot 3: Password filled\n');

    // Step 4: Press Enter to submit
    console.log('Step 4: Pressing Enter to submit...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'approach3_step4_submitted.png'),
      fullPage: true 
    });
    console.log('Screenshot 4: After submission\n');

    // Check if logged in
    const url = page.url();
    console.log('Current URL:', url);
    if (url.includes('home')) {
      console.log('SUCCESS: Logged in!');
    } else {
      console.log('Check screenshots to see what happened');
    }

  } catch (error) {
    console.log('Error:', error.message);
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'approach3_error.png'),
      fullPage: true 
    });
    console.log('Error screenshot saved');
  }

  await browser.close();
  console.log('Test complete! Check screenshots/ folder');
}

testApproach3();
