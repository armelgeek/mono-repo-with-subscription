import { z, ZodSchema, ZodObject } from 'zod';
import { BaseServiceImpl, ResourceEndpoints } from '@/shared/domain/base.service';
import { Filter } from '@/shared/lib/types/filter';
import { Badge } from '@/shared/components/atoms/ui/badge';
import * as React from 'react';
import { Icons } from '@/shared/components/atoms/ui/icons';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'date' | 'email' | 'url' | 'rich-text' | 'image' | 'file' | 'relation' | 'list' | 'array' | 'time';
  required?: boolean;
  options?: string[] | { value: string; label: string }[];
  placeholder?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  readOnly?: boolean; // Champ non éditable dans le formulaire
  computed?: (item: Record<string, unknown>) => unknown; // Valeur calculée dynamiquement
  display?: {
    showInTable?: boolean;
    showInForm?: boolean;
    showInDetail?: boolean;
    order?: number;
    widget?: 'select' | 'tag' | 'radio';
    arrayDisplayField?: string; // Champ à exposer pour un tableau d'objets
    prefix?: string;
    suffix?: string;
    format?: (value: unknown) => string;
    visibleIf?: (item: Record<string, unknown>) => boolean; // Visibilité conditionnelle
    customComponent?: React.ComponentType<Record<string, unknown>>;
  };
  relation?: {
    entity: string;
    displayField: string;
    multiple?: boolean;
  };
}

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (ids: string[]) => Promise<void> | void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
}

export interface AdminConfig<T = Record<string, unknown>> {
  title: string;
  description?: string;
  icon?: string;
  fields: FieldConfig[];
  actions: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    bulk?: boolean;
  
  };
  ui?: {
    table?: {
      defaultSort?: string;
      defaultFilters?: Record<string, unknown>;
      pageSize?: number;
    };
    form?: {
      layout?: 'sections' | 'simple'| 'two-cols' | 'horizontal';
      sections?: {
        title: string;
        fields: string[];
      }[];
      createTitle?: string;
      createSubtitle?: string;
      editTitle?: string;
      editSubtitle?: string;
    };
    toolbarActions?: React.ReactNode | ((selectedRows: T[]) => React.ReactNode);
    searchEnabled?: boolean;
  };
  bulkActions?: BulkAction[];
}

export interface AdminConfigWithAccessor extends AdminConfig {
  accessor: DynamicFieldAccess;
  bulkActions?: BulkAction[];
}

export type ChildConfig = {
  route: string;
  label?: string;
  icon?: string;
  [key: string]: unknown;
};

export interface AdminConfigWithServices<T extends Record<string, unknown>> extends AdminConfigWithAccessor {
  parent?: {
    key: string;
    routeParam: string;
    parentEntity?: string;
    parentLabel?: string;
  };
  services?: CrudService<T>;
  queryKey?: string[];
  parseEditItem?: (item: Partial<T>) => Partial<T> | T;
  formFields?: string[];
  bulkActions?: BulkAction[];
  children?: ChildConfig[];
}

export interface AdminConfigWithParent<T extends Record<string, unknown>> extends AdminConfigWithServices<T> {
  parent?: {
    key: string;
    routeParam: string;
    parentEntity?: string;
    parentLabel?: string;
  };
  bulkActions?: BulkAction[];
}

export interface AdminConfigWithChild<T extends Record<string, unknown>> extends AdminConfigWithParent<T> {
  children?: ChildConfig[];
  bulkActions?: BulkAction[];
}

interface ZodMetadata {
  label?: string;
  description?: string;
  placeholder?: string;
  type?: FieldConfig['type'];
  display?: FieldConfig['display'];
  relation?: FieldConfig['relation'];
  options?: string[] | { value: string; label: string }[];
  readOnly?: boolean;
  computed?: (item: Record<string, unknown>) => unknown;
}

export function getNestedProperty<T = unknown>(obj: Record<string, unknown>, path: string): T | undefined {
  return path.split('.').reduce<Record<string, unknown> | undefined>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      const next = (current as Record<string, unknown>)[key];
      return typeof next === 'object' && next !== null
        ? (next as Record<string, unknown>)
        : next as Record<string, unknown> | undefined;
    }
    return undefined;
  }, obj) as T | undefined;
}

export function setNestedProperty(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return;

  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key] as Record<string, unknown>;
  }, obj);

  target[lastKey] = value;
}

export function hasNestedProperty(obj: Record<string, unknown>, path: string): boolean {
  return getNestedProperty(obj, path) !== undefined;
}

