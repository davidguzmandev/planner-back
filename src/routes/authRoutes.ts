import { Router, Request, Response } from 'express';
import { query } from '../config/db';

const authRouter = Router();

authRouter.get('/users', async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});