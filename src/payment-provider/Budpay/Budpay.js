import * as paymentProvider from 'interfaces-psp-v1-payment-service-provider';
import { fetch } from 'wix-fetch';
import { v4 as uuidv4 } from 'uuid';

const baseUrl = 'https://api.budpay.com/';

/**
 * This payment plugin endpoint is triggered when a merchant provides required data to connect their PSP account to a Wix site.
 * The plugin has to verify merchant's credentials, and ensure the merchant has an operational PSP account.
 * @param {import('interfaces-psp-v1-payment-service-provider').ConnectAccountOptions} options
 * @param {import('interfaces-psp-v1-payment-service-provider').Context} context
 * @returns {Promise<import('interfaces-psp-v1-payment-service-provider').ConnectAccountResponse | import('interfaces-psp-v1-payment-service-provider').BusinessError>}
 */
export const connectAccount = async (options, context) => {
    let returnObj = {
        credentials: options.credentials,
    };

    const response = await fetch('https://api-pilot.budpay.com/api/v2/business-name', {
        method: "get",
        headers: {
            'authorization': `Bearer ${options.credentials.secret_key}`,
            'content-type': 'application/json'
        }
    });

    const responseData = await response.json();

    if (response.status === 200) {
        returnObj.accountId = String(responseData.data.id);
        returnObj.accountName = responseData.data.name;
    } else {
        returnObj.errorCode = 'INVALID_CREDENTIALS';
        returnObj.reasonCode = 2004;
        returnObj.errorMessage = "The API keys you provided are incorrect. Please check and retry.";
    }

    return returnObj;
};

/**
 * This payment plugin endpoint is triggered when a buyer pays on a Wix site.
 * The plugin has to process this payment request but prevent double payments for the same `wixTransactionId`.
 * @param {import('interfaces-psp-v1-payment-service-provider').CreateTransactionOptions} options
 * @param {import('interfaces-psp-v1-payment-service-provider').Context} context
 * @returns {Promise<import('interfaces-psp-v1-payment-service-provider').CreateTransactionResponse | import('interfaces-psp-v1-payment-service-provider').BusinessError>}
 */
export const createTransaction = async (options, context) => {
    const transactionReference = uuidv4();

    const payment_request = {
        currency: options.order.description.currency,
        email: options.order.description.billingAddress.email,
        callback: options.order.returnUrls.successUrl,
        amount: (options.order.description.totalAmount / 100).toFixed(2),
        reference: transactionReference,
        metadata: {
            wixTransactionId: options.wixTransactionId,
        }
    };

    console.log(payment_request);

    const response = await fetch(
        baseUrl + "api/v2/transaction/initialize", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${options.merchantCredentials.secret_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payment_request),
        }
    );

    const json = await response.json();
    console.log(`BudPay response JSON: ${JSON.stringify(json, null, 2)}`);
    
    if (response.status === 200){
        return {
            pluginTransactionId: json.data.reference,
            redirectUrl: json.data.authorization_url,
        };
    }else{
        return {
            errorCode: 'CHECKOUT_ERROR',
            reasonCode: 6000,
            errorMessage: 'We are unable to connect to the provider. Please re-initiate the payment.'
        }
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