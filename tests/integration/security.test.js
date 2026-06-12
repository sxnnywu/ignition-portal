// tests/integration/security.test.js
//
// Focused on the security boundary: JWT verification edge cases and
// role-based access control across every protected surface.

import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { api } from '../helpers/app.js';
import { mongoose } from '../../backend/src/config/db.js';
import User from '../../backend/src/models/User.js';
import {
  createApplicant,
  createReviewer,
  createAdmin,
  authHeader,
  createSubmittedApplication,
} from '../helpers/factories.js';

const fakeId = () => new mongoose.Types.ObjectId().toString();

describe('JWT verification', () => {
  it('rejects a request with no Authorization header (401)', async () => {
    expect((await api().get('/applications/me')).status).toBe(401);
  });

  it('rejects an Authorization header without the Bearer prefix (401)', async () => {
    const res = await api().get('/applications/me').set('Authorization', 'Token abc');
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with the wrong secret (401)', async () => {
    const token = jwt.sign({ userId: fakeId(), role: 'admin' }, 'the-wrong-secret');
    const res = await api().get('/applications').set(authHeader(token));
    expect(res.status).toBe(401);
  });

  it('rejects an expired token (401)', async () => {
    const token = jwt.sign(
      { userId: fakeId(), role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: -10 },
    );
    const res = await api().get('/applications').set(authHeader(token));
    expect(res.status).toBe(401);
  });

  it('rejects a token with a tampered signature (401)', async () => {
    const token = jwt.sign({ userId: fakeId(), role: 'admin' }, process.env.JWT_SECRET);
    const tampered = `${token}x`;
    const res = await api().get('/applications').set(authHeader(tampered));
    expect(res.status).toBe(401);
  });

  it('a valid token whose user was deleted still authenticates, but user-dependent routes 404', async () => {
    const { token, user } = await createApplicant();
    await User.findByIdAndDelete(user._id); // delete the account behind the token
    // auth middleware only trusts the JWT, so this passes the 401 gate...
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ personal: { city: 'Toronto' } });
    expect(res.status).toBe(404); // ...but the route can't find the user
  });
});

describe('role-based access control', () => {
  // [method, path, body, roles that must get 403]
  const adminOnly = [
    ['get', '/applications'],
    ['get', '/api/admin/stats'],
    ['get', '/api/admin/applications'],
    ['get', '/api/admin/users'],
    ['get', '/api/admin/export-csv'],
  ];

  it('blocks applicants from every admin-only endpoint (403)', async () => {
    const { token } = await createApplicant();
    for (const [method, path] of adminOnly) {
      const res = await api()[method](path).set(authHeader(token));
      expect(res.status, `${method} ${path}`).toBe(403);
    }
  });

  it('blocks reviewers from every admin-only endpoint (403)', async () => {
    const { token } = await createReviewer();
    for (const [method, path] of adminOnly) {
      const res = await api()[method](path).set(authHeader(token));
      expect(res.status, `${method} ${path}`).toBe(403);
    }
  });

  it('blocks applicants from reviewer/admin-only application reads (403)', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: other } = await createApplicant();

    expect((await api().get(`/applications/${app._id}`).set(authHeader(other))).status).toBe(403);
    expect((await api().get(`/applications/${app._id}/review/me`).set(authHeader(other))).status).toBe(403);
  });

  it('blocks reviewers from admin-only application actions (403)', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    const status = await api()
      .post(`/applications/${app._id}/status`)
      .set(authHeader(reviewer))
      .send({ status: 'accepted' });
    expect(status.status).toBe(403);

    const reviews = await api().get(`/applications/${app._id}/reviews`).set(authHeader(reviewer));
    expect(reviews.status).toBe(403);
  });

  it('lets reviewers AND admins read a single application and the review pool', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);

    for (const make of [createReviewer, createAdmin]) {
      const { token } = await make();
      expect((await api().get(`/applications/${app._id}`).set(authHeader(token))).status).toBe(200);
      expect((await api().get('/applications/reviewer').set(authHeader(token))).status).toBe(200);
    }
  });
});
