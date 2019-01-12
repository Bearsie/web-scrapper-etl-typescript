import { urlencoded, json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { extract, load, opinions, products, search, transform } from './api';
import mongoURI from './config/database';

const app = express();

// Connect to mongoDB
console.log('DATABASE_URL = ', process.env.DATABASE_URL);
mongoose.Promise = global.Promise;
mongoose.connect(mongoURI).then(() => console.log('MongoDB connected'));

// Body parser middleware
app.use(urlencoded({ limit: '50mb', extended: true }));
app.use(json({ limit: '50mb' }));

// Enable cors
app.use(cors());

app.use('/extract', extract);
app.use('/load', load);
app.use('/opinions', opinions);
app.use('/products', products);
app.use('/search', search);
app.use('/transform', transform);

// Handle errors
app.use((_req, res) => {
    const error = new Error('Not found');

    res.status(404);
    res.json({
        error: {
            message: error.message,
        },
    })
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}`));