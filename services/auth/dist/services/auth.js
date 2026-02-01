"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config"));
const jwt_1 = __importDefault(require("./jwt"));
const mfa_1 = __importDefault(require("./mfa"));
const redis_1 = __importDefault(require("./redis"));
class AuthService {
    users = new Map(); // In-memory store for demo - replace with database
    constructor() {
        this.initializeDefaultUsers();
    }
    async initializeDefaultUsers() {
        // Create default admin user
        const adminUser = {
            id: (0, uuid_1.v4)(),
            email: 'admin@vendorplatform.com',
            passwordHash: await bcryptjs_1.default.hash('admin123', config_1.default.bcrypt.saltRounds),
            roles: [{ id: 'admin', name: 'admin', permissions: [] }],
            mfaEnabled: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Create default vendor user
        const vendorUser = {
            id: (0, uuid_1.v4)(),
            email: 'vendor@example.com',
            passwordHash: await bcryptjs_1.default.hash('vendor123', config_1.default.bcrypt.saltRounds),
            roles: [{ id: 'vendor', name: 'vendor', permissions: [] }],
            mfaEnabled: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(adminUser.email, adminUser);
        this.users.set(vendorUser.email, vendorUser);
    }
    async authenticate(credentials) {
        const user = this.users.get(credentials.email);
        if (!user || !user.isActive) {
            return null;
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(credentials.password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }
        // Check MFA if enabled
        if (user.mfaEnabled) {
            if (!credentials.totpCode) {
                throw new Error('MFA_REQUIRED');
            }
            if (!user.mfaSecret) {
                throw new Error('MFA_NOT_CONFIGURED');
            }
            const isMFAValid = mfa_1.default.verifyToken(user.mfaSecret, credentials.totpCode);
            if (!isMFAValid) {
                return null;
            }
        }
        // Generate tokens
        const tokens = jwt_1.default.generateTokens(user.id, user.email, user.roles.map(role => role.name));
        // Store session in Redis
        const sessionData = {
            userId: user.id,
            email: user.email,
            roles: user.roles.map(role => role.name),
        };
        const sessionId = this.extractSessionId(tokens.accessToken);
        await redis_1.default.setSession(sessionId, sessionData, tokens.expiresIn);
        // Store refresh token
        await redis_1.default.setRefreshToken(user.id, sessionId, this.parseExpirationTime(config_1.default.jwtRefreshExpiresIn));
        return tokens;
    }
    async refreshToken(refreshToken) {
        return jwt_1.default.refreshToken(refreshToken);
    }
    async logout(token) {
        await jwt_1.default.invalidateToken(token);
    }
    async setupMFA(userId) {
        const user = this.findUserById(userId);
        if (!user) {
            return null;
        }
        const mfaSetup = await mfa_1.default.setupMFA(user.email);
        // Store MFA secret (in production, this should be encrypted)
        user.mfaSecret = mfaSetup.secret;
        user.updatedAt = new Date();
        return mfaSetup;
    }
    async enableMFA(userId, totpCode) {
        const user = this.findUserById(userId);
        if (!user || !user.mfaSecret) {
            return false;
        }
        const isValid = mfa_1.default.verifyToken(user.mfaSecret, totpCode);
        if (!isValid) {
            return false;
        }
        user.mfaEnabled = true;
        user.updatedAt = new Date();
        return true;
    }
    async disableMFA(userId, totpCode) {
        const user = this.findUserById(userId);
        if (!user || !user.mfaSecret) {
            return false;
        }
        const isValid = mfa_1.default.verifyToken(user.mfaSecret, totpCode);
        if (!isValid) {
            return false;
        }
        user.mfaEnabled = false;
        user.mfaSecret = undefined;
        user.updatedAt = new Date();
        return true;
    }
    async createUser(email, password, roles = ['vendor']) {
        if (this.users.has(email)) {
            return null; // User already exists
        }
        const passwordHash = await bcryptjs_1.default.hash(password, config_1.default.bcrypt.saltRounds);
        const user = {
            id: (0, uuid_1.v4)(),
            email,
            passwordHash,
            roles: roles.map(roleName => ({ id: roleName, name: roleName, permissions: [] })),
            mfaEnabled: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(email, user);
        return user;
    }
    async getUserById(userId) {
        return this.findUserById(userId);
    }
    async getUserByEmail(email) {
        return this.users.get(email) || null;
    }
    async updateUserPassword(userId, currentPassword, newPassword) {
        const user = this.findUserById(userId);
        if (!user) {
            return false;
        }
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            return false;
        }
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, config_1.default.bcrypt.saltRounds);
        user.updatedAt = new Date();
        return true;
    }
    async deactivateUser(userId) {
        const user = this.findUserById(userId);
        if (!user) {
            return false;
        }
        user.isActive = false;
        user.updatedAt = new Date();
        // Invalidate all user sessions
        await redis_1.default.deleteAllUserRefreshTokens(userId);
        return true;
    }
    findUserById(userId) {
        for (const user of this.users.values()) {
            if (user.id === userId) {
                return user;
            }
        }
        return null;
    }
    extractSessionId(token) {
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            return payload.sessionId;
        }
        catch {
            return '';
        }
    }
    parseExpirationTime(timeString) {
        const unit = timeString.slice(-1);
        const value = parseInt(timeString.slice(0, -1), 10);
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 60 * 60 * 24;
            default: return 604800; // 7 days default
        }
    }
}
exports.authService = new AuthService();
exports.default = exports.authService;
//# sourceMappingURL=auth.js.map