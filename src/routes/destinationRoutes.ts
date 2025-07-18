import { Router, Request, Response } from 'express';
import { DestinationModel } from '../models/Destination';
const destinationRouter = Router();

// Solicitud GET para obtener todos los destinos
destinationRouter.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const destinations = await DestinationModel.getAllDestinations();
        res.status(200).json(destinations);
        return;
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ message: 'Error fetching destinations' });
        return;
    }
})

export default destinationRouter;