import jwt from 'jsonwebtoken';
import data from '../config/config.js';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    const token = authHeader.split(' ')[1];
    const { JWT_SECRET } = data;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export { authMiddleware };