import React from 'react';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
} from '@ionic/react';
import { TripTypeAttribute } from '../types';

interface DynamicFormFieldProps {
  attribute: TripTypeAttribute;
  value: any;
  onChange: (name: string, value: any) => void;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  attribute,
  value,
  onChange,
}) => {
  const handleChange = (newValue: any) => {
    onChange(attribute.name, newValue);
  };

  // Parse validation rules if available
  const getValidationRules = () => {
    if (!attribute.validationRules) return {};
    try {
      return JSON.parse(attribute.validationRules);
    } catch (e) {
      console.error('Failed to parse validation rules:', e);
      return {};
    }
  };

  // Parse options for select fields
  const getOptions = () => {
    if (!attribute.options) return [];
    try {
      return JSON.parse(attribute.options);
    } catch (e) {
      console.error('Failed to parse options:', e);
      return [];
    }
  };

  const validationRules = getValidationRules();

  switch (attribute.dataType) {
    case 'text':
      return (
        <IonItem>
          <IonLabel position="stacked">
            {attribute.label}
            {attribute.isRequired && <span style={{ color: 'red' }}> *</span>}
          </IonLabel>
          <IonInput
            value={value || ''}
            onIonInput={(e) => handleChange(e.detail.value)}
            placeholder={attribute.placeholder || `Enter ${attribute.label.toLowerCase()}`}
            required={attribute.isRequired}
          />
          {attribute.description && (
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              {attribute.description}
            </p>
          )}
        </IonItem>
      );

    case 'textarea':
      return (
        <IonItem>
          <IonLabel position="stacked">
            {attribute.label}
            {attribute.isRequired && <span style={{ color: 'red' }}> *</span>}
          </IonLabel>
          <IonTextarea
            value={value || ''}
            onIonInput={(e) => handleChange(e.detail.value)}
            placeholder={attribute.placeholder || `Enter ${attribute.label.toLowerCase()}`}
            rows={3}
            required={attribute.isRequired}
          />
          {attribute.description && (
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              {attribute.description}
            </p>
          )}
        </IonItem>
      );

    case 'number':
      return (
        <IonItem>
          <IonLabel position="stacked">
            {attribute.label}
            {attribute.isRequired && <span style={{ color: 'red' }}> *</span>}
          </IonLabel>
          <IonInput
            type="number"
            value={value || ''}
            onIonInput={(e) => handleChange(e.detail.value ? Number(e.detail.value) : null)}
            placeholder={attribute.placeholder || `Enter ${attribute.label.toLowerCase()}`}
            min={validationRules.min}
            max={validationRules.max}
            required={attribute.isRequired}
          />
          {attribute.description && (
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              {attribute.description}
            </p>
          )}
        </IonItem>
      );

    case 'date':
      return (
        <IonItem>
          <IonLabel position="stacked">
            {attribute.label}
            {attribute.isRequired && <span style={{ color: 'red' }}> *</span>}
          </IonLabel>
          <IonDatetimeButton datetime={`datetime-${attribute.id}`} />
          <IonModal keepContentsMounted={true}>
            <IonDatetime
              id={`datetime-${attribute.id}`}
              value={value || ''}
              onIonChange={(e) => handleChange(e.detail.value)}
              presentation="date"
            />
          </IonModal>
          {attribute.description && (
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              {attribute.description}
            </p>
          )}
        </IonItem>
      );

    case 'boolean':
      return (
        <IonItem>
          <IonLabel>
            {attribute.label}
            {attribute.isRequired && <span style={{ color: 'red' }}> *</span>}
          </IonLabel>
          <IonCheckbox
            checked={value || false}
            onIonChange={(e) => handleChange(e.detail.checked)}
            slot="end"
          />
          {attribute.description && (
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              {attribute.description}
            </p>
          )}
        </IonItem>
      );

    case 'select':
      const options = getOptions();
      return (
        <IonItem>
          <IonLabel position="stacked">
            {attribute.label}
            {attribute.isRequired && <span style={{ color: 'red' }}> *</span>}
          </IonLabel>
          <IonSelect
            value={value || ''}
            onIonChange={(e) => handleChange(e.detail.value)}
            placeholder={attribute.placeholder || `Select ${attribute.label.toLowerCase()}`}
            interface="action-sheet"
          >
            {options.map((option: any, index: number) => (
              <IonSelectOption key={index} value={option.value || option}>
                {option.label || option}
              </IonSelectOption>
            ))}
          </IonSelect>
          {attribute.description && (
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              {attribute.description}
            </p>
          )}
        </IonItem>
      );

    default:
      return null;
  }
};

export default DynamicFormField;
