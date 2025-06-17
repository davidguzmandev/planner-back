import { Router, Request, Response } from 'express';
import { PartModel, Part } from '../models/Parts';
const partRouter = Router();

// Solicitud GET para obtener todas las partes
partRouter.get('/parts', async (req: Request, res: Response): Promise<void> => {
    try {
        const parts = await PartModel.getAllParts();
        res.status(200).json(parts);
    } catch (error) {
        console.error('Error fetching parts:', error);
        res.status(500).json({ message: 'Error fetching parts' });
    }
})

// Solicitud GET para obtener parts por ID
partRouter.get('/parts/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params // Extrae el ID de los parametros URL
    if (!id) {
        res.status(400).json({ message: 'Part ID is required' });
    }
    try {
        const part = await  PartModel.getPartById(id);
        if(!part) {
            res.status(400).json({ message: `Part with ID ${id} not found.`})
        }
        res.status(200).json(part);
    } catch (error) {
        console.error(`Error fetching part with ID ${id}: `, error);
        res.status(500).json({ message: `Error fetching part with ID ${id}.` });
    }
});

//Solicitud GET para obtener part por part_number
partRouter.get('/parts/:part_number', async (req: Request, res: Response): Promise<void> => {
    const { part_number } = req.params;
    if (!part_number){
        res.status(400).json({ message: 'Part number is required' });
    }
    try {
        const part = await PartModel.getPartByPartNumber(part_number);
        if(!part){
            res.status(400).json({ message: `Part with part number ${part_number} not found.` });
        }
        res.status(200).json(part);
    } catch (error) {
        console.error(`Error fetching part with part number ${part_number}: `, error);
        res.status(500).json({ message: `Error fetching part with part number ${part_number}.` });
    }
})

//Solicitud POST para crear una nueva parte
partRouter.post('/parts', async (req: Request, res: Response): Promise<void> => {
    const newPart: Omit<Part, 'id' | 'created_at' | 'update_at'> = req.body; // Extrae el cuerpo de la solicitud
    const {
        part_number,
        project_id,
        product_id,
        destination_id,
        quantity_requested,
        quantity_remaining
    } = newPart;
    if(!part_number || !project_id || !product_id || !destination_id || quantity_requested === undefined || quantity_remaining === undefined) {
        res.status(400).json({ message: 'All fields with * are required.' });
    }
    try {
        const createdPart = await PartModel.createPart(newPart);
        res.status(201).json({
            message: 'Part created successfully',
            part: createdPart
        })
    } catch (error) {
        // Maneja el caso de número de parte duplicado (código SQLSTATE 23505 para unique_violation).
        if((error as any).code === '23505'){
            console.error(`Duplicate part number: ${part_number}`);
            res.status(409).json({ message: `Part with part number ${part_number} already exists.` });
        }
        // Maneja errores de clave foránea (código SQLSTATE 23503 para foreign_key_violation).
        if((error as any).code === '23503'){
            const detail = (error as any).detail || 'Referenced to inexistent foreign key.';
            console.error(`Foreign key violation creating part: ${detail}`);
            res.status(400).json({ message: `Invalid referenced data: ${detail}` });
        }
        console.error('Error creating part:', error);
        res.status(500).json({ message: 'Error creating part.' });
    }
});

//

export default partRouter;