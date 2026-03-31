const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URL;
const connectdb=async () => {
    if (!mongoURI) {
        throw new Error("MONGO_URL is not defined in environment variables.");
    }

    try { 
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log("MongoDB connected");
        
    } catch (error) {
           console.error(`Db error: ${error.message}`);
           throw error;
    }
    
}
module.exports=connectdb;
