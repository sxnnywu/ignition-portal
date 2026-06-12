// backend/src/index.js

// imports
import connectDB from './config/db.js';
import { createApp } from './app.js';
import dotenv from 'dotenv';

// load environment variables
dotenv.config();

// connect to the database, then build and start the server
await connectDB();

const app = createApp();

// start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
