import type {
  BlogCreate,
  BlogListResponse,
  BlogResponse,
  BlogUpdate,
  BlogWithCategories
} from '../../../../../shared/src/types/blog'
import type { BlogRepository } from '../../../domain/repositories/blog.repository'

export class GetAllBlogsUseCase {
  constructor(private blogRepo: BlogRepository) {}
  execute(page = 1, limit = 10): Promise<BlogListResponse> {
    return this.blogRepo.getAll(page, limit)
  }
}

export class GetBlogByIdUseCase {
  constructor(private blogRepo: BlogRepository) {}
  execute(id: string): Promise<BlogResponse> {
    return this.blogRepo.getById(id)
  }
}

export class GetBlogByIdWithCategoriesUseCase {
  constructor(private blogRepo: BlogRepository) {}
  execute(id: string): Promise<{ success: boolean; data?: BlogWithCategories }> {
    return this.blogRepo.getByIdWithCategories(id)
  }
}

export class CreateBlogUseCase {
  constructor(private blogRepo: BlogRepository) {}
  execute(data: BlogCreate): Promise<BlogResponse> {
    return this.blogRepo.create(data)
  }
}

export class UpdateBlogUseCase {
  constructor(private blogRepo: BlogRepository) {}
  execute(id: string, data: BlogUpdate): Promise<BlogResponse> {
    return this.blogRepo.update(id, data)
  }
}

export class DeleteBlogUseCase {
  constructor(private blogRepo: BlogRepository) {}
  execute(id: string): Promise<BlogResponse> {
    return this.blogRepo.deleteById(id)
  }
}

export class AddCategoriesToBlogUseCase {
  constructor(private blogRepo: BlogRepository) {}
  execute(blogId: string, categoryIds: string[]): Promise<BlogResponse> {
    return this.blogRepo.addCategoriesToBlog(blogId, categoryIds)
  }
}

export class RemoveCategoriesFromBlogUseCase {
  constructor(private blogRepo: BlogRepository) {}
  execute(blogId: string): Promise<BlogResponse> {
    return this.blogRepo.removeCategoriesFromBlog(blogId)
  }
}
