export interface User {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  isAdmin: boolean;
  role?: 'user' | 'admin' | 'super_admin';
  banned?: boolean;
  banReason?: string;
  banExpires?: string;
  impersonatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreate {
  name: string;
  firstname?: string;
  lastname?: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  isAdmin?: boolean;
}

export interface UserUpdate {
  name?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  emailVerified?: boolean;
  image?: string;
  isAdmin?: boolean;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserResponse {
  success: boolean;
  data?: User | UserListResponse;
  error?: string;
}
