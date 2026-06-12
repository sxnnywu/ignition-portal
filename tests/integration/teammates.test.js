// tests/integration/teammates.test.js
import { describe, it, expect } from 'vitest';
import { api } from '../helpers/app.js';
import {
  createApplicant,
  createReviewer,
  authHeader,
} from '../helpers/factories.js';

describe('GET /applications/teammate/:userId — lookup', () => {
  it('looks up a fellow applicant by id', async () => {
    const { token } = await createApplicant();
    const { user: mate } = await createApplicant({ name: 'Grace Hopper' });

    const res = await api()
      .get(`/applications/teammate/${mate._id}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      _id: mate._id,
      firstName: 'Grace',
      lastName: 'Hopper',
    });
  });

  it('returns 400 when looking up yourself', async () => {
    const { token, user } = await createApplicant();
    const res = await api()
      .get(`/applications/teammate/${user._id}`)
      .set(authHeader(token));
    expect(res.status).toBe(400);
  });

  it('returns 404 for a non-applicant (e.g. a reviewer)', async () => {
    const { token } = await createApplicant();
    const { user: reviewer } = await createReviewer();
    const res = await api()
      .get(`/applications/teammate/${reviewer._id}`)
      .set(authHeader(token));
    expect(res.status).toBe(404);
  });

  it('returns 404 for a malformed id', async () => {
    const { token } = await createApplicant();
    const res = await api()
      .get('/applications/teammate/not-an-id')
      .set(authHeader(token));
    expect(res.status).toBe(404);
  });
});

describe('POST /applications — teammates rules (server is source of truth)', () => {
  it('stores teammates from a list of ids, deriving name/email from the DB', async () => {
    const { token } = await createApplicant();
    const { user: a } = await createApplicant({ name: 'Mate One' });
    const { user: b } = await createApplicant({ name: 'Mate Two' });

    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ teammates: [a._id, b._id] });

    expect(res.status).toBe(201);
    expect(res.body.application.teammates).toHaveLength(2);
    expect(res.body.application.teammates[0]).toMatchObject({
      userId: a._id,
      name: 'Mate One',
    });
  });

  it('rejects more than 3 teammates (400)', async () => {
    const { token } = await createApplicant();
    const mates = [];
    for (let i = 0; i < 4; i += 1) {
      const { user } = await createApplicant();
      mates.push(user._id);
    }
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ teammates: mates });
    expect(res.status).toBe(400);
  });

  it('rejects adding yourself as a teammate (400)', async () => {
    const { token, user } = await createApplicant();
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ teammates: [user._id] });
    expect(res.status).toBe(400);
  });

  it('rejects duplicate teammate ids (400)', async () => {
    const { token } = await createApplicant();
    const { user: a } = await createApplicant();
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ teammates: [a._id, a._id] });
    expect(res.status).toBe(400);
  });

  it('rejects a teammate id that is not an applicant (400)', async () => {
    const { token } = await createApplicant();
    const { user: reviewer } = await createReviewer();
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ teammates: [reviewer._id] });
    expect(res.status).toBe(400);
  });

  it('rejects a well-formed id that belongs to no user (400)', async () => {
    const { token } = await createApplicant();
    const res = await api()
      .post('/applications')
      .set(authHeader(token))
      .send({ teammates: ['000000000000000000000000'] });
    expect(res.status).toBe(400);
  });

  it('replaces the teammates array on re-save (not append)', async () => {
    const { token } = await createApplicant();
    const { user: a } = await createApplicant();
    const { user: b } = await createApplicant();

    await api().post('/applications').set(authHeader(token)).send({ teammates: [a._id, b._id] });
    const res = await api().post('/applications').set(authHeader(token)).send({ teammates: [a._id] });
    expect(res.body.application.teammates).toHaveLength(1);
    expect(res.body.application.teammates[0].userId).toBe(String(a._id));
  });
});

describe('teammate lookup — name splitting & missing users', () => {
  it('splits a single-word name into firstName with an empty lastName', async () => {
    const { token } = await createApplicant();
    const { user: mate } = await createApplicant({ name: 'Madonna' });
    const res = await api().get(`/applications/teammate/${mate._id}`).set(authHeader(token));
    expect(res.body.user.firstName).toBe('Madonna');
    expect(res.body.user.lastName).toBe('');
  });

  it('returns 404 for a well-formed id with no matching user', async () => {
    const { token } = await createApplicant();
    const res = await api()
      .get('/applications/teammate/000000000000000000000000')
      .set(authHeader(token));
    expect(res.status).toBe(404);
  });
});
