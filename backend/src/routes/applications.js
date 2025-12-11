// backend/src/routes/applications.js

// imports
import express from 'express';
import Application from '../models/Application.js';
import User from '../models/User.js';

// create router
const router = express.Router();

// GET /applications/me?userId=...
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

export default router;
