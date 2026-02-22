
import 'dotenv/config';
import { createCheckoutSession } from './server/utils/doku.js';

async function testDoku() {
    console.log('=== Testing DOKU Checkout API ===');
    console.log('Client ID:', process.env.DOKU_CLIENT_ID);
    console.log('Secret Key:', process.env.DOKU_SECRET_KEY ? '***' + process.env.DOKU_SECRET_KEY.slice(-4) : 'MISSING');
    console.log('API URL:', process.env.DOKU_API_URL || 'https://api-sandbox.doku.com');
    console.log('');

    try {
        const result = await createCheckoutSession({
            amount: 15000,
            invoiceNumber: 'TEST-' + Date.now(),
            customerId: 'user-test-123',
            customerName: 'Test User',
            customerEmail: 'test@bikinliga.online',
            customerPhone: '081234567890'
        });

        console.log('');
        console.log('=== RESULT ===');
        console.log(JSON.stringify(result, null, 2));

        if (result.response?.payment?.url) {
            console.log('');
            console.log('SUCCESS! Payment URL:', result.response.payment.url);
        } else {
            console.log('');
            console.log('FAILED: No payment URL in response');
        }
    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testDoku();
