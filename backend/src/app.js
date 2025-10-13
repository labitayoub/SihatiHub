import express from 'express';
import connectDB from './config/db.js';
import userRoute from './routes/userRoute.js'

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/user', userRoute);

app.get("/",(req,res)=>{
    res.send("<h2>Hello Ayoub</h2>")
})

app.listen(port, () => console.log(`listening on port http://localhost:${port}`))

export default app;