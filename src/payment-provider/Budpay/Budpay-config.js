import * as paymentProvider from 'interfaces-psp-v1-payment-service-provider';

/** @returns {import('interfaces-psp-v1-payment-service-provider').PaymentServiceProviderConfig} */
export function getConfig() {
  return {
    title: 'BudPay',
    paymentMethods: [{
      hostedPage: {
        title: 'BudPay',
        billingAddressMandatoryFields: ['EMAIL'],
        logos: {
          colored: {
            png: 'https://cdn.jsdelivr.net/gh/BudPay-Org/budpay-woo-commerce-plugin@main/assets/img/budpay.png'
          }
        }
      }
    }],
    credentialsFields: [{
      simpleField: {
        name: 'secret_key',
        label: 'Secret Key'
      }
    },
    {
      simpleField: {
        name: 'public_key',
        label: 'Public Key'
      }
    }
    ]
  };
}