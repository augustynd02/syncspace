import jwt from "jsonwebtoken";

const generateAccessToken = (id: string) => {
    if (!process.env.TOKEN_SECRET) {
        throw new Error('Could not load TOKEN_SECRET from .env');
    }
    return jwt.sign(
        { id },
        process.env.TOKEN_SECRET,
        { expiresIn: '1d' })
}

export default generateAccessToken
