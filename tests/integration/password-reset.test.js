// tests/integration/password-reset.test.js
//
// Exercises the reset-password flow end-to-end WITHOUT sending email: we seed
// the same SHA-256 token hash the /forgot-password route would have stored, then
// drive /reset-password and confirm the new password actually works on /login.

import crypto from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { api } from '../helpers/app.js';
import User from '../../backend/src/models/User.js';
import { createApplicant, STRONG_PASSWORD } from '../helpers/factories.js';

// seed a reset token for a user the same way /forgot-password does
async function seedResetToken(userId, { expiresInMs = 60 * 60 * 1000 } = {}) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await User.findByIdAndUpdate(userId, {
    resetPasswordToken: tokenHash,
    resetPasswordExpiresAt: new Date(Date.now() + expiresInMs),
  });
  return rawToken;
}

describe('POST /reset-password — full flow', () => {
  it('resets the password with a valid token and the new password works on login', async () => {
    const { user } = await createApplicant({ email: 'reset.me@example.com' });
    const rawToken = await seedResetToken(user._id);

    const reset = await api()
      .post('/reset-password')
      .send({ token: rawToken, password: 'BrandNew123' });
    expect(reset.status).toBe(200);

    // old password no longer works
    const oldLogin = await api()
      .post('/login')
      .send({ email: 'reset.me@example.com', password: STRONG_PASSWORD });
    expect(oldLogin.status).toBe(401);

    // new password works
    const newLogin = await api()
      .post('/login')
      .send({ email: 'reset.me@example.com', password: 'BrandNew123' });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.token).toBeTruthy();
  });

  it('clears the reset token after a successful reset (single-use)', async () => {
    const { user } = await createApplicant();
    const rawToken = await seedResetToken(user._id);

    await api().post('/reset-password').send({ token: rawToken, password: 'BrandNew123' });

    // token is consumed — a second attempt with the same token fails
    const second = await api()
      .post('/reset-password')
      .send({ token: rawToken, password: 'AnotherOne123' });
    expect(second.status).toBe(400);

    const fresh = await User.findById(user._id);
    expect(fresh.resetPasswordToken).toBeNull();
    expect(fresh.resetPasswordExpiresAt).toBeNull();
  });

  it('rejects an expired token (400) and leaves the password unchanged', async () => {
    const { user } = await createApplicant({ email: 'expired@example.com' });
    const rawToken = await seedResetToken(user._id, { expiresInMs: -1000 });

    const reset = await api()
      .post('/reset-password')
      .send({ token: rawToken, password: 'BrandNew123' });
    expect(reset.status).toBe(400);

    // original password still works
    const login = await api()
      .post('/login')
      .send({ email: 'expired@example.com', password: STRONG_PASSWORD });
    expect(login.status).toBe(200);
  });

  it('rejects a weak new password even with a valid token (400)', async () => {
    const { user } = await createApplicant();
    const rawToken = await seedResetToken(user._id);

    const reset = await api()
      .post('/reset-password')
      .send({ token: rawToken, password: 'weak' });
    expect(reset.status).toBe(400);
  });
});

describe('POST /forgot-password — validation (no email sent)', () => {
  it('returns 400 when no email is given', async () => {
    expect((await api().post('/forgot-password').send({})).status).toBe(400);
  });

  it('returns 404 for an unknown email', async () => {
    const res = await api().post('/forgot-password').send({ email: 'nobody@example.com' });
    expect(res.status).toBe(404);
  });
});

describe('login is case-insensitive on email', () => {
  it('logs in regardless of the email casing used at signup', async () => {
    await api()
      .post('/signup')
      .send({ name: 'Case Test', email: 'MixedCase@Example.com', password: STRONG_PASSWORD });

    const res = await api()
      .post('/login')
      .send({ email: 'mixedcase@example.com', password: STRONG_PASSWORD });
    expect(res.status).toBe(200);
  });
});
