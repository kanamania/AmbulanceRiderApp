import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonButton,
  IonIcon, 
  useIonToast,
  useIonLoading,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonList,
  IonAvatar,
  IonSpinner,
  IonText,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { 
  save,
  trash, 
  car, 
  checkmarkCircle,
  alertCircle,
  camera,
  closeCircle,
  barcode,
  informationCircle,
  add
} from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {useForm, Controller, Resolver} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { VehicleType } from '../../types/vehicle.types';
import { vehicleService, fileUploadService } from '../../services';
import {AdminLayout} from '../../layouts/AdminLayout';
import './AdminPages.css';

// Validation schema
const vehicleSchema = yup.object().shape({
  name: yup.string().required('Vehicle name is required'),
  plateNumber: yup.string().required('Plate number is required'),
  vehicleTypeId: yup.number().required('Vehicle type is required')
});

interface VehicleFormData {
  name: string;
  plateNumber: string;
  vehicleTypeId: number;
}

const VehicleEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset
  } = useForm<VehicleFormData>({
    resolver: yupResolver(vehicleSchema) as unknown as Resolver<VehicleFormData>,
    defaultValues: {
      name: '',
      plateNumber: '',
      vehicleTypeId: undefined
    }
  });

  // Load vehicle data if in edit mode
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load vehicle types
        const types = await vehicleService.getVehicleTypes();
        setVehicleTypes(types);
        
        if (isEdit && id) {
          // Load vehicle data
          const vehicleData = await vehicleService.getVehicle(parseInt(id!));
          
          // Set form values
          reset({
            name: vehicleData.name,
            plateNumber: vehicleData.plateNumber,
            vehicleTypeId: vehicleData.vehicleTypeId
          });
          
          // Set image preview if available
          if (vehicleData.image) {
            setImagePreview(vehicleData.image);
            setUploadedImagePath(vehicleData.image);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        presentToast({
          message: 'Failed to load vehicle data',
          duration: 3000,
          color: 'danger'
        });
        navigate('/admin/vehicles');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, isEdit, navigate, presentToast, reset]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = fileUploadService.validateImageFile(file);
    if (!validation.valid) {
      presentToast({
        message: validation.error || 'Invalid file',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
      return;
    }

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Store file for upload on save
      setImageFile(file);
      
      // If editing, upload immediately
      if (isEdit && id) {
        await presentLoading('Uploading image...');
        const response = await fileUploadService.uploadVehicleImage(file);
        setUploadedImagePath(response.filePath);
        setImagePreview(response.fileUrl);
        
        presentToast({
          message: 'Image uploaded successfully',
          duration: 2000,
          color: 'success',
          icon: checkmarkCircle
        });
        await dismissLoading();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      await dismissLoading();
      presentToast({
        message: 'Failed to upload image',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
    }
  };

  const removeImage = async () => {
    try {
      // If there's an uploaded image path, delete it from server
      if (uploadedImagePath) {
        await presentLoading('Removing image...');
        await fileUploadService.deleteVehicleImage(uploadedImagePath);
        await dismissLoading();
        
        presentToast({
          message: 'Image removed successfully',
          duration: 2000,
          color: 'success',
          icon: checkmarkCircle
        });
      }
      
      setImagePreview(null);
      setUploadedImagePath(null);
      setImageFile(null);
    } catch (error) {
      console.error('Error removing image:', error);
      await dismissLoading();
      presentToast({
        message: 'Failed to remove image',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      setIsSubmitting(true);
      
      // Upload image if there's a new file
      let imageUrl = uploadedImagePath;
      if (imageFile) {
        try {
          const response = await fileUploadService.uploadVehicleImage(imageFile);
          imageUrl = response.fileUrl;
        } catch (error) {
          console.error('Error uploading image:', error);
          presentToast({
            message: 'Failed to upload image, but continuing with vehicle save',
            duration: 3000,
            color: 'warning'
          });
        }
      }
      
      const vehicleData = {
        ...data,
        image: imageUrl || undefined,
      };
      
      if (isEdit && id) {
        // Update existing vehicle
        await vehicleService.updateVehicle(parseInt(id!), vehicleData);
        presentToast({
          message: 'Vehicle updated successfully',
          duration: 3000,
          color: 'success',
          icon: checkmarkCircle
        });
      } else {
        // Create new vehicle
        await vehicleService.createVehicle(vehicleData);
        presentToast({
          message: 'Vehicle created successfully',
          duration: 3000,
          color: 'success',
          icon: checkmarkCircle
        });
      }
      
      navigate('/admin/vehicles');
    } catch (err) {
      const error = err as Error;
      console.error('Error saving vehicle:', error);
      presentToast({
        message: error.message || 'Failed to save vehicle',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    
    try {
      await presentLoading('Deleting vehicle...');
      await vehicleService.deleteVehicle(parseInt(id!));
      
      presentToast({
        message: 'Vehicle deleted successfully',
        duration: 3000,
        color: 'success',
        icon: checkmarkCircle
      });
      
      navigate('/admin/vehicles');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      presentToast({
        message: 'Failed to delete vehicle',
        duration: 3000,
        color: 'danger',
        icon: alertCircle
      });
    } finally {
      await dismissLoading();
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'}>
        <div className="loading-container">
          <IonSpinner name="crescent" />
          <p>Loading vehicle data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'}>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
          <IonList lines="full" className="ion-margin-bottom">
            {/* Vehicle Image */}
            <div className="ion-text-center ion-margin-vertical">
              <div className="image-upload-container">
                <IonAvatar className="vehicle-image-preview">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vehicle" />
                  ) : (
                    <IonIcon icon={car} className="placeholder-icon" />
                  )}
                  
                  <div className="image-actions">
                    <IonButton 
                      fill="clear" 
                      color="light" 
                      className="upload-button"
                      onClick={() => document.getElementById('vehicle-image-upload')?.click()}
                    >
                      <IonIcon icon={camera} slot="icon-only" />
                    </IonButton>
                    
                    {imagePreview && (
                      <IonButton 
                        fill="clear" 
                        color="light" 
                        className="remove-button"
                        onClick={removeImage}
                      >
                        <IonIcon icon={closeCircle} slot="icon-only" />
                      </IonButton>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    id="vehicle-image-upload" 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </IonAvatar>
              </div>
            </div>

            {/* Vehicle Information */}
            <h3 className="section-title">
              <IonIcon icon={informationCircle} className="section-icon" />
              Vehicle Information
            </h3>
            
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.name ? 'ion-invalid' : ''}`}>
                    <IonLabel position="floating">Vehicle Name <span className="required">*</span></IonLabel>
                    <IonIcon icon={car} slot="start" className="input-icon" />
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <IonInput 
                          value={field.value} 
                          onIonChange={e => field.onChange(e.detail.value)}
                          type="text"
                          placeholder="Ambulance 1"
                        />
                      )}
                    />
                    {errors.name && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>{errors.name.message}</small>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeSm="6">
                  <IonItem className={`form-group ${errors.plateNumber ? 'ion-invalid' : ''}`}>
                    <IonLabel position="floating">Plate Number <span className="required">*</span></IonLabel>
                    <IonIcon icon={barcode} slot="start" className="input-icon" />
                    <Controller
                      name="plateNumber"
                      control={control}
                      render={({ field }) => (
                        <IonInput 
                          value={field.value} 
                          onIonChange={e => field.onChange(e.detail.value)}
                          type="text"
                          placeholder="ABC-1234"
                        />
                      )}
                    />
                    {errors.plateNumber && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>{errors.plateNumber.message}</small>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12">
                  <IonItem className={`form-group ${errors.vehicleTypeId ? 'ion-invalid' : ''}`}>
                    <IonLabel>Vehicle Type <span className="required">*</span></IonLabel>
                    <Controller
                      name="vehicleTypeId"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <IonSelect 
                          value={value}
                          onIonChange={e => onChange(e.detail.value)}
                          interface="action-sheet"
                        >
                          {vehicleTypes.map(type => (
                            <IonSelectOption key={type.id} value={type.id}>
                              {type.name}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      )}
                    />
                    {errors.vehicleTypeId && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>{errors.vehicleTypeId.message}</small>
                      </IonText>
                    )}
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonList>

          {/* Form Actions */}
          <div className="form-actions">
            <IonButton 
              type="button" 
              fill="clear" 
              color="medium"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </IonButton>
            
            {isEdit && (
              <IonButton 
                type="button" 
                fill="clear" 
                color="danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <IonIcon icon={trash} slot="start" />
                Delete
              </IonButton>
            )}
            
            <IonButton 
              type="submit" 
              color="primary" 
              disabled={isSubmitting}
            >
              <IonIcon icon={isEdit ? save : add} slot="start" />
              {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
              {isSubmitting && <IonSpinner name="dots" className="ion-margin-start" />}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </AdminLayout>
  );
};

export default VehicleEdit;
