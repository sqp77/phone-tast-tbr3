import React, { useState, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonToast,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonNote,
  IonLabel,
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
  refreshOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  heartOutline,
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

const validate = (data: DonationFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'الاسم الكامل مطلوب';
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
  }

  const phonePattern = /^(05\d{8}|\+9665\d{8})$/;
  if (!data.phone.trim()) {
    errors.phone = 'رقم الجوال مطلوب';
  } else if (!phonePattern.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'صيغة غير صحيحة، مثال: 0512345678';
  }

  if (!data.donationType) {
    errors.donationType = 'يرجى اختيار نوع التبرع';
  }

  if (!data.quantity || Number(data.quantity) <= 0) {
    errors.quantity = 'الكمية يجب أن تكون أكبر من صفر';
  }

  if (!data.region) {
    errors.region = 'يرجى اختيار المنطقة';
  }

  return errors;
};

const DonationForm: React.FC = () => {
  const [form, setForm] = useState<DonationFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; color: string }>({
    open: false,
    message: '',
    color: 'success',
  });

  const { getCurrentLocation, isLoading: isLoadingLocation } = useGeolocation();

  const setField = useCallback(
    <K extends keyof DonationFormData>(field: K, value: DonationFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleGetLocation = useCallback(async () => {
    try {
      const loc = await getCurrentLocation();
      setField('location', loc);
      showToast('تم تحديد موقعك بنجاح ✓', 'success');
    } catch (err) {
      showToast(String(err), 'danger');
    }
  }, [getCurrentLocation, setField]);

  const showToast = (message: string, color: string) => {
    setToast({ open: true, message, color });
  };

  const handleSubmit = async () => {
    const allTouched = Object.keys(EMPTY_FORM).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<string, boolean>,
    );
    setTouched(allTouched);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('يرجى تصحيح الأخطاء قبل الإرسال', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await donationService.submit(form);
      showToast('تم إرسال طلب التبرع بنجاح! سنتواصل معك قريباً ✓', 'success');
      setForm(EMPTY_FORM);
      setTouched({});
      setErrors({});
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
  };

  const showError = (field: keyof ValidationErrors) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  return (
    <IonPage>
      <IonHeader className="app-header">
        <IonToolbar className="app-toolbar">
          <div className="toolbar-content">
            <IonIcon icon={heartOutline} className="toolbar-icon" />
            <IonTitle className="app-title">منصة التبرعات</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="donation-content" dir="rtl">
        {/* Hero */}
        <div className="hero-section">
          <div className="hero-icon-wrap">
            <IonIcon icon={giftOutline} className="hero-icon" />
          </div>
          <h1 className="hero-title">تبرع بما لا تحتاج</h1>
          <p className="hero-subtitle">ساهم في مساعدة المحتاجين بتبرعاتك القيمة في المنطقة الشرقية</p>
        </div>

        {/* ── Section 1: Personal Info ── */}
        <IonCard className="section-card">
          <IonCardHeader className="section-header">
            <IonCardTitle className="section-title">
              <IonIcon icon={personOutline} className="section-icon" />
              المعلومات الشخصية
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="field-wrap">
              <IonInput
                className={`custom-input ${showError('fullName') ? 'input-error' : ''}`}
                label="الاسم الكامل"
                labelPlacement="floating"
                placeholder="أدخل اسمك الكامل"
                value={form.fullName}
                onIonInput={(e) => setField('fullName', e.detail.value ?? '')}
                onIonBlur={() => markTouched('fullName')}
                clearInput
                fill="outline"
              >
                <IonIcon slot="start" icon={personOutline} aria-hidden="true" />
              </IonInput>
              {showError('fullName') && (
                <IonNote className="error-note" color="danger">
                  <IonIcon icon={alertCircleOutline} />
                  {showError('fullName')}
                </IonNote>
              )}
            </div>

            <div className="field-wrap">
              <IonInput
                className={`custom-input ${showError('phone') ? 'input-error' : ''}`}
                label="رقم الجوال"
                labelPlacement="floating"
                placeholder="05XXXXXXXX"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onIonInput={(e) => setField('phone', e.detail.value ?? '')}
                onIonBlur={() => markTouched('phone')}
                maxlength={13}
                fill="outline"
              >
                <IonIcon slot="start" icon={callOutline} aria-hidden="true" />
              </IonInput>
              {showError('phone') && (
                <IonNote className="error-note" color="danger">
                  <IonIcon icon={alertCircleOutline} />
                  {showError('phone')}
                </IonNote>
              )}
            </div>
          </IonCardContent>
        </IonCard>

        {/* ── Section 2: Donation Details ── */}
        <IonCard className="section-card">
          <IonCardHeader className="section-header">
            <IonCardTitle className="section-title">
              <IonIcon icon={giftOutline} className="section-icon" />
              تفاصيل التبرع
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="field-wrap">
              <IonSelect
                className={`custom-select ${showError('donationType') ? 'input-error' : ''}`}
                label="نوع التبرع"
                labelPlacement="floating"
                placeholder="اختر نوع التبرع"
                value={form.donationType}
                onIonChange={(e) => {
                  setField('donationType', e.detail.value);
                  markTouched('donationType');
                }}
                fill="outline"
                interface="action-sheet"
                cancelText="إلغاء"
              >
                {DONATION_TYPES.map((t) => (
                  <IonSelectOption key={t.value} value={t.value}>
                    {t.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
              {showError('donationType') && (
                <IonNote className="error-note" color="danger">
                  <IonIcon icon={alertCircleOutline} />
                  {showError('donationType')}
                </IonNote>
              )}
            </div>

            <div className="field-wrap">
              <IonTextarea
                className="custom-input"
                label="وصف التبرع"
                labelPlacement="floating"
                placeholder="اكتب وصفاً مختصراً للتبرع (الحالة، الحجم، ...)"
                value={form.description}
                onIonInput={(e) => setField('description', e.detail.value ?? '')}
                rows={4}
                maxlength={500}
                counter
                fill="outline"
                autoGrow
              >
                <IonIcon slot="start" icon={documentTextOutline} aria-hidden="true" />
              </IonTextarea>
            </div>

            <div className="field-wrap">
              <IonInput
                className={`custom-input ${showError('quantity') ? 'input-error' : ''}`}
                label="الكمية"
                labelPlacement="floating"
                placeholder="أدخل الكمية"
                type="number"
                inputMode="numeric"
                min="1"
                value={form.quantity}
                onIonInput={(e) => setField('quantity', e.detail.value ?? '')}
                onIonBlur={() => markTouched('quantity')}
                fill="outline"
              >
                <IonIcon slot="start" icon={layersOutline} aria-hidden="true" />
              </IonInput>
              {showError('quantity') && (
                <IonNote className="error-note" color="danger">
                  <IonIcon icon={alertCircleOutline} />
                  {showError('quantity')}
                </IonNote>
              )}
            </div>
          </IonCardContent>
        </IonCard>

        {/* ── Section 3: Location ── */}
        <IonCard className="section-card">
          <IonCardHeader className="section-header">
            <IonCardTitle className="section-title">
              <IonIcon icon={locationOutline} className="section-icon" />
              الموقع الجغرافي
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="field-wrap">
              <IonSelect
                className={`custom-select ${showError('region') ? 'input-error' : ''}`}
                label="المنطقة"
                labelPlacement="floating"
                placeholder="اختر المنطقة"
                value={form.region}
                onIonChange={(e) => {
                  setField('region', e.detail.value);
                  markTouched('region');
                }}
                fill="outline"
                interface="popover"
                cancelText="إلغاء"
              >
                {REGIONS.map((r) => (
                  <IonSelectOption key={r} value={r}>
                    {r}
                  </IonSelectOption>
                ))}
              </IonSelect>
              {showError('region') && (
                <IonNote className="error-note" color="danger">
                  <IonIcon icon={alertCircleOutline} />
                  {showError('region')}
                </IonNote>
              )}
            </div>

            <div className="map-section">
              <p className="map-label">
                <IonIcon icon={locationOutline} />
                موقع التبرع على الخريطة
              </p>
              <LocationPicker
                location={form.location}
                onLocationChange={(loc: Location) => setField('location', loc)}
                onGetCurrentLocation={handleGetLocation}
                isLoadingLocation={isLoadingLocation}
              />
            </div>
          </IonCardContent>
        </IonCard>

        {/* ── Section 4: Images ── */}
        <IonCard className="section-card">
          <IonCardHeader className="section-header">
            <IonCardTitle className="section-title">
              <IonIcon icon={imagesOutline} className="section-icon" />
              صور التبرع
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p className="images-hint">أضف صوراً واضحة للتبرع لتسريع عملية القبول (اختياري)</p>
            <ImageUploader
              images={form.images}
              onChange={(imgs) => setField('images', imgs)}
            />
          </IonCardContent>
        </IonCard>

        {/* ── Actions ── */}
        <IonGrid className="action-grid">
          <IonRow>
            <IonCol size="8">
              <IonButton
                expand="block"
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <IonIcon slot="start" icon={sendOutline} />
                إرسال الطلب
              </IonButton>
            </IonCol>
            <IonCol size="4">
              <IonButton
                expand="block"
                fill="outline"
                color="medium"
                className="reset-btn"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                <IonIcon slot="start" icon={refreshOutline} />
                مسح
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <div className="footer-note">
          <IonText color="medium">
            <p>سيتم التواصل معك خلال 24-48 ساعة من تقديم الطلب</p>
          </IonText>
        </div>

        <IonLoading
          isOpen={isSubmitting}
          message="جاري إرسال الطلب..."
          spinner="crescent"
        />

        <IonToast
          isOpen={toast.open}
          message={toast.message}
          duration={3500}
          color={toast.color}
          position="top"
          onDidDismiss={() => setToast((prev) => ({ ...prev, open: false }))}
          icon={toast.color === 'success' ? checkmarkCircleOutline : alertCircleOutline}
        />
      </IonContent>
    </IonPage>
  );
};

export default DonationForm;
