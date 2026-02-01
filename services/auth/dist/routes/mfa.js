"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../services/auth"));
const auth_2 = require("../middleware/auth");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Setup MFA - generates QR code and backup codes
router.post('/setup', auth_2.authenticateToken, async (req, res) => {
    try {
        const mfaSetup = await auth_1.default.setupMFA(req.user.userId);
        if (!mfaSetup) {
            return res.status(404).json({
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        res.json({
            success: true,
            data: mfaSetup,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'MFA_SETUP_ERROR',
                message: 'An error occurred while setting up MFA',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
// Enable MFA - verifies TOTP code and enables MFA
router.post('/enable', auth_2.authenticateToken, (0, schemas_1.validateRequest)(schemas_1.mfaVerificationSchema), async (req, res) => {
    try {
        const { totpCode } = req.body;
        const success = await auth_1.default.enableMFA(req.user.userId, totpCode);
        if (!success) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_TOTP_CODE',
                    message: 'Invalid TOTP code or MFA not set up',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        res.json({
            success: true,
            message: 'MFA enabled successfully',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'MFA_ENABLE_ERROR',
                message: 'An error occurred while enabling MFA',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
// Disable MFA - verifies TOTP code and disables MFA
router.post('/disable', auth_2.authenticateToken, (0, schemas_1.validateRequest)(schemas_1.mfaVerificationSchema), async (req, res) => {
    try {
        const { totpCode } = req.body;
        const success = await auth_1.default.disableMFA(req.user.userId, totpCode);
        if (!success) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_TOTP_CODE',
                    message: 'Invalid TOTP code',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        res.json({
            success: true,
            message: 'MFA disabled successfully',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'MFA_DISABLE_ERROR',
                message: 'An error occurred while disabling MFA',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
// Get MFA status
router.get('/status', auth_2.authenticateToken, async (req, res) => {
    try {
        const user = await auth_1.default.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        res.json({
            success: true,
            data: {
                mfaEnabled: user.mfaEnabled,
                mfaConfigured: !!user.mfaSecret,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'MFA_STATUS_ERROR',
                message: 'An error occurred while fetching MFA status',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
});
exports.default = router;
//# sourceMappingURL=mfa.js.map