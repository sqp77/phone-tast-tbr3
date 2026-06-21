import React, { useState, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonToast,
  IonLoading,
  IonNote,
} from '@ionic/react';
import {
  personOutline,
  callOutline,
  giftOutline,
  documentTextOutline,
  layersOutline,
  locationOutline,
  imagesOutline,
  sendOutline,
  checkmarkOutline,
  checkmarkCircle,
  alertCircleOutline,
  heartOutline,
  arrowBackOutline,
  arrowForwardOutline,
  starOutline,
  ribbonOutline,
} from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker/LocationPicker';
import ImageUploader from '../components/ImageUploader/ImageUploader';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  DonationFormData,
  ValidationErrors,
  Location,
  DONATION_TYPES,
  REGIONS,
} from '../types/donation';
import { donationService } from '../services/donationService';
import './DonationForm.css';

const EMPTY_FORM: DonationFormData = {
  fullName: '',
  phone: '',
  donationType: '',
  description: '',
  quantity: '',
  region: '',
  location: null,
  images: [],
};

const STEPS = [
  { id: 1, label: 'معلوماتي',  icon: personOutline },
  { id: 2, label: 'التبرع',    icon: giftOutline },
  { id: 3, label: 'الموقع',   icon: locationOutline },
  { id: 4, label: 'الصور',    icon: imagesOutline },
];

const validateStep = (step: number, data: DonationFormData): ValidationErrors => {
  const e: ValidationErrors = {};
  if (step === 1) {
    if (!data.fullName.trim()) e.fullName = 'الاسم الكامل مطلوب';
    else if (data.fullName.trim().length < 3) e.fullName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    const ph = /^(05\d{8}|\+9665\d{8})$/;
    if (!data.phone.trim()) e.phone = 'رقم الجوال مطلوب';
    else if (!ph.test(data.phone.replace(/\s/g, ''))) e.phone = 'صيغة غير صحيحة، مثال: 0512345678';
  }
  if (step === 2) {
    if (!data.donationType) e.donationType = 'يرجى اختيار نوع التبرع';
    if (!data.quantity || Number(data.quantity) <= 0) e.quantity = 'الكمية يجب أن تكون أكبر من صفر';
  }
  if (step === 3) {
    if (!data.region) e.region = 'يرجى اختيار المنطقة';
  }
  return e;
};

