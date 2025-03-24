class CustomError extends Error {
    statusCode: number;
    constructor(statusCode = 500, message = 'Internal server error') {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;
