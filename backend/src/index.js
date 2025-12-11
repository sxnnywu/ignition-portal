// backend/src/index.js

// imports
import express from 'express';
import connectDB from './config/db.js';
import testRoutes from './routes/test.js';
import signupRoutes from './routes/signup.js';
import applicationsRoutes from './routes/applications.js';
import dotenv from 'dotenv';

// load environment variables
dotenv.config();

// initialize express app and connect to database
const app = express();
connectDB();

// middleware to parse JSON requests
app.use(express.json());

// mount routes
app.use('/api/test', testRoutes);
app.use('/applications', applicationsRoutes);
app.use('/', signupRoutes);

// start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