const DonationForm: React.FC = () => {
  const [step, setStep]               = useState(1);
  const [dir, setDir]                 = useState<'fwd' | 'bwd'>('fwd');
  const [animKey, setAnimKey]         = useState(0);
  const [form, setForm]               = useState<DonationFormData>(EMPTY_FORM);
  const [errors, setErrors]           = useState<ValidationErrors>({});
  const [touched, setTouched]         = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [toast, setToast]             = useState<{ open: boolean; message: string; color: string }>({
    open: false, message: '', color: 'success',
  });

  const { getCurrentLocation, isLoading: isLoadingLocation } = useGeolocation();

  const setField = useCallback(<K extends keyof DonationFormData>(field: K, value: DonationFormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const markTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const showError = (field: keyof ValidationErrors) =>
    (touched[field] && errors[field]) ? errors[field] : undefined;

  const showToast = (message: string, color: string) =>
    setToast({ open: true, message, color });

  const goNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      const t: Record<string, boolean> = {};
      Object.keys(errs).forEach(k => (t[k] = true));
      setTouched(prev => ({ ...prev, ...t }));
      setErrors(errs);
      return;
    }
    setDir('fwd');
    setAnimKey(k => k + 1);
    setStep(s => Math.min(s + 1, 4));
  };

  const goBack = () => {
    setDir('bwd');
    setAnimKey(k => k + 1);
    setStep(s => Math.max(s - 1, 1));
  };

  const handleGetLocation = useCallback(async () => {
    try {
      const loc = await getCurrentLocation();
      setField('location', loc);
      showToast('تم تحديد موقعك بنجاح ✓', 'success');
    } catch (err) {
      showToast(String(err), 'danger');
    }
  }, [getCurrentLocation, setField]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await donationService.submit(form);
      setSubmitted(true);
    } catch {
      showToast('حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});
    setStep(1);
    setDir('fwd');
    setAnimKey(k => k + 1);
    setSubmitted(false);
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <IonPage>
        <IonContent className="df-content" dir="rtl">
          <div className="success-screen">
            <div className="success-glow" />
            <div className="success-icon-wrap">
              <IonIcon icon={checkmarkCircle} className="success-icon" />
            </div>
            <h2 className="success-title">تم إرسال طلبك بنجاح!</h2>
            <p className="success-msg">شكراً لك على تبرعك الكريم، سيتم التواصل معك خلال 24–48 ساعة</p>
            <div className="success-badge">
              <IonIcon icon={ribbonOutline} />
              <span>متبرع فاعل</span>
            </div>
            <IonButton expand="block" className="new-donation-btn" onClick={handleReset}>
              <IonIcon slot="start" icon={heartOutline} />
              تقديم تبرع جديد
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      {/* ── Header ── */}
      <IonHeader className="df-header">
        <IonToolbar className="df-toolbar">
          <div className="df-toolbar-inner">
            <div className="df-brand">
              <div className="df-logo">
                <IonIcon icon={heartOutline} />
              </div>
              <div>
                <p className="df-brand-name">منصة التبرعات</p>
                <p className="df-brand-sub">المنطقة الشرقية</p>
              </div>
            </div>
            <div className="df-step-counter">
              <span className="df-step-num">{step}</span>
              <span className="df-step-total">/ 4</span>
            </div>
          </div>
        </IonToolbar>

        {/* ── Step progress ── */}
        <div className="df-progress-bar">
          <div className="df-progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <div className="df-steps-row">
          {STEPS.map(s => (
            <div key={s.id} className={`df-step-item ${s.id < step ? 'done' : ''} ${s.id === step ? 'active' : ''}`}>
              <div className="df-step-dot">
                {s.id < step
                  ? <IonIcon icon={checkmarkOutline} />
                  : <IonIcon icon={s.icon} />}
              </div>
              <span className="df-step-label">{s.label}</span>
            </div>
          ))}
        </div>
      </IonHeader>

      <IonContent className="df-content" dir="rtl">
        <div className={`df-step-view ${dir}`} key={animKey}>

          {/* ══ STEP 1: Personal Info ══ */}
          {step === 1 && (
            <div className="df-step-block">
              <div className="df-step-hero" style={{ background: 'linear-gradient(135deg,#003d1b,#00843b)' }}>
                <div className="df-step-hero-num">01</div>
                <div className="df-step-hero-icon"><IonIcon icon={personOutline} /></div>
                <h2 className="df-step-hero-title">معلوماتك الشخصية</h2>
                <p className="df-step-hero-sub">أدخل بياناتك لنتمكن من التواصل معك</p>
              </div>
              <div className="df-fields-card">
                <div className="df-field">
                  <label className="df-label">
                    <IonIcon icon={personOutline} />
                    الاسم الكامل <span className="df-req">*</span>
                  </label>
                  <IonInput
                    className={`df-input ${showError('fullName') ? 'df-input-err' : ''}`}
                    placeholder="أدخل اسمك الكامل"
                    value={form.fullName}
                    onIonInput={e => setField('fullName', e.detail.value ?? '')}
                    onIonBlur={() => markTouched('fullName')}
                    fill="outline"
                    clearInput
                  />
                  {showError('fullName') && (
                    <IonNote className="df-err-note" color="danger">
                      <IonIcon icon={alertCircleOutline} /> {showError('fullName')}
                    </IonNote>
                  )}
                </div>

                <div className="df-field">
                  <label className="df-label">
                    <IonIcon icon={callOutline} />
                    رقم الجوال <span className="df-req">*</span>
                  </label>
                  <IonInput
                    className={`df-input ${showError('phone') ? 'df-input-err' : ''}`}
                    placeholder="05XXXXXXXX"
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onIonInput={e => setField('phone', e.detail.value ?? '')}
                    onIonBlur={() => markTouched('phone')}
                    maxlength={13}
                    fill="outline"
                  />
                  {showError('phone') && (
                    <IonNote className="df-err-note" color="danger">
                      <IonIcon icon={alertCircleOutline} /> {showError('phone')}
                    </IonNote>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 2: Donation Details ══ */}
          {step === 2 && (
            <div className="df-step-block">
              <div className="df-step-hero" style={{ background: 'linear-gradient(135deg,#1a3a6e,#2563eb)' }}>
                <div className="df-step-hero-num">02</div>
                <div className="df-step-hero-icon"><IonIcon icon={giftOutline} /></div>
                <h2 className="df-step-hero-title">تفاصيل التبرع</h2>
                <p className="df-step-hero-sub">أخبرنا بما تودّ التبرع به</p>
              </div>
              <div className="df-fields-card">
                <div className="df-field">
                  <label className="df-label">
                    <IonIcon icon={giftOutline} />
                    نوع التبرع <span className="df-req">*</span>
                  </label>
                  <IonSelect
                    className={`df-input ${showError('donationType') ? 'df-input-err' : ''}`}
                    placeholder="اختر نوع التبرع"
                    value={form.donationType}
                    onIonChange={e => { setField('donationType', e.detail.value); markTouched('donationType'); }}
                    fill="outline"
                    interface="action-sheet"
                    cancelText="إلغاء"
                  >
                    {DONATION_TYPES.map(t => (
                      <IonSelectOption key={t.value} value={t.value}>{t.label}</IonSelectOption>
                    ))}
                  </IonSelect>
                  {showError('donationType') && (
                    <IonNote className="df-err-note" color="danger">
                      <IonIcon icon={alertCircleOutline} /> {showError('donationType')}
                    </IonNote>
                  )}
                </div>

                <div className="df-field">
                  <label className="df-label">
                    <IonIcon icon={documentTextOutline} />
                    وصف التبرع <span className="df-optional">(اختياري)</span>
                  </label>
                  <IonTextarea
                    className="df-input"
                    placeholder="اكتب وصفاً مختصراً: الحالة، الحجم، اللون..."
                    value={form.description}
                    onIonInput={e => setField('description', e.detail.value ?? '')}
                    rows={4}
                    maxlength={500}
                    counter
                    fill="outline"
                    autoGrow
                  />
                </div>

                <div className="df-field">
                  <label className="df-label">
                    <IonIcon icon={layersOutline} />
                    الكمية <span className="df-req">*</span>
                  </label>
                  <IonInput
                    className={`df-input ${showError('quantity') ? 'df-input-err' : ''}`}
                    placeholder="أدخل الكمية"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={form.quantity}
                    onIonInput={e => setField('quantity', e.detail.value ?? '')}
                    onIonBlur={() => markTouched('quantity')}
                    fill="outline"
                  />
                  {showError('quantity') && (
                    <IonNote className="df-err-note" color="danger">
                      <IonIcon icon={alertCircleOutline} /> {showError('quantity')}
                    </IonNote>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 3: Location ══ */}
          {step === 3 && (
            <div className="df-step-block">
              <div className="df-step-hero" style={{ background: 'linear-gradient(135deg,#6b21a8,#9333ea)' }}>
                <div className="df-step-hero-num">03</div>
                <div className="df-step-hero-icon"><IonIcon icon={locationOutline} /></div>
                <h2 className="df-step-hero-title">الموقع الجغرافي</h2>
                <p className="df-step-hero-sub">حدد مكان التبرع لتسهيل الاستلام</p>
              </div>
              <div className="df-fields-card">
                <div className="df-field">
                  <label className="df-label">
                    <IonIcon icon={locationOutline} />
                    المنطقة <span className="df-req">*</span>
                  </label>
                  <IonSelect
                    className={`df-input ${showError('region') ? 'df-input-err' : ''}`}
                    placeholder="اختر المنطقة"
                    value={form.region}
                    onIonChange={e => { setField('region', e.detail.value); markTouched('region'); }}
                    fill="outline"
                    interface="action-sheet"
                    cancelText="إلغاء"
                  >
                    {REGIONS.map(r => (
                      <IonSelectOption key={r} value={r}>{r}</IonSelectOption>
                    ))}
                  </IonSelect>
                  {showError('region') && (
                    <IonNote className="df-err-note" color="danger">
                      <IonIcon icon={alertCircleOutline} /> {showError('region')}
                    </IonNote>
                  )}
                </div>

                <div className="df-field">
                  <label className="df-label">
                    <IonIcon icon={locationOutline} />
                    الموقع على الخريطة <span className="df-optional">(اختياري)</span>
                  </label>
                  <LocationPicker
                    location={form.location}
                    onLocationChange={(loc: Location) => setField('location', loc)}
                    onGetCurrentLocation={handleGetLocation}
                    isLoadingLocation={isLoadingLocation}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 4: Images + Submit ══ */}
          {step === 4 && (
            <div className="df-step-block">
              <div className="df-step-hero" style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
                <div className="df-step-hero-num">04</div>
                <div className="df-step-hero-icon"><IonIcon icon={imagesOutline} /></div>
                <h2 className="df-step-hero-title">صور التبرع</h2>
                <p className="df-step-hero-sub">أضف صوراً واضحة لتسريع قبول طلبك</p>
              </div>
              <div className="df-fields-card">
                <ImageUploader
                  images={form.images}
                  onChange={imgs => setField('images', imgs)}
                />

                {/* Review summary */}
                <div className="df-review">
                  <p className="df-review-title">
                    <IonIcon icon={starOutline} />
                    ملخص الطلب
                  </p>
                  <div className="df-review-rows">
                    <div className="df-review-row">
                      <span className="df-review-key">الاسم</span>
                      <span className="df-review-val">{form.fullName || '—'}</span>
                    </div>
                    <div className="df-review-row">
                      <span className="df-review-key">الجوال</span>
                      <span className="df-review-val" style={{ direction: 'ltr' }}>{form.phone || '—'}</span>
                    </div>
                    <div className="df-review-row">
                      <span className="df-review-key">نوع التبرع</span>
                      <span className="df-review-val">
                        {DONATION_TYPES.find(t => t.value === form.donationType)?.label || '—'}
                      </span>
                    </div>
                    <div className="df-review-row">
                      <span className="df-review-key">الكمية</span>
                      <span className="df-review-val">{form.quantity || '—'}</span>
                    </div>
                    <div className="df-review-row">
                      <span className="df-review-key">المنطقة</span>
                      <span className="df-review-val">{form.region || '—'}</span>
                    </div>
                    <div className="df-review-row">
                      <span className="df-review-key">الموقع</span>
                      <span className="df-review-val">
                        {form.location ? `${form.location.lat.toFixed(4)}, ${form.location.lng.toFixed(4)}` : 'غير محدد'}
                      </span>
                    </div>
                    <div className="df-review-row">
                      <span className="df-review-key">الصور</span>
                      <span className="df-review-val">{form.images.length} صورة</span>
                    </div>
                  </div>
                </div>

                <IonButton
                  expand="block"
                  className="df-submit-btn"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <IonIcon slot="start" icon={sendOutline} />
                  إرسال طلب التبرع
                </IonButton>
              </div>
            </div>
          )}

        </div>

        {/* ── Navigation ── */}
        <div className="df-nav">
          {step > 1 ? (
            <IonButton fill="outline" className="df-nav-back" onClick={goBack}>
              <IonIcon slot="start" icon={arrowForwardOutline} />
              السابق
            </IonButton>
          ) : <div />}

          {step < 4 && (
            <IonButton className="df-nav-next" onClick={goNext}>
              التالي
              <IonIcon slot="end" icon={arrowBackOutline} />
            </IonButton>
          )}
        </div>

        <div className="df-footer">
          <p>سيتم التواصل معك خلال 24–48 ساعة من تقديم الطلب</p>
        </div>

        <IonLoading isOpen={isSubmitting} message="جاري إرسال الطلب..." spinner="crescent" />

        <IonToast
          isOpen={toast.open}
          message={toast.message}
          duration={3500}
          color={toast.color}
          position="top"
          onDidDismiss={() => setToast(prev => ({ ...prev, open: false }))}
          icon={toast.color === 'success' ? checkmarkCircle : alertCircleOutline}
        />
      </IonContent>
    </IonPage>
  );
};

export default DonationForm;
