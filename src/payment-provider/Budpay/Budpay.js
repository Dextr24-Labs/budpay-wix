import * as paymentProvider from 'interfaces-psp-v1-payment-service-provider';

/**
 * This payment plugin endpoint is triggered when a merchant provides required data to connect their PSP account to a Wix site.
 * The plugin has to verify merchant's credentials, and ensure the merchant has an operational PSP account.
 * @param {import('interfaces-psp-v1-payment-service-provider').ConnectAccountOptions} options
 * @param {import('interfaces-psp-v1-payment-service-provider').Context} context
 * @returns {Promise<import('interfaces-psp-v1-payment-service-provider').ConnectAccountResponse | import('interfaces-psp-v1-payment-service-provider').BusinessError>}
 */
export const connectAccount = async (options, context) => {
    const { credentials } = options;

    return {
        credentials
    }
};

/**
 * This payment plugin endpoint is triggered when a buyer pays on a Wix site.
 * The plugin has to process this payment request but prevent double payments for the same `wixTransactionId`.
 * @param {import('interfaces-psp-v1-payment-service-provider').CreateTransactionOptions} options
 * @param {import('interfaces-psp-v1-payment-service-provider').Context} context
 * @returns {Promise<import('interfaces-psp-v1-payment-service-provider').CreateTransactionResponse | import('interfaces-psp-v1-payment-service-provider').BusinessError>}
 */
export const createTransaction = async (options, context) => {
    let baseUrl = 'https://api.budpay.com/';

    if (!options.merchantCredentials || !options.merchantCredentials.secret_key) {
        return {
            reasonCode: 3001,
            errorCode: 'CREDENTIALS_MISSING',
            errorMessage: 'Merchant credentials are missing. Please reconnect BudPay.'
        };
    }

    const payment_request = {
        currency: options.order.description.currency,
        callback: options.order.returnUrls.successUrl,
        email: options.order.description.billingAddress.email,
        amount: (options.order.description.totalAmount / 100).toFixed(2),
        reference: options.wixTransactionId,
    };

    console.log(payment_request);

    const response = await fetch(
        baseUrl + "api/v2/transaction/initialize",
        {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + options.merchantCredentials.secret_key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payment_request),
        }
    );

    const json = await response.json();
    console.log(`BudPay response JSON: ${JSON.stringify(json, null, 2)}`);
    return {
            pluginTransactionId: json.data.reference,
            redirectUrl: json.data.authorization_url,
        }
};

/**
 * This payment plugin endpoint is triggered when a merchant refunds a payment made on a Wix site.
 * The plugin has to process this refund request but prevent double refunds for the same `wixRefundId`.
 * @param {import('interfaces-psp-v1-payment-service-provider').RefundTransactionOptions} options
 * @param {import('interfaces-psp-v1-payment-service-provider').Context} context
 * @returns {Promise<import('interfaces-psp-v1-payment-service-provider').CreateRefundResponse | import('interfaces-psp-v1-payment-service-provider').BusinessError>}
 */
export const refundTransaction = async (options, context) => {};
