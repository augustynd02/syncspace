import { Request, Response, NextFunction } from "express";
import { VerifyErrors } from "jsonwebtoken";

const jwt = require('jsonwebtoken');

function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (token == null) {
        req.user_id = null;
        return next()
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err: VerifyErrors | null, data: { id: string }) => {
        if (err) {
            req.user_id = null;
            return next()
        }
        req.user_id = data.id;
        next()
    })
}

module.exports = authenticateToken;
