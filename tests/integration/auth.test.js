// tests/integration/auth.test.js
import { describe, it, expect } from 'vitest';
import { api } from '../helpers/app.js';
import {
  createApplicant,
  uniqueEmail,
  STRONG_PASSWORD,
} from '../helpers/factories.js';

describe('POST /signup (applicant)', () => {
  it('creates an applicant and returns a token', async () => {
    const email = uniqueEmail('signup');
    const res = await api()
      .post('/signup')
      .send({ name: 'Ada Lovelace', email, password: STRONG_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toMatchObject({ email, role: 'applicant' });
    expect(res.body.user.password).toBeUndefined();
  });

  it('capitalizes / formats the name', async () => {
    const res = await api()
      .post('/signup')
      .send({ name: '  ada   LOVELACE ', email: uniqueEmail(), password: STRONG_PASSWORD });
    expect(res.body.user.name).toBe('Ada Lovelace');
  });

  it('rejects missing fields with 400', async () => {
    const res = await api().post('/signup').send({ email: uniqueEmail() });
    expect(res.status).toBe(400);
  });

  it('rejects names containing numbers with 400', async () => {
    const res = await api()
      .post('/signup')
      .send({ name: 'Ada3', email: uniqueEmail(), password: STRONG_PASSWORD });
    expect(res.status).toBe(400);
  });

  it('rejects invalid email format with 400', async () => {
    const res = await api()
      .post('/signup')
      .send({ name: 'Ada', email: 'not-an-email', password: STRONG_PASSWORD });
    expect(res.status).toBe(400);
  });

  it('rejects weak passwords with 400', async () => {
    const res = await api()
      .post('/signup')
      .send({ name: 'Ada', email: uniqueEmail(), password: 'weak' });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email with 409', async () => {
    const email = uniqueEmail('dup');
    await api().post('/signup').send({ name: 'Ada', email, password: STRONG_PASSWORD });
    const res = await api()
      .post('/signup')
      .send({ name: 'Grace', email, password: STRONG_PASSWORD });
    expect(res.status).toBe(409);
  });
});

describe('POST /signup/reviewer and /signup/admin', () => {
  it('rejects reviewer signup with a wrong secret (403)', async () => {
    const res = await api().post('/signup/reviewer').send({
      name: 'Rev Iewer',
      email: uniqueEmail('rev'),
      password: STRONG_PASSWORD,
      secret: 'wrong',
    });
    expect(res.status).toBe(403);
  });

  it('creates a reviewer with the correct secret', async () => {
    const res = await api().post('/signup/reviewer').send({
      name: 'Rev Iewer',
      email: uniqueEmail('rev'),
      password: STRONG_PASSWORD,
      secret: process.env.REVIEWER_SIGNUP_SECRET,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('reviewer');
  });

  it('rejects admin signup with a wrong secret (403)', async () => {
    const res = await api().post('/signup/admin').send({
      name: 'Ad Min',
      email: uniqueEmail('adm'),
      password: STRONG_PASSWORD,
      secret: 'wrong',
    });
    expect(res.status).toBe(403);
  });

  it('creates an admin with the correct secret', async () => {
    const res = await api().post('/signup/admin').send({
      name: 'Ad Min',
      email: uniqueEmail('adm'),
      password: STRONG_PASSWORD,
      secret: process.env.ADMIN_SIGNUP_SECRET,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('admin');
  });
});

describe('POST /login', () => {
  it('logs in with valid credentials', async () => {
    const email = uniqueEmail('login');
    await api().post('/signup').send({ name: 'Log In', email, password: STRONG_PASSWORD });

    const res = await api().post('/login').send({ email, password: STRONG_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects a wrong password with 401', async () => {
    const email = uniqueEmail('login');
    await api().post('/signup').send({ name: 'Log In', email, password: STRONG_PASSWORD });

    const res = await api().post('/login').send({ email, password: 'WrongPass123' });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown email with 401', async () => {
    const res = await api()
      .post('/login')
      .send({ email: uniqueEmail('ghost'), password: STRONG_PASSWORD });
    expect(res.status).toBe(401);
  });

  it('rejects missing fields with 400', async () => {
    const res = await api().post('/login').send({ email: uniqueEmail() });
    expect(res.status).toBe(400);
  });
});

describe('POST /reset-password', () => {
  it('rejects an invalid/expired token with 400', async () => {
    const res = await api()
      .post('/reset-password')
      .send({ token: 'bogus-token', password: STRONG_PASSWORD });
    expect(res.status).toBe(400);
  });

  it('rejects missing token/password with 400', async () => {
    const res = await api().post('/reset-password').send({});
    expect(res.status).toBe(400);
  });
});

describe('auth middleware', () => {
  it('rejects protected routes with no token (401)', async () => {
    const res = await api().get('/applications/me');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed token (401)', async () => {
    const res = await api()
      .get('/applications/me')
      .set('Authorization', 'Bearer not.a.real.jwt');
    expect(res.status).toBe(401);
  });

  it('accepts a valid token', async () => {
    const { token } = await createApplicant();
    // no application yet -> 404, but auth passed (not 401)
    const res = await api().get('/applications/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).not.toBe(401);
  });
});
