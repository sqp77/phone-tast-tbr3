export const STATS = [
  { value: '1,247', label: 'تبرع مقبول',    color: '#00632c', bg: '#e6f4ec' },
  { value: '389',   label: 'عائلة مستفادة', color: '#2563eb', bg: '#eff6ff' },
  { value: '9',     label: 'مدن مغطاة',     color: '#7c3aed', bg: '#f5f3ff' },
];

export const CATEGORIES = [
  { value: 'furniture',   label: 'أثاث',         emoji: '🛋️' },
  { value: 'clothes',     label: 'ملابس',         emoji: '👕' },
  { value: 'electronics', label: 'إلكترونيات',    emoji: '📺' },
  { value: 'food',        label: 'غذاء',          emoji: '🛒' },
  { value: 'medical',     label: 'طبي',           emoji: '🏥' },
  { value: 'other',       label: 'أخرى',          emoji: '📦' },
];

export const URGENT_NEEDS = [
  { id: 1, emoji: '🛋️', title: 'أثاث غرفة نوم كامل',        city: 'الدمام',    urgent: true,  daysLeft: 2 },
  { id: 2, emoji: '👕', title: 'ملابس أطفال (6–10 سنوات)',  city: 'الخبر',     urgent: true,  daysLeft: 1 },
  { id: 3, emoji: '♿', title: 'كرسي متحرك',                 city: 'الأحساء',   urgent: false, daysLeft: 5 },
  { id: 4, emoji: '🛒', title: 'مواد غذائية أساسية',        city: 'الجبيل',    urgent: false, daysLeft: 7 },
];

export const RECENT_DONATIONS = [
  { id: 1, initials: 'م.أ', name: 'محمد أحمد',  type: 'أثاث',       city: 'الدمام',  ago: 'منذ ساعة',    status: 'accepted',   color: '#00632c' },
  { id: 2, initials: 'س.خ', name: 'سارة خالد',  type: 'ملابس',      city: 'الخبر',   ago: 'منذ 3 ساعات', status: 'reviewing',  color: '#2563eb' },
  { id: 3, initials: 'خ.م', name: 'خالد محمد',  type: 'إلكترونيات', city: 'القطيف',  ago: 'أمس',          status: 'delivered',  color: '#7c3aed' },
  { id: 4, initials: 'ن.ع', name: 'نورة علي',   type: 'غذاء',       city: 'الجبيل',  ago: 'منذ يومين',    status: 'in_transit', color: '#d97706' },
];

export const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  submitted:   { label: 'تم الإرسال',     color: '#6b7280', bg: '#f3f4f6' },
  reviewing:   { label: 'قيد المراجعة',  color: '#d97706', bg: '#fef3c7' },
  accepted:    { label: 'تم القبول',      color: '#2563eb', bg: '#eff6ff' },
  in_transit:  { label: 'في الطريق',      color: '#7c3aed', bg: '#f5f3ff' },
  delivered:   { label: 'تم التسليم',     color: '#00632c', bg: '#e6f4ec' },
};

export interface MyDonation {
  id: string;
  emoji: string;
  type: string;
  description: string;
  quantity: number;
  region: string;
  submittedAt: string;
  status: string;
  steps: { label: string; done: boolean; date: string }[];
}

export const MY_DONATIONS: MyDonation[] = [
  {
    id: 'DON-2026-001',
    emoji: '🛋️',
    type: 'أثاث',
    description: 'طاولة وكراسي طعام (6 كراسي)',
    quantity: 1,
    region: 'الدمام',
    submittedAt: '18 يونيو 2026',
    status: 'delivered',
    steps: [
      { label: 'تم الإرسال',    done: true, date: '18 يونيو' },
      { label: 'قيد المراجعة', done: true, date: '18 يونيو' },
      { label: 'تم القبول',    done: true, date: '19 يونيو' },
      { label: 'في الطريق',    done: true, date: '20 يونيو' },
      { label: 'تم التسليم',   done: true, date: '21 يونيو' },
    ],
  },
  {
    id: 'DON-2026-002',
    emoji: '👕',
    type: 'ملابس',
    description: 'ملابس شتوية أطفال مقاس (8-10)',
    quantity: 5,
    region: 'الخبر',
    submittedAt: '20 يونيو 2026',
    status: 'in_transit',
    steps: [
      { label: 'تم الإرسال',    done: true,  date: '20 يونيو' },
      { label: 'قيد المراجعة', done: true,  date: '20 يونيو' },
      { label: 'تم القبول',    done: true,  date: '21 يونيو' },
      { label: 'في الطريق',    done: true,  date: '21 يونيو' },
      { label: 'تم التسليم',   done: false, date: '' },
    ],
  },
  {
    id: 'DON-2026-003',
    emoji: '📺',
    type: 'إلكترونيات',
    description: 'تلفاز 43 بوصة بحالة ممتازة',
    quantity: 1,
    region: 'القطيف',
    submittedAt: '21 يونيو 2026',
    status: 'reviewing',
    steps: [
      { label: 'تم الإرسال',    done: true,  date: '21 يونيو' },
      { label: 'قيد المراجعة', done: true,  date: '21 يونيو' },
      { label: 'تم القبول',    done: false, date: '' },
      { label: 'في الطريق',    done: false, date: '' },
      { label: 'تم التسليم',   done: false, date: '' },
    ],
  },
];
