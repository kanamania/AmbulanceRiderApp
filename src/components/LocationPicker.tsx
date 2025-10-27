import React, { useState, useRef, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (location: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
}

// Component to handle map clicks
const MapClickHandler: React.FC<{
  onLocationClick: (lat: number, lng: number) => void;
}> = ({ onLocationClick }) => {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelected,
  initialLocation,
}) => {
  const DEFAULT_CENTER: [number, number] = [9.0054, 38.7636]; // Addis Ababa
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map>(null);

  // Reset selected position when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialLocation) {
        setSelectedPosition([initialLocation.lat, initialLocation.lng]);
      } else {
        setSelectedPosition(null);
      }
    }
  }, [isOpen, initialLocation]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
  };

  const handleConfirm = async () => {
    if (!selectedPosition) {
      setError('Please select a location on the map');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use Nominatim reverse geocoding to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedPosition[0]}&lon=${selectedPosition[1]}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      const address = data.display_name || `${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}`;

      onLocationSelected({
        latitude: selectedPosition[0],
        longitude: selectedPosition[1],
        address: address,
      });

      onClose();
    } catch (err: any) {
      console.error('Error fetching address:', err);
      // Fallback to coordinates if geocoding fails
      onLocationSelected({
        latitude: selectedPosition[0],
        longitude: selectedPosition[1],
        address: `${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}`,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Select Location</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>Cancel</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <MapContainer
                center={initialLocation ? [initialLocation.lat, initialLocation.lng] : DEFAULT_CENTER}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler onLocationClick={handleMapClick} />
                {selectedPosition && (
                  <Marker position={selectedPosition} icon={defaultIcon} />
                )}
              </MapContainer>
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                {selectedPosition
                  ? `Selected: ${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}`
                  : 'Tap on the map to select a location'}
              </p>
              <IonButton
                expand="block"
                onClick={handleConfirm}
                disabled={!selectedPosition || loading}
              >
                {loading ? 'Getting Address...' : 'Confirm Location'}
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <IonLoading isOpen={loading} message="Getting address..." />
      
      <IonToast
        isOpen={!!error}
        message={error || ''}
        duration={3000}
        onDidDismiss={() => setError(null)}
        color="danger"
      />
    </>
  );
};

export default LocationPicker;
