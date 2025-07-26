import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'color';
  placeholder?: string;
  required?: boolean;
  validation?: z.ZodSchema;
  options?: { value: string; label: string }[];
  multiple?: boolean;
  accept?: string; // pour les fichiers
  rows?: number; // pour textarea
  min?: number;
  max?: number;
}

export interface FormConfig<T = Record<string, unknown>> {
  fields: FormField[];
  onSubmit: (data: T) => Promise<void> | void;
  initialValues?: Partial<T>;
  validationSchema?: z.ZodSchema;
}

export interface FormState<T = Record<string, unknown>> {
  values: Partial<T>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export function useForm<T = Record<string, unknown>>(config: FormConfig<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: config.initialValues || {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
  });

  const validateField = useCallback((name: string, value: unknown) => {
    const field = config.fields.find(f => f.name === name);
    if (!field) return '';

    // Validation requise
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} est requis`;
    }

    // Validation avec schéma Zod
    if (field.validation) {
      try {
        field.validation.parse(value);
        return '';
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message || 'Valeur invalide';
        }
      }
    }

    return '';
  }, [config.fields]);

  const validateForm = useCallback((values: Partial<T>) => {
    const errors: Record<string, string> = {};
    
    config.fields.forEach(field => {
      const error = validateField(field.name, values[field.name as keyof T]);
      if (error) {
        errors[field.name] = error;
      }
    });

    // Validation globale avec schéma
    if (config.validationSchema) {
      try {
        config.validationSchema.parse(values);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            if (err.path.length > 0) {
              errors[err.path[0]] = err.message;
            }
          });
        }
      }
    }

    return errors;
  }, [config.fields, config.validationSchema, validateField]);

  const setValue = useCallback((name: string, value: unknown) => {
    setState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const errors = validateForm(newValues);
      
      return {
        ...prev,
        values: newValues,
        errors,
        isValid: Object.keys(errors).length === 0,
      };
    });
  }, [validateForm]);

  const setTouched = useCallback((name: string, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  const handleChange = useCallback((name: string, value: unknown) => {
    setValue(name, value);
    setTouched(name, true);
  }, [setValue, setTouched]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const errors = validateForm(state.values);
      
      if (Object.keys(errors).length > 0) {
        setState(prev => ({
          ...prev,
          errors,
          isSubmitting: false,
          touched: config.fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}),
        }));
        return;
      }

      await config.onSubmit(state.values as T);
      
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: {},
        touched: {},
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: { submit: 'Une erreur est survenue lors de la soumission' },
      }));
      throw error;
    }
  }, [state.values, validateForm, config]);

  const reset = useCallback(() => {
    setState({
      values: config.initialValues || {},
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false,
    });
  }, [config.initialValues]);

  const getFieldProps = useCallback((name: string) => {
    return {
      name,
      value: state.values[name as keyof T] || '',
      onChange: (value: unknown) => handleChange(name, value),
      onBlur: () => setTouched(name, true),
      error: state.touched[name] ? state.errors[name] : undefined,
      required: config.fields.find(f => f.name === name)?.required || false,
    };
  }, [state, handleChange, setTouched, config.fields]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setValue,
    setTouched,
    handleChange,
    handleSubmit,
    reset,
    getFieldProps,
  };
}
