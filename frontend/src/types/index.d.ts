declare interface TApiErrorResponse {
  title: string;
  message: string;
  description: string;
  status: number;
  errors: Record<string, string[]>;
}

declare type TLoadingBehavior = {
  isLoading?: boolean;
  loadingText?: string;
};

declare type TResponse<T> = {
  message: string;
  data: T;
};

declare type TResponseArr<T> = {
  message: string;
  data: T[];
};

declare interface IPaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

declare type TPaginatedResponse<T> = {
  message: string;
  data: T[];
  meta: IPaginationMeta;
};

declare type TMediaFile = {
  id: number;
  created_at: string;
  filename: string;
  hash: string;
  mime_type: string;
  size: number;
  url: string;
  userId: number;
};
