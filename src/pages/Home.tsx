import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
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
  IonIcon,
  IonInput,
  IonTextarea,
  IonToast
} from '@ionic/react';
import { locationOutline, navigateOutline, mapOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import AppHeader from '../components/AppHeader';
import TripMap from '../components/TripMap';
import LocationPicker from '../components/LocationPicker';
import DynamicFormField from '../components/DynamicFormField';
import { useAuth } from '../contexts/AuthContext';
import locationService from '../services/location.service';
import tripService from '../services/trip.service';
import { Location, CreateTripData, TripType } from '../types';
import { TelemetryCollector } from '../utils/telemetry.util';
import './Home.css';

interface TripFormData {
  tripTypeId: number | null;
  fromLocationId: number | null;
  toLocationId: number | null;
  fromAddress: string;
  toAddress: string;
  fromLatitude: number | null;
  fromLongitude: number | null;
  toLatitude: number | null;
  toLongitude: number | null;
  patientName: string;
  emergencyType: string;
  notes: string;
  attributeValues: Record<string, unknown>;
}

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { tripTypes, isAuthenticated, isLoading: authLoading } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedTripType, setSelectedTripType] = useState<TripType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger');

  // Form state
  const [formData, setFormData] = useState<TripFormData>({
    tripTypeId: null,
    fromLocationId: null,
    toLocationId: null,
    fromAddress: '',
    toAddress: '',
    fromLatitude: null,
    fromLongitude: null,
    toLatitude: null,
    toLongitude: null,
    patientName: '',
    emergencyType: '',
    notes: '',
    attributeValues: {},
  });

  // Map picker state
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Fetch locations on component mount - only after auth is loaded
  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if auth is still loading or user is not authenticated
      if (authLoading || !isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const locationsData = await locationService.getAllLocations();
        setLocations(locationsData);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load locations';
        
        // If we get a 401, it means the token is invalid - don't show error to user
        // The API interceptor will handle the redirect to login
        if (errorMessage.includes('401')) {
          return;
        }
        
        console.error('Error fetching data:', error);
        setToastMessage(errorMessage);
        setToastColor('danger');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated]);

  // Handle predefined location selection for "from"
  const handleFromLocationSelect = (locationId: string) => {
    const location = locations.find(loc => loc.id.toString() === locationId);
    if (location) {
      setFormData(prev => ({
        ...prev,
        fromLocationId: location.id,
        fromAddress: location.name,
        // In a real app, you would get coordinates from the location object
        // For now, we'll leave them null until the user picks from map
      }));
    }
  };

  // Handle predefined location selection for "to"
  const handleToLocationSelect = (locationId: string) => {
    const location = locations.find(loc => loc.id.toString() === locationId);
    if (location) {
      setFormData(prev => ({
        ...prev,
        toLocationId: location.id,
        toAddress: location.name,
        // In a real app, you would get coordinates from the location object
      }));
    }
  };

  // Handle map-based location selection for "from"
  const handleFromMapLocation = (location: { latitude: number; longitude: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      fromLatitude: location.latitude,
      fromLongitude: location.longitude,
      fromAddress: location.address,
      fromLocationId: null, // Clear predefined location when using custom coordinates
    }));
  };

  // Handle map-based location selection for "to"
  const handleToMapLocation = (location: { latitude: number; longitude: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      toLatitude: location.latitude,
      toLongitude: location.longitude,
      toAddress: location.address,
      toLocationId: null, // Clear predefined location when using custom coordinates
    }));
  };

  // Handle trip type selection
  const handleTripTypeSelect = (tripTypeId: string) => {
    const tripType = tripTypes.find(t => t.id.toString() === tripTypeId);
    setSelectedTripType(tripType || null);
    setFormData(prev => ({
      ...prev,
      tripTypeId: tripType ? tripType.id : null,
      attributeValues: {}, // Reset attribute values when trip type changes
    }));
  };

  // Handle dynamic attribute value change
  const handleAttributeChange = (attributeName: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      attributeValues: {
        ...prev.attributeValues,
        [attributeName]: value,
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.fromAddress || !formData.toAddress) {
      setToastMessage('Please select both pickup and destination locations');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (formData.fromLatitude === null || formData.fromLongitude === null ||
        formData.toLatitude === null || formData.toLongitude === null) {
      setToastMessage('Please select locations with coordinates using the map picker');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!formData.patientName.trim()) {
      setToastMessage('Please enter patient name');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    // Validate required dynamic attributes
    if (selectedTripType) {
      const requiredAttributes = selectedTripType.attributes.filter(attr => attr.isRequired && attr.isActive);
      for (const attr of requiredAttributes) {
        const value = formData.attributeValues[attr.name];
        if (value === undefined || value === null || value === '') {
          setToastMessage(`Please fill in required field: ${attr.label}`);
          setToastColor('danger');
          setShowToast(true);
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      // Collect telemetry data with GPS location
      const telemetry = await TelemetryCollector.collectTelemetryWithLocation();

      const tripData: CreateTripData = {
        tripTypeId: formData.tripTypeId || undefined,
        fromLocationId: formData.fromLocationId || undefined,
        toLocationId: formData.toLocationId || undefined,
        fromAddress: formData.fromAddress,
        toAddress: formData.toAddress,
        fromLatitude: formData.fromLatitude,
        fromLongitude: formData.fromLongitude,
        toLatitude: formData.toLatitude,
        toLongitude: formData.toLongitude,
        patientName: formData.patientName,
        emergencyType: formData.emergencyType || undefined,
        notes: formData.notes || undefined,
        attributeValues: Object.keys(formData.attributeValues).length > 0 ? formData.attributeValues : undefined,
        telemetry,
      };

      await tripService.createTrip(tripData);
      
      setToastMessage('Trip request created successfully!');
      setToastColor('success');
      setShowToast(true);
      
      // Reset form
      setFormData({
        tripTypeId: null,
        fromLocationId: null,
        toLocationId: null,
        fromAddress: '',
        toAddress: '',
        fromLatitude: null,
        fromLongitude: null,
        toLatitude: null,
        toLongitude: null,
        patientName: '',
        emergencyType: '',
        notes: '',
        attributeValues: {},
      });
      setSelectedTripType(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create trip request';
      setToastMessage(errorMessage);
      setToastColor('danger');
      setShowToast(true);
      console.error('Error creating trip:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <AppHeader title={t('trip.bookTrip')} />
      
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading || submitting} message={submitting ? t('common.loading') : t('common.loading')} />
        
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Trip</IonCardSubtitle>
            <IonCardTitle>Request a Trip</IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            <IonGrid>
              {/* Pickup Section */}
              <IonRow>
                <IonCol size="12">
                  <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                    <IonIcon icon={locationOutline} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Pickup
                  </h3>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12" sizeMd="8">
                  <IonItem>
                    <IonLabel position="stacked">Select Predefined Location</IonLabel>
                    <IonSelect 
                      value={formData.fromLocationId?.toString() || ''} 
                      onIonChange={e => handleFromLocationSelect(e.detail.value)}
                      placeholder="Choose a location"
                      interface="action-sheet"
                    >
                      {locations.map(location => (
                        <IonSelectOption key={location.id} value={location.id.toString()}>
                          {location.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
                <IonCol size="12" sizeMd="4">
                  <IonButton 
                    expand="block" 
                    fill="outline"
                    onClick={() => setShowFromPicker(true)}
                    style={{ marginTop: '20px' }}
                  >
                    <IonIcon icon={mapOutline} slot="start" />
                    Pick on Map
                  </IonButton>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Pickup Address</IonLabel>
                    <IonInput 
                      value={formData.fromAddress}
                      onIonInput={e => setFormData(prev => ({ ...prev, fromAddress: e.detail.value || '' }))}
                      placeholder="Address will be filled automatically"
                      readonly={!!formData.fromLocationId}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              {/* Destination Location Section */}
              <IonRow style={{ marginTop: '24px' }}>
                <IonCol size="12">
                  <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                    <IonIcon icon={navigateOutline} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Destination
                  </h3>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12" sizeMd="8">
                  <IonItem>
                    <IonLabel position="stacked">Select Predefined Location</IonLabel>
                    <IonSelect 
                      value={formData.toLocationId?.toString() || ''} 
                      onIonChange={e => handleToLocationSelect(e.detail.value)}
                      placeholder="Choose a location"
                      interface="action-sheet"
                    >
                      {locations.map(location => (
                        <IonSelectOption key={location.id} value={location.id.toString()}>
                          {location.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
                <IonCol size="12" sizeMd="4">
                  <IonButton 
                    expand="block" 
                    fill="outline"
                    onClick={() => setShowToPicker(true)}
                    style={{ marginTop: '20px' }}
                  >
                    <IonIcon icon={mapOutline} slot="start" />
                    Pick on Map
                  </IonButton>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Destination Address</IonLabel>
                    <IonInput 
                      value={formData.toAddress}
                      onIonInput={e => setFormData(prev => ({ ...prev, toAddress: e.detail.value || '' }))}
                      placeholder="Address will be filled automatically"
                      readonly={!!formData.toLocationId}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Select Trip Type</IonLabel>
                    <IonSelect 
                      value={formData.tripTypeId?.toString() || ''} 
                      onIonChange={e => handleTripTypeSelect(e.detail.value)}
                      placeholder="Choose trip type (optional)"
                      interface="action-sheet"
                    >
                      {tripTypes.map(tripType => (
                        <IonSelectOption key={tripType.id} value={tripType.id.toString()}>
                          {tripType.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                  {selectedTripType?.description && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '8px 16px', fontStyle: 'italic' }}>
                      {selectedTripType.description}
                    </p>
                  )}
                </IonCol>
              </IonRow>

              {/* Dynamic Attributes Section */}
              {selectedTripType && selectedTripType.attributes.length > 0 && (
                  <>
                    <IonRow style={{ marginTop: '24px' }}>
                      <IonCol size="12">
                        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                          Additional Information
                        </h3>
                      </IonCol>
                    </IonRow>

                    {selectedTripType.attributes
                        .filter(attr => attr.isActive)
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map(attribute => (
                            <IonRow key={attribute.id}>
                              <IonCol size="12">
                                <DynamicFormField
                                    attribute={attribute}
                                    value={formData.attributeValues[attribute.name]}
                                    onChange={handleAttributeChange}
                                />
                              </IonCol>
                            </IonRow>
                        ))}
                  </>
              )}


              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Additional Notes</IonLabel>
                    <IonTextarea 
                      value={formData.notes}
                      onIonInput={e => setFormData(prev => ({ ...prev, notes: e.detail.value || '' }))}
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              {/* Map Preview */}
              {formData.fromLatitude && formData.fromLongitude && 
               formData.toLatitude && formData.toLongitude && (
                <IonRow style={{ marginTop: '24px' }}>
                  <IonCol size="12">
                    <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                      Route Preview
                    </h3>
                    <TripMap 
                      fromLocation={{
                        lat: formData.fromLatitude,
                        lng: formData.fromLongitude,
                        name: formData.fromAddress
                      }}
                      toLocation={{
                        lat: formData.toLatitude,
                        lng: formData.toLongitude,
                        name: formData.toAddress
                      }}
                    />
                  </IonCol>
                </IonRow>
              )}

              {/* Submit Button */}
              <IonRow className="ion-margin-top">
                <IonCol size="12">
                  <IonButton 
                    expand="block" 
                    size="large" 
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    Request Ambulance
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Location Pickers */}
        <LocationPicker 
          isOpen={showFromPicker}
          onClose={() => setShowFromPicker(false)}
          onLocationSelected={handleFromMapLocation}
          initialLocation={
            formData.fromLatitude && formData.fromLongitude
              ? { lat: formData.fromLatitude, lng: formData.fromLongitude }
              : undefined
          }
        />
        
        <LocationPicker 
          isOpen={showToPicker}
          onClose={() => setShowToPicker(false)}
          onLocationSelected={handleToMapLocation}
          initialLocation={
            formData.toLatitude && formData.toLongitude
              ? { lat: formData.toLatitude, lng: formData.toLongitude }
              : undefined
          }
        />

        {/* Toast Messages */}
        <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={3000}
            color={toastColor}
        />

      </IonContent>
    </IonPage>
  );
};

export default Home;
