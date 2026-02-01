"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.mfaVerificationSchema = exports.changePasswordSchema = exports.registerSchema = exports.refreshTokenSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
    }),
    totpCode: joi_1.default.string().length(6).pattern(/^\d+$/).optional().messages({
        'string.length': 'TOTP code must be exactly 6 digits',
        'string.pattern.base': 'TOTP code must contain only numbers',
    }),
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required().messages({
        'any.required': 'Refresh token is required',
    }),
});
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
    }),
    confirmPassword: joi_1.default.string().valid(joi_1.default.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
    }),
    roles: joi_1.default.array().items(joi_1.default.string().valid('admin', 'vendor', 'readonly', 'api')).optional(),
});
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required().messages({
        'any.required': 'Current password is required',
    }),
    newPassword: joi_1.default.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required',
    }),
    confirmNewPassword: joi_1.default.string().valid(joi_1.default.ref('newPassword')).required().messages({
        'any.only': 'New passwords do not match',
        'any.required': 'New password confirmation is required',
    }),
});
exports.mfaVerificationSchema = joi_1.default.object({
    totpCode: joi_1.default.string().length(6).pattern(/^\d+$/).required().messages({
        'string.length': 'TOTP code must be exactly 6 digits',
        'string.pattern.base': 'TOTP code must contain only numbers',
        'any.required': 'TOTP code is required',
    }),
});
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                    details: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                    })),
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
        next();
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=schemas.js.map