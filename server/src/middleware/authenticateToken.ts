import { Request, Response, NextFunction } from "express";
import { VerifyErrors } from "jsonwebtoken";
import jwt, { JwtPayload } from "jsonwebtoken";

function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
        throw new Error("TOKEN_SECRET is not defined in .env file");
    }

    const token = req.cookies.token;

    if (token == null || token == undefined) {
        req.user_id = null;
        return next();
    }

    jwt.verify(token, secret, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
        if (err || decoded === undefined) {
            req.user_id = null;
            return next();
        }

        if (typeof decoded === "object" && decoded !== null) {
            req.user_id = decoded.id as string;
        } else {
            req.user_id = null;
        }

        next();
    });
}

export default authenticateToken;
