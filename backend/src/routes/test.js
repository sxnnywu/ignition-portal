// backend/src/routes/test.js

// imports
import express from "express";

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
router.get("/sunny-test-user", async (req, res) => {
    try {
        // import User model
        const User = (await import("../models/User.js")).default;

        // create a test user
        const doc = await User.create({
            name: "Test User",
            email: "sunny_test@example.com",
            role: "admin",
        });

        // respond with success message
        return res.json({
            message: "Successfully wrote to database.",
            inserted: doc,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/* ---------------------------------------
   ANISH — add tests here
--------------------------------------- */

/* ---------------------------------------
   ARYAN — add tests here
--------------------------------------- */

/* ---------------------------------------
   YOUSSEF — add tests here
--------------------------------------- */

// test question model
// http://localhost:8000/api/test/youssef-test-question
router.get("/youssef-test-question", async (req, res) => {
    try {
        // import Question model
        const Question = (await import("../models/Question.js")).default;

        // clear questions collection
        await Question.deleteMany({});

        // create a test question
        const doc1 = await Question.create({
            key: "test_question_one",
            label: "Test question 1",
            type: "text",
            order: 1,
        });

        const doc2 = await Question.create({
            key: "test_question_two",
            label: "Test question 2",
            type: "multichoice",
            required: false,
            order: 2,
        });

        const doc3 = await Question.create({
            key: "test_question_three",
            label: "Test question 3",
            type: "file",
            required: true,
            order: 13,
        });

        // respond with success message
        return res.json({
            message: "Successfully wrote to database.",
            inserted: { doc1, doc2, doc3 },
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// test file model
// need to wait for Application model to be implemented
// http://localhost:8000/api/test/youssef-test-file
router.get("/youssef-test-file", async (req, res) => {
    try {
        // import models
        const File = (await import("../models/File.js")).default;
        const Application = (await import("../models/Application.js")).default;
        const User = (await import("../models/User.js")).default;

        // clear files collection
        await File.deleteMany({});

        // fetch random application and user for testing
        const app = await Application.findOne({});
        const user = await User.findOne({});

        // create a test file
        const doc = await File.create({
            applicationId: app._id,
            fileName: "test-file",
            storagePath: "C://youssef/testing/",
            uploadedBy: user._id,
        });

        // respond with success message
        return res.json({
            message: "Successfully wrote to database.",
            inserted: doc,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
