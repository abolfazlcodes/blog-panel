// Access token: short-lived (refreshed silently). Refresh token: long-lived,
// rotated on every use.
export const ACCESS_TOKEN_EXPIRY_TIME = 60 * 60; // seconds (1h)
export const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Back-compat alias for the old name.
export const TOKEN_EXPIRY_TIME = ACCESS_TOKEN_EXPIRY_TIME;
