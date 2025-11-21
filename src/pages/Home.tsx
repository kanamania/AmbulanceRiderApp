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
  IonToast,
  IonDatetime,
  IonModal
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
import notificationService from '../services/notification.service';
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
  name: string;
  emergencyType: string;
  notes: string;
  attributeValues: Record<string, unknown>;
  scheduledStartTime: string | null;
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
  const [nameEdited, setNameEdited] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  const shortenAddress = (addr: string): string => {
    if (!addr) return '';
    const parts = addr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !/^(tanzania|dar es salaam|tz)$/i.test(s));
    let out = parts.slice(0, 2).join(', ');
    if (!out) out = parts[0] || addr;
    out = out
      .replace(/\bStreet\b/gi, 'St')
      .replace(/\bRoad\b/gi, 'Rd')
      .replace(/\bAvenue\b/gi, 'Ave')
      .replace(/\bBoulevard\b/gi, 'Blvd')
      .replace(/\bLane\b/gi, 'Ln')
      .replace(/\bDrive\b/gi, 'Dr')
      .replace(/\bCourt\b/gi, 'Ct')
      .replace(/\bPlace\b/gi, 'Pl')
      .replace(/\bSquare\b/gi, 'Sq');
    if (out.length > 40) out = out.slice(0, 37) + '...';
    return out;
  };

  const formatDateTime = (iso: string | null): string => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { timeZone: 'Africa/Dar_es_Salaam' });
    } catch {
      return '';
    }
  };

  const nowEATIso = (): string => {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Dar_es_Salaam',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]));
    const y = parts.year;
    const m = parts.month;
    const d = parts.day;
    const hh = parts.hour;
    const mm = parts.minute;
    const ss = parts.second;
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}+03:00`;
  };

  const toEATIso = (value: string | null): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Dar_es_Salaam',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
    const y = parts.year;
    const m = parts.month;
    const d = parts.day;
    const hh = parts.hour;
    const mm = parts.minute;
    const ss = parts.second;
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}+03:00`;
  };

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
    name: '',
    emergencyType: '',
    notes: '',
    attributeValues: {},
    scheduledStartTime: nowEATIso(),
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
        fromLatitude: location.latitude,
        fromLongitude: location.longitude,
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
        toLatitude: location.latitude,
        toLongitude: location.longitude,
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

  // Auto-generate trip name from addresses unless user edited it
  useEffect(() => {
    if (nameEdited) return;
    const auto = formData.fromAddress && formData.toAddress
      ? `${shortenAddress(formData.fromAddress)} -> ${shortenAddress(formData.toAddress)}`
      : '';
    if (formData.name !== auto) {
      setFormData(prev => ({ ...prev, name: auto }));
    }
  }, [formData.fromAddress, formData.toAddress, nameEdited]);

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

    if (formData.scheduledStartTime) {
      const scheduledMs = new Date(formData.scheduledStartTime).getTime();
      if (scheduledMs < Date.now()) {
        setToastMessage('Please select a future scheduled start time');
        setToastColor('danger');
        setShowToast(true);
        return;
      }
    }

    if (!formData.name.trim()) {
      setToastMessage('Please trip enter name');
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

      const attributeValuesPayload = selectedTripType
        ? selectedTripType.attributes
            .filter(attr => Object.prototype.hasOwnProperty.call(formData.attributeValues, attr.name))
            .map(attr => {
              const raw = (formData.attributeValues as Record<string, unknown>)[attr.name];
              const value = raw == null
                ? ''
                : typeof raw === 'string'
                  ? raw
                  : (Array.isArray(raw) || typeof raw === 'object')
                    ? JSON.stringify(raw)
                    : String(raw);
              return {
                tripTypeAttributeId: attr.id,
                value,
              };
            })
            .filter(item => item.value.trim() !== '')
        : undefined;
      const attributeValuesPayloadFinal = attributeValuesPayload && attributeValuesPayload.length > 0 ? attributeValuesPayload : undefined;

      const tripData: CreateTripData = {
        tripTypeId: formData.tripTypeId || undefined,
        fromAddress: formData.fromAddress,
        toAddress: formData.toAddress,
        fromLatitude: formData.fromLatitude,
        fromLongitude: formData.fromLongitude,
        toLatitude: formData.toLatitude,
        toLongitude: formData.toLongitude,
        name: formData.name,
        emergencyType: formData.emergencyType || undefined,
        notes: formData.notes || undefined,
        attributeValues: attributeValuesPayloadFinal,
        telemetry,
        scheduledStartTime: formData.scheduledStartTime ?? null,
      };

      const createdTrip = await tripService.createTrip(tripData);
      
      // Send notification via backend (will broadcast via SignalR)
      try {
        await notificationService.notifyTripCreated(createdTrip.id);
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the trip creation if notification fails
      }
      
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
        name: '',
        emergencyType: '',
        notes: '',
        attributeValues: {},
        scheduledStartTime: nowEATIso(),
      });
      setSelectedTripType(null);
      setNameEdited(false);
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

              {/* Trip Name */}
              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Trip Name</IonLabel>
                    <IonInput
                      value={formData.name}
                      onIonInput={e => { setFormData(prev => ({ ...prev, name: e.detail.value || '' })); setNameEdited(true); }}
                      placeholder="e.g., Pickup Address -> Destination Address"
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              {/* Scheduled Start Time (Optional) */}
              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Scheduled Start Time (optional)</IonLabel>
                    <IonInput
                      value={formatDateTime(formData.scheduledStartTime)}
                      placeholder={formatDateTime(formData.scheduledStartTime) || 'Now'}
                      readonly
                      onClick={() => setShowSchedulePicker(true)}
                    />
                  </IonItem>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, gap: 8 }}>
                    <IonButton size="small" onClick={() => setShowSchedulePicker(true)}>Pick</IonButton>
                    <IonButton size="small" fill="outline" onClick={() => setFormData(prev => ({ ...prev, scheduledStartTime: null }))}>Clear</IonButton>
                  </div>
                </IonCol>
              </IonRow>

              <IonModal isOpen={showSchedulePicker} onDidDismiss={() => setShowSchedulePicker(false)}>
                <div style={{ padding: 16 }}>
                  <IonDatetime
                    presentation="date-time"
                    value={formData.scheduledStartTime ?? undefined}
                    min={nowEATIso()}
                    onIonChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        scheduledStartTime: toEATIso(
                          typeof e.detail.value === 'string'
                            ? e.detail.value
                            : Array.isArray(e.detail.value)
                              ? (e.detail.value[0] as string | undefined) || null
                              : null
                        ),
                      }))
                    }
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
                    <IonButton fill="outline" onClick={() => setShowSchedulePicker(false)}>Cancel</IonButton>
                    <IonButton onClick={() => setShowSchedulePicker(false)}>Done</IonButton>
                  </div>
                </div>
              </IonModal>

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
                    Request Trip
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
