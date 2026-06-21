import { useState, useCallback } from 'react';
import { Location } from '../types/donation';

interface UseGeolocationReturn {
  getCurrentLocation: () => Promise<Location>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'الموقع الجغرافي غير مدعوم في هذا المتصفح';
        setError(msg);
        reject(msg);
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setIsLoading(false);
          let msg = 'تعذر تحديد الموقع';
          if (err.code === err.PERMISSION_DENIED) {
            msg = 'تم رفض الإذن للوصول إلى الموقع';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = 'الموقع غير متاح حالياً';
          } else if (err.code === err.TIMEOUT) {
            msg = 'انتهت مهلة طلب الموقع';
          }
          setError(msg);
          reject(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { getCurrentLocation, isLoading, error, clearError };
};
