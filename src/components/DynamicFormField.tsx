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

interface SelectOption {
  value?: string | number;
  label?: string;
}

interface DynamicFormFieldProps {
  attribute: TripTypeAttribute;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  attribute,
  value,
  onChange,
}) => {
  const handleChange = (newValue: unknown) => {
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
  const options = getOptions();

  switch (attribute.dataType) {
    case 'text':
      return (
        <IonItem>
          <IonLabel position="stacked">
            {attribute.label}
            {attribute.isRequired && <span style={{ color: 'red' }}> *</span>}
          </IonLabel>
          <IonInput
            value={(value as string) || ''}
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
            value={(value as string) || ''}
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
            value={(value as number | string) || ''}
            onIonInput={(e) => handleChange(e.detail.value ? Number(e.detail.value) : null)}
            placeholder={attribute.placeholder || `Enter ${attribute.label.toLowerCase()}`}
            min={validationRules.min || undefined}
            max={validationRules.max || undefined}
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
              value={(value as string || '') || ''}
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
            checked={(value as boolean) || false}
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
            {options.map((option: SelectOption | string, index: number) => {
              const optionValue = typeof option === 'string' ? option : (option.value ?? '');
              const optionLabel = typeof option === 'string' ? option : (option.label ?? '');
              return (
                <IonSelectOption key={index} value={optionValue}>
                  {optionLabel}
                </IonSelectOption>
              );
            })}
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
