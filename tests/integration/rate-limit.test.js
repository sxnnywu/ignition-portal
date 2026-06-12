// tests/integration/rate-limit.test.js
//
// Verifies the security hardening: auth-route rate limiting (429 after too many
// attempts) and helmet security headers. The rest of the suite runs with
// DISABLE_RATE_LIMIT=true (see setup.js); here we flip it off to exercise the
// real limiter.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api } from '../helpers/app.js';
import { RATE_LIMITS } from '../../backend/src/middleware/rateLimit.js';
import { createApplicant } from '../helpers/factories.js';

describe('rate limiting on /login', () => {
  beforeAll(() => { process.env.DISABLE_RATE_LIMIT = 'false'; });
  afterAll(() => { process.env.DISABLE_RATE_LIMIT = 'true'; });

  it('returns 429 once the per-IP login limit is exceeded', async () => {
    // a real user, so allowed attempts fail with 401 (wrong password) not 404
    await createApplicant({ email: 'limit@example.com' });
    const max = RATE_LIMITS.login.limit;

    const statuses = [];
    for (let i = 0; i < max + 1; i += 1) {
      const res = await api()
        .post('/login')
        .send({ email: 'limit@example.com', password: 'WrongPass123' });
      statuses.push(res.status);
    }

    // the first `max` attempts are let through (401), the next one is throttled
    expect(statuses.slice(0, max).every((s) => s === 401)).toBe(true);
    expect(statuses[max]).toBe(429);
  });

  it('the 429 response carries a clear JSON message', async () => {
    // the limiter is already over its threshold from the previous test
    const res = await api()
      .post('/login')
      .send({ email: 'limit@example.com', password: 'WrongPass123' });
    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/too many login attempts/i);
  });
});

describe('helmet security headers', () => {
  it('sets hardening headers on API responses', async () => {
    // any response works; pick one that does not require auth state
    const res = await api().post('/login').send({});
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    // helmet also removes the Express fingerprint
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
