import { query } from '../config/db';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: Date;
}

export class UserModel {

    // Obtener todos los usuarios de la base de datos
    static async getAllUsers(): Promise<User[]> {
        const result = await query('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC');
        return result.rows as User[];
    }

    //Obtener un usuario por email
    static async findUserByEmail(email: string): Promise<User | null> {
        const result = await query('SELECT id, name, email, role, created_at FROM users WHERE email = $1', [email]);
        return result.rows.length > 0 ? result.rows[0] as User : null;
    }
}