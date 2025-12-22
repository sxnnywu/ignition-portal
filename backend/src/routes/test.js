// backend/src/routes/test.js

// imports
import express from 'express';

// create router
const router = express.Router();

/**
 * =========================================================
 *  TEAM TEST ROUTE (SANDBOX)
 *  Everyone can add TEMPORARY test endpoints here only.
 *  This file is NOT for production logic.
 * =========================================================
 */

/* ---------------------------------------
   SUNNY — add tests here
--------------------------------------- */
router.get('/sunny-test-user', async (req, res) => {
  try {
    // import User model
    const User = (await import('../models/User.js')).default;

    // create a test user
    const doc = await User.create({
      name: 'Test User',
      email: 'sunny_test@example.com',
      role: 'admin',
    });

    // respond with success message
    return res.json({
      message: 'Successfully wrote to database.',
      inserted: doc,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------
   ANISH — add tests here
--------------------------------------- */

// test login route
// http://localhost:8000/api/test/anish-test-login
router.post('/anish-test-login', async (req, res) => {
  try {
    // import User model
    const User = (await import('../models/User.js')).default;
    const bcrypt = (await import('bcryptjs')).default;

    // create a test user with hashed password
    const password = 'Test1234';
    const hashedPassword = await bcrypt.hash(password, 10);

    // clear previous test user if exists
    await User.deleteOne({ email: 'anish_test@example.com' });

    const user = await User.create({
      name: 'Anish Test User',
      email: 'anish_test@example.com',
      password: hashedPassword,
      role: 'applicant',
    });

    // respond with success message and test credentials
    return res.json({
      message: 'Test user created. Use these credentials to test login:',
      testUser: {
        email: 'anish_test@example.com',
        password: 'Test1234',
      },
      createdUser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      instructions: 'POST to /login with { "email": "anish_test@example.com", "password": "Test1234" }',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// test get all applications
// http://localhost:8000/api/test/anish-test-get-all-applications
router.get('/anish-test-get-all-applications', async (req, res) => {
  try {
    // import models
    const Application = (await import('../models/Application.js')).default;
    const User = (await import('../models/User.js')).default;

    // create test user if doesn't exist
    let user = await User.findOne({ email: 'anish_app_test@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Anish App Test User',
        email: 'anish_app_test@example.com',
        role: 'applicant',
      });
    }

    // create test applications
    await Application.deleteMany({ userId: user._id });

    const app1 = await Application.create({
      userId: user._id,
      status: 'draft',
      version: 1,
      answers: { question1: 'Answer 1' },
    });

    const app2 = await Application.create({
      userId: user._id,
      status: 'submitted',
      version: 1,
      answers: { question1: 'Answer 1' },
    });

    // respond with success message
    return res.json({
      message: 'Test applications created.',
      testData: {
        userId: user._id,
        applications: [app1, app2],
      },
      instructions: 'GET /applications to fetch all applications',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// test get application by id
// http://localhost:8000/api/test/anish-test-get-application-by-id
router.get('/anish-test-get-application-by-id', async (req, res) => {
  try {
    // import models
    const Application = (await import('../models/Application.js')).default;
    const User = (await import('../models/User.js')).default;

    // create test user if doesn't exist
    let user = await User.findOne({ email: 'anish_id_test@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Anish ID Test User',
        email: 'anish_id_test@example.com',
        role: 'applicant',
      });
    }

    // create test application
    const app = await Application.create({
      userId: user._id,
      status: 'under_review',
      version: 2,
      answers: { question1: 'Test Answer' },
    });

    // respond with success message and application id
    return res.json({
      message: 'Test application created.',
      testApplication: app,
      instructions: `GET /applications/${app._id} to fetch this application by id`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// test create application
// http://localhost:8000/api/test/anish-test-create-application
router.post('/anish-test-create-application', async (req, res) => {
  try {
    // import models
    const Application = (await import('../models/Application.js')).default;
    const User = (await import('../models/User.js')).default;

    // create test user if doesn't exist
    let user = await User.findOne({ email: 'anish_create_test@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Anish Create Test User',
        email: 'anish_create_test@example.com',
        role: 'applicant',
      });
    }

    // create application via test
    const app = await Application.create({
      userId: user._id,
      status: 'draft',
      version: 1,
      answers: {
        name: 'Anish Test',
        background: 'Testing application creation',
      },
    });

    // respond with success message
    return res.json({
      message: 'Test application created successfully.',
      testApplication: app,
      instructions: 'Use POST /applications with userId to create applications',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// test update application
// http://localhost:8000/api/test/anish-test-update-application
router.post('/anish-test-update-application', async (req, res) => {
  try {
    // import models
    const Application = (await import('../models/Application.js')).default;
    const User = (await import('../models/User.js')).default;

    // create test user if doesn't exist
    let user = await User.findOne({ email: 'anish_update_test@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Anish Update Test User',
        email: 'anish_update_test@example.com',
        role: 'applicant',
      });
    }

    // create initial application
    let app = await Application.findOne({ userId: user._id });
    if (!app) {
      app = await Application.create({
        userId: user._id,
        status: 'draft',
        version: 1,
        answers: { question1: 'Initial answer' },
      });
    }

    // update application
    app.version += 1;
    app.answers = {
      question1: 'Updated answer',
      question2: 'New question answer',
    };
    app.status = 'submitted';
    app.submittedAt = new Date();

    await app.save();

    // respond with success message
    return res.json({
      message: 'Test application updated successfully.',
      updatedApplication: app,
      instructions: 'Use POST /applications with userId and answers to update applications',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// test get user applications
// http://localhost:8000/api/test/anish-test-get-user-applications
router.get('/anish-test-get-user-applications', async (req, res) => {
  try {
    // import models
    const Application = (await import('../models/Application.js')).default;
    const User = (await import('../models/User.js')).default;

    // create test user if doesn't exist
    let user = await User.findOne({ email: 'anish_me_test@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Anish Me Test User',
        email: 'anish_me_test@example.com',
        role: 'applicant',
      });
    }

    // create multiple test applications for the user
    await Application.deleteMany({ userId: user._id });

    const app1 = await Application.create({
      userId: user._id,
      status: 'draft',
      version: 1,
      answers: { question1: 'Draft answer' },
    });

    const app2 = await Application.create({
      userId: user._id,
      status: 'submitted',
      version: 2,
      answers: { question1: 'Submitted answer' },
    });

    // respond with success message
    return res.json({
      message: 'Test applications created for user.',
      userId: user._id,
      applications: [app1, app2],
      instructions: `GET /applications/me?userId=${user._id} to fetch user applications`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// test signup route
// http://localhost:8000/api/test/anish-test-signup
router.post('/anish-test-signup', async (req, res) => {
  try {
    // import models
    const User = (await import('../models/User.js')).default;

    // create a test signup request
    const testEmail = `anish_signup_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123';

    // respond with instructions on how to signup
    return res.json({
      message: 'Signup endpoint test instructions',
      testCredentials: {
        name: 'Anish Signup Test',
        email: testEmail,
        password: testPassword,
      },
      instructions: 'POST /signup with { "name": "...", "email": "...", "password": "..." } - Password must be at least 8 chars, include uppercase, lowercase, and numbers',
      requirements: {
        passwordMinLength: 8,
        requiresUppercase: true,
        requiresLowercase: true,
        requiresNumbers: true,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------
   ARYAN — add tests here
--------------------------------------- */

/* ---------------------------------------
   YOUSSEF — add tests here
--------------------------------------- */

// test question model
// http://localhost:8000/api/test/youssef-test-question
router.get('/youssef-test-question', async (req, res) => {
  try {
    // import Question model
    const Question = (await import('../models/Question.js')).default;

    // clear questions collection
    await Question.deleteMany({});

    // create a test question
    const doc1 = await Question.create({
      key: 'test_question_one',
      label: 'Test question 1',
      type: 'text',
      order: 1,
    });

    const doc2 = await Question.create({
      key: 'test_question_two',
      label: 'Test question 2',
      type: 'multichoice',
      required: false,
      order: 2,
    });

    const doc3 = await Question.create({
      key: 'test_question_three',
      label: 'Test question 3',
      type: 'file',
      required: true,
      order: 13,
    });

    // respond with success message
    return res.json({
      message: 'Successfully wrote to database.',
      inserted: { doc1, doc2, doc3 },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// test file model
// need to wait for Application model to be implemented
// http://localhost:8000/api/test/youssef-test-file
router.get('/youssef-test-file', async (req, res) => {
  try {
    // import models
    const File = (await import('../models/File.js')).default;
    const Application = (await import('../models/Application.js')).default;
    const User = (await import('../models/User.js')).default;

    // clear files collection
    await File.deleteMany({});

    // fetch random application and user for testing
    const app = await Application.findOne({});
    const user = await User.findOne({});

    // create a test file
    const doc = await File.create({
      applicationId: app._id,
      fileName: 'test-file',
      storagePath: 'C://youssef/testing/',
      uploadedBy: user._id,
    });

    // respond with success message
    return res.json({
      message: 'Successfully wrote to database.',
      inserted: doc,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// test application model
// http://localhost:8000/api/test/youssef-test-application
router.get('/youssef-test-application', async (req, res) => {
  try {
    // import models
    const Application = (await import('../models/Application.js')).default;
    const User = (await import('../models/User.js')).default;

    // clear applications collection
    await Application.deleteMany({});

    // fetch a random user for testing
    const user = await User.findOne({});
    if (!user) {
      return res.status(400).json({
        message: 'No users found in database to attach applications to.',
      });
    }

    // create test application
    const doc = await Application.create({
      userId: user._id,
      status: 'under_review',
      version: 3,
      answers: {
        test_question_one: 'Review answer 1',
        test_question_two: 'Review answer 2',
        test_question_three: 'Review answer 3',
      },
    });

    // respond with success message
    return res.json({
      message: 'Successfully wrote applications to database.',
      inserted: doc,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
