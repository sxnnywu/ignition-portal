// backend/src/middleware/rateLimit.js
//
// Rate limiters for the abuse-prone auth endpoints (brute-force / spam defence).
// Each limiter is keyed by client IP (express-rate-limit default).

import rateLimit from 'express-rate-limit';

// Per-request opt-out. The test suite fires hundreds of auth calls, so it sets
// DISABLE_RATE_LIMIT=true to avoid being throttled; individual tests flip it back
// to false to exercise the 429 path. Evaluated on every request.
const skip = () => process.env.DISABLE_RATE_LIMIT === 'true';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Thresholds are exported so tests can assert against the exact numbers.
export const RATE_LIMITS = {
  login: { windowMs: WINDOW_MS, limit: 10 },
  signup: { windowMs: WINDOW_MS, limit: 5 },
  forgotPassword: { windowMs: WINDOW_MS, limit: 5 },
};

function makeLimiter({ windowMs, limit }, message) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7', // RateLimit-* headers
    legacyHeaders: false, // no X-RateLimit-* headers
    skip,
    handler: (req, res) => res.status(429).json({ message }),
  });
}

// brute-force protection on login
export const loginLimiter = makeLimiter(
  RATE_LIMITS.login,
  'Too many login attempts from this IP. Please try again later.',
);

// spam protection on the three self-service signup routes
export const signupLimiter = makeLimiter(
  RATE_LIMITS.signup,
  'Too many sign-up attempts from this IP. Please try again later.',
);

// spam protection on password-reset requests (also limits email sending)
export const forgotPasswordLimiter = makeLimiter(
  RATE_LIMITS.forgotPassword,
  'Too many password reset requests from this IP. Please try again later.',
);
