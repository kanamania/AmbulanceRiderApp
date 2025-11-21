# Vehicle Model Updates - Remaining Work

## Backend Model (C#)
```csharp
public class Vehicle : BaseModel
{
    public string Name { get; set; } = string.Empty;
    public string PlateNumber { get; set; } = string.Empty;
    public string? Image { get; set; }
    public int VehicleTypeId { get; set; }
    
    // Navigation properties
    public VehicleType? VehicleType { get; set; }
}
```

## ✅ Completed Updates

### 1. Type Definitions (`src/types/vehicle.types.ts`)
- ✅ Updated `Vehicle` interface to match backend
- ✅ Updated `VehicleFormData` interface
- ✅ Removed non-existent properties: `licensePlate`, `make`, `model`, `year`, `color`, `status`, `capacity`, `mileage`, etc.
- ✅ Added correct properties: `plateNumber`, `image`

### 2. Database Service (`src/services/database.service.ts`)
- ✅ Updated vehicles table schema
- ✅ Updated `upsertVehicles` method
- ✅ Removed non-existent columns

### 3. Vehicle Service (`src/services/vehicle.service.ts`)
- ✅ Removed status filter logic
- ✅ Updated cache operations

### 4. Activity Page (`src/pages/Activity.tsx`)
- ✅ Updated vehicle search to use `plateNumber` and `name`
- ✅ Updated vehicle display in modals
- ✅ Updated search placeholder text

### 5. Vehicle Management Page (`src/pages/admin/VehicleManagement.tsx`)
- ✅ Updated search filter
- ✅ Updated vehicle display to use `plateNumber`, `name`, and `image`
- ✅ Removed references to `make`, `model`, `year`, `status`

### 6. Vehicle Edit Page (`src/pages/admin/VehicleEdit.tsx`)
- ✅ Updated validation schema
- ✅ Updated form data interface
- ✅ Updated form defaults
- ✅ Updated data loading
- ✅ Updated onSubmit handler

## ⚠️ Remaining Work

### Vehicle Edit Form Fields (`src/pages/admin/VehicleEdit.tsx`)
The form still has many old fields that need to be replaced. The form should only have:

**Required Fields:**
1. **Name** - Vehicle name (text input)
2. **Plate Number** - Vehicle plate number (text input)  
3. **Vehicle Type** - Dropdown of vehicle types (already correct)
4. **Image** - Image upload (already exists)

**Fields to REMOVE from the form (lines ~370-678):**
- ❌ License Plate (use Plate Number instead)
- ❌ Make
- ❌ Model
- ❌ Year
- ❌ Color
- ❌ Status
- ❌ Capacity
- ❌ Mileage
- ❌ Last Maintenance Date
- ❌ Next Maintenance Date
- ❌ Notes
- ❌ Is Active

### Simplified Form Structure Needed:

```tsx
<IonGrid>
  <IonRow>
    {/* Vehicle Name */}
    <IonCol size="12" sizeSm="6">
      <IonItem className={`form-group ${errors.name ? 'ion-invalid' : ''}`}>
        <IonLabel position="floating">Vehicle Name <span className="required">*</span></IonLabel>
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

    {/* Plate Number */}
    <IonCol size="12" sizeSm="6">
      <IonItem className={`form-group ${errors.plateNumber ? 'ion-invalid' : ''}`}>
        <IonLabel position="floating">Plate Number <span className="required">*</span></IonLabel>
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
    {/* Vehicle Type */}
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
```

## 🔍 Other Files to Check

### TripDetails Page (`src/pages/admin/TripDetails.tsx`)
- Line 611: Uses `vehicle.make`, `vehicle.model`, `vehicle.licensePlate`
- **Action Needed:** Update to use `vehicle.name` and `vehicle.plateNumber`

### Translation Files
- `src/locales/en.json` - Line 152: "licensePlate"
- `src/locales/sw.json` - Line 152: "licensePlate"  
- **Action Needed:** Add "plateNumber" translations, keep "licensePlate" for backward compatibility

### Potential API Response Issues
If the backend returns vehicles with these properties, the frontend will now correctly handle them. However, ensure:
1. Backend API returns `plateNumber` not `licensePlate`
2. Backend API returns `image` URL as a string
3. Backend API includes `vehicleType` navigation property when needed

## 🧪 Testing Checklist

After completing remaining updates:
- [ ] Vehicle list loads correctly
- [ ] Vehicle search works with name and plate number
- [ ] Vehicle creation works with new fields
- [ ] Vehicle editing works with new fields
- [ ] Vehicle deletion works
- [ ] Vehicle images display correctly
- [ ] Vehicle type dropdown works
- [ ] Cache operations work correctly
- [ ] Trip assignment shows correct vehicle info
- [ ] No console errors related to undefined properties

## 📝 Migration Notes

The changes are **breaking** for existing data that uses the old property names. Consider:
1. Backend migration to rename `LicensePlate` to `PlateNumber` in database
2. Data migration script if needed
3. API versioning if old clients need support
