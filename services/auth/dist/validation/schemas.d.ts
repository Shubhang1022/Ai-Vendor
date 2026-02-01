import Joi from 'joi';
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const refreshTokenSchema: Joi.ObjectSchema<any>;
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const changePasswordSchema: Joi.ObjectSchema<any>;
export declare const mfaVerificationSchema: Joi.ObjectSchema<any>;
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => any;
//# sourceMappingURL=schemas.d.ts.map