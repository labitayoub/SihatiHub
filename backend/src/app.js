import express from 'express';
import userRoute from './routes/userRoute.js';
import appointmentRoute from './routes/appointmentRoute.js';
import consultationRoute from './routes/consultationRoute.js';
import ordonnanceRoute from './routes/ordonnanceRoute.js';
import analyseRoute from './routes/analyseRoute.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRoute);
app.use('/rendez-vous', appointmentRoute);
app.use('/consultation', consultationRoute);

app.use('/ordonnances', ordonnanceRoute);
app.use('/analyses', analyseRoute);

app.get('/', (req, res) => {
    res.send('<h2>SihatiHub API</h2>');
});

export default app;