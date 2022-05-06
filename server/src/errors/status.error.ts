export class StatusError extends Error {
  status: number;

  constructor(error: string, code: number) {
    super(error);
    this.status = code;
  }
}
