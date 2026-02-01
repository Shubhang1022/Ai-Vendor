import { Request, Response, NextFunction } from 'express';
import { UserSession, Permission } from '../types/auth';
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
declare class RBACService {
    private rolePermissions;
    constructor();
    private initializeDefaultRoles;
    hasPermission(userRoles: string[], resource: string, action: string): boolean;
    getUserPermissions(userRoles: string[]): Permission[];
    requirePermission(options: RBACOptions): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    requireOwnership(resourceIdParam?: string): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
}
export declare const rbacService: RBACService;
export default rbacService;
//# sourceMappingURL=rbac.d.ts.map