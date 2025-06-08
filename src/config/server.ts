import express, {Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { Server } from 'http';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`);
    console.log(`This backend is now ready on http://localhost:${PORT}`);
});