import { Request, Response } from 'express';

const isAuthenticated = (req: Request, res: Response): req is Request & { user_id: string } => {
    if (!req.user_id) {
        res.status(401).json({ message: "Not authenticated" });
        return false;
    }
    return true;
}

export default isAuthenticated;
