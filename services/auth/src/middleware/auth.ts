import { Request, Response, NextFunction } from 'express';
import jwtService from '../services/jwt';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const userSession = await jwtService.validateToken(token);
    
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
  } catch (error) {
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

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const userSession = await jwtService.validateToken(token);
      if (userSession) {
        req.user = userSession;
      }
    } catch (error) {
      // Ignore errors for optional auth
    }
  }

  next();
};