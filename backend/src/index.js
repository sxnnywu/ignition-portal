// imports 
const express = require('express');
const connectDB = require('./config/db');

// initialize express app and connect to database
const app = express();
connectDB();

// middleware to parse JSON requests
app.use(express.json());

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));