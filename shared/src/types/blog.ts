import type { Category } from './category'

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  published?: boolean;
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  viewCount?: number;
  readTime?: number;
  featuredImage?: string;
  publishedAt?: string;
  // SEO Metadata
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  ogDescription?: string;
  // Content Management
  contentType?: 'markdown' | 'html' | 'rich-text';
  isDraft?: boolean;
  scheduledAt?: string;
  // Media
  galleryImages?: string[];
  videoUrl?: string;
  audioUrl?: string;
  categories?: Category[];
}

export interface BlogWithAuthor extends Blog {
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BlogWithCategories extends Blog {
  categories: Category[];
}

export interface BlogCreate {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
  tags?: string[];
  published?: boolean;
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  featuredImage?: string;
  categoryIds?: string[];
  // SEO Metadata
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  ogDescription?: string;
  // Content Management
  contentType?: 'markdown' | 'html' | 'rich-text';
  isDraft?: boolean;
  scheduledAt?: string;
  // Media
  galleryImages?: string[];
  videoUrl?: string;
  audioUrl?: string;
  // Base fields for compatibility with BaseRepository
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BlogUpdate {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  published?: boolean;
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  featuredImage?: string;
  categoryIds?: string[];
  // SEO Metadata
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  ogDescription?: string;
  // Content Management
  contentType?: 'markdown' | 'html' | 'rich-text';
  isDraft?: boolean;
  scheduledAt?: string;
  // Media
  galleryImages?: string[];
  videoUrl?: string;
  audioUrl?: string;
  // Base fields for compatibility with BaseRepository
  updatedAt?: string | Date;
}

export interface BlogListResponse {
  data: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogResponse {
  success: boolean;
  data?: Blog | BlogListResponse;
  error?: string;
}

export interface BlogDetailResponse {
  success: boolean;
  data?: BlogWithAuthor;
  error?: string;
}
