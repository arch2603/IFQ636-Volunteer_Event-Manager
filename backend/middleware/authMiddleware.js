
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    let decoded

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {
        const message = error.name === 'TokenExpiredError' ? 'Not authorized, token expired' : 'Not authorized, token failed';
        return res.status(401).json({ message: message });
    }


    try {
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        req.user = user;
        return next();
    } catch (error) {
        return next(error);
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden, insufficient permissions' });
        }
        next();
    };
};

module.exports = { protect, requireRole };
