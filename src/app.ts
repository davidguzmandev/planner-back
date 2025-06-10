/* import express, { Express, Request, Response, NextFunction } from 'express';
const app: Express = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Planner App!');
});

// --- Middleware para manejar rutas no encontradas (404 Not Found) ---
// Este middleware se ejecutará si ninguna de las rutas definidas (incluida la ruta raíz de arriba)
// coincide con la solicitud. Se coloca antes del middleware global de manejo de errores.
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send('Route not found');
});

// --- Middleware global de manejo de errores ---
// Este es el manejador de errores principal de Express.
// Captura errores que ocurren dentro de las rutas o middlewares, o que se pasan explícitamente con next(error).
// Es CRUCIAL que se coloque *después* de todas las rutas y otros middlewares.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('--- Global Error Handler ---');
    console.error('Message:', err.message);
    console.error('Stack: ', err.stack); // El stack trace es vital para la depuración
    console.error('------------------------------');

    // En un entorno de producción, es crucial evitar enviar detalles sensibles del error al cliente.
    // Aquí enviamos un mensaje genérico de error interno del servidor.
    res.status(500).send('Internal Server Error');
});

// Exporta la instancia de la aplicación Express configurada.
// server.ts la importará para iniciar el servidor HTTP.
export default app; */



// Importa el módulo Express y sus tipos.
import express, { Express, Request, Response, NextFunction } from 'express';
// Importa el paquete 'cors' para manejar las políticas de Cross-Origin Resource Sharing.
import cors from 'cors'; // <-- Añadido esta línea

// Importa el router principal que contiene tus rutas.
import mainRouter from './routes/mainRouter';

// Crea una instancia de la aplicación Express.
const app: Express = express();

// --- Configuración de CORS ---
// Habilita CORS para todas las solicitudes.
// Esto permite que tu frontend (ej. desde localhost o tu dominio) pueda comunicarse con este backend.
app.use(cors()); // <-- Añadido esta línea

// Middleware para parsear el cuerpo de las solicitudes en formato JSON.
app.use(express.json());

// --- Ruta Raíz Simple ---
app.get('/', (req: Request, res: Response) => {
  res.send('¡TEST: Servidor Express mínimo funcionando!');
});

// --- Middleware para manejar rutas no encontradas (404 Not Found) ---
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send('Ruta no encontrada');
});

// --- Middleware global de manejo de errores ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('--- Manejador Global de Errores ---');
    console.error('Mensaje:', err.message);
    console.error('Pila de llamadas: ', err.stack);
    console.error('------------------------------');
    res.status(500).send('Error interno del servidor');
});

// Exporta la instancia de la aplicación Express configurada.
export default app;
