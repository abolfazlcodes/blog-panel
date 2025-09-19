export interface ICustomError extends Error {
  statusCode: number;
  data: any;
}
