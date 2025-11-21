import React, { useEffect, useRef, useState } from 'react';
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
  onRouteDistanceChange?: (distanceKm: number | null) => void;
}

const DEFAULT_CENTER: [number, number] = [-6.814716925593744, 39.287831907676]; // Posta Dar es Salaam
const ZOOM_LEVEL = 13;

const TripMap: React.FC<TripMapProps> = ({ fromLocation, toLocation, route = [], onRouteDistanceChange }) => {
  const mapRef = useRef<L.Map | null>(null);
  const [routePositions, setRoutePositions] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  // Fit map to show all markers when locations change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Use setTimeout to ensure map is fully rendered before fitting bounds
    const fitMapBounds = () => {
      if (routePositions.length > 1) {
        // If we have a route, fit to the entire route path
        const bounds = L.latLngBounds(routePositions.map(([lat, lng]) => L.latLng(lat, lng)));
        map.fitBounds(bounds, { 
          padding: [60, 60],
          maxZoom: 15,
          animate: true
        });
      } else if (fromLocation && toLocation) {
        // If no route yet but have both locations, fit to show both markers
        const bounds = L.latLngBounds(
          [fromLocation.lat, fromLocation.lng],
          [toLocation.lat, toLocation.lng]
        );
        map.fitBounds(bounds, { 
          padding: [60, 60],
          maxZoom: 15,
          animate: true
        });
      } else if (fromLocation) {
        map.setView([fromLocation.lat, fromLocation.lng], 15, { animate: true });
      } else if (toLocation) {
        map.setView([toLocation.lat, toLocation.lng], 15, { animate: true });
      }
    };

    // Invalidate size first, then fit bounds
    setTimeout(() => {
      map.invalidateSize();
      setTimeout(fitMapBounds, 100);
    }, 100);
  }, [fromLocation, toLocation, routePositions]);
 
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, []);
  
  useEffect(() => {
    let cancelled = false;
    const fetchOrUseProvidedRoute = async () => {
      if (!(fromLocation && toLocation)) {
        setRoutePositions([]);
        setDistanceKm(null);
        if (onRouteDistanceChange && !cancelled) onRouteDistanceChange(null);
        return;
      }
      // Use provided route if available
      if (route && route.length > 1) {
        const coordsFromProp: [number, number][] = route.map(p => [p.lat, p.lng]);
        if (!cancelled) {
          setRoutePositions(coordsFromProp);
          setDistanceKm(null);
        }
        if (onRouteDistanceChange && !cancelled) onRouteDistanceChange(null);
        return;
      }
      // Otherwise fetch route from OSRM
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${fromLocation.lng},${fromLocation.lat};${toLocation.lng},${toLocation.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch route');
        const data = await res.json();
        const coords: [number, number][] =
          data?.routes?.[0]?.geometry?.coordinates?.map((c: [number, number]) => [c[1], c[0]]) || [];
        if (!cancelled) setRoutePositions(coords);
        const dist = typeof data?.routes?.[0]?.distance === 'number' ? data.routes[0].distance / 1000 : null;
        if (!cancelled) setDistanceKm(dist);
        if (onRouteDistanceChange && !cancelled) onRouteDistanceChange(dist);
      } catch (e) {
        console.error('Routing error:', e);
        if (!cancelled) setRoutePositions([]);
        if (!cancelled) setDistanceKm(null);
        if (onRouteDistanceChange && !cancelled) onRouteDistanceChange(null);
      }
    };
    fetchOrUseProvidedRoute();
    return () => { cancelled = true; };
  }, [fromLocation, toLocation, route, onRouteDistanceChange]);

  return (
    <div className="map-container" style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
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
        
        {(routePositions.length > 0 || route.length > 0) && (
          <Polyline 
            positions={routePositions.length > 0 ? routePositions : route.map(p => [p.lat, p.lng] as [number, number])} 
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
      {distanceKm !== null && (
        <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', fontSize: '12px' }}>
          Estimated distance: {distanceKm.toFixed(1)} km
        </div>
      )}
    </div>
  );
};

export default TripMap;
