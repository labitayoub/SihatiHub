import express from 'express';
import mongoose from 'mongoose';
const app = express()
const port = 3001;


mongoose
.connect("mongodb://localhost:27017/sihatihub")
.then(()=> console.log("Mongo connected!"))
.catch((err) => console.log("Failed to connect!",err));


app.get("/", (req, res) => {
    res.send("<h2>Hi Ayoub</h2>")
})



app.listen(port,()=> console.log(`listening on port http://localhost:${port}`))