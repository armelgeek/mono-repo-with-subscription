import { createAdminEntity, registerAdminEntity } from '@/shared/lib/admin/admin-generator';
import { CategorySchema } from './category.schema';
import { categoryService } from './category.service';



export const CategoryAdminConfig = createAdminEntity('Catégorie', CategorySchema, {
  description: 'Gérez vos catégories',
  icon: '📂',
  actions: {
    create: true,
    read: true,
    update: true,
    delete: true,
    bulk: true
  },
  services: categoryService,
  queryKey: ['categories'],
  formFields: ['name', 'description', 'slug', 'color'],
  ui: {
    table: {
      defaultSort: 'createdAt',
      pageSize: 20,
    },
    form: {
      layout: 'simple',
    },
  toolbarActions: undefined
  },
});

registerAdminEntity('category', CategoryAdminConfig, '/admin/categories', '📂',1);
