"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = __importDefault(require("../config"));
const auth_1 = __importDefault(require("../services/auth"));
const auth_2 = require("../middleware/auth");
const rbac_1 = __importDefault(require("../middleware/rbac"));
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Rate limiting for authentication endpoints
const authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: config_1.default.rateLimit.windowMs,
    max: config_1.default.rateLimit.max,
    message: {
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts, please try again later',
            timestamp: new Date().toISOString(),
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Login endpoint
router.post('/login', authRateLimit, (0, schemas_1.validateRequest)(schemas_1.loginSchema), async (req, res) => {
    try {
        const { email, password, totpCode } = req.body;
        const tokens = await auth_1.default.authenticate({ email, password, totpCode });
        if (!tokens) {
            return res.status(401).json({
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email, password, or MFA code',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        res.json({
            success: true,
            data: tokens,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        if (error.message === 'MFA_REQUIRED') {
            return res.status(400).json({
                error: {
                    code: 'MFA_REQUIRED',
                    message: 'Multi-factor authentication code is required',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        if (error.message === 'MFA_NOT_CONFIGURED') {
            return res.status(500).json({
                error: {
                    code: 'MFA_NOT_CONFIGURED',
                    message: 'MFA is enabled but not properly configured',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        res.status(500).json({
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'An error occurred during authentication',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
// Refresh token endpoint
router.post('/refresh', (0, schemas_1.validateRequest)(schemas_1.refreshTokenSchema), async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const tokens = await auth_1.default.refreshToken(refreshToken);
        if (!tokens) {
            return res.status(401).json({
                error: {
                    code: 'INVALID_REFRESH_TOKEN',
                    message: 'Invalid or expired refresh token',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        res.json({
            success: true,
            data: tokens,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'TOKEN_REFRESH_ERROR',
                message: 'An error occurred while refreshing the token',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
// Logout endpoint
router.post('/logout', auth_2.authenticateToken, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            await auth_1.default.logout(token);
        }
        res.json({
            success: true,
            message: 'Successfully logged out',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'LOGOUT_ERROR',
                message: 'An error occurred during logout',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
// Register endpoint (admin only)
router.post('/register', auth_2.authenticateToken, rbac_1.default.requirePermission({ resource: 'user-management', action: 'write' }), (0, schemas_1.validateRequest)(schemas_1.registerSchema), async (req, res) => {
    try {
        const { email, password, roles = ['vendor'] } = req.body;
        const user = await auth_1.default.createUser(email, password, roles);
        if (!user) {
            return res.status(409).json({
                error: {
                    code: 'USER_EXISTS',
                    message: 'A user with this email already exists',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        // Remove sensitive data from response
        const { passwordHash, mfaSecret, ...safeUser } = user;
        res.status(201).json({
            success: true,
            data: safeUser,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'REGISTRATION_ERROR',
                message: 'An error occurred during user registration',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
// Get current user profile
router.get('/profile', auth_2.authenticateToken, async (req, res) => {
    try {
        const user = await auth_1.default.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User profile not found',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        // Remove sensitive data from response
        const { passwordHash, mfaSecret, ...safeUser } = user;
        res.json({
            success: true,
            data: safeUser,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'PROFILE_ERROR',
                message: 'An error occurred while fetching user profile',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
// Change password
router.post('/change-password', auth_2.authenticateToken, (0, schemas_1.validateRequest)(schemas_1.changePasswordSchema), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const success = await auth_1.default.updateUserPassword(req.user.userId, currentPassword, newPassword);
        if (!success) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_CURRENT_PASSWORD',
                    message: 'Current password is incorrect',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        res.json({
            success: true,
            message: 'Password changed successfully',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'PASSWORD_CHANGE_ERROR',
                message: 'An error occurred while changing password',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map