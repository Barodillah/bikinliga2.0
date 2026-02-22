import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const IS_PRODUCTION = process.env.DOKU_IS_PRODUCTION === 'true';
const DOKU_API_URL = IS_PRODUCTION ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
const DOKU_CLIENT_ID = IS_PRODUCTION ? process.env.DOKU_PROD_CLIENT_ID : process.env.DOKU_SANDBOX_CLIENT_ID;
const DOKU_SECRET_KEY = IS_PRODUCTION ? process.env.DOKU_PROD_SECRET_KEY : process.env.DOKU_SANDBOX_SECRET_KEY;

console.log(`DOKU: Mode=${IS_PRODUCTION ? 'PRODUCTION' : 'SANDBOX'}, ClientID=${DOKU_CLIENT_ID}`);

/**
 * Generate Digest (SHA-256 base64 of JSON body)
 */
function generateDigest(jsonBody) {
    return crypto
        .createHash('sha256')
        .update(jsonBody, 'utf8')
        .digest('base64');
}

/**
 * Generate DOKU HMAC-SHA256 Signature
 * Format from official docs:
 *   Client-Id:{clientId}\n
 *   Request-Id:{requestId}\n
 *   Request-Timestamp:{timestamp}\n
 *   Request-Target:{targetPath}\n
 *   Digest:{digest}
 */
function generateSignature(clientId, requestId, timestamp, targetPath, digest, secretKey) {
    const componentSignature =
        `Client-Id:${clientId}\n` +
        `Request-Id:${requestId}\n` +
        `Request-Timestamp:${timestamp}\n` +
        `Request-Target:${targetPath}\n` +
        `Digest:${digest}`;

    return crypto
        .createHmac('sha256', secretKey)
        .update(componentSignature)
        .digest('base64');
}

/**
 * Create DOKU Checkout Session
 * Docs: POST /checkout/v1/payment
 * Ref: https://developers.doku.com/accept-payments/doku-checkout/integration-guide/backend-integration
 */
export async function createCheckoutSession(params) {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString().split('.')[0] + 'Z';
    const targetPath = '/checkout/v1/payment';

    // Build payload per DOKU docs
    // order.amount: number, mandatory, IDR without decimal, max 12
    // order.invoice_number: string, mandatory, max 64
    const payload = {
        order: {
            amount: parseInt(params.amount),
            invoice_number: params.invoiceNumber,
            callback_url: params.callbackUrl
        },
        payment: {
            payment_due_date: 60
        }
    };

    // Add optional customer info
    if (params.customerName || params.customerEmail) {
        payload.customer = {};
        if (params.customerId) payload.customer.id = params.customerId;
        if (params.customerName) payload.customer.name = params.customerName;
        if (params.customerEmail) payload.customer.email = params.customerEmail;
        if (params.customerPhone) payload.customer.phone = params.customerPhone;
    }

    const jsonBody = JSON.stringify(payload);
    const digest = generateDigest(jsonBody);
    const signature = generateSignature(
        DOKU_CLIENT_ID,
        requestId,
        timestamp,
        targetPath,
        digest,
        DOKU_SECRET_KEY
    );

    const headers = {
        'Client-Id': DOKU_CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        'Signature': `HMACSHA256=${signature}`,
        'Content-Type': 'application/json'
    };

    console.log('DOKU: Requesting checkout...', { url: `${DOKU_API_URL}${targetPath}`, invoiceNumber: params.invoiceNumber, amount: params.amount });

    try {
        const response = await fetch(`${DOKU_API_URL}${targetPath}`, {
            method: 'POST',
            headers,
            body: jsonBody
        });

        const data = await response.json();
        console.log('DOKU: Response status:', response.status, 'body:', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('DOKU: Fetch error:', error.message);
        throw error;
    }
}

/**
 * Verify DOKU Notification Signature (Webhook)
 */
export function verifyNotificationSignature(reqHeaders, body, secretKey) {
    const clientId = reqHeaders['client-id'];
    const requestId = reqHeaders['request-id'];
    const timestamp = reqHeaders['request-timestamp'];
    const signatureHeader = reqHeaders['signature'];
    const receivedSignature = signatureHeader ? signatureHeader.replace('HMACSHA256=', '') : '';

    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const digest = generateDigest(bodyString);

    const componentSignature =
        `Client-Id:${clientId}\n` +
        `Request-Id:${requestId}\n` +
        `Request-Timestamp:${timestamp}\n` +
        `Request-Target:${reqHeaders['request-target'] || ''}\n` +
        `Digest:${digest}`;

    const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(componentSignature)
        .digest('base64');

    return computedSignature === receivedSignature;
}