export interface DynamicFieldAccess {
  getValue: <T = unknown>(obj: Record<string, unknown>, field: string) => T | undefined;
  setValue: (obj: Record<string, unknown>, field: string, value: unknown) => void;
  hasValue: (obj: Record<string, unknown>, field: string) => boolean;
}

export function createDynamicAccessor(): DynamicFieldAccess {
  return {
    getValue: <T = unknown>(obj: Record<string, unknown>, field: string): T | undefined => {
      if (field.includes('.')) {
        return getNestedProperty<T>(obj, field);
      }
      return obj[field] as T | undefined;
    },

    setValue: (obj: Record<string, unknown>, field: string, value: unknown): void => {
      if (field.includes('.')) {
        setNestedProperty(obj, field, value);
      } else {
        obj[field] = value;
      }
    },

    hasValue: (obj: Record<string, unknown>, field: string): boolean => {
      if (field.includes('.')) {
        return hasNestedProperty(obj, field);
      }
      return field in obj;
    }
  };
}

export interface AdminConfigWithAccessor extends AdminConfig {
  accessor: DynamicFieldAccess;
}

export function withMeta<T extends ZodSchema>(schema: T, metadata: ZodMetadata): T & { _metadata: ZodMetadata } {
  return Object.assign(schema, { _metadata: metadata });
}

export const createField = {
  string: (metadata?: ZodMetadata) =>
    withMeta(z.string(), { type: 'text', ...metadata }),

  email: (metadata?: ZodMetadata) =>
    withMeta(z.string().email(), { type: 'email', ...metadata }),

  url: (metadata?: ZodMetadata) =>
    withMeta(z.string().url(), { type: 'url', ...metadata }),

  textarea: (metadata?: ZodMetadata) =>
    withMeta(z.string(), { type: 'textarea', ...metadata }),

  richText: (metadata?: ZodMetadata) =>
    withMeta(z.string(), { type: 'rich-text', ...metadata }),

  number: (metadata?: ZodMetadata) =>
    withMeta(z.number(), { type: 'number', ...metadata }),

  boolean: (metadata?: ZodMetadata) =>
    withMeta(z.boolean(), { type: 'boolean', ...metadata }),

  date: (metadata?: ZodMetadata) =>
    withMeta(z.date(), { type: 'date', ...metadata }),

  select: (options: string[] | { value: string; label: string }[], metadata?: ZodMetadata) =>
    withMeta(z.string(), { type: 'select', options, ...metadata }),

  relation: (entity: string, displayField: string = 'name', multiple: boolean = false, metadata?: ZodMetadata) =>
    withMeta(multiple ? z.array(z.string()) : z.string(), {
      type: 'relation',
      relation: { entity, displayField, multiple },
      ...metadata
    }),

  image: (metadata?: ZodMetadata) =>
    withMeta(z.string(), { type: 'image', ...metadata }),

  file: (metadata?: ZodMetadata) =>
    withMeta(z.string(), { type: 'file', ...metadata }),

  radio: (options: string[] | { value: string; label: string }[], metadata?: ZodMetadata) =>
    withMeta(z.string(), { type: 'select', options, display: { widget: 'radio', ...(metadata?.display || {}) }, ...metadata }),
  tag: (options: string[] | { value: string; label: string }[], metadata?: ZodMetadata) =>
    withMeta(z.string(), { type: 'select', options, display: { widget: 'tag', ...(metadata?.display || {}) }, ...metadata }),
  list: (metadata?: ZodMetadata) =>
    withMeta(z.preprocess(
      (val) => {
        // Autorise string (CSV) ou array en entrée, convertit toujours en string CSV pour la valeur retournée
        if (typeof val === 'string') {
          return val
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .join(',');
        }
        if (Array.isArray(val)) {
          return val.map((s) => String(s)).filter(Boolean).join(',');
        }
        return '';
      },
      z.string()
    ), { type: 'list', ...metadata }),
};

