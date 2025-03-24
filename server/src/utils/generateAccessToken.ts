const jwt = require('jsonwebtoken');

const generateAccessToken = (id: string, username: string) => {
    return jwt.sign(
        { id, username },
        process.env.TOKEN_SECRET,
        { expiresIn: '1d' })
}

export default generateAccessToken
