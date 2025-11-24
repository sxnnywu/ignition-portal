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


export default router;
