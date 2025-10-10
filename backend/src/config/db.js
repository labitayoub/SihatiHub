import mongoose from "mongoose";


const connectDB = async () => {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/sihatihub";

    try {
        await mongoose.connect(uri);
        console.log("Mongo connected!");
    } catch (err) {
        console.error("Failed to connect!", err);
        throw err;
    }

};

export default connectDB;
