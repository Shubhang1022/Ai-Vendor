"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = __importDefault(require("./config"));
const startServer = async () => {
    try {
        // Initialize services
        await (0, app_1.initializeServices)();
        // Start the server
        const server = app_1.app.listen(config_1.default.port, () => {
            console.log(`Authentication service running on port ${config_1.default.port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
        // Handle server shutdown
        const shutdown = () => {
            console.log('Shutting down server...');
            server.close(() => {
                console.log('Server closed');
            });
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map