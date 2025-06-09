// Importa el módulo Express y sus tipos.
import express, { Express, Request, Response } from 'express';
// Importa dotenv para cargar variables de entorno.
import dotenv from 'dotenv';
// Importa el tipo Server del módulo 'http' de Node.js.
import { Server } from 'http';

// Carga las variables de entorno.
dotenv.config();

// Crea una instancia de la aplicación Express directamente en este archivo.
const app: Express = express(); // <-- ¡Instancia de Express aquí!

// Define el puerto.
const PORT: number = parseInt(process.env.PORT || '8080', 10);

// --- Ruta Raíz Simple ---
// Una ruta mínima para probar la conectividad HTTP.
app.get('/', (req: Request, res: Response) => {
  res.send('¡TEST: Servidor Express mínimo funcionando!');
});

// --- Función para manejar errores al intentar iniciar el servidor ---
function handleServerStartupError(error: Error): void {
    if ((error as any).code === 'EADDRINUSE') {
        console.error(`Error: The port ${PORT} is already in use. Please choose a different port or stop the process using it.`);
    } else {
        console.error(`Error running the server: ${error.message}`);
    }
    console.error('Stopping the server process...');
    process.exit(1);
}

// --- Manejo de excepciones no capturadas y rechazos de promesas no manejados ---
process.on('uncaughtException', (error: Error) => {
    console.error('!!! Exception not caught in the process !!!');
    handleServerStartupError(error);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
    console.error(' !!! Unhandled Rejection !!!');
    if (reason instanceof Error) {
        handleServerStartupError(reason);
    } else {
        console.error('Rejection reason:', reason);
        process.exit(1);
    }
});

// Inicia el servidor Express vinculándolo explícitamente a '0.0.0.0'.
// Esto se hace directamente, sin una función async para aislar aún más.
const server: Server = app.listen(PORT, '0.0.0.0', (err?: Error) => {
    if (err) {
        handleServerStartupError(err);
    } else {
        console.log(`🚀 TEST: Servidor Express mínimo escuchando en puerto ${PORT} en todas las interfaces.`);
        console.log(`TEST: Accede a http://82.25.93.170:${PORT}/ para verificar.`);
    }
});

// --- Manejo de señales de cierre del servidor (SIGTERM, SIGINT) ---
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Received SIGINT (Ctrl + C), shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
