import { Router, Request, Response } from 'express';
import { UserModel, User } from '../models/Users';

const authRouter = Router();

// --- Ruta para obtener el perfil del usuario autenticado ---
authRouter.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await UserModel.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body; // El front envia un cuerpo y en el extraemos el role

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await UserModel.findUserByEmail(email);

        if (!user) {
            res.status(404).json({ message: `User not found with the email ${email}` });
            return;
        }

        const redirectUrl = '/dashboard';

        res.status(200).json({
            message: 'Login successful',
            user: {
                id:user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            redirectUrl: redirectUrl
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error processing login request' });
    }
});

export default authRouter