"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = __importDefault(require("../services/jwt"));
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json({
            error: {
                code: 'MISSING_TOKEN',
                message: 'Access token is required',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
        return;
    }
    try {
        const userSession = await jwt_1.default.validateToken(token);
        if (!userSession) {
            res.status(401).json({
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired access token',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
            return;
        }
        req.user = userSession;
        next();
    }
    catch (error) {
        res.status(401).json({
            error: {
                code: 'TOKEN_VALIDATION_ERROR',
                message: 'Failed to validate access token',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const userSession = await jwt_1.default.validateToken(token);
            if (userSession) {
                req.user = userSession;
            }
        }
        catch (error) {
            // Ignore errors for optional auth
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map