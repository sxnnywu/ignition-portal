// tests/helpers/factories.js
//
// Helpers to create users and applications through the real API, returning
// tokens and ids the tests can use. Going through the API (not direct model
// writes) keeps these true end-to-end fixtures.

import { api } from './app.js';

let counter = 0;
// unique-but-stable email per call
export function uniqueEmail(prefix = 'user') {
  counter += 1;
  return `${prefix}${counter}@example.com`;
}

export const STRONG_PASSWORD = 'Password123';

// register an applicant via /signup, returns { token, user }
export async function createApplicant(overrides = {}) {
  const body = {
    name: overrides.name || 'Test Applicant',
    email: overrides.email || uniqueEmail('applicant'),
    password: overrides.password || STRONG_PASSWORD,
  };
  const res = await api().post('/signup').send(body);
  if (res.status !== 201) {
    throw new Error(`createApplicant failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.token, user: res.body.user };
}

// register a reviewer via /signup/reviewer
export async function createReviewer(overrides = {}) {
  const res = await api().post('/signup/reviewer').send({
    name: overrides.name || 'Test Reviewer',
    email: overrides.email || uniqueEmail('reviewer'),
    password: overrides.password || STRONG_PASSWORD,
    secret: process.env.REVIEWER_SIGNUP_SECRET,
  });
  if (res.status !== 201) {
    throw new Error(`createReviewer failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.token, user: res.body.user };
}

// register an admin via /signup/admin
export async function createAdmin(overrides = {}) {
  const res = await api().post('/signup/admin').send({
    name: overrides.name || 'Test Admin',
    email: overrides.email || uniqueEmail('admin'),
    password: overrides.password || STRONG_PASSWORD,
    secret: process.env.ADMIN_SIGNUP_SECRET,
  });
  if (res.status !== 201) {
    throw new Error(`createAdmin failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.token, user: res.body.user };
}

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// a fully-valid application payload (passes submit completeness validation)
export function validApplicationPayload(overrides = {}) {
  return {
    personal: {
      gender: 'female',
      age: 20,
      ethnicity: 'prefer-not-to-say',
      country: 'Canada',
      city: 'Toronto',
      state: 'Ontario',
    },
    education: {
      institution: 'University of Toronto',
      level: 'undergraduate',
      program: 'Computer Science',
      coop: 'yes',
    },
    experience: {
      attended2025: 'no',
      hackathonsAttended: 2,
    },
    responses: {
      admireDescribe: 'Curious and persistent.',
      proudProject: 'A portal for hackathon applications.',
      motivation: 'I want to learn and build with others.',
    },
    ...overrides,
  };
}

// create + fully fill + submit an application for the given applicant token,
// returning the application document. Used to set up review tests.
export async function createSubmittedApplication(token, overrides = {}) {
  const saveRes = await api()
    .post('/applications')
    .set(authHeader(token))
    .send(validApplicationPayload(overrides));
  if (saveRes.status !== 201 && saveRes.status !== 200) {
    throw new Error(`save application failed: ${saveRes.status} ${JSON.stringify(saveRes.body)}`);
  }
  const appId = saveRes.body.application._id;

  const submitRes = await api()
    .post(`/applications/${appId}/submit`)
    .set(authHeader(token));
  if (submitRes.status !== 200) {
    throw new Error(`submit failed: ${submitRes.status} ${JSON.stringify(submitRes.body)}`);
  }
  return submitRes.body.application;
}
