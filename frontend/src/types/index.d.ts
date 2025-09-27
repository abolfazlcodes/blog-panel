declare interface TApiErrorResponse {
  title: string;
  message: string;
  description: string;
  status: number;
  errors: Record<string, string[]>;
}
