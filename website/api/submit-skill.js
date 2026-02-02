// API endpoint to handle skill registration submissions
// Stores submission and notifies admin via Telegram

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const submission = req.body;
    
    // Validate required fields
    const required = ['developerName', 'walletAddress', 'contact', 'skillId', 'skillName', 'description', 'price'];
    for (const field of required) {
      if (!submission[field]) {
        return res.status(400).json({ 
          error: 'Missing required field',
          field: field 
        });
      }
    }

    // Validate wallet address format
    if (!submission.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        error: 'Invalid wallet address',
        message: 'Must be a valid Ethereum address (0x...)'
      });
    }

    // Validate skill ID format
    if (!submission.skillId.match(/^[a-z0-9-]+$/)) {
      return res.status(400).json({
        error: 'Invalid skill ID',
        message: 'Must be lowercase letters, numbers, and hyphens only'
      });
    }

    // Add timestamp and ID
    const enrichedSubmission = {
      ...submission,
      id: `reg-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Log submission
    console.log('New skill registration:', enrichedSubmission);

    // Send Telegram notification
    await sendTelegramNotification(enrichedSubmission);

    return res.status(200).json({
      success: true,
      message: 'Registration submitted successfully',
      registrationId: enrichedSubmission.id,
      nextSteps: [
        'Review submission within 24 hours',
        'Register skill on Base Mainnet contract',
        'Notify developer when live'
      ]
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process registration'
    });
  }
}

async function sendTelegramNotification(submission) {
  // Get environment variables
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7764891688';

  if (!TELEGRAM_BOT_TOKEN) {
    console.log('Telegram bot token not configured, skipping notification');
    return;
  }

  const message = `
🐚 *New Skill Registration!*

*Developer:* ${submission.developerName}
*Skill ID:* \`${submission.skillId}\`
*Skill Name:* ${submission.skillName}
*Price:* $${submission.price} USDC
*Wallet:* \`${submission.walletAddress}\`
*Contact:* ${submission.contact}

*Description:*
${submission.description.substring(0, 200)}${submission.description.length > 200 ? '...' : ''}

${submission.repoUrl ? `*Repo:* ${submission.repoUrl}` : ''}

Registration ID: \`${submission.id}\`
Submitted: ${new Date(submission.submittedAt).toLocaleString()}

[Register on Remix](https://remix.ethereum.org)
`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram notification failed:', errorText);
    } else {
      console.log('Telegram notification sent successfully');
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}
