import type { CategoryType } from '@/domain/models/category.model'
import type { CategoryRepositoryInterface } from '@/domain/repositories/category.repository.interface'

export class GetAllCategoriesUseCase {
  constructor(private categoryRepository: CategoryRepositoryInterface) {}

  async execute(page: number = 1, limit: number = 10) {
    try {
      const result = await this.categoryRepository.findAll(page, limit)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class GetCategoryByIdUseCase {
  constructor(private categoryRepository: CategoryRepositoryInterface) {}

  async execute(id: string) {
    try {
      const category = await this.categoryRepository.findById(id)
      if (!category) {
        return { success: false, error: 'Category not found' }
      }
      return { success: true, data: category }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class GetCategoryBySlugUseCase {
  constructor(private categoryRepository: CategoryRepositoryInterface) {}

  async execute(slug: string) {
    try {
      const category = await this.categoryRepository.findBySlug(slug)
      if (!category) {
        return { success: false, error: 'Category not found' }
      }
      return { success: true, data: category }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepositoryInterface) {}

  async execute(data: Omit<CategoryType, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = new Date().toISOString()
      const category: CategoryType = {
        ...data,
        id: '',
        createdAt: now,
        updatedAt: now
      }

      const result = await this.categoryRepository.save(category)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepositoryInterface) {}

  async execute(id: string, data: Partial<CategoryType>) {
    try {
      const category = await this.categoryRepository.update(id, data)
      if (!category) {
        return { success: false, error: 'Category not found or update failed' }
      }
      return { success: true, data: category }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: CategoryRepositoryInterface) {}

  async execute(id: string) {
    try {
      const deleted = await this.categoryRepository.remove(id)
      if (!deleted) {
        return { success: false, error: 'Category not found or deletion failed' }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}