export function generateAdminConfig(schema: ZodObject<z.ZodRawShape>, title: string): AdminConfigWithAccessor {
  const fields: FieldConfig[] = [];
  const accessor = createDynamicAccessor();

  if (!(schema instanceof z.ZodObject)) {
    throw new Error('[generateAdminConfig] Le schéma fourni n\'est pas un ZodObject.');
  }

  let shape: Record<string, z.ZodTypeAny>;
  const s = schema as unknown as { shape?: () => Record<string, z.ZodTypeAny>; _def?: { shape?: () => Record<string, z.ZodTypeAny> | Record<string, z.ZodTypeAny> } };
  if (typeof s.shape === 'function') {
    shape = s.shape();
  } else if (typeof s._def?.shape === 'function') {
    shape = s._def.shape();
  } else if (s._def?.shape && typeof s._def.shape === 'object') {
    shape = s._def.shape;
  } else {
    throw new Error('[generateAdminConfig] Impossible de récupérer la shape du schéma ZodObject.');
  }

  Object.entries(shape).forEach(([key, zodField]) => {
    let metadata: ZodMetadata = {};
    let actualField = zodField;
    if (zodField instanceof z.ZodOptional) {
      actualField = zodField._def.innerType;
    }
    if ((actualField as { _metadata?: ZodMetadata })._metadata) {
      metadata = (actualField as { _metadata?: ZodMetadata })._metadata || {};
    } else if ((zodField as { _metadata?: ZodMetadata })._metadata) {
      metadata = (zodField as { _metadata?: ZodMetadata })._metadata || {};
    }

    const field: FieldConfig = {
      key,
      label: metadata.label || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      type: metadata.type || 'text',
      required: !zodField.isOptional(),
      placeholder: metadata.placeholder,
      description: metadata.description,
      readOnly: metadata.readOnly,
      computed: metadata.computed,
      display: {
        showInTable: !['textarea', 'rich-text', 'image', 'file'].includes(metadata.type || 'text'),
        showInForm: true,
        showInDetail: true,
        ...metadata.display,
      },
      relation: metadata.relation,
    };

    if (!metadata.type) {
      if (actualField instanceof z.ZodString) {
        if (key.toLowerCase().includes('email')) field.type = 'email';
        else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) field.type = 'url';
        else if (key.toLowerCase().includes('description') || key.toLowerCase().includes('comment') || key.toLowerCase().includes('content')) field.type = 'textarea';
        else if (key.toLowerCase().includes('image') || key.toLowerCase().includes('photo') || key.toLowerCase().includes('avatar')) field.type = 'image';
        else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key === 'createdAt' || key === 'updatedAt') field.type = 'date';
        else if (key.toLowerCase().includes('status') || key.toLowerCase().includes('type') || key.toLowerCase().includes('state')) {
          field.type = 'select';
          if (metadata.options) field.options = metadata.options;
        }
        else field.type = 'text';
      } else if (actualField instanceof z.ZodNumber) {
        field.type = 'number';
      } else if (actualField instanceof z.ZodBoolean) {
        field.type = 'boolean';
      } else if (actualField instanceof z.ZodEnum) {
        field.type = 'select';
        field.options = actualField.options;
      } else if (actualField instanceof z.ZodDate) {
        field.type = 'date';
      }
    }

    if (metadata.options) {
      field.options = metadata.options;
    }

    if (key === 'id') {
      field.display = {
        ...field.display,
        showInForm: false,
        showInTable: false,
        showInDetail: true,
      };
    }
    if (key === 'updatedAt') {
      field.display = {
        ...field.display,
        showInForm: false,
        showInTable: false,
        showInDetail: true,
      };
    }

    fields.push(field);
  });

  return {
    title,
    fields,
    accessor,
    actions: {
      create: true,
      read: true,
      update: true,
      delete: true,
      bulk: true
    },
    ui: {
      table: {
        defaultSort: 'createdAt',
        pageSize: 10,
      },
      form: {
        layout: 'simple',
      },
    }
  };
}

export function detectContentType(value: unknown): 'number' | 'date' | 'boolean' | 'string' {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value === null || value === undefined) return 'string';
  const str = String(value).trim();
  if (/^-?\d+(?:[.,]\d+)?$/.test(str)) return 'number';
  if (/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?/.test(str)) return 'date';
  if (/^(true|false|oui|non|yes|no|0|1)$/i.test(str)) return 'boolean';
  return 'string';
}

