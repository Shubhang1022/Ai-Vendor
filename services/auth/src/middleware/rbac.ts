import { Request, Response, NextFunction } from 'express';
import { UserSession, Permission } from '../types/auth';

// Extend Express Request type to include user session
declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

interface RBACOptions {
  resource: string;
  action: string;
  conditions?: (req: Request) => boolean;
}

class RBACService {
  private rolePermissions: Map<string, Permission[]> = new Map();

  constructor() {
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles(): void {
    // Admin role - full access
    this.rolePermissions.set('admin', [
      { id: 'admin-all', resource: '*', action: '*' },
    ]);

    // Vendor role - vendor-specific access
    this.rolePermissions.set('vendor', [
      { id: 'vendor-profile-read', resource: 'vendor-profile', action: 'read' },
      { id: 'vendor-profile-write', resource: 'vendor-profile', action: 'write' },
      { id: 'price-discovery-read', resource: 'price-discovery', action: 'read' },
      { id: 'negotiation-read', resource: 'negotiation', action: 'read' },
      { id: 'negotiation-write', resource: 'negotiation', action: 'write' },
      { id: 'deal-read', resource: 'deal', action: 'read' },
      { id: 'deal-write', resource: 'deal', action: 'write' },
      { id: 'market-intelligence-read', resource: 'market-intelligence', action: 'read' },
    ]);

    // Read-only role - limited access
    this.rolePermissions.set('readonly', [
      { id: 'vendor-profile-read', resource: 'vendor-profile', action: 'read' },
      { id: 'price-discovery-read', resource: 'price-discovery', action: 'read' },
      { id: 'market-intelligence-read', resource: 'market-intelligence', action: 'read' },
    ]);

    // API role - for external integrations
    this.rolePermissions.set('api', [
      { id: 'integration-read', resource: 'integration', action: 'read' },
      { id: 'integration-write', resource: 'integration', action: 'write' },
      { id: 'export-read', resource: 'export', action: 'read' },
    ]);
  }

  hasPermission(userRoles: string[], resource: string, action: string): boolean {
    for (const roleName of userRoles) {
      const permissions = this.rolePermissions.get(roleName) || [];
      
      for (const permission of permissions) {
        // Check for wildcard permissions
        if (permission.resource === '*' && permission.action === '*') {
          return true;
        }
        
        // Check for resource wildcard
        if (permission.resource === '*' && permission.action === action) {
          return true;
        }
        
        // Check for action wildcard
        if (permission.resource === resource && permission.action === '*') {
          return true;
        }
        
        // Check for exact match
        if (permission.resource === resource && permission.action === action) {
          return true;
        }
      }
    }
    
    return false;
  }

  getUserPermissions(userRoles: string[]): Permission[] {
    const allPermissions: Permission[] = [];
    
    for (const roleName of userRoles) {
      const permissions = this.rolePermissions.get(roleName) || [];
      allPermissions.push(...permissions);
    }
    
    // Remove duplicates
    const uniquePermissions = allPermissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );
    
    return uniquePermissions;
  }

  requirePermission(options: RBACOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
      }

      const userRoles = req.user.roles.map(role => role.name);
      const hasPermission = this.hasPermission(userRoles, options.resource, options.action);

      if (!hasPermission) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: `Insufficient permissions for ${options.action} on ${options.resource}`,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
      }

      // Check additional conditions if provided
      if (options.conditions && !options.conditions(req)) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied due to additional constraints',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
      }

      // Add user permissions to request for use in controllers
      req.user.permissions = this.getUserPermissions(userRoles);
      
      next();
    };
  }

  // Middleware to check if user owns the resource (for vendor-specific data)
  requireOwnership(resourceIdParam: string = 'vendorId') {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
      }

      const resourceId = req.params[resourceIdParam];
      const userRoles = req.user.roles.map(role => role.name);

      // Admins can access any resource
      if (userRoles.includes('admin')) {
        return next();
      }

      // Check if user owns the resource
      if (req.user.userId !== resourceId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: insufficient ownership permissions',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
      }

      next();
    };
  }
}

export const rbacService = new RBACService();
export default rbacService;