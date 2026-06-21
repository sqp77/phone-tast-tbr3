import { DonationFormData } from '../types/donation';

export interface DonationSubmitResponse {
  success: boolean;
  message: string;
  id?: string;
}

const buildFormPayload = (data: DonationFormData): FormData => {
  const payload = new FormData();
  payload.append('fullName', data.fullName);
  payload.append('phone', data.phone);
  payload.append('donationType', data.donationType);
  payload.append('description', data.description);
  payload.append('quantity', data.quantity);
  payload.append('region', data.region);
  if (data.location) {
    payload.append('latitude', String(data.location.lat));
    payload.append('longitude', String(data.location.lng));
  }
  data.images.forEach((file, i) => payload.append(`image_${i}`, file));
  return payload;
};

export const donationService = {
  async submit(data: DonationFormData): Promise<DonationSubmitResponse> {
    // Replace with your actual API endpoint
    const API_URL = import.meta.env.VITE_API_URL ?? '/api/donations';

    const payload = buildFormPayload(data);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json() as Promise<DonationSubmitResponse>;
  },
};
