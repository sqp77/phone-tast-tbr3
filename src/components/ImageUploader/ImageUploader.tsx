import React, { useState, useCallback } from 'react';
import { Camera, MediaResult, EncodingType, CameraErrorCode } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  IonIcon,
  IonBadge,
  IonLoading,
  IonActionSheet,
  IonToast,
} from '@ionic/react';
import {
  cameraOutline,
  imagesOutline,
  cloudUploadOutline,
  closeCircle,
  addCircleOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { CapturedImage } from '../../types/donation';
import './ImageUploader.css';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGES = 10;

// Error codes that mean "user pressed cancel" — not real errors
const CANCEL_CODES = new Set<string>([
  CameraErrorCode.TakePhotoCancelled,
  CameraErrorCode.ChooseMediaCancelled,
  CameraErrorCode.EditPhotoCancelled,
]);

interface ImageUploaderProps {
  images: CapturedImage[];
  onChange: (images: CapturedImage[]) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function isCancellation(err: unknown): boolean {
  if (err && typeof err === 'object' && 'code' in err) {
    return CANCEL_CODES.has((err as { code: string }).code);
  }
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return msg.includes('cancel') || msg.includes('dismiss') || msg.includes('no image');
}

async function ensureCameraPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  const status = await Camera.checkPermissions();
  if (status.camera === 'granted' || status.camera === 'limited') return true;
  if (status.camera === 'denied') return false;
  const requested = await Camera.requestPermissions({ permissions: ['camera'] });
  return requested.camera === 'granted' || requested.camera === 'limited';
}

async function ensurePhotosPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  const status = await Camera.checkPermissions();
  if (status.photos === 'granted' || status.photos === 'limited') return true;
  if (status.photos === 'denied') return false;
  const requested = await Camera.requestPermissions({ permissions: ['photos'] });
  return requested.photos === 'granted' || requested.photos === 'limited';
}

/**
 * Converts a MediaResult (from takePhoto / chooseFromGallery) into a
 * CapturedImage that holds a preview URL and an uploadable File.
 *
 * webPath is served by Capacitor's local web server on native, and is a
 * blob URL on web — both work as <img src> and can be fetched as a blob.
 */
async function mediaResultToCaptured(result: MediaResult): Promise<CapturedImage> {
  const srcUrl = result.webPath;
  if (!srcUrl) throw new Error('لا يمكن الحصول على مسار الصورة');

  const response = await fetch(srcUrl);
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';

  if (!ALLOWED_MIME.includes(mimeType)) {
    throw new Error('نوع الملف غير مدعوم. يرجى اختيار JPG أو PNG أو WEBP');
  }
  if (blob.size > MAX_SIZE) {
    throw new Error('حجم الصورة يتجاوز الحد المسموح به (5MB)');
  }

  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const file = new File([blob], `donation-${Date.now()}.${ext}`, { type: mimeType });

  // srcUrl works as <img src> on both native (Capacitor local server) and web (blob URL)
  return { dataUrl: srcUrl, file };
}

