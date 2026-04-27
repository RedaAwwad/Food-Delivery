import { NotFoundError } from '../utils/errors/error-factories';
import { preferredPaymentSettingsRepository } from '../repositories/PreferredPaymentSettingsRepository';

export class PreferredPaymentSettingsService {
    async getCustomerSettings(customerId: string) {
        const settings = await preferredPaymentSettingsRepository.findByCustomerId(customerId);
        if (!settings) throw NotFoundError("Customer payment settings");
        return settings;
    }
}

export const preferredPaymentSettingsService = new PreferredPaymentSettingsService();
