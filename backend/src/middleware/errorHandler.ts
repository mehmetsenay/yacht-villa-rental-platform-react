import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Caught:", err);

    // Default error status and message
    let status = 500;
    let message = 'Something went wrong';

    if (err.name === 'ValidationError') {
        status = 400;
        message = err.message;
    }

    res.status(status).json({
        error: message,
        // Only show stack trace in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
