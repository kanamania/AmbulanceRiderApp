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
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
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
  const DEFAULT_CENTER: [number, number] = [-6.814716925593744, 39.287831907676]; // Posta Dar es Salaam
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: number; lon: number }[]>([]);
  const [searching, setSearching] = useState(false);

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

  useEffect(() => {
    if (!isOpen) return;
    const map = mapRef.current;
    if (!map) return;
    const target = selectedPosition
      ? selectedPosition
      : initialLocation
      ? [initialLocation.lat, initialLocation.lng]
      : null;
    if (target) {
      map.setView(target as [number, number], map.getZoom(), { animate: true });
    }
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, [isOpen, initialLocation, selectedPosition]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5`;
        const res = await fetch(url, { signal: controller.signal, headers: { 'Accept-Language': 'en' } });
        if (!res.ok) throw new Error('Failed to search');
        const data = await res.json();
        const mapped = data.map((d: { display_name: string; lat: string; lon: string }) => ({ display_name: d.display_name, lat: parseFloat(d.lat), lon: parseFloat(d.lon) }));
        setSearchResults(mapped);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Search error:', err.message);
        }
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [searchQuery]);

  const handleSelectLocation = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    setSearchQuery('');
    setSearchResults([]);
    const map = mapRef.current;
    if (map) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
      setTimeout(() => {
        map.invalidateSize();
      }, 0);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleSelectLocation(lat, lng);
        setSearchQuery('');
        setSearchResults([]);
        setLoading(false);
      },
      () => {
        setError('Unable to get current location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
    } catch (err) {
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
          <div style={{ position: 'relative', height: '100%' }}>
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

            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000 }}>
              <IonSearchbar
                value={searchQuery}
                onIonInput={(e) => setSearchQuery((e).detail.value || '')}
                placeholder="Search for a place"
              />
              {(searchQuery.length > 0 || searchResults.length > 0) && (
                <div style={{ marginTop: 8, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', maxHeight: 240, overflow: 'auto' }}>
                  <IonList>
                    <IonItem button onClick={handleUseCurrentLocation}>
                      <IonLabel>Use my current location</IonLabel>
                    </IonItem>
                    {searchResults.map((r, idx) => (
                      <IonItem key={idx} button onClick={() => handleSelectLocation(r.lat, r.lon)}>
                        <IonLabel>{r.display_name}</IonLabel>
                      </IonItem>
                    ))}
                    {!searching && searchResults.length === 0 && searchQuery.length >= 3 && (
                      <IonItem>
                        <IonLabel>No results</IonLabel>
                      </IonItem>
                    )}
                  </IonList>
                </div>
              )}
            </div>

            <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 1000 }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666', background: 'rgba(255,255,255,0.9)', padding: '8px 12px', borderRadius: 8 }}>
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
