export class NotFoundError extends Error {
    constructor(message: string = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
        // Сохраняет правильный stack trace для V8
        Error.captureStackTrace(this, this.constructor);
    }
}

export class DatabaseError extends Error {
    constructor(message: string = 'Database error') {
        super(message);
        this.name = 'DatabaseError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends Error {
    constructor(message: string = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
        Error.captureStackTrace(this, this.constructor);
    }
}
