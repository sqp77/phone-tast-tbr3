import React, { useRef, useCallback } from 'react';
import { IonButton, IonIcon, IonBadge } from '@ionic/react';
import { addCircleOutline, closeCircle, imagesOutline, cloudUploadOutline } from 'ionicons/icons';
import './ImageUploader.css';

interface ImageUploaderProps {
  images: File[];
  onChange: (images: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (!selected.length) return;
      const merged = [...images, ...selected].slice(0, 10); // max 10
      onChange(merged);
      e.target.value = '';
    },
    [images, onChange],
  );

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange],
  );

  const getPreviewUrl = (file: File) => URL.createObjectURL(file);

  return (
    <div className="image-uploader" dir="rtl">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {images.length === 0 ? (
        <button className="upload-area" onClick={() => inputRef.current?.click()} type="button">
          <IonIcon icon={cloudUploadOutline} className="upload-icon" />
          <p className="upload-title">اضغط لإضافة صور التبرع</p>
          <p className="upload-subtitle">يدعم JPG، PNG، WEBP (حتى 10 صور)</p>
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
            {images.map((file, i) => (
              <div key={i} className="image-thumb">
                <img src={getPreviewUrl(file)} alt={`صورة ${i + 1}`} className="thumb-img" />
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

            {images.length < 10 && (
              <button
                className="add-more-btn"
                type="button"
                onClick={() => inputRef.current?.click()}
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
