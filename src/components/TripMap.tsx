import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface TripMapProps {
  fromLocation?: Location;
  toLocation?: Location;
  route?: { lat: number; lng: number }[];
}

const DEFAULT_CENTER: [number, number] = [-6.814716925593744, 39.287831907676]; // Posta Dar es Salaam
const ZOOM_LEVEL = 13;

const TripMap: React.FC<TripMapProps> = ({ fromLocation, toLocation, route = [] }) => {
  const mapRef = useRef<L.Map>(null);

  // Fit map to show all markers when locations change
  useEffect(() => {
    if ((fromLocation || toLocation) && mapRef.current) {
      const bounds = L.latLngBounds(
        fromLocation ? [fromLocation.lat, fromLocation.lng] : DEFAULT_CENTER,
        toLocation ? [toLocation.lat, toLocation.lng] : DEFAULT_CENTER
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [fromLocation, toLocation]);

  return (
    <div className="map-container" style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={ZOOM_LEVEL}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {fromLocation && (
          <Marker position={[fromLocation.lat, fromLocation.lng]} icon={defaultIcon}>
            <Popup>{fromLocation.name}</Popup>
          </Marker>
        )}
        
        {toLocation && (
          <Marker position={[toLocation.lat, toLocation.lng]} icon={defaultIcon}>
            <Popup>{toLocation.name}</Popup>
          </Marker>
        )}
        
        {route.length > 0 && (
          <Polyline 
            positions={route} 
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default TripMap;
