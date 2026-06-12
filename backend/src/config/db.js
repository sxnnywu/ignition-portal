// imports
import mongoose from "mongoose";
import dotenv from "dotenv";

// load environment variables
dotenv.config();

// function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

// export the connectDB function
export default connectDB;

// re-export the shared mongoose instance so other entry points (e.g. the test
// suite) connect and register models on the exact same instance the app uses
export { mongoose };
