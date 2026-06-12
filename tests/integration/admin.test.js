// tests/integration/admin.test.js
import { describe, it, expect } from 'vitest';
import { api } from '../helpers/app.js';
import {
  createApplicant,
  createReviewer,
  createAdmin,
  authHeader,
  createSubmittedApplication,
} from '../helpers/factories.js';

describe('admin route protection', () => {
  it('forbids applicants from listing all applications (403)', async () => {
    const { token } = await createApplicant();
    const res = await api().get('/applications').set(authHeader(token));
    expect(res.status).toBe(403);
  });

  it('forbids reviewers from admin endpoints (403)', async () => {
    const { token } = await createReviewer();
    const res = await api().get('/api/admin/stats').set(authHeader(token));
    expect(res.status).toBe(403);
  });

  it('allows admins to list all applications (200)', async () => {
    const { token } = await createAdmin();
    const res = await api().get('/applications').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.applications)).toBe(true);
  });
});

describe('GET /api/admin/stats', () => {
  it('reports status counts and reviewer coverage', async () => {
    const { token: applicant } = await createApplicant();
    await createSubmittedApplication(applicant);
    const { token: admin } = await createAdmin();

    const res = await api().get('/api/admin/stats').set(authHeader(admin));
    expect(res.status).toBe(200);
    expect(res.body.statusCounts.submitted).toBe(1);
    expect(res.body.totalApplications).toBe(1);
    expect(res.body.reviewerCoverage.none).toBe(1);
  });
});

