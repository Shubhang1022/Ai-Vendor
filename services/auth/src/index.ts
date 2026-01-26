import { app, initializeServices } from './app';
import config from './config';

const startServer = async () => {
  try {
    // Initialize services
    await initializeServices();
    
    // Start the server
    const server = app.listen(config.port, () => {
      console.log(`Authentication service running on port ${config.port}`);
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

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();