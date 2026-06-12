// tests/integration/reviews.test.js
import { describe, it, expect } from 'vitest';
import { api } from '../helpers/app.js';
import {
  createApplicant,
  createReviewer,
  createAdmin,
  authHeader,
  createSubmittedApplication,
} from '../helpers/factories.js';

const SCORES = { technical: 4, motivation: 5, experience: 3 };

describe('POST /applications/:id/review', () => {
  it('lets a reviewer score a submitted application (201) and moves it to under_review', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    const res = await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES });

    expect(res.status).toBe(201);
    expect(res.body.review.totalScore).toBe(12);

    // application is now under_review (visible to admins)
    const { token: admin } = await createAdmin();
    const detail = await api().get(`/applications/${app._id}`).set(authHeader(admin));
    expect(detail.body.application.status).toBe('under_review');
  });

  it('persists a reviewer comment and returns it on read (the data-loss fix)', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    const comment = 'Strong project experience; would be a great fit.';
    const post = await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES, comment });
    expect(post.status).toBe(201);
    expect(post.body.review.comment).toBe(comment);

    // reviewer re-reads their own review -> comment survives the round-trip
    const mine = await api()
      .get(`/applications/${app._id}/review/me`)
      .set(authHeader(reviewer));
    expect(mine.status).toBe(200);
    expect(mine.body.review.comment).toBe(comment);

    // admin sees the comment in the full reviews list
    const { token: admin } = await createAdmin();
    const all = await api().get(`/applications/${app._id}/reviews`).set(authHeader(admin));
    expect(all.status).toBe(200);
    expect(all.body.reviews[0].comment).toBe(comment);
  });

  it('trims the comment and rejects one longer than 2000 chars (400)', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    const res = await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES, comment: 'x'.repeat(2001) });
    expect(res.status).toBe(400);
  });

  it('rejects a non-string comment (400)', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    const res = await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES, comment: { not: 'a string' } });
    expect(res.status).toBe(400);
  });

  it('rejects negative or non-numeric scores (400)', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    const res = await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: { technical: -1 } });
    expect(res.status).toBe(400);
  });

  it('forbids applicants from reviewing (403)', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: other } = await createApplicant();

    const res = await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(other))
      .send({ scores: SCORES });
    expect(res.status).toBe(403);
  });

  it('rejects a second review of the same app by the same reviewer (409)', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES });
    const res = await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES });
    expect(res.status).toBe(409);
  });

  it('refuses to review a draft application (400)', async () => {
    const { token: applicant } = await createApplicant();
    const save = await api()
      .post('/applications')
      .set(authHeader(applicant))
      .send({ personal: { city: 'Toronto' } });
    const { token: reviewer } = await createReviewer();

    const res = await api()
      .post(`/applications/${save.body.application._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES });
    expect(res.status).toBe(400);
  });
});

describe('PUT /applications/:id/review — update', () => {
  it('updates scores and comment, recomputing the total', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES, comment: 'first pass' });

    const res = await api()
      .put(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: { technical: 5, motivation: 5 }, comment: 'second pass' });

    expect(res.status).toBe(200);
    expect(res.body.review.totalScore).toBe(10);
    expect(res.body.review.comment).toBe('second pass');
  });

  it('preserves an existing comment when the update omits it', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    await api()
      .post(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES, comment: 'keep me' });

    const res = await api()
      .put(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: { technical: 1 } });

    expect(res.status).toBe(200);
    expect(res.body.review.comment).toBe('keep me');
  });

  it('returns 404 when no review exists yet', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    const res = await api()
      .put(`/applications/${app._id}/review`)
      .set(authHeader(reviewer))
      .send({ scores: SCORES });
    expect(res.status).toBe(404);
  });
});

describe('multiple reviewers on one application', () => {
  it('records each review and sorts the admin list by total score desc', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: r1 } = await createReviewer();
    const { token: r2 } = await createReviewer();

    await api().post(`/applications/${app._id}/review`).set(authHeader(r1)).send({ scores: { a: 4, b: 4 } }); // 8
    await api().post(`/applications/${app._id}/review`).set(authHeader(r2)).send({ scores: { a: 9, b: 6 } }); // 15

    const { token: admin } = await createAdmin();
    const all = await api().get(`/applications/${app._id}/reviews`).set(authHeader(admin));
    expect(all.body.reviews).toHaveLength(2);
    expect(all.body.reviews.map((r) => r.totalScore)).toEqual([15, 8]); // desc
  });
});

describe('GET /applications/reviewer — per-reviewer status', () => {
  it('shows "pending" with null score before reviewing, "reviewed" with the score after', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: reviewer } = await createReviewer();

    const before = await api().get('/applications/reviewer').set(authHeader(reviewer));
    const rowBefore = before.body.applications.find((a) => a._id === String(app._id));
    expect(rowBefore.reviewStatus).toBe('pending');
    expect(rowBefore.yourScore).toBeNull();

    await api().post(`/applications/${app._id}/review`).set(authHeader(reviewer)).send({ scores: { a: 7, b: 6 } });

    const after = await api().get('/applications/reviewer').set(authHeader(reviewer));
    const rowAfter = after.body.applications.find((a) => a._id === String(app._id));
    expect(rowAfter.reviewStatus).toBe('reviewed');
    expect(rowAfter.yourScore).toBe(13);
  });

  it('does not expose draft applications to reviewers', async () => {
    const { token: applicant } = await createApplicant();
    await api().post('/applications').set(authHeader(applicant)).send({ personal: { city: 'X' } });
    const { token: reviewer } = await createReviewer();

    const res = await api().get('/applications/reviewer').set(authHeader(reviewer));
    expect(res.body.applications).toHaveLength(0);
  });
});
