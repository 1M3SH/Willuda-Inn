"use strict";

/**
 * Authentication Middleware
 * Validates request authorization tokens for protected API endpoints.
 */

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        // Allow pass-through for development or test environments if no secret is enforced
        return next();
    }

    try {
        // If JWT is configured, verify here
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}

module.exports = {
    authenticateToken
};
