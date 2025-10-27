import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonItem, 
  IonLabel, 
  IonSelect, 
  IonSelectOption, 
  IonButton, 
  IonLoading, 
  IonCard, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle, 
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon
} from '@ionic/react';
import { locationOutline, navigateOutline, timeOutline } from 'ionicons/icons';
import TripMap from '../components/TripMap';
import routeService from '../services/route.service';
import locationService from '../services/location.service';
import { Route, Location } from '../types';
import './Home.css';

interface LocationWithCoords extends Location {
  lat: number;
  lng: number;
}

// Mock coordinates for locations (in a real app, these would come from your API)
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'Addis Ababa': { lat: 9.0054, lng: 38.7636 },
  'Adama': { lat: 8.5390, lng: 39.2682 },
  'Bahir Dar': { lat: 11.6000, lng: 37.3833 },
  'Mekele': { lat: 13.4966, lng: 39.4769 },
  'Hawassa': { lat: 7.0612, lng: 38.4764 },
};

const Home: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fromLocation, setFromLocation] = useState<LocationWithCoords | null>(null);
  const [toLocation, setToLocation] = useState<LocationWithCoords | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [showRouteInfo, setShowRouteInfo] = useState<boolean>(false);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [estimatedDistance, setEstimatedDistance] = useState<string>('');

  // Fetch routes and locations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [routesData, locationsData] = await Promise.all([
          routeService.getAllRoutes(),
          locationService.getAllLocations()
        ]);
        
        setRoutes(routesData);
        setLocations(locationsData);
        
        // If there are routes, select the first one by default
        if (routesData.length > 0) {
          handleRouteSelect(routesData[0].id.toString());
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle route selection
  const handleRouteSelect = (routeId: string) => {
    const route = routes.find(r => r.id.toString() === routeId);
    if (!route) return;

    setSelectedRoute(route);
    
    // Find the from and to locations
    const fromLoc = locations.find(loc => loc.id === route.fromLocationId);
    const toLoc = locations.find(loc => loc.id === route.toLocationId);

    if (fromLoc && toLoc) {
      const fromCoords = LOCATION_COORDS[fromLoc.name] || { lat: 9.0054, lng: 38.7636 };
      const toCoords = LOCATION_COORDS[toLoc.name] || { lat: 9.0054, lng: 38.7636 };
      
      setFromLocation({ ...fromLoc, ...fromCoords });
      setToLocation({ ...toLoc, ...toCoords });
      
      // Generate some points for the route line (in a real app, this would come from a routing API)
      const points = [];
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const lat = fromCoords.lat + (toCoords.lat - fromCoords.lat) * (i / steps);
        const lng = fromCoords.lng + (toCoords.lng - fromCoords.lng) * (i / steps);
        // Add some randomness to make it look like a real route
        points.push({
          lat: lat + (Math.random() - 0.5) * 0.1,
          lng: lng + (Math.random() - 0.5) * 0.1
        });
      }
      setRouteCoords(points);
      
      // Calculate estimated time and distance (in a real app, this would come from the API)
      setEstimatedDistance(`${Math.round(route.distance * 10) / 10} km`);
      setEstimatedTime(`${Math.round(route.estimatedDuration / 60)} mins`);
      
      setShowRouteInfo(true);
    }
  };

  // Handle book now button click
  const handleBookNow = () => {
    if (!selectedRoute) return;
    alert(`Booking confirmed for route: ${selectedRoute.name}`);
    // In a real app, you would navigate to a booking page or show a booking form
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Ambulance Service</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Loading..." />
        
        {error && (
          <IonCard color="danger">
            <IonCardHeader>
              <IonCardSubtitle>Error</IonCardSubtitle>
              <IonCardTitle>Something went wrong</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>{error}</IonCardContent>
          </IonCard>
        )}
        
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Book an Ambulance</IonCardSubtitle>
            <IonCardTitle>Select Your Route</IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Select Route</IonLabel>
              <IonSelect 
                value={selectedRoute?.id.toString()} 
                onIonChange={e => handleRouteSelect(e.detail.value)}
                placeholder="Select a route"
                interface="action-sheet"
              >
                {routes.map(route => (
                  <IonSelectOption key={route.id} value={route.id.toString()}>
                    {route.name} ({route.fromLocation.name} → {route.toLocation.name})
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            
            {showRouteInfo && selectedRoute && fromLocation && toLocation && (
              <>
                <div style={{ margin: '20px 0' }}>
                  <TripMap 
                    fromLocation={{
                      lat: fromLocation.lat,
                      lng: fromLocation.lng,
                      name: fromLocation.name
                    }}
                    toLocation={{
                      lat: toLocation.lat,
                      lng: toLocation.lng,
                      name: toLocation.name
                    }}
                    route={routeCoords}
                  />
                </div>
                
                <IonGrid>
                  <IonRow>
                    <IonCol size="12">
                      <IonItem lines="none">
                        <IonIcon icon={locationOutline} slot="start" color="primary" />
                        <IonLabel>
                          <h3>From: {fromLocation.name}</h3>
                        </IonLabel>
                      </IonItem>
                      <IonItem lines="none">
                        <IonIcon icon={navigateOutline} slot="start" color="primary" />
                        <IonLabel>
                          <h3>To: {toLocation.name}</h3>
                        </IonLabel>
                      </IonItem>
                      <IonItem lines="none">
                        <IonIcon icon={timeOutline} slot="start" color="primary" />
                        <IonLabel>
                          <h3>Estimated Time: {estimatedTime}</h3>
                        </IonLabel>
                      </IonItem>
                      <IonItem lines="none">
                        <IonIcon icon="analytics-outline" slot="start" color="primary" />
                        <IonLabel>
                          <h3>Distance: {estimatedDistance}</h3>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                  
                  <IonRow className="ion-justify-content-center ion-margin-top">
                    <IonCol size="12" sizeMd="8" sizeLg="6">
                      <IonButton 
                        expand="block" 
                        size="large" 
                        onClick={handleBookNow}
                        disabled={!selectedRoute}
                      >
                        Book Ambulance Now
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Home;