// Fonction pour créer des colonnes React Table dynamiquement
export function createDynamicColumns(fields: FieldConfig[], accessor: DynamicFieldAccess) {
  return fields
    .filter(field => field.display?.showInTable !== false)
    .map(field => {
      return {
        accessorKey: field.key,
        header: field.label,
        cell: ({ row }: { row: { original: Record<string, unknown> } }) => {
          const value = accessor.getValue(row.original, field.key);
          const detected = detectContentType(value);

          if (field.display?.format) {
            return field.display.format(value);
          }

          if (detected === 'number') {
            if (value !== undefined && value !== null) {
              const str = String(value);
              return `${field.display?.prefix ?? ''}${str}${field.display?.suffix ?? ''}`;
            }
            return '';
          }
          if (detected === 'date') {
            if (!value) return '';
            const date = new Date(value as string);
            return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('fr-FR');
          }
          if (detected === 'boolean') {
            if (typeof value === 'boolean') return value ? '✓' : '✗';
            if (typeof value === 'string') {
              const v = value.toLowerCase();
              if (['true', 'oui', 'yes', '1'].includes(v)) return '✓';
              if (['false', 'non', 'no', '0'].includes(v)) return '✗';
            }
            return String(value);
          }

          if (field.type === 'list') {
            if (!value) return '';
            const tags = String(value)
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean);
            if (tags.length === 0) return '';
            return React.createElement(
              'div',
              { className: 'flex flex-wrap gap-1', 'aria-label': field.label },
              tags.map((tag, i) =>
                React.createElement(
                  Badge,
                  { variant: 'secondary', key: tag ? `${tag}-${i}` : `${i}` },
                  tag
                )
              )
            );
          }
          // Affichage spécial pour les tableaux d'objets
          if (field.type === 'array' && Array.isArray(value)) {
            if (value.length > 0 && typeof value[0] === 'object') {
              const arrayDisplayField = field.display?.arrayDisplayField;
              return value
                .map((v: Record<string, unknown>) => {
                  if (arrayDisplayField && arrayDisplayField in v && v[arrayDisplayField]) {
                    return String(v[arrayDisplayField]);
                  }
                  return JSON.stringify(v);
                })
                .filter(Boolean)
                .join(', ');
            }
            return value.map(String).join(', ');
          }
          return String(value || '');
        },
        meta: {
          className: (row: { original: Record<string, unknown> }) => {
            const raw = accessor.getValue(row.original, field.key);
            const detected = detectContentType(raw);
            if (detected === 'number' || detected === 'date' || detected === 'boolean') return 'text-center';
            return undefined;
          }
        }
      };
    });
}

export function createFormAccessors<T extends Record<string, unknown>>(
  data: T,
  fields: FieldConfig[]
) {
  const accessor = createDynamicAccessor();

  return {

    getFieldValue: (fieldKey: string) => {
      return accessor.getValue(data, fieldKey);
    },

    setFieldValue: (fieldKey: string, value: unknown) => {
      accessor.setValue(data, fieldKey, value);
    },

    getFormValues: () => {
      const values: Record<string, unknown> = {};
      fields
        .filter(field => field.display?.showInForm !== false)
        .forEach(field => {
          values[field.key] = accessor.getValue(data, field.key);
        });
      return values;
    },

    validateRequired: () => {
      const errors: string[] = [];
      fields
        .filter(field => field.required && field.display?.showInForm !== false)
        .forEach(field => {
          const value = accessor.getValue(data, field.key);
          if (value === undefined || value === null || value === '') {
            errors.push(`${field.label} est requis`);
          }
        });
      return errors;
    }
  };
}

export function useZodValidation<T>(schema: ZodSchema<T>) {
  const validate = (data: unknown): { success: boolean; data?: T; errors?: string[] } => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { success: false, errors: ['Erreur de validation inconnue'] };
    }
  };

  const safeValidate = (data: unknown) => {
    const result = schema.safeParse(data);
    return result;
  };

  return { validate, safeValidate };
}


// Type utilitaire pour forcer la présence des propriétés indispensables
type RequiredAdminConfig<T extends Record<string, unknown>> = {
  description: string;
  icon: string;
  actions: Required<AdminConfigWithChild<T>["actions"]>;
  services: NonNullable<AdminConfigWithChild<T>["services"]>;
  queryKey: string[];
} & Partial<Omit<AdminConfigWithChild<T>, 'description' | 'icon' | 'actions' | 'services' | 'queryKey' | 'accessor'>>;