describe('GET /api/admin/applications', () => {
  it('paginates and excludes drafts', async () => {
    // one submitted, one draft
    const { token: a } = await createApplicant();
    await createSubmittedApplication(a);
    const { token: b } = await createApplicant();
    await api().post('/applications').set(authHeader(b)).send({ personal: { city: 'X' } });

    const { token: admin } = await createAdmin();
    const res = await api().get('/api/admin/applications').set(authHeader(admin));
    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('GET /api/admin/export-csv', () => {
  it('returns a CSV attachment with a header row', async () => {
    const { token: applicant } = await createApplicant();
    await createSubmittedApplication(applicant);
    const { token: admin } = await createAdmin();

    const res = await api().get('/api/admin/export-csv').set(authHeader(admin));
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text.split('\n')[0]).toContain('Name,Email');
  });
});

describe('admin user management', () => {
  it('lists users with pagination', async () => {
    const { token: admin } = await createAdmin();
    await createApplicant();
    const res = await api().get('/api/admin/users').set(authHeader(admin));
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
  });

  it('creates a user', async () => {
    const { token: admin } = await createAdmin();
    const res = await api()
      .post('/api/admin/users')
      .set(authHeader(admin))
      .send({ name: 'New Person', email: 'new.person@example.com', role: 'reviewer', password: 'Password123' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('reviewer');
  });

  it('changes a user role but not your own', async () => {
    const { token: admin, user: adminUser } = await createAdmin();
    const { user: applicant } = await createApplicant();

    const ok = await api()
      .put(`/api/admin/users/${applicant._id}/role`)
      .set(authHeader(admin))
      .send({ role: 'reviewer' });
    expect(ok.status).toBe(200);
    expect(ok.body.user.role).toBe('reviewer');

    const self = await api()
      .put(`/api/admin/users/${adminUser._id}/role`)
      .set(authHeader(admin))
      .send({ role: 'applicant' });
    expect(self.status).toBe(400);
  });

  it('deletes a user and cascades their application + reviews', async () => {
    const { token: applicant, user: applicantUser } = await createApplicant();
    await createSubmittedApplication(applicant);
    const { token: admin } = await createAdmin();

    const del = await api()
      .delete(`/api/admin/users/${applicantUser._id}`)
      .set(authHeader(admin));
    expect(del.status).toBe(200);

    // applications list no longer includes the deleted user's app
    const list = await api().get('/applications').set(authHeader(admin));
    expect(list.body.applications).toHaveLength(0);
  });
});

describe('POST /applications/:id/status', () => {
  it('lets an admin accept an application', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: admin } = await createAdmin();

    const res = await api()
      .post(`/applications/${app._id}/status`)
      .set(authHeader(admin))
      .send({ status: 'accepted' });
    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('accepted');
  });

  it('rejects an invalid status value (400)', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: admin } = await createAdmin();

    const res = await api()
      .post(`/applications/${app._id}/status`)
      .set(authHeader(admin))
      .send({ status: 'banana' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/admin/applications — aggregation, filtering, paging', () => {
  it('computes avgScore (rounded) and reviewCount from reviews', async () => {
    const { token: applicant } = await createApplicant();
    const app = await createSubmittedApplication(applicant);
    const { token: r1 } = await createReviewer();
    const { token: r2 } = await createReviewer();
    await api().post(`/applications/${app._id}/review`).set(authHeader(r1)).send({ scores: { a: 8 } });
    await api().post(`/applications/${app._id}/review`).set(authHeader(r2)).send({ scores: { a: 10 } });

    const { token: admin } = await createAdmin();
    const res = await api().get('/api/admin/applications').set(authHeader(admin));
    const row = res.body.applications[0];
    expect(row.reviewCount).toBe(2);
    expect(row.avgScore).toBe(9); // round(avg(8,10))
  });

  it('filters by status', async () => {
    const { token: a } = await createApplicant();
    const accepted = await createSubmittedApplication(a);
    const { token: b } = await createApplicant();
    await createSubmittedApplication(b);
    const { token: admin } = await createAdmin();
    await api().post(`/applications/${accepted._id}/status`).set(authHeader(admin)).send({ status: 'accepted' });

    const res = await api().get('/api/admin/applications?status=accepted').set(authHeader(admin));
    expect(res.body.applications).toHaveLength(1);
    expect(res.body.applications[0].status).toBe('accepted');
  });

  it('searches by applicant name', async () => {
    const { token } = await createApplicant({ name: 'Zelindra Quoxal' });
    await createSubmittedApplication(token);
    const { token: admin } = await createAdmin();

    const hit = await api().get('/api/admin/applications?search=Zelindra').set(authHeader(admin));
    expect(hit.body.applications).toHaveLength(1);
    const miss = await api().get('/api/admin/applications?search=Nobodyhere').set(authHeader(admin));
    expect(miss.body.applications).toHaveLength(0);
  });

  it('paginates', async () => {
    for (let i = 0; i < 3; i += 1) {
      const { token } = await createApplicant();
      await createSubmittedApplication(token);
    }
    const { token: admin } = await createAdmin();
    const page1 = await api().get('/api/admin/applications?limit=2&page=1').set(authHeader(admin));
    expect(page1.body.applications).toHaveLength(2);
    expect(page1.body.pagination.total).toBe(3);
    expect(page1.body.pagination.totalPages).toBe(2);

    const page2 = await api().get('/api/admin/applications?limit=2&page=2').set(authHeader(admin));
    expect(page2.body.applications).toHaveLength(1);
  });
});

describe('GET /api/admin/stats — reviewer coverage buckets', () => {
  it('buckets applications into full / partial / none by review count', async () => {
    // app with 2 reviews -> full
    const { token: aFull } = await createApplicant();
    const full = await createSubmittedApplication(aFull);
    const { token: r1 } = await createReviewer();
    const { token: r2 } = await createReviewer();
    await api().post(`/applications/${full._id}/review`).set(authHeader(r1)).send({ scores: { a: 1 } });
    await api().post(`/applications/${full._id}/review`).set(authHeader(r2)).send({ scores: { a: 1 } });

    // app with 1 review -> partial
    const { token: aPartial } = await createApplicant();
    const partial = await createSubmittedApplication(aPartial);
    await api().post(`/applications/${partial._id}/review`).set(authHeader(r1)).send({ scores: { a: 1 } });

    // app with 0 reviews -> none
    const { token: aNone } = await createApplicant();
    await createSubmittedApplication(aNone);

    const { token: admin } = await createAdmin();
    const res = await api().get('/api/admin/stats').set(authHeader(admin));
    expect(res.body.reviewerCoverage).toEqual({ full: 1, partial: 1, none: 1 });
    expect(res.body.totalApplications).toBe(3);
  });
});

describe('GET /api/admin/export-csv — quoting', () => {
  it('wraps values containing commas in quotes', async () => {
    const { token } = await createApplicant();
    await createSubmittedApplication(token, {
      education: { institution: 'Toronto, ON Tech', level: 'high-school', program: '', coop: 'no' },
    });
    const { token: admin } = await createAdmin();

    const res = await api().get('/api/admin/export-csv').set(authHeader(admin));
    expect(res.text).toContain('"Toronto, ON Tech"');
  });
});

describe('admin user management — edges', () => {
  it('rejects creating a user with a duplicate email (409)', async () => {
    const { user } = await createApplicant({ email: 'dupe.admin@example.com' });
    const { token: admin } = await createAdmin();
    const res = await api()
      .post('/api/admin/users')
      .set(authHeader(admin))
      .send({ name: 'Clone', email: user.email, role: 'reviewer', password: 'Password123' });
    expect(res.status).toBe(409);
  });

  it('rejects creating a user with an invalid role (400)', async () => {
    const { token: admin } = await createAdmin();
    const res = await api()
      .post('/api/admin/users')
      .set(authHeader(admin))
      .send({ name: 'Bad Role', email: 'badrole@example.com', role: 'wizard', password: 'Password123' });
    expect(res.status).toBe(400);
  });

  it('rejects creating a user with missing fields (400)', async () => {
    const { token: admin } = await createAdmin();
    const res = await api().post('/api/admin/users').set(authHeader(admin)).send({ name: 'Partial' });
    expect(res.status).toBe(400);
  });

  it('filters the user list by role', async () => {
    await createReviewer();
    await createApplicant();
    const { token: admin } = await createAdmin();

    const res = await api().get('/api/admin/users?role=reviewer').set(authHeader(admin));
    expect(res.body.users.length).toBeGreaterThanOrEqual(1);
    expect(res.body.users.every((u) => u.role === 'reviewer')).toBe(true);
  });

  it('rejects deleting your own account (400)', async () => {
    const { token: admin, user: adminUser } = await createAdmin();
    const res = await api().delete(`/api/admin/users/${adminUser._id}`).set(authHeader(admin));
    expect(res.status).toBe(400);
  });
});
