const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Apply stealth plugin
chromium.use(stealth());

// Screenshot directory
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Configuration
const CONFIG = {
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO) || 300,
  timeout: 60000,
  viewport: { 
    width: 1920 + Math.floor(Math.random() * 100), 
    height: 1080 + Math.floor(Math.random() * 50) 
  }
};

// Timestamp for screenshots
const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

// Human-like delays with randomization
const humanDelay = async (page, min = 1000, max = 4000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`   ⏱️  Waiting ${delay}ms...`);
  await page.waitForTimeout(delay);
};

// Random mouse movements
const humanMouseMove = async (page) => {
  const x = Math.floor(Math.random() * CONFIG.viewport.width * 0.8) + 100;
  const y = Math.floor(Math.random() * CONFIG.viewport.height * 0.6) + 100;
  console.log(`   🖱️  Moving mouse to (${x}, ${y})`);
  await page.mouse.move(x, y, { steps: 10 + Math.floor(Math.random() * 10) });
  await page.waitForTimeout(Math.random() * 500 + 200);
};

// Human-like scrolling
const humanScroll = async (page, direction = 'down', amount = null) => {
  const scrollAmount = amount || Math.floor(Math.random() * 400) + 300;
  const scrollY = direction === 'down' ? scrollAmount : -scrollAmount;
  console.log(`   📜 Scrolling ${direction} ${scrollAmount}px...`);
  
  // Multiple small scrolls (more human-like)
  const steps = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, scrollY / steps);
    await page.waitForTimeout(Math.random() * 300 + 100);
  }
  await page.waitForTimeout(Math.random() * 500 + 200);
};

// Human-like typing with mistakes and corrections
const humanType = async (page, selector, text) => {
  console.log(`   ⌨️  Typing "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"...`);
  
  // Click the field first
  await page.click(selector);
  await humanDelay(page, 200, 500);
  
  // Type with variable delays
  for (const char of text) {
    // 5% chance of "mistake" - type wrong char then backspace
    if (Math.random() < 0.05 && char !== ' ') {
      const wrongChar = String.fromCharCode(char.charCodeAt(0) + 1);
      await page.type(selector, wrongChar, { delay: Math.random() * 100 + 50 });
      await page.waitForTimeout(Math.random() * 200 + 100);
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(Math.random() * 150 + 100);
    }
    
    await page.type(selector, char, { delay: Math.random() * 120 + 40 });
    
    // Occasionally pause (like thinking)
    if (Math.random() < 0.1) {
      await page.waitForTimeout(Math.random() * 500 + 200);
    }
  }
};

