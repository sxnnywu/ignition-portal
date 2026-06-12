// tests/integration/applications.test.js
import { describe, it, expect } from 'vitest';
import { api } from '../helpers/app.js';
import {
  createApplicant,
  authHeader,
  validApplicationPayload,
} from '../helpers/factories.js';

describe('POST /applications (create / draft)', () => {
  it('creates a new draft application (201) for the current user', async () => {
    const { token, user } = await createApplicant();
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ personal: { city: 'Toronto' } });

    expect(res.status).toBe(201);
    expect(res.body.application.status).toBe('draft');
    expect(res.body.application.userId).toBe(user._id);
    expect(res.body.application.personal.city).toBe('Toronto');
  });

  it('updates the same application on a second save (200, version bumps)', async () => {
    const { token } = await createApplicant();
    const first = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ personal: { city: 'Toronto' } });
    expect(first.status).toBe(201);
    expect(first.body.application.version).toBe(1);

    const second = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ personal: { city: 'Ottawa' } });
    expect(second.status).toBe(200);
    expect(second.body.application.version).toBe(2);
    expect(second.body.application.personal.city).toBe('Ottawa');
  });

  it('persists across "devices" — GET /applications/me returns the saved draft', async () => {
    const { token } = await createApplicant();
    await api()
      .post('/applications')
      .set(authHeader(token))
      .send(validApplicationPayload());

    const res = await api().get('/applications/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
    expect(res.body.applications[0].education.institution).toBe('University of Toronto');
  });

  it('requires authentication', async () => {
    const res = await api().post('/applications').send({});
    expect(res.status).toBe(401);
  });

  it('rejects a response longer than its character limit (400)', async () => {
    const { token } = await createApplicant();
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ responses: { admireDescribe: 'x'.repeat(101) } });
    expect(res.status).toBe(400);
  });

  it('coerces numeric strings for age and hackathonsAttended', async () => {
    const { token } = await createApplicant();
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ personal: { age: '21' }, experience: { hackathonsAttended: '3' } });
    expect(res.body.application.personal.age).toBe(21);
    expect(res.body.application.experience.hackathonsAttended).toBe(3);
  });

  it('treats empty string age as null (not 0)', async () => {
    const { token } = await createApplicant();
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ personal: { age: '' } });
    expect(res.body.application.personal.age).toBeNull();
  });

  it('rejects hackathonsAttended above the schema max of 5 (400)', async () => {
    const { token } = await createApplicant();
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ experience: { hackathonsAttended: 9 } });
    expect(res.status).toBe(400);
  });
});

describe('GET /applications/me', () => {
  it('returns 404 when the user has no application', async () => {
    const { token } = await createApplicant();
    const res = await api().get('/applications/me').set(authHeader(token));
    expect(res.status).toBe(404);
  });
});

describe('structured slices update independently (no overwrite)', () => {
  it('saving education does not wipe a previously-saved personal slice', async () => {
    const { token } = await createApplicant();
    await api().post('/applications').set(authHeader(token)).send({ personal: { city: 'Toronto' } });
    await api().post('/applications').set(authHeader(token)).send({ education: { institution: 'UofT' } });

    const res = await api().get('/applications/me').set(authHeader(token));
    const app = res.body.applications[0];
    expect(app.personal.city).toBe('Toronto'); // survived the second save
    expect(app.education.institution).toBe('UofT');
  });
});

describe('submitted applications cannot be reverted to draft', () => {
  it('rejects POST /applications with status draft once submitted (400)', async () => {
    const { token } = await createApplicant();
    await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ ...validApplicationPayload(), status: 'submitted' });

    const revert = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ status: 'draft' });
    expect(revert.status).toBe(400);
  });
});
