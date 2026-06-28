export interface Location {
  lat: number;
  lng: number;
}

export interface CapturedImage {
  dataUrl: string;
  file: File;
}

export interface DonationFormData {
  fullName: string;
  phone: string;
  donationType: string;
  description: string;
  quantity: string;
  region: string;
  location: Location | null;
  images: CapturedImage[];
}

export interface ValidationErrors {
  fullName?: string;
  phone?: string;
  donationType?: string;
  description?: string;
  quantity?: string;
  region?: string;
}

export const DONATION_TYPES = [
  { value: 'furniture', label: 'أثاث' },
  { value: 'electronics', label: 'أجهزة إلكترونية' },
  { value: 'clothes', label: 'ملابس' },
  { value: 'food', label: 'مواد غذائية' },
  { value: 'medical', label: 'معدات طبية' },
  { value: 'other', label: 'أخرى' },
];

export const REGIONS = [
  'الدمام',
  'الخبر',
  'الجبيل',
  'الأحساء',
  'بقيق',
  'القطيف',
  'رأس تنورة',
  'الخفجي',
  'النعيرية',
];