// Take screenshot for debugging
const screenshot = async (page, name) => {
  const filePath = path.join(SCREENSHOT_DIR, `${timestamp()}_${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`   📸 Screenshot saved: ${filePath}`);
  return filePath;
};

// Launch browser with anti-detection
async function launchBrowser() {
  console.log('🚀 Launching browser with stealth...');
  console.log(`   📐 Viewport: ${CONFIG.viewport.width}x${CONFIG.viewport.height}`);
  
  const browser = await chromium.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=' + CONFIG.viewport.width + ',' + CONFIG.viewport.height
    ]
  });

  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { latitude: 40.7128, longitude: -74.0060 }, // NYC
    permissions: ['geolocation']
  });

  // Add anti-detection scripts
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [
      { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
      { name: 'Native Client', filename: 'internal-nacl-plugin' },
      { name: 'Widevine Content Decryption Module', filename: 'widevinecdmadapter.dll' }
    ]});
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    window.chrome = { runtime: {} };
    
    // Override canvas fingerprint
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function(...args) {
      const imageData = originalGetImageData.apply(this, args);
      // Add slight noise
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (Math.random() < 0.01) {
          imageData.data[i] = Math.min(255, imageData.data[i] + 1);
        }
      }
      return imageData;
    };
  });

  return { browser, context };
}

// Login to Twitter with human-like behavior
async function login(page) {
  const username = process.env.TWITTER_USERNAME;
  const password = process.env.TWITTER_PASSWORD;
  const email = process.env.TWITTER_EMAIL;

  if (!username || !password) {
    throw new Error('TWITTER_USERNAME and TWITTER_PASSWORD required in .env');
  }

  console.log('🔐 Navigating to Twitter login (mobile version)...');
  await page.goto('https://mobile.x.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await screenshot(page, '01_login_page');
  await humanDelay(page, 2000, 4000);

  // Random mouse movement
  await humanMouseMove(page);

  console.log('👤 Entering username...');
  await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
  await humanType(page, 'input[autocomplete="username"]', username);
  await humanDelay(page, 500, 1500);
  
  // Click next
  console.log('➡️ Clicking Next...');
  await humanMouseMove(page);
  await page.click('button[role="button"]:has-text("Next")');
  await humanDelay(page, 2000, 4000);
  await screenshot(page, '02_after_username');

  // Check for unusual activity (email verification)
  const emailInput = await page.$('input[data-testid="ocfEnterTextTextInput"]');
  if (emailInput && email) {
    console.log('📧 Email verification required...');
    await humanType(page, 'input[data-testid="ocfEnterTextTextInput"]', email);
    await humanDelay(page, 500, 1500);
    await page.click('button[data-testid="ocfEnterTextNextButton"]');
    await humanDelay(page, 2000, 4000);
  }

  console.log('🔑 Entering password...');
  // Mobile site uses different selector
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  await humanType(page, 'input[type="password"]', password);
  await humanDelay(page, 500, 1500);

  console.log('➡️ Clicking login...');
  await humanMouseMove(page);
  // Mobile: try multiple selectors for login button
  try {
    await page.click('div[role="button"]:has-text("Log in")');
  } catch {
    await page.click('input[type="submit"]');
  }
  await humanDelay(page, 4000, 7000);
  await screenshot(page, '03_after_login');

  // Check if login successful
  const homeButton = await page.$('a[data-testid="AppTabBar_Home_Link"]');
  if (homeButton) {
    console.log('✅ Login successful!');
    return true;
  }

  // Check for 2FA
  const twoFAInput = await page.$('input[data-testid="ocfEnterTextTextInput"]');
  if (twoFAInput) {
    console.log('⚠️ 2FA required. Check your authenticator app or email.');
    await screenshot(page, '04_2fa_required');
    return false;
  }

  // Check for suspicious activity
  const suspiciousText = await page.$('text="Suspicious activity"');
  if (suspiciousText) {
    console.log('⚠️ Twitter detected suspicious activity!');
    await screenshot(page, '04_suspicious_activity');
    return false;
  }

  return false;
}

// Post a tweet with human-like behavior
async function postTweet(text) {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();

  try {
    const loggedIn = await login(page);
    if (!loggedIn) {
      console.error('❌ Login failed - check screenshots');
      return false;
    }
    
    console.log('📝 Navigating to compose tweet...');
    await humanMouseMove(page);
    await page.goto('https://x.com/compose/tweet', { waitUntil: 'networkidle', timeout: 30000 });
    await humanDelay(page, 3000, 5000);
    await screenshot(page, '05_compose_page');

    // Scroll down a bit (like reading the page)
    await humanScroll(page, 'down', 200);

    console.log('✍️ Composing tweet...');
    const tweetBox = await page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 10000 });
    await humanMouseMove(page);
    await humanType(page, '[data-testid="tweetTextarea_0"]', text);
    await humanDelay(page, 1000, 3000);
    await screenshot(page, '06_tweet_composed');

    console.log('📤 Clicking post button...');
    await humanMouseMove(page);
    await page.click('button[data-testid="tweetButton"]');
    await humanDelay(page, 4000, 6000);
    await screenshot(page, '07_tweet_posted');

    // Verify post was successful
    const successIndicator = await page.$('text="Your post was sent"') || 
                            await page.$('[data-testid="toast"]');
    
    if (successIndicator) {
      console.log('✅ Tweet posted successfully!');
      return true;
    }

    console.log('⚠️ Could not verify tweet was posted - check screenshots');
    return false;

  } catch (error) {
    console.error('❌ Error posting tweet:', error.message);
    await screenshot(page, 'ERROR_' + error.message.substring(0, 30));
    return false;
  } finally {
    await browser.close();
  }
}

// Read timeline with human-like behavior
async function readTimeline(count = 10) {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();

  try {
    const loggedIn = await login(page);
    if (!loggedIn) {
      console.error('❌ Login failed');
      return [];
    }
    
    console.log('📜 Reading timeline...');
    await page.goto('https://x.com/home', { waitUntil: 'networkidle', timeout: 30000 });
    await humanDelay(page, 3000, 5000);
    await screenshot(page, '05_timeline');

    // Scroll to load tweets (human-like)
    for (let i = 0; i < 4; i++) {
      await humanScroll(page, 'down', Math.random() * 500 + 400);
      await humanDelay(page, 2000, 4000);
      
      // Occasionally scroll back up (like re-reading)
      if (Math.random() < 0.3) {
        await humanScroll(page, 'up', 200);
        await humanDelay(page, 1000, 2000);
        await humanScroll(page, 'down', 300);
      }
    }
    
    await screenshot(page, '06_timeline_scrolled');

    // Extract tweets
    const tweets = await page.evaluate((maxCount) => {
      const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
      const results = [];
      
      for (let i = 0; i < Math.min(tweetElements.length, maxCount); i++) {
        const tweet = tweetElements[i];
        const textEl = tweet.querySelector('[data-testid="tweetText"]');
        const userEl = tweet.querySelector('[data-testid="User-Names"]');
        
        if (textEl && userEl) {
          results.push({
            user: userEl.innerText.split('\n')[0],
            text: textEl.innerText,
            time: tweet.querySelector('time')?.getAttribute('datetime') || 'unknown'
          });
        }
      }
      
      return results;
    }, count);

    console.log(`\n📊 Found ${tweets.length} tweets:\n`);
    tweets.forEach((tweet, i) => {
      console.log(`${i + 1}. @${tweet.user} (${tweet.time}):`);
      console.log(`   ${tweet.text.substring(0, 100)}${tweet.text.length > 100 ? '...' : ''}\n`);
    });

    return tweets;

  } catch (error) {
    console.error('❌ Error reading timeline:', error.message);
    await screenshot(page, 'ERROR_' + error.message.substring(0, 30));
    return [];
  } finally {
    await browser.close();
  }
}

// Search tweets with human-like behavior
async function searchTweets(query, count = 10) {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();

  try {
    const loggedIn = await login(page);
    if (!loggedIn) {
      console.error('❌ Login failed');
      return [];
    }
    
    console.log(`🔍 Searching for: "${query}"...`);
    const encodedQuery = encodeURIComponent(query);
    await page.goto(`https://x.com/search?q=${encodedQuery}&src=typed_query&f=live`, { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    await humanDelay(page, 3000, 5000);
    await screenshot(page, '05_search_results');

    // Scroll to load results
    for (let i = 0; i < 4; i++) {
      await humanScroll(page, 'down', Math.random() * 500 + 400);
      await humanDelay(page, 2000, 4000);
    }
    
    await screenshot(page, '06_search_scrolled');

    // Extract tweets
    const tweets = await page.evaluate((maxCount) => {
      const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
      const results = [];
      
      for (let i = 0; i < Math.min(tweetElements.length, maxCount); i++) {
        const tweet = tweetElements[i];
        const textEl = tweet.querySelector('[data-testid="tweetText"]');
        const userEl = tweet.querySelector('[data-testid="User-Names"]');
        
        if (textEl && userEl) {
          results.push({
            user: userEl.innerText.split('\n')[0],
            text: textEl.innerText,
            time: tweet.querySelector('time')?.getAttribute('datetime') || 'unknown'
          });
        }
      }
      
      return results;
    }, count);

    console.log(`\n📊 Found ${tweets.length} tweets for "${query}":\n`);
    tweets.forEach((tweet, i) => {
      console.log(`${i + 1}. @${tweet.user} (${tweet.time}):`);
      console.log(`   ${tweet.text.substring(0, 100)}${tweet.text.length > 100 ? '...' : ''}\n`);
    });

    return tweets;

  } catch (error) {
    console.error('❌ Error searching tweets:', error.message);
    await screenshot(page, 'ERROR_' + error.message.substring(0, 30));
    return [];
  } finally {
    await browser.close();
  }
}

// CLI interface
async function main() {
  const [,, command, ...args] = process.argv;

  switch (command) {
    case 'post':
      if (!args.length) {
        console.error('Usage: node skill.js post "Your tweet text"');
        process.exit(1);
      }
      await postTweet(args.join(' '));
      break;

    case 'timeline':
      await readTimeline(parseInt(args[0]) || 10);
      break;

    case 'search':
      if (!args.length) {
        console.error('Usage: node skill.js search "your query"');
        process.exit(1);
      }
      await searchTweets(args.join(' '), 10);
      break;

    default:
      console.log(`
🐦 Twitter Automation Skill - FREE Version (Enhanced Human-Like)

Usage:
  node skill.js post "Your tweet text"     - Post a tweet
  node skill.js timeline [count]           - Read timeline (default: 10)
  node skill.js search "query"             - Search tweets

Features:
  ✅ Human-like mouse movements
  ✅ Random delays and typing speeds
  ✅ Realistic scrolling patterns
  ✅ Occasional "mistakes" with corrections
  ✅ Variable viewport sizes
  ✅ Screenshots for debugging
  ✅ Canvas fingerprint randomization

Environment Variables:
  TWITTER_USERNAME    - Your Twitter username
  TWITTER_PASSWORD    - Your Twitter password
  TWITTER_EMAIL       - Your email (for verification)
  HEADLESS=true       - Run without GUI (set false to see browser)
  SLOW_MO=300         - Base delay between actions

Screenshots saved to: ./screenshots/
      `);
  }
}

main().catch(console.error);
