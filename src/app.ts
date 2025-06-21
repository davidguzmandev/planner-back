import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
const app: Express = express();
app.use(express.json());
app.use(cors());
import authRouter from './routes/authRoutes';
import partRouter from './routes/partsRoutes'
import deliveryRouter from './routes/deliveryPlanRoutes'

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Planner App!');
});

// Importacion de rutas de la aplicacion
// Las rutas de la app deben ir antes del manejador 404
app.use('/auth', authRouter);
app.use('/part', partRouter);
app.use('/delivery', deliveryRouter);
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
export default app;