"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeServices = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const auth_1 = __importDefault(require("./routes/auth"));
const mfa_1 = __importDefault(require("./routes/mfa"));
const ai_1 = __importDefault(require("./routes/ai"));
const redis_1 = __importDefault(require("./services/redis"));
const app = (0, express_1.default)();
exports.app = app;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
}));
// Request ID middleware
app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || (0, uuid_1.v4)();
    res.setHeader('X-Request-ID', req.headers['x-request-id']);
    next();
});
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.headers['x-request-id']}`);
    });
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/mfa', mfa_1.default);
app.use('/api/ai', ai_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'The requested endpoint was not found',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
        },
    });
});
// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
        },
    });
});
// Initialize Redis connection
const initializeServices = async () => {
    try {
        await redis_1.default.connect();
        console.log('Storage service initialized successfully');
    }
    catch (error) {
        console.warn('Redis connection failed, using in-memory storage:', error);
        // Continue with mock service - don't exit
    }
};
exports.initializeServices = initializeServices;
// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    try {
        await redis_1.default.disconnect();
        console.log('Redis connection closed');
    }
    catch (error) {
        console.error('Error during shutdown:', error);
    }
    process.exit(0);
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
exports.default = app;
//# sourceMappingURL=app.js.map