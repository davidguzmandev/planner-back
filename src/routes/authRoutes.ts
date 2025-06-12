import { Router, Request, Response } from 'express';
import { query } from '../config/db';

const authRouter = Router();

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

// --- Ruta para obtener el perfil del usuario autenticado ---
authRouter.get('/users', async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT id, name, email, role FROM users ORDER BY name ASC');
        res.status(200).json(result.rows);
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
        const result = await query('SELECT id, name, email, role FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: `User not found with the email ${email}` });
        }

        const user = result.rows[0] // Aqui guardamos al primer usuario encontrado

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