export function createAdminEntity<T extends Record<string, unknown>>(
  name: string,
  schema: z.ZodObject<z.ZodRawShape>,
  config: RequiredAdminConfig<T>
): AdminConfigWithChild<T> {
  const baseConfig = generateAdminConfig(schema, name);
  return {
    ...baseConfig,
    ...config,
    fields: config?.fields || baseConfig.fields,
    actions: { ...baseConfig.actions, ...config?.actions },
    ui: { ...baseConfig.ui, ...config?.ui },
    services: config.services,
    queryKey: config.queryKey,
    parent: config.parent,
    children: config.children,
    formFields: config.formFields,
    parseEditItem: config.parseEditItem || ((item: Partial<T>) => {
      const parsed: Partial<T> = { ...item };
      const dateRegex = /date|at$/i;
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?/;
      for (const key in item) {
        const value = item[key as keyof T];
        if (
          dateRegex.test(key) ||
          (typeof value === 'string' && isoDateRegex.test(value)) ||
          (typeof value === 'number' && value > 1000000000)
        ) {
          if (value === null || value === undefined || value === '') {
            parsed[key as keyof T] = '' as unknown as T[keyof T];
          } else if (value instanceof Date) {
            parsed[key as keyof T] = value as T[keyof T];
          } else if (typeof value === 'string' || typeof value === 'number') {
            const d = new Date(value);
            parsed[key as keyof T] = !isNaN(d.getTime()) ? (d as unknown as T[keyof T]) : ('' as unknown as T[keyof T]);
          } else {
            parsed[key as keyof T] = '' as unknown as T[keyof T];
          }
        } else if (value === null || value === undefined) {
          parsed[key as keyof T] = '' as unknown as T[keyof T];
        }
      }
      return parsed;
    }),
  };
}

export function createEntitySchema<T extends z.ZodRawShape>(
  fields: T,
  relations?: Record<string, { entity: string; displayField?: string; multiple?: boolean }>
) {
  const schema = z.object(fields);

  if (relations) {
    const relatedFields: Record<string, z.ZodTypeAny> = {};
    Object.entries(relations).forEach(([key, relation]) => {
      relatedFields[key] = createField.relation(
        relation.entity,
        relation.displayField,
        relation.multiple
      );
    });

    return z.object({ ...fields, ...relatedFields });
  }

  return schema;
}

export interface CrudService<T extends Record<string, unknown>> {
  fetchItems: (filters?: Record<string, string | number | undefined>) => Promise<{ data: T[]; meta?: { total: number; totalPages: number } }>;
  createItem: (data: T) => Promise<T>;
  updateItem: (id: string, data: Partial<T>) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
}

export interface AdminConfigWithServices<T extends Record<string, unknown>> extends AdminConfigWithAccessor {
  services?: CrudService<T>;
  queryKey?: string[];
  parseEditItem?: (item: Partial<T>) => Partial<T> | T;
  formFields?: string[];
  bulkActions?: BulkAction[];
}

export interface AdminConfigWithParent<T extends Record<string, unknown>> extends AdminConfigWithServices<T> {
  parent?: {
    key: string;
    routeParam: string;
    parentEntity?: string;
    parentLabel?: string;
  };
  bulkActions?: BulkAction[];
}

export interface AdminConfigWithChild<T extends Record<string, unknown>> extends AdminConfigWithParent<T> {
  children?: ChildConfig[];
  bulkActions?: BulkAction[];
}

export function createMockService<T extends Record<string, unknown>>(
  initialData: T[] = []
): CrudService<T> {
  const data: T[] = [...initialData];

  return {
    fetchItems: async () => ({
      data: [...data],
      meta: { total: data.length, totalPages: Math.ceil(data.length / 20) }
    }),

    createItem: async (item: T) => {
      console.log('createMockService.createItem called with:', item);
      const newItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      } as T;
      console.log('Creating new item:', newItem);
      data.push(newItem);
      return newItem;
    },

    updateItem: async (id: string, updates: Partial<T>) => {
      console.log('createMockService.updateItem called with:', id, updates);
      const index = data.findIndex((item: T) => (item as Record<string, unknown>).id === id);
      if (index === -1) throw new Error('Item not found');
      data[index] = { ...data[index], ...updates, updatedAt: new Date() };
      return data[index];
    },

    deleteItem: async (id: string) => {
      console.log('createMockService.deleteItem called with:', id);
      const index = data.findIndex((item: T) => (item as Record<string, unknown>).id === id);
      if (index === -1) throw new Error('Item not found');
      data.splice(index, 1);
    }
  };
}

export class AdminCrudService<T extends Record<string, unknown>> extends BaseServiceImpl<T, T> {
  protected endpoints: ResourceEndpoints;

  constructor(baseEndpoint: string) {
    super();
    this.endpoints = {
      base: baseEndpoint,
      list: (qs: string) => `${baseEndpoint}${qs ? `?${qs}` : ''}`,
      create: baseEndpoint,
      detail: (slug: string) => `${baseEndpoint}/${slug}`,
      update: (slug: string) => `${baseEndpoint}/${slug}`,
      delete: (slug: string) => `${baseEndpoint}/${slug}`,
    };
  }

