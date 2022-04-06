export class StatusError extends Error {
    statusCode: number;

    constructor(error: string, code: number) {
        super(error);
        this.statusCode = code;
    }
}

