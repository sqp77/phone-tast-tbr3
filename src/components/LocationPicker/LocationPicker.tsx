import React, { useEffect, useRef } from 'react';
import { IonButton, IonIcon, IonSkeletonText, IonText } from '@ionic/react';
import { locateOutline, locationOutline } from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../../types/donation';
import './LocationPicker.css';

const DEFAULT_CENTER: [number, number] = [26.4207, 50.0888]; // Dammam
const DEFAULT_ZOOM = 12;
const LOCATION_ZOOM = 16;

const MarkerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface LocationPickerProps {
  location: Location | null;
  onLocationChange: (loc: Location) => void;
  onGetCurrentLocation: () => void;
  isLoadingLocation: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onLocationChange,
  onGetCurrentLocation,
  isLoadingLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialise map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker when location changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !location) return;

    const latLng: L.LatLngExpression = [location.lat, location.lng];

    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
    } else {
      const marker = L.marker(latLng, { icon: MarkerIcon, draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationChange({ lat: pos.lat, lng: pos.lng });
      });
      markerRef.current = marker;
    }

    map.flyTo(latLng, LOCATION_ZOOM, { animate: true, duration: 1 });
  }, [location, onLocationChange]);

  return (
    <div className="location-picker" dir="rtl">
      <IonButton
        expand="block"
        fill="outline"
        className="locate-btn"
        onClick={onGetCurrentLocation}
        disabled={isLoadingLocation}
      >
        <IonIcon slot="start" icon={locateOutline} />
        {isLoadingLocation ? 'جاري تحديد الموقع...' : 'تحديد موقعي الحالي'}
      </IonButton>

      <div className="map-wrapper">
        {isLoadingLocation && (
          <div className="map-skeleton">
            <IonSkeletonText animated style={{ width: '100%', height: '100%', borderRadius: '14px' }} />
          </div>
        )}
        <div ref={mapContainerRef} className="leaflet-map-container" />
      </div>

      {location ? (
        <div className="coords-badge">
          <IonIcon icon={locationOutline} />
          <IonText>
            <span>{location.lat.toFixed(6)}</span>
            <span className="coords-separator">,</span>
            <span>{location.lng.toFixed(6)}</span>
          </IonText>
        </div>
      ) : (
        <p className="map-hint">اضغط على الخريطة لتحديد الموقع أو استخدم زر التحديد التلقائي</p>
      )}
    </div>
  );
};

export default LocationPicker;
