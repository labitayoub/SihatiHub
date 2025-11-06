import mongoose from "mongoose";


const connectDB = async () => {
    // Use MONGO_URI from environment if available, otherwise fall back to MONGODB_SERVER and MONGODB_PORT
    const uri = process.env.MONGO_URI || 
                `mongodb://${process.env.MONGODB_SERVER || 'localhost'}:${process.env.MONGODB_PORT || '27018'}/careflowDocker`;

    try {
        await mongoose.connect(uri);
        console.log("Mongo connected to:", uri);
    } catch (err) {
        console.error("Failed to connect!", err);
        throw err;
    }

};

export default connectDB;
