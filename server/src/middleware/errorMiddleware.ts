import { Request, Response, NextFunction } from "express";

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    const statusCode = err.status || 500;
    const message: String = err.message || "Internal server error";

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export default errorMiddleware;
