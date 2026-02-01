export declare const config: {
    port: number;
    jwtSecret: string;
    jwtRefreshSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    bcrypt: {
        saltRounds: number;
    };
    mfa: {
        issuer: string;
        window: number;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map