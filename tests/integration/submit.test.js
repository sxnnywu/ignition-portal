// tests/integration/submit.test.js
import { describe, it, expect } from 'vitest';
import { api } from '../helpers/app.js';
import {
  createApplicant,
  authHeader,
  validApplicationPayload,
} from '../helpers/factories.js';

// helper: save a draft and return its id
async function saveDraft(token, payload) {
  const res = await api().post('/applications').set(authHeader(token)).send(payload);
  return res.body.application._id;
}

describe('POST /applications/:id/submit — completeness validation', () => {
  it('submits a fully-completed application (200)', async () => {
    const { token } = await createApplicant();
    const id = await saveDraft(token, validApplicationPayload());

    const res = await api().post(`/applications/${id}/submit`).set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('submitted');
    expect(res.body.application.submittedAt).toBeTruthy();
  });

  it('blocks submit when required fields are missing and lists them (400)', async () => {
    const { token } = await createApplicant();
    const id = await saveDraft(token, { personal: { city: 'Toronto' } });

    const res = await api().post(`/applications/${id}/submit`).set(authHeader(token));
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.missing)).toBe(true);
    expect(res.body.missing).toContain('Gender');
    expect(res.body.missing).toContain('Question 1 (how others describe you)');
  });

  it('requires program ONLY for undergraduate/graduate', async () => {
    const { token } = await createApplicant();
    // undergraduate without program -> missing "Program"
    const id = await saveDraft(
      token,
      validApplicationPayload({
        education: {
          institution: 'UofT',
          level: 'undergraduate',
          program: '',
          coop: 'no',
        },
      }),
    );
    const res = await api().post(`/applications/${id}/submit`).set(authHeader(token));
    expect(res.status).toBe(400);
    expect(res.body.missing).toContain('Program');
  });

  it('does NOT require program for high-school applicants', async () => {
    const { token } = await createApplicant();
    const id = await saveDraft(
      token,
      validApplicationPayload({
        education: {
          institution: 'Central High',
          level: 'high-school',
          program: '',
          coop: 'no',
        },
      }),
    );
    const res = await api().post(`/applications/${id}/submit`).set(authHeader(token));
    expect(res.status).toBe(200);
  });

  it('accepts 0 hackathons attended as a valid answer', async () => {
    const { token } = await createApplicant();
    const id = await saveDraft(
      token,
      validApplicationPayload({ experience: { attended2025: 'no', hackathonsAttended: 0 } }),
    );
    const res = await api().post(`/applications/${id}/submit`).set(authHeader(token));
    expect(res.status).toBe(200);
  });

  it('prevents submitting another user\'s application (403)', async () => {
    const { token: ownerToken } = await createApplicant();
    const id = await saveDraft(ownerToken, validApplicationPayload());

    const { token: otherToken } = await createApplicant();
    const res = await api().post(`/applications/${id}/submit`).set(authHeader(otherToken));
    expect(res.status).toBe(403);
  });

  it('prevents double submission (400)', async () => {
    const { token } = await createApplicant();
    const id = await saveDraft(token, validApplicationPayload());
    await api().post(`/applications/${id}/submit`).set(authHeader(token));

    const res = await api().post(`/applications/${id}/submit`).set(authHeader(token));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid application id', async () => {
    const { token } = await createApplicant();
    const res = await api().post('/applications/not-an-id/submit').set(authHeader(token));
    expect(res.status).toBe(400);
  });

  it('returns 404 when submitting a non-existent application', async () => {
    const { token } = await createApplicant();
    const ghostId = '000000000000000000000000';
    const res = await api().post(`/applications/${ghostId}/submit`).set(authHeader(token));
    expect(res.status).toBe(404);
  });
});

describe('program requirement by education level', () => {
  // graduate also requires program; bootcamp / other / high-school do not
  const cases = [
    ['graduate', false, 400],
    ['graduate', true, 200],
    ['bootcamp', false, 200],
    ['other', false, 200],
  ];

  for (const [level, withProgram, expected] of cases) {
    it(`${level} ${withProgram ? 'with' : 'without'} program → ${expected}`, async () => {
      const { token } = await createApplicant();
      const id = await saveDraft(
        token,
        validApplicationPayload({
          education: {
            institution: 'Somewhere',
            level,
            program: withProgram ? 'Some Program' : '',
            coop: 'no',
          },
        }),
      );
      const res = await api().post(`/applications/${id}/submit`).set(authHeader(token));
      expect(res.status).toBe(expected);
    });
  }
});
