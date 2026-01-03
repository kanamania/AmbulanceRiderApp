import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';

export interface PricingMatrix {
  id: number;
  name: string;
  // Add other fields as needed
}

class PricingService {
  async getAllPricingMatrices(): Promise<PricingMatrix[]> {
    try {
      const response = await apiService.get<PricingMatrix[]>(API_CONFIG.ENDPOINTS.PRICING.LIST);
      return response;
    } catch (error) {
      console.error('Error fetching pricing matrices:', error);
      throw new Error('Failed to fetch pricing matrices');
    }
  }
}

export default new PricingService();
