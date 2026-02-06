import { Decimal } from "@prisma/client/runtime/client";

class PaymentService {
  async processPayment(
    customerId: string,
    amount: Decimal
  ): Promise<{ success: boolean; transactionId?: string }> {
    console.log(`Processing payment of ${amount} for customer ${customerId}...`);
    return { success: true, transactionId: `txn_${Date.now()}` };
  }
}

export const paymentService = new PaymentService();

