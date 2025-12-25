// backend/src/routes/applications.js

// imports
import express from 'express';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

// create router
const router = express.Router();

// GET /applications - get all applications
router.get('/', async (req, res) => {
  try {
    // fetch all applications
    const applications = await Application.find().populate('userId', 'name email role');

    // respond with applications
    res.status(200).json({
      message: 'All applications fetched',
      applications: applications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /applications/:id - get application by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // validate id format
    if (!id)
      return res.status(400).json({ message: 'Application ID is required' });

    // find application by id
    const application = await Application.findById(id).populate('userId', 'name email role');

    // application not found
    if (!application)
      return res.status(404).json({ message: 'Application not found' });

    // respond with application
    res.status(200).json({
      message: 'Application fetched',
      application: application,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /applications/me?userId=...
// get application of current user
router.get('/me', async (req, res) => {
  try {
    const { userId } = req.query;

    // basic validation
    if (!userId) {
      return res
        .status(400)
        .json({ message: 'userId is required until auth middleware is added' });
    }

    // query by userId
    const apps = await Application.find({ userId: userId });

    // application not found for user
    if (!apps || apps.length === 0) {
      return res.status(404).json({
        message: 'No applications found for this user',
      });
    }
    // respond with applications
    res.status(200).json({
      message: 'User applications fetched',
      applications: apps,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /applications
// start/update application
router.post('/', async (req, res) => {
  try {
    const { userId, answers, status } = req.body;

    // basic validation
    if (!userId) {
      res.status(400).json({ message: 'userId is required' });
    }

    let user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'user does not exist' });
    }

    // find existing application for this user
    let app = await Application.findOne({ userId: user._id });

    // create application
    if (!app) {
      app = await Application.create({
        userId,
        status: status || 'draft',
        version: 1.0,
        answers: answers || {},
        submittedAt: status === 'submitted' ? new Date() : null,
      });

      // application created
      return res.status(201).json({
        message: 'Application started',
        application: app,
      });
    }

    // update application if already exists
    app.version += 1;

    if (answers) {
      app.answers = answers;
    }

    if (status) {
      app.status = status;
      if (status === 'submitted') {
        app.submittedAt = new Date();
      }
    }

    await app.save();

    return res.status(200).json({
      message: 'Application updated',
      application: app,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /applications/:id/review
// add a review to an application (reviewers and admins)
router.post('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerId, scores } = req.body;

    // no reviewer id
    if (!reviewerId) {
      return res.status(400).json({ message: 'reviewerId is required' });
    }
    // no score or invalid data type
    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({ message: 'scores object is required' });
    }

    // validate application id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }

    // fetch application
    const application = await Application.findById(id);

    // no application
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // only allow reviews for submitted apps
    if (application.status !== 'submitted' && application.status !== 'under_review') {
      return res.status(400).json({
        message: 'Application must be submitted to be reviewed',
      });
    }

    // fetch reviewer
    const reviewer = await User.findById(reviewerId);

    // if no reviewer
    if (!reviewer) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }
    // if user isn't a reviewer or admin
    if (reviewer.role !== 'reviewer' && reviewer.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to review applications' });
    }

    // check if reviewer has already reviewed this application
    const existingReview = await Review.findOne({
      applicationId: application._id,
      reviewerId: reviewer._id,
    });

    // if review already exists
    if (existingReview) {
      return res.status(409).json({
        message: 'Reviewer has already reviewed this application',
      });
    }

    // total score
    let totalScore = 0;

    // compute total score
    for (const [questionKey, value] of Object.entries(scores)) {

      // if value is negative or not a number
      if (typeof value !== 'number' || value < 0) {
        return res.status(400).json({
          message: `Invalid score for question "${questionKey}"`,
        });
      }
      // otherwise add it to total score
      totalScore += value;
    }

    // create new review object
    const review = await Review.create({
      applicationId: application._id,
      reviewerId: reviewer._id,
      scores,
      totalScore,
    });

    // move application into under_review if it isn't already
    if (application.status === 'submitted') {
      application.status = 'under_review';
      await application.save();
    }

    // return success response
    return res.status(201).json({
      message: 'Review submitted',
      review,
    });
  }
  // error handling
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /applications/:id/review
// update a review (reviewers and admins)
router.put('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerId, scores } = req.body;

    // no reviewer id
    if (!reviewerId) {
      return res.status(400).json({ message: 'reviewerId is required' });
    }

    // no score or invalid data type
    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({ message: 'scores object is required' });
    }

    // fetch application
    const application = await Application.findById(id);

    // no application
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // fetch reviewer
    const reviewer = await User.findById(reviewerId);

    // if no reviewer
    if (!reviewer) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    // if user isn't a reviewer or admin
    if (reviewer.role !== 'reviewer' && reviewer.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to review applications' });
    }

    // find existing review
    const review = await Review.findOne({
      applicationId: application._id,
      reviewerId: reviewer._id,
    });

    // if no existing review
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // recompute total score
    let totalScore = 0;

    for (const [questionKey, value] of Object.entries(scores)) {
      // if value is negative or not a number
      if (typeof value !== 'number' || value < 0) {
        return res.status(400).json({
          message: `Invalid score for question "${questionKey}"`,
        });
      }
      // otherwise add it to total score
      totalScore += value;
    }

    // update review fields
    review.scores = scores;
    review.totalScore = totalScore;

    // save updated review
    await review.save();

    // return success response
    return res.status(200).json({
      message: 'Review updated',
      review,
    });
  }
  // error handling
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /applications/:id/review/me
// get current user's review for an application (reviewer and admins)
router.get('/:id/review/me', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerId } = req.query;

    // no reviewer id
    if (!reviewerId) {
      return res.status(400).json({ message: 'reviewerId is required' });
    }

    // fetch application
    const application = await Application.findById(id);

    // no application
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // fetch reviewer
    const reviewer = await User.findById(reviewerId);

    // if no reviewer
    if (!reviewer) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    // if user isn't a reviewer or admin
    if (reviewer.role !== 'reviewer' && reviewer.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view reviews' });
    }

    // fetch review
    const review = await Review.findOne({
      applicationId: application._id,
      reviewerId: reviewer._id,
    });

    // if no existing review
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // return success response
    return res.status(200).json({
      message: 'Review found',
      review,
    });
  }
  // error handling
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /applications/:id/reviews
// get all reviews for an application (admin-only)
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;
    
    // no admin id
    if (!adminId) {
      return res.status(400).json({ message: 'adminId is required' });
    }

    // fetch admin user
    const admin = await User.findById(adminId);
    
    // if no admin user
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // if user isn't an admin
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view all reviews' });
    }

    // fetch application
    const application = await Application.findById(id);

    // no application
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // fetch all reviews for the application
    const reviews = await Review.find({ applicationId: application._id })
      .populate('reviewerId', 'name email role')
      .sort({ totalScore: -1 });

    // no reviews found
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this application' });
    }

    // return success response
    return res.status(200).json({
      message: 'Reviews fetched',
      reviews,
    });
  }
  // error handling
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