// ── Component ────────────────────────────────────────────────────────────────

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange }) => {
  const [isLoading, setIsLoading]         = useState(false);
  const [showSheet, setShowSheet]         = useState(false);
  const [pendingAction, setPendingAction] = useState<'camera' | 'gallery' | null>(null);
  const [toast, setToast]                 = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const showError = useCallback(
    (msg: string) => setToast({ open: true, message: msg }),
    [],
  );

  // Converts a raw MediaResult and appends it to the list
  const processAndAdd = useCallback(async (result: MediaResult) => {
    const captured = await mediaResultToCaptured(result);
    onChange([...images, captured]);
  }, [images, onChange]);

  // ── Camera ────────────────────────────────────────────────────────────────

  const takePhoto = useCallback(async () => {
    if (images.length >= MAX_IMAGES) {
      showError(`الحد الأقصى للصور هو ${MAX_IMAGES}`);
      return;
    }
    setIsLoading(true);
    try {
      const ok = await ensureCameraPermission();
      if (!ok) {
        showError('لم يتم منح إذن الكاميرا. افتح إعدادات الجهاز وفعّل الإذن للتطبيق');
        return;
      }

      const result = await Camera.takePhoto({
        quality: 85,
        correctOrientation: true,
        saveToGallery: false,
        encodingType: EncodingType.JPEG,
      });

      await processAndAdd(result);
    } catch (err: unknown) {
      if (!isCancellation(err)) {
        console.error('[ImageUploader] takePhoto', err);
        showError('حدث خطأ أثناء فتح الكاميرا. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsLoading(false);
    }
  }, [images, processAndAdd, showError]);

  // ── Gallery ───────────────────────────────────────────────────────────────

  const pickFromGallery = useCallback(async () => {
    if (images.length >= MAX_IMAGES) {
      showError(`الحد الأقصى للصور هو ${MAX_IMAGES}`);
      return;
    }
    setIsLoading(true);
    try {
      const ok = await ensurePhotosPermission();
      if (!ok) {
        showError('لم يتم منح إذن مكتبة الصور. افتح إعدادات الجهاز وفعّل الإذن للتطبيق');
        return;
      }

      const gallery = await Camera.chooseFromGallery({
        quality: 85,
        correctOrientation: true,
        allowMultipleSelection: false,
      });

      const result = gallery.results[0];
      if (result) await processAndAdd(result);
    } catch (err: unknown) {
      if (!isCancellation(err)) {
        console.error('[ImageUploader] pickFromGallery', err);
        showError('حدث خطأ أثناء فتح الألبوم. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsLoading(false);
    }
  }, [images, processAndAdd, showError]);

  // ── Action sheet: fire camera/gallery AFTER sheet fully dismisses ─────────
  // This prevents iOS from conflicting on two simultaneous modal presentations.

  const handleSheetDismiss = useCallback(() => {
    setShowSheet(false);
    const action = pendingAction;
    setPendingAction(null);
    if (action === 'camera') takePhoto();
    else if (action === 'gallery') pickFromGallery();
  }, [pendingAction, takePhoto, pickFromGallery]);

  const removeImage = useCallback((index: number) => {
    onChange(images.filter((_, i) => i !== index));
  }, [images, onChange]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="image-uploader" dir="rtl">
      <IonActionSheet
        isOpen={showSheet}
        onDidDismiss={handleSheetDismiss}
        header="إضافة صورة"
        buttons={[
          {
            text: 'التقاط صورة بالكاميرا',
            icon: cameraOutline,
            handler: () => { setPendingAction('camera'); },
          },
          {
            text: 'اختيار صورة من ألبوم الصور',
            icon: imagesOutline,
            handler: () => { setPendingAction('gallery'); },
          },
          {
            text: 'إلغاء',
            role: 'cancel',
          },
        ]}
      />

      <IonLoading isOpen={isLoading} message="جاري معالجة الصورة..." spinner="crescent" />

      <IonToast
        isOpen={toast.open}
        message={toast.message}
        duration={3500}
        color="danger"
        position="top"
        icon={alertCircleOutline}
        onDidDismiss={() => setToast(prev => ({ ...prev, open: false }))}
      />

      {images.length === 0 ? (
        <button className="upload-area" type="button" onClick={() => setShowSheet(true)}>
          <div className="upload-icon-wrap">
            <IonIcon icon={cloudUploadOutline} className="upload-icon" />
          </div>
          <p className="upload-title">إضافة صورة</p>
          <p className="upload-subtitle">JPG · PNG · WEBP — حتى 5MB للصورة</p>
        </button>
      ) : (
        <>
          <div className="images-header">
            <span className="images-label">
              <IonIcon icon={imagesOutline} />
              الصور المرفقة
            </span>
            <IonBadge color="success">{images.length}</IonBadge>
          </div>

          <div className="images-grid">
            {images.map((img, i) => (
              <div key={i} className="image-thumb">
                <img src={img.dataUrl} alt={`صورة ${i + 1}`} className="thumb-img" />
                <button
                  className="remove-btn"
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="حذف الصورة"
                >
                  <IonIcon icon={closeCircle} />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <button
                className="add-more-btn"
                type="button"
                onClick={() => setShowSheet(true)}
              >
                <IonIcon icon={addCircleOutline} />
                <span>إضافة</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageUploader;