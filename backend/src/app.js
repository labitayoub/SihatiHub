import express from 'express';
import userRoute from './routes/userRoute.js';
import appointmentRoute from './routes/appointmentRoute.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRoute);
app.use('/rendez-vous', appointmentRoute);

app.get('/', (req, res) => {
    res.send('<h2>SihatiHub API</h2>');
});

export default app;