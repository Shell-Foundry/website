// API endpoint to handle skill registration submissions
// Stores submission and notifies admin

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

    // Log submission (in production, store in database)
    console.log('New skill registration:', enrichedSubmission);

    // TODO: Send notification to admin
    // This could be:
    // - Email via SendGrid/AWS SES
    // - Telegram bot message
    // - Slack webhook
    // - Store in database for admin dashboard
    
    // For now, we'll just return success
    // The admin (you) can check logs or we can add a dashboard later

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
