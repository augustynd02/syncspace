const jwt = require('jsonwebtoken');

const generateAccessToken = (id: string) => {
    return jwt.sign(
        { id },
        process.env.TOKEN_SECRET,
        { expiresIn: '1d' })
}

export default generateAccessToken
