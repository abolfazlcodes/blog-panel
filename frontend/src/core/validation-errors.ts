export default class ValidationError extends Error {
  constructor(err: TApiErrorResponse) {
    super();
    this.cause = err as TApiErrorResponse;
    this.message = err.message;
  }
}
