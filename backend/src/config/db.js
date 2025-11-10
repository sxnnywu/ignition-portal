// imports
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// load environment variables
dotenv.config();

// function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// export the connectDB function
module.exports = connectDB;