export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 7;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// JWT Secret - 后端专用，前端使用默认值
export const JWT_SECRET = (typeof process !== 'undefined' ? process.env.JWT_SECRET : undefined) || "your-secret-key-change-in-production";
