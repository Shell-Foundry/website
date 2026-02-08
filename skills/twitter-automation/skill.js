const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();

// Apply stealth plugin
chromium.use(stealth());

// Configuration
const CONFIG = {
  headless: process.env.HEADLESS !== 'false', // Set HEADLESS=false to see browser
  slowMo: parseInt(process.env.SLOW_MO) || 100,
  timeout: 30000,
  viewport: { width: 1920, height: 1080 }
};

// Human-like delays
const humanDelay = (min = 1000, max = 3000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Human-like typing
const humanType = async (page, selector, text) => {
  for (const char of text) {
    await page.type(selector, char, { delay: Math.random() * 100 + 50 });
  }
};

// Launch browser with anti-detection
async function launchBrowser() {
  console.log('🚀 Launching browser with stealth...');
  
  const browser = await chromium.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  // Add anti-detection scripts
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    window.chrome = { runtime: {} };
  });

  return { browser, context };
}

// Login to Twitter
async function login(page) {
  const username = process.env.TWITTER_USERNAME;
  const password = process.env.TWITTER_PASSWORD;
  const email = process.env.TWITTER_EMAIL;

  if (!username || !password) {
    throw new Error('TWITTER_USERNAME and TWITTER_PASSWORD required in .env');
  }

  console.log('🔐 Navigating to Twitter login...');
  await page.goto('https://x.com/login', { waitUntil: 'networkidle' });
  await humanDelay(2000, 4000);

  console.log('👤 Entering username...');
  await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
  await humanType(page, 'input[autocomplete="username"]', username);
  await humanDelay(500, 1500);
  
  // Click next
  await page.click('button[role="button"]:has-text("Next")');
  await humanDelay(2000, 4000);

  // Check for unusual activity (email verification)
  const emailInput = await page.$('input[data-testid="ocfEnterTextTextInput"]');
  if (emailInput && email) {
    console.log('📧 Email verification required...');
    await humanType(page, 'input[data-testid="ocfEnterTextTextInput"]', email);
    await humanDelay(500, 1500);
    await page.click('button[data-testid="ocfEnterTextNextButton"]');
    await humanDelay(2000, 4000);
  }

  console.log('🔑 Entering password...');
  await page.waitForSelector('input[name="password"]', { timeout: 10000 });
  await humanType(page, 'input[name="password"]', password);
  await humanDelay(500, 1500);

  console.log('➡️ Clicking login...');
  await page.click('button[data-testid="LoginForm_Login_Button"]');
  await humanDelay(3000, 5000);

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
    console.log('Waiting 30 seconds for manual entry...');
    await humanDelay(30000, 30000);
  }

  return false;
}

// Post a tweet
async function postTweet(text) {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();

  try {
    await login(page);
    
    console.log('📝 Composing tweet...');
    await page.goto('https://x.com/compose/tweet', { waitUntil: 'networkidle' });
    await humanDelay(2000, 4000);

    // Find and fill tweet box
    const tweetBox = await page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 10000 });
    await humanType(page, '[data-testid="tweetTextarea_0"]', text);
    await humanDelay(1000, 2000);

    console.log('📤 Clicking post button...');
    await page.click('button[data-testid="tweetButton"]');
    await humanDelay(3000, 5000);

    console.log('✅ Tweet posted successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error posting tweet:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Read timeline
async function readTimeline(count = 10) {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();

  try {
    await login(page);
    
    console.log('📜 Reading timeline...');
    await page.goto('https://x.com/home', { waitUntil: 'networkidle' });
    await humanDelay(3000, 5000);

    // Scroll to load tweets
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, 800);
      await humanDelay(2000, 4000);
    }

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
    return [];
  } finally {
    await browser.close();
  }
}

// Search tweets
async function searchTweets(query, count = 10) {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();

  try {
    await login(page);
    
    console.log(`🔍 Searching for: "${query}"...`);
    const encodedQuery = encodeURIComponent(query);
    await page.goto(`https://x.com/search?q=${encodedQuery}&src=typed_query&f=live`, { waitUntil: 'networkidle' });
    await humanDelay(3000, 5000);

    // Scroll to load results
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, 800);
      await humanDelay(2000, 4000);
    }

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
🐦 Twitter Automation Skill - FREE Version

Usage:
  node skill.js post "Your tweet text"     - Post a tweet
  node skill.js timeline [count]           - Read timeline (default: 10)
  node skill.js search "query"             - Search tweets

Environment Variables:
  TWITTER_USERNAME    - Your Twitter username
  TWITTER_PASSWORD    - Your Twitter password
  TWITTER_EMAIL       - Your email (for verification)
  HEADLESS=false      - Show browser window (for debugging)
  SLOW_MO=100         - Slow down actions by ms

Setup:
  1. Copy .env.example to .env
  2. Add your Twitter credentials
  3. Run: npm install
  4. Run: npx playwright install chromium
      `);
  }
}

main().catch(console.error);
