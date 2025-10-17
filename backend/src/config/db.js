import mongoose from "mongoose";


const connectDB = async () => {

    try {
        const conn = await mongoose.connect("mongodb://localhost:27017/sihatihub")
        console.log("Mongo connected!");
    } catch (err) {
        console.error("Failed to connect!", err);
    }

};

export default connectDB;
