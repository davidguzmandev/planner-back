import express, {Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { Server } from 'http';
import { query } from './db';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// --- Middleware para manejar rutas no encontradas (404 Not Found) ---
// Este middleware se ejecutará si ninguna de las rutas definidas (que se cargarán por separado)
// coincide con la solicitud. Se coloca antes del middleware global de manejo de errores.
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send('Route not found');
});

// --- Middleware global de manejo de errores ---
// Este es el manejador de errores principal de Express.
// Captura errores que ocurren dentro de las rutas o middlewares, o que se pasan explícitamente con next(error).
// Debe ser el último app.use() definido antes de app.listen().
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('--- Global Error Handler ---');
    console.error('Message:', err.message);
    console.error('Stack: ', err.stack);// El stack trace es crucial para la depuración
    console.error('------------------------------')
    // En un entorno de producción, es crucial evitar enviar detalles sensibles del error al cliente.
    // Aquí enviamos un mensaje genérico de error interno del servidor.
    res.status(500).send('Internal Server Error');
})

// --- Función para manejar errores al intentar iniciar el servidor ---
// Esta función se encarga de errores que impiden que el servidor Express se vincule al puerto
// (ej. puerto ya en uso) o de errores fatales a nivel de proceso.
function handleServerStartupError(error: Error): void {
    // Comprueba si el error es 'EADDRINUSE' (dirección/puerto ya en uso).
    if ((error as any).code === 'EADDRINUSE') {
        console.error(`Error: The port ${PORT} is already in use. Please choose a different port or stop the process using it.`);
    } else {
        console.error(`Error running the server: ${error.message}`);
    }
    console.error('Stopping the server process...');
    process.exit(1);
}

// --- Manejo de excepciones no capturadas y rechazos de promesas no manejados ---
// Estos manejadores son CRUCIALES para la robustez en producción.
// Capturan errores que no fueron atrapados por bloques try/catch o middlewares de Express,
// evitando que la aplicación se caiga silenciosamente.
process.on('uncaughtException', (error: Error) => {
    console.error('!!! Exception not caught in the process !!!');
    handleServerStartupError(error);
})

process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
    console.error(' !!! Unhandled Rejection !!!');
    // Es importante asegurarse de que 'reason' sea un objeto Error para acceder a su mensaje y stack.
    if (reason instanceof Error) {
        handleServerStartupError(reason);
    } else {
        console.error('Rejection reason:', reason);
        process.exit(1);
    }
});

// --- Función asíncrona principal para iniciar la aplicación ---
// Esta función encapsula la lógica de verificación de la base de datos
// y el inicio del servidor Express.
async function startApp(): Promise<void> {
    try {
        console.log('Trying to connect to the database...');
        // Realiza una consulta SQL simple (SELECT 1) para verificar si la base de datos
        // es accesible y está operativa.
        await query('SELECT 1')
        console.log('✅ Database connection is successful. Starting the server...');
        // Inicia el servidor express si la conexion con la DB es exitosa.
        const server: Server = app.listen(PORT, (err?: Error) => {
            // El callback de listen() maneja errores específicos del enlace del puerto (ej. EADDRINUSE).
            if (err) {
                handleServerStartupError(err);
            } else {
                console.log(`Server listening on port ${PORT}`);
                console.log(`This backend is ready on http://localhost:${PORT}`);
            }
        });
        // --- Manejo de señales de cierre del servidor (SIGTERM, SIGINT) ---
        // Esto permite que el servidor realice un "cierre elegante" cuando recibe una señal
        // de terminación (ej. de PM2, Docker o Ctrl+C en la terminal).
        process.on('SIGTERM', () => {
            console.log('Received SIGTERM, shutting down gracefully...');
            server.close(() => {
                console.log('Server closed.');
                process.exit(0);// Sale del proceso con código de éxito.
            });
        });
        process.on('SIGINT', () => {
            console.log('Received SIGINT (Ctrl + C), shutting down gracefully...');
            server.close(() => {
                console.log('Server closed.');
                process.exit(0);// Sale del proceso con código de éxito.
            });
        })

    } catch (dbError) {
        // Si la conexión a la base de datos falla al inicio (capturado por el 'await query'),
        // registramos el error como crítico y salimos del proceso.
        // Es fundamental que el servidor no inicie si no puede acceder a su base de datos.
        console.error('❌ Critical error: Unable to connect to the database.');
        console.error((dbError instanceof Error) ? dbError.message : 'Unknown error happenend while connecting to the database.');
        process.exit(1); // Sale del proceso con un código de error.
    }
}

// Llama a la función principal para iniciar la aplicación.
// startApp() es asíncrona, así que se ejecutará en segundo plano.
startApp()