  protected serializeParams(filter: Filter): string {
    const params = new URLSearchParams();

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return params.toString();
  }

  async fetchItems(filters?: Record<string, string | number | undefined>): Promise<{ data: T[]; meta?: { total: number; totalPages: number; page?: number; limit?: number } }> {
    try {
      const response = await this.list(filters || {});
      return {
        data: response.data,
        meta: {
          total: response.total,
          totalPages: response.limit ? Math.ceil(response.total / response.limit) : 1,
          page: response.page,
          limit: response.limit
        },
      };
    } catch (error) {
      console.error('AdminCrudService.fetchItems error:', error);
      throw error;
    }
  }

  async createItem(data: T): Promise<T> {
    try {
      const response = await this.create(data);
      return response.data || data;
    } catch (error) {
      console.error('AdminCrudService.createItem error:', error);
      throw error;
    }
  }

  async updateItem(id: string, data: Partial<T>): Promise<T> {
    try {
      const response = await this.update(id, data as T);
      return response.data || (data as T);
    } catch (error) {
      console.error('AdminCrudService.updateItem error:', error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<void> {
    await this.fetchData(this.endpoints.delete(id), {
      method: 'DELETE',
      credentials: 'include',
    });
  }
}

export function createApiService<T extends Record<string, unknown>>(
  baseUrl: string
): CrudService<T> {
  const service = new AdminCrudService<T>(baseUrl);

  return {
    fetchItems: (filters?: Record<string, string | number | undefined>) => {
      return service.fetchItems(filters);
    },
    createItem: (data: T) => service.createItem(data),
    updateItem: (id: string, data: Partial<T>) => service.updateItem(id, data),
    deleteItem: (id: string) => service.deleteItem(id),
  };
}

// --- BREADCRUMB ADMIN CENTRAL ---
export interface AdminBreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  emoji?: string;
}

const adminRoot = { label: 'Tableau de bord', href: '/admin', icon: Icons.dashboard };

function getEntityFromPath(segments: string[]) {
  return getRegisteredAdminEntities().find(e => segments.includes(e.path));
}

function getSubPageLabel(segment: string) {
  if (segment === 'create') return 'Créer';
  if (segment === 'edit') return 'Modifier';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * Génère la config du breadcrumb admin à partir du pathname
 */
export function getAdminBreadcrumbConfig(pathname: string): AdminBreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: AdminBreadcrumbItem[] = [];

  // Racine admin
  breadcrumbs.push({ label: adminRoot.label, href: adminRoot.href, icon: adminRoot.icon });

  // Entité admin (ex: categories, routes...)
  const entity = getEntityFromPath(segments);
  if (entity) {
    const config = entity.config as { title?: string; icon?: unknown };
    breadcrumbs.push({
      label: config.title || entity.path,
      href: entity.href,
      icon: (typeof config.icon === 'function' && (config.icon.prototype?.isReactComponent || String(config.icon).includes('return React.createElement'))) ? config.icon as React.ComponentType<{ className?: string }> : undefined,
      emoji: typeof config.icon === 'string' ? config.icon : undefined,
    });
  }

  // Sous-page (ex: /admin/categories/create)
  const last = segments[segments.length - 1];
  if (last && entity && last !== entity.path) {
    // Si c'est un id (UUID ou nombre), on affiche "Détail" ou rien
    if (/^\d+$/.test(last) || /^[0-9a-fA-F-]{8,}$/.test(last)) {
      breadcrumbs.push({ label: 'Détail' });
    } else if (['create', 'edit'].includes(last)) {
      breadcrumbs.push({ label: getSubPageLabel(last) });
    } else {
      breadcrumbs.push({ label: getSubPageLabel(last) });
    }
  }

  return breadcrumbs;
}

// --- REGISTRE GLOBAL DES ENTITÉS ADMIN ---
export interface RegisteredAdminEntity {
  path: string;
  config: unknown;
  href: string;
  icon?: string;
  menuOrder?: number;
}

const AdminEntityRegistry: RegisteredAdminEntity[] = [];

export function registerAdminEntity(path: string, config: unknown, href: string, icon?: string, menuOrder?: number) {
  if (!AdminEntityRegistry.some(e => e.path === path)) {
    AdminEntityRegistry.push({ path, config, href, icon, menuOrder });
  }
}

export function getRegisteredAdminEntities() {
  return AdminEntityRegistry;
}