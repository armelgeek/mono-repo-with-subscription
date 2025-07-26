"use client";

import React from 'react';
import { FormField, useForm, FormConfig } from '@/shared/hooks/useForm';
import { Button } from '@/shared/components/atoms/ui/button';
import { Input } from '@/shared/components/atoms/ui/input';
import { Label } from '@/shared/components/atoms/ui/label';
import { Textarea } from '@/shared/components/atoms/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/atoms/ui/select';
import { Checkbox } from '@/shared/components/atoms/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/components/atoms/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/atoms/ui/card';
import { Alert, AlertDescription } from '@/shared/components/atoms/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface DynamicFormProps<T = Record<string, unknown>> {
  config: FormConfig<T>;
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
  variant?: 'default' | 'card';
}

function FormFieldComponent({ field, fieldProps }: { field: FormField; fieldProps: (name: string) => { name: string; value: unknown; onChange: (value: unknown) => void; onBlur: () => void; error: string | undefined; required: boolean; } }) {
  const { value, onChange, error, required } = fieldProps(field.name);

  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={field.rows || 3}
            className={error ? 'border-red-500' : ''}
          />
        );
      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={onChange}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || `Sélectionner ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={Boolean(value)}
              onCheckedChange={onChange}
            />
            <Label htmlFor={field.name} className="text-sm font-normal">
              {field.label}
            </Label>
          </div>
        );
      case 'radio':
        return (
          <RadioGroup
            value={(value as string) || ''}
            onValueChange={onChange}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                <Label htmlFor={`${field.name}-${option.value}`} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'file':
        return (
          <Input
            id={field.name}
            type="file"
            accept={field.accept}
            multiple={field.multiple}
            onChange={(e) => {
              const files = e.target.files;
              onChange(field.multiple ? files : files?.[0]);
            }}
            className={error ? 'border-red-500' : ''}
          />
        );
      case 'color':
        return (
          <input
            id={field.name}
            type="color"
            value={(value as string) || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-red-500 h-10 w-16 p-0' : 'h-10 w-16 p-0'}
            style={{ minWidth: 48, minHeight: 32 }}
          />
        );
      default:
        return (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            min={field.min}
            max={field.max}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  if (field.type === 'checkbox') {
    return (
      <div className="space-y-2">
        {renderField()}
        {error && (
          <div className="flex items-center text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}

export function DynamicForm<T = Record<string, unknown>>({
  config,
  title,
  description,
  submitText = "Envoyer",
  cancelText = "Annuler",
  onCancel,
  className = "",
  variant = "default"
}: DynamicFormProps<T>) {
  const form = useForm(config);

  const content = (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      {title && variant === "default" && (
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      )}

      {form.errors.submit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{form.errors.submit}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config.fields.map((field) => (
          <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <FormFieldComponent field={field} fieldProps={form.getFieldProps} />
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={form.isSubmitting}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={form.isSubmitting || !form.isValid}
          className="min-w-[120px]"
        >
          {form.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Envoi...
            </>
          ) : (
            submitText
          )}
        </Button>
      </div>
    </form>
  );

  if (variant === "card") {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </CardHeader>
        )}
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}
