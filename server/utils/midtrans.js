import midtransClient from 'midtrans-client';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;

console.log(`MIDTRANS: Mode=${IS_PRODUCTION ? 'PRODUCTION' : 'SANDBOX'}, ClientKey=${CLIENT_KEY}`);

// Snap API instance
const snap = new midtransClient.Snap({
    isProduction: IS_PRODUCTION,
    serverKey: SERVER_KEY,
    clientKey: CLIENT_KEY
});

// Core API instance (for status check)
const coreApi = new midtransClient.CoreApi({
    isProduction: IS_PRODUCTION,
    serverKey: SERVER_KEY,
    clientKey: CLIENT_KEY
});

/**
 * Create Midtrans Snap Transaction
 * Returns { token, redirect_url }
 */
export async function createSnapTransaction(params) {
    const parameter = {
        transaction_details: {
            order_id: params.orderId,
            gross_amount: parseInt(params.amount)
        },
        credit_card: {
            secure: process.env.MIDTRANS_3DS === 'true'
        }
    };

    // Add optional customer details
    if (params.customerName || params.customerEmail) {
        parameter.customer_details = {};
        if (params.customerName) {
            const nameParts = params.customerName.split(' ');
            parameter.customer_details.first_name = nameParts[0] || '';
            parameter.customer_details.last_name = nameParts.slice(1).join(' ') || '';
        }
        if (params.customerEmail) parameter.customer_details.email = params.customerEmail;
        if (params.customerPhone) parameter.customer_details.phone = params.customerPhone;
        // Also add billing address if available
        if (params.billingAddress) {
            parameter.customer_details.billing_address = params.billingAddress;
        }
    }

    // Add item details if provided
    if (params.itemDetails) {
        parameter.item_details = params.itemDetails;
    }

    // Add callbacks
    if (params.callbackUrl) {
        parameter.callbacks = {
            finish: params.callbackUrl
        };
    }

    // Add custom fields
    if (params.customFields) {
        if (params.customFields.custom_field1) parameter.custom_field1 = params.customFields.custom_field1;
        if (params.customFields.custom_field2) parameter.custom_field2 = params.customFields.custom_field2;
        if (params.customFields.custom_field3) parameter.custom_field3 = params.customFields.custom_field3;
    }

    console.log('MIDTRANS: Creating Snap transaction...', {
        orderId: params.orderId,
        amount: params.amount
    });

    try {
        const transaction = await snap.createTransaction(parameter);
        console.log('MIDTRANS: Snap token created:', transaction.token);
        return transaction; // { token, redirect_url }
    } catch (error) {
        console.error('MIDTRANS: Create transaction error:', error.message);
        throw error;
    }
}

/**
 * Verify Midtrans Notification Signature Key
 * signature_key = SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifySignatureKey(notification) {
    const { order_id, status_code, gross_amount, signature_key } = notification;

    const payload = order_id + status_code + gross_amount + SERVER_KEY;
    const computedSignature = crypto
        .createHash('sha512')
        .update(payload)
        .digest('hex');

    return computedSignature === signature_key;
}

/**
 * Get Transaction Status from Midtrans
 * Returns full transaction status object
 */
export async function getTransactionStatus(orderId) {
    try {
        const statusResponse = await coreApi.transaction.status(orderId);
        console.log('MIDTRANS: Status response for', orderId, ':', statusResponse.transaction_status);
        return statusResponse;
    } catch (error) {
        if (error.httpStatusCode === 404 || (error.data && error.data.status_code === '404')) {
            console.log(`MIDTRANS: Transaction ${orderId} is not fully created in midtrans yet (404).`);
            return { transaction_status: 'pending' }; // Treat 404 from midtrans as still pending
        }
        console.error('MIDTRANS: Check status error:', error.message);
        throw error;
    }
}

/**
 * Map Midtrans transaction_status to internal status
 * settlement/capture → 'success'
 * pending → 'pending'
 * expire/cancel/deny/failure → 'failed'
 */
export function mapMidtransStatus(transactionStatus) {
    const status = (transactionStatus || '').toLowerCase();
    if (status === 'settlement' || status === 'capture') return 'success';
    if (status === 'pending') return 'pending';
    return 'failed'; // expire, cancel, deny, failure, etc.
}
