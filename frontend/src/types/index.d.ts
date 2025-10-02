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
