import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Database Url is not defined in the environment variables.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
});

pool.on('connect', ()=> {
    console.log('Connected to the database successfully.');
})

pool.on('remove', () => {
    console.log('Database connection closed.');
})

pool.on('error', (err: Error, client:any) => {
    console.error('Error, inactive client on the DB', err);
})

// Exporta la función 'query' que utiliza el pool para ejecutar consultas SQL.
// Esto permite que otros módulos (como server.ts) importen y usen 'query'.
export const query = (text: string, params?: any[]): Promise<QueryResult> => pool.query(text, params);