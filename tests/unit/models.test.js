// tests/unit/models.test.js
//
// Schema-level unit tests. Unlike the integration suites, these exercise the
// Mongoose models directly — validators (`validateSync`, no DB round-trip) and
// the password-hash pre-save hook — to prove the data layer enforces its own
// invariants regardless of what the routes do.

import { describe, it, expect } from 'vitest';
import { mongoose } from '../../backend/src/config/db.js';
import User from '../../backend/src/models/User.js';
import Application from '../../backend/src/models/Application.js';
import Review from '../../backend/src/models/Review.js';

const oid = () => new mongoose.Types.ObjectId();

describe('User model', () => {
  it('requires name, email, and password', () => {
    const err = new User({}).validateSync();
    expect(err.errors.name).toBeTruthy();
    expect(err.errors.email).toBeTruthy();
    expect(err.errors.password).toBeTruthy();
  });

  it('rejects an invalid role', () => {
    const err = new User({
      name: 'A', email: 'a@b.com', password: 'x', role: 'superuser',
    }).validateSync();
    expect(err.errors.role).toBeTruthy();
  });

  it('hashes the password on save and never stores plaintext', async () => {
    const user = await User.create({
      name: 'Hash Me', email: 'hash@example.com', password: 'Password123',
    });
    expect(user.password).not.toBe('Password123');
    expect(user.password.startsWith('$2')).toBe(true); // bcrypt hash prefix
  });

  it('does NOT re-hash the password when an unrelated field changes', async () => {
    const user = await User.create({
      name: 'Stable Hash', email: 'stable@example.com', password: 'Password123',
    });
    const originalHash = user.password;
    user.name = 'Renamed';
    await user.save();
    expect(user.password).toBe(originalHash);
  });
});

describe('Application model', () => {
  const validTeammate = () => ({ userId: oid(), name: 'Mate', email: 'mate@example.com' });

  it('rejects more than 3 teammates', () => {
    const err = new Application({
      userId: oid(),
      teammates: [validTeammate(), validTeammate(), validTeammate(), validTeammate()],
    }).validateSync();
    expect(err.errors.teammates).toBeTruthy();
    expect(err.errors.teammates.message).toMatch(/at most 3/i);
  });

  it('allows exactly 3 teammates', () => {
    const err = new Application({
      userId: oid(),
      teammates: [validTeammate(), validTeammate(), validTeammate()],
    }).validateSync();
    expect(err?.errors?.teammates).toBeFalsy();
  });

  it('enforces response character limits', () => {
    const err = new Application({
      userId: oid(),
      responses: { admireDescribe: 'x'.repeat(101) },
    }).validateSync();
    expect(err.errors['responses.admireDescribe']).toBeTruthy();
  });

  it('rejects an invalid status enum', () => {
    const err = new Application({ userId: oid(), status: 'frozen' }).validateSync();
    expect(err.errors.status).toBeTruthy();
  });

  it('rejects an invalid education level enum', () => {
    const err = new Application({
      userId: oid(),
      education: { level: 'phd' },
    }).validateSync();
    expect(err.errors['education.level']).toBeTruthy();
  });

  it('enforces the hackathonsAttended 0..5 range', () => {
    expect(new Application({ userId: oid(), experience: { hackathonsAttended: 6 } })
      .validateSync().errors['experience.hackathonsAttended']).toBeTruthy();
    expect(new Application({ userId: oid(), experience: { hackathonsAttended: -1 } })
      .validateSync().errors['experience.hackathonsAttended']).toBeTruthy();
    expect(new Application({ userId: oid(), experience: { hackathonsAttended: 0 } })
      .validateSync()?.errors?.['experience.hackathonsAttended']).toBeFalsy();
  });

  it('requires a userId', () => {
    expect(new Application({}).validateSync().errors.userId).toBeTruthy();
  });
});

describe('Review model', () => {
  it('requires applicationId, reviewerId, scores, and totalScore', () => {
    const err = new Review({}).validateSync();
    expect(err.errors.applicationId).toBeTruthy();
    expect(err.errors.reviewerId).toBeTruthy();
    expect(err.errors.scores).toBeTruthy();
    expect(err.errors.totalScore).toBeTruthy();
  });

  it('rejects a comment longer than 2000 characters', () => {
    const err = new Review({
      applicationId: oid(),
      reviewerId: oid(),
      scores: { a: 1 },
      totalScore: 1,
      comment: 'x'.repeat(2001),
    }).validateSync();
    expect(err.errors.comment).toBeTruthy();
  });

  it('accepts a valid review with an empty default comment', () => {
    const review = new Review({
      applicationId: oid(), reviewerId: oid(), scores: { a: 1 }, totalScore: 1,
    });
    expect(review.validateSync()).toBeUndefined();
    expect(review.comment).toBe('');
  });

  it('updates updatedAt on save (pre-save hook)', async () => {
    const review = await Review.create({
      applicationId: oid(), reviewerId: oid(), scores: { a: 1 }, totalScore: 1,
    });
    const first = review.updatedAt.getTime();
    review.totalScore = 2;
    await review.save();
    expect(review.updatedAt.getTime()).toBeGreaterThanOrEqual(first);
  });
});
