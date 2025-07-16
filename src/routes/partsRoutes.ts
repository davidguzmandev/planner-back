import { Router, Request, Response } from 'express';
import { PartModel, Part, PartRow } from '../models/Parts';
const partRouter = Router();

// Solicitud GET para obtener todas las partes
partRouter.get('/parts', async (req: Request, res: Response): Promise<void> => {
    try {
        const parts = await PartModel.getAllParts();
        res.status(200).json(parts);
        return;
    } catch (error) {
        console.error('Error fetching parts:', error);
        res.status(500).json({ message: 'Error fetching parts' });
        return;
    }
})

// Solicitud GET para obtener parts por ID
partRouter.get('/parts/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params // Extrae el ID de los parametros URL
    if (!id) {
        res.status(400).json({ message: 'Part ID is required' });
        return;
    }
    try {
        const part = await  PartModel.getPartById(id);
        if(!part) {
            res.status(400).json({ message: `Part with ID ${id} not found.`})
            return;
        }
        res.status(200).json(part);
        return;
    } catch (error) {
        console.error(`Error fetching part with ID ${id}: `, error);
        res.status(500).json({ message: `Error fetching part with ID ${id}.` });
        return;
    }
});

//Solicitud GET para obtener part por part_number
partRouter.get('/parts/bpn/:part_number', async (req: Request, res: Response): Promise<void> => {
    const { part_number } = req.params;
    if (!part_number){
        res.status(400).json({ message: 'Part number is required' });
        return;
    }
    try {
        const part = await PartModel.getPartByPartNumber(part_number);
        if(!part){
            res.status(400).json({ message: `Part with part number ${part_number} not found.` });
            return;
        }
        res.status(200).json(part);
        return;
    } catch (error) {
        console.error(`Error fetching part with part number ${part_number}: `, error);
        res.status(500).json({ message: `Error fetching part with part number ${part_number}.` });
        return;
    }
})

//Solicitud POST para crear una nueva parte
partRouter.post('/parts', async (req: Request, res: Response): Promise<void> => {
    const newPart: Omit<PartRow, 'id' | 'created_at' | 'update_at'> = req.body; // Extrae el cuerpo de la solicitud
    const {
        part_number,
        description,
        project_id,
        product_id,
        coefficient,
        comments,
        destination_id,
        quantity_requested,
        quantity_remaining
    } = newPart;
    if(!part_number || !project_id || !product_id || !destination_id || quantity_requested === undefined || quantity_remaining === undefined) {
        res.status(400).json({ message: 'All fields with * are required.' });
        return;
    }
    try {
        const createdPart = await PartModel.createPart(newPart);
        res.status(201).json({
            message: 'Part created successfully',
            part: createdPart
        })
        return;
    } catch (error) {
        // Maneja el caso de número de parte duplicado (código SQLSTATE 23505 para unique_violation).
        if((error as any).code === '23505'){
            console.error(`Duplicate part number: ${part_number}`);
            res.status(409).json({ message: `Part with part number ${part_number} already exists.` });
            return;
        }
        // Maneja errores de clave foránea (código SQLSTATE 23503 para foreign_key_violation).
        if((error as any).code === '23503'){
            const detail = (error as any).detail || 'Referenced to inexistent foreign key.';
            console.error(`Foreign key violation creating part: ${detail}`);
            res.status(400).json({ message: `Invalid referenced data: ${detail}` });
            return;
        }
        console.error('Error creating part:', error);
        res.status(500).json({ message: 'Error creating part.' });
        return;
    }
});

//Solicitud PATCH para actualizar parcialmente parts
partRouter.patch('/parts/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const updates: Partial<Omit<PartRow, 'id' | 'created_at' | 'updated_at'>> = req.body;

    if(!id || Object.keys(updates).length === 0) {
        res.status(400).json({ message: 'ID part and at least one field to update is required'})
        return;
    }
    try {
        const updatedPart = await PartModel.updatePart(id, updates);
        if(!updatedPart){
            res.status(404).json({ message: `Part with ID ${id} not found or no valid fields were provided to update`});
            return;
        }
        res.status(200).json({
            message: 'Part updated successfully',
            part: updatedPart
        })
        return;
    } catch (error: any) {
        console.error(`Error updating part ${id}:`, error.stack || error);
        // Maneja errores de clave foránea (código SQLSTATE 23503 para foreign_key_violation).
        if((error as any).code === '23503'){
            const detail = (error as any).detail || 'Referenced to inexistent foreign key.';
            console.error(`Foreign key violation updating part: ${detail}`);
            res.status(400).json({ message: `Invalid referenced data: ${detail}` });
            return;
        }
        // Manejo de errores genericos
        console.error(`Error trying to update the part with ID ${id}:`, error);
        res.status(500).json({ message: `Error trying to update the part with ID #${id}.`})
        return;
    }
});

//Solicitud DELETE para eliminar una part
partRouter.delete('/parts/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if(!id){
        res.status(400).json({ message: 'The part ID is required to delete'})
        return;
    }
    try {
        const deleted = await PartModel.deletePart(id)
        if(!deleted){
            res.status(404).json({ message: `Part with ID ${id} not found`});
            return;
        }
        res.status(200).json({ message: `Part with ID ${id} successfully deleted`})
        return;
    } catch (error: any) {
        if(error.code === '23503'){
            const detail = error.detail || 'There are dependent records in other tables.'
            console.error(`ERROR (409 Conflict): Part cannot be deleted due to foreign key dependencies. ID: '${id}'. Detail: ${detail}`)
            res.status(409).json({ message: `The part with ID '${id}' cannot be deleted because ${detail}. Please delete the dependent records first.`})
            return;
        }
        console.error(`ERROR (500 Internal Server Error): Error deleting part with ID '${id}':`, error)
        res.status(500).json({ message: `Internal server error while deleting part with ID '${id}'.`})
        return;
    }
})

export default partRouter;