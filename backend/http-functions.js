import { ok, badRequest } from 'wix-http-functions';
import wixPaymentProviderBackend from "wix-payment-provider-backend";

//https://24dextr.wixstudio.com/test-budpay/_functions/updateTransaction
export async function post_updateTransaction(request) {
  const transactionRequestBody = await request.body.json();

  console.log(transactionRequestBody);

  // Validate the request content.
  if (transactionRequestBody.notifyType === "successful") {
    // Update the transaction status on your site. This code assumes that the Wix
    // transaction ID and the payment provider's transaction ID are included in
    // the URL as query parameters.
    await wixPaymentProviderBackend.submitEvent({
      event: {
        transaction: {
          wixTransactionId: transactionRequestBody.data.metadata,
          pluginTransactionId: transactionRequestBody.data.reference,
        },
      },
    });
    return ok();
  } else {
    return badRequest();
  }
}