/**
 * Example: How to integrate ClawPay into YOUR skill
 * 
 * This shows how skill developers can require payment
 * before providing their service.
 */

const { ClawPaySkill } = require('./skill.js');

class ExamplePaidSkill {
  constructor() {
    this.skillId = 'example-skill-v1';
    this.clawpay = new ClawPaySkill('testnet'); // or 'mainnet'
    this.price = '5.00'; // USDC
  }

  /**
   * Main entry point - checks payment before executing
   */
  async execute(userAddress, userRequest) {
    // Step 1: Check if user has paid
    const access = await this.clawpay.checkAccess(this.skillId, userAddress);
    
    if (!access.success) {
      return {
        success: false,
        error: 'Payment check failed: ' + access.error
      };
    }

    if (!access.hasAccess) {
      // User hasn't paid - show payment instructions
      const paymentInfo = await this.clawpay.generatePaymentInstructions(
        this.skillId, 
        userAddress
      );

      return {
        success: false,
        requiresPayment: true,
        message: `This skill costs ${this.price} USDC`,
        instructions: paymentInfo.instructions,
        contractAddress: paymentInfo.contractAddress,
        skillId: this.skillId
      };
    }

    // Step 2: User has paid - provide the service
    return await this.provideService(userRequest);
  }

  /**
   * The actual skill functionality (only runs after payment)
   */
  async provideService(userRequest) {
    // Your skill logic here
    return {
      success: true,
      message: 'Thank you for your payment! Here is your service...',
      data: {
        result: 'Service completed',
        request: userRequest
      }
    };
  }
}

// Example usage
async function demo() {
  const skill = new ExamplePaidSkill();
  const userAddress = '0x1234567890123456789012345678901234567890';
  
  console.log('Testing paid skill...\n');
  
  // First call - user hasn't paid
  const result1 = await skill.execute(userAddress, 'Do something');
  console.log('First call (no payment):', result1);
  
  // After user pays (simulated), second call works
  // const result2 = await skill.execute(userAddress, 'Do something');
  // console.log('Second call (after payment):', result2);
}

// Run demo if called directly
if (require.main === module) {
  demo().catch(console.error);
}

module.exports = { ExamplePaidSkill };
