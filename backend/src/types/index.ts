export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId: string;
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: string;
}

export * from '../db/schema.js';
