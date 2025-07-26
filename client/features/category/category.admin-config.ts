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
    bulk: false
  },
  services: categoryService,
  queryKey: ['categories'],
});

registerAdminEntity('category', CategoryAdminConfig, '/admin/category', '📂');
