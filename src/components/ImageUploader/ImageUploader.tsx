import React, { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
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

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGES = 10;

interface ImageUploaderProps {
  images: CapturedImage[];
  onChange: (images: CapturedImage[]) => void;
}

async function base64ToFile(base64: string, mimeType: string, filename: string): Promise<File> {
  const res = await fetch(`data:${mimeType};base64,${base64}`);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const showError = (msg: string) => setToast({ open: true, message: msg });

  const captureImage = useCallback(
    async (source: CameraSource) => {
      if (images.length >= MAX_IMAGES) {
        showError(`الحد الأقصى للصور هو ${MAX_IMAGES}`);
        return;
      }

      setIsLoading(true);
      try {
        if (source === CameraSource.Camera) {
          const perms = await Camera.checkPermissions();
          if (perms.camera === 'denied') {
            const req = await Camera.requestPermissions({ permissions: ['camera'] });
            if (req.camera === 'denied') {
              showError('لم يتم منح إذن الكاميرا، يرجى تفعيله من الإعدادات');
              return;
            }
          }
        } else {
          const perms = await Camera.checkPermissions();
          if (perms.photos === 'denied') {
            const req = await Camera.requestPermissions({ permissions: ['photos'] });
            if (req.photos === 'denied') {
              showError('لم يتم منح إذن مكتبة الصور، يرجى تفعيله من الإعدادات');
              return;
            }
          }
        }

        const photo = await Camera.getPhoto({
          resultType: CameraResultType.Base64,
          source,
          quality: 85,
          allowEditing: false,
          correctOrientation: true,
        });

        if (!photo.base64String) return;

        const mimeType =
          photo.format === 'png'
            ? 'image/png'
            : photo.format === 'webp'
            ? 'image/webp'
            : 'image/jpeg';

        if (!ALLOWED_TYPES.includes(mimeType)) {
          showError('نوع الملف غير مدعوم. يرجى اختيار JPG أو PNG أو WEBP');
          return;
        }

        const file = await base64ToFile(
          photo.base64String,
          mimeType,
          `donation-${Date.now()}.${photo.format ?? 'jpg'}`,
        );

        if (file.size > MAX_SIZE) {
          showError('حجم الصورة يتجاوز الحد المسموح به (5MB)');
          return;
        }

        const dataUrl = `data:${mimeType};base64,${photo.base64String}`;
        onChange([...images, { dataUrl, file }]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        const cancelled =
          msg.includes('cancelled') ||
          msg.includes('cancel') ||
          msg.includes('No image picked') ||
          msg.includes('User cancelled');
        if (!cancelled) {
          showError('حدث خطأ أثناء معالجة الصورة');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [images, onChange],
  );

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange],
  );

  return (
    <div className="image-uploader" dir="rtl">
      <IonActionSheet
        isOpen={showSheet}
        onDidDismiss={() => setShowSheet(false)}
        header="إضافة صورة"
        buttons={[
          {
            text: 'التقاط صورة بالكاميرا',
            icon: cameraOutline,
            handler: () => captureImage(CameraSource.Camera),
          },
          {
            text: 'اختيار صورة من ألبوم الصور',
            icon: imagesOutline,
            handler: () => captureImage(CameraSource.Photos),
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
        duration={3200}
        color="danger"
        position="top"
        icon={alertCircleOutline}
        onDidDismiss={() => setToast(prev => ({ ...prev, open: false }))}
      />

      {images.length === 0 ? (
        <button
          className="upload-area"
          type="button"
          onClick={() => setShowSheet(true)}
        >
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