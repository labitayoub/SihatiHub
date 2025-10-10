import express from 'express';
import connectDB from './config/db.js';

const app = express()
const port = 3001;


connectDB();

app.get("/",(req,res)=>{
    res.send("<h2>Hello Ayoub</h2>")
})

app.listen(port, () => console.log(`listening on port http://localhost:${port}`))

export default app;