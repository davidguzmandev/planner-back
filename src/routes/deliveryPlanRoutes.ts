import { Router, Request, Response } from 'express';
import { DeliveryPlanModel, DeliveryPlan } from '../models/DeliveryPlan';
const deliveryRouter = Router();

//Ruta GET para obtener todos los planes de entrega
deliveryRouter.get('/delivery', async (req: Request, res: Response): Promise<void> => {
    try {
        const deliveryPlan = await DeliveryPlanModel.getAllDeliveryPlan();
        res.status(200).json(deliveryPlan);
        return;
    } catch (error) {
        console.error('Error fetching delivery plan:', error);
        res.status(500).json({ message: 'Error fetching delivery plan.'});
        return;
    }
});

//Ruta GET para obtener un plan de entrega por ID
deliveryRouter.get('/delivery/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if(!id){
        res.status(400).json({ message: 'Delivery Plan ID is required'})
        return;
    }
    try {
        const deliveryPlan = await DeliveryPlanModel.getDeliveryPlanById(Number(id));
        if(!deliveryPlan){
            res.status(404).json({ message: `Delivery plan with ID ${id} not found`})
            return;
        }
        res.status(200).json(deliveryPlan);
        return;
    } catch (error) {
        console.error(`Error fetching delivery plan with ID: ${id}: `, error);
        res.status(500).json({ message: `Error fetching delivery plan with ID: ${id}`});
        return;
    }
});

//Ruta GET para obtener un plan de entrega por numero de parte
deliveryRouter.get('/delivery/bpn/:part_number', async (req: Request, res: Response): Promise<void> =>{
    const {part_number} = req.params;
    if(!part_number){
        res.status(400).json({ message: `Part number is required`});
        return;
    }
    try {
        const deliveryPlan = await DeliveryPlanModel.getDeliveryPlanByPartNumber(part_number);
        if(!deliveryPlan){
            res.status(404).json({ message: `Delivery plan with part number ${part_number} not found`})
            return;
        }
        res.status(200).json(deliveryPlan);
        return;
    } catch (error) {
        console.error(`Error fetching delivery plan with part number: ${part_number}: `, error);
        res.status(500).json({ message: `Error fetching delivery plan with part number: ${part_number}`});
        return;
    }
})

//Ruta POST para crear un nuevo Delivery Plan
deliveryRouter.post('/delivery', async (req: Request, res: Response): Promise<void> => {
    const newDeliveryPlan: Omit<DeliveryPlan, 'id' | 'created_at' | 'updated_at' | 'part_number' | 'part_description' | 'part_quantity_remaining' | 'quantity_pending_this_week'> = req.body;
    const {
        week_start_date,
        week_number,
        year,
        quantity_this_week,
        quantity_declared_this_week,
        part_id
    } = newDeliveryPlan
    
    if(!week_start_date || !week_number || !year || !quantity_this_week || !part_id){
        res.status(400).json({ message: 'All fields with * are required.' });
        return;
    }
    try {
        const createdDeliveryPlan = await DeliveryPlanModel.createDeliveryPlan(newDeliveryPlan);
        res.status(201).json({
            message: 'Delivery plan created successfully',
            deliveryPlan: createdDeliveryPlan
        })
        return;
    } catch (error) {
        // Maneja errores de clave foránea (código SQLSTATE 23503 para foreign_key_violation).
        if((error as any).code === '23503'){
            const detail = (error as any).detail || 'Referenced to inexistent foreign key.';
            console.error(`Foreign key violation creating delivery plan: ${detail}`);
            res.status(400).json({ message: `Invalid referenced data: ${detail}` });
            return;
        }
        console.error('Error creating delivery plan:', error);
        res.status(500).json({ message: 'Error creating delivery plan.' });
        return;
    }
});

//Ruta PATCH para actualizar parcialmente Delivery Plan
deliveryRouter.patch('/delivery/:id', async(req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates: Partial<Omit<DeliveryPlan, 'id' | 'created_at' | 'updated_at' | 'part_number' | 'part_description' | 'part_quantity_remaining' | 'quantity_pending_this_week'>> = req.body;
    
    if(!id || Object.keys(updates).length === 0){
        res.status(400).json({ message: 'ID part and at least one field to update is required'})
        return;
    }
    try {
        const updatedDeliveryPlan = await DeliveryPlanModel.updateDeliveryPlan(Number(id), updates);
        if(!updatedDeliveryPlan){
            res.status(404).json({ message: `Delivery plan with ID ${id} not found or no valid fields were provided to update`});
            return;
        }
        res.status(200).json({
            message: 'Delivery plan updated successfully',
            deliveryPlan: updatedDeliveryPlan
        })
        return;
    } catch (error) {
        // Maneja errores de clave foránea (código SQLSTATE 23503 para foreign_key_violation).
        if((error as any).code === '23503'){
            const detail = (error as any).detail || 'Referenced to inexistent foreign key.';
            console.error(`Foreign key violation updating delivery plan: ${detail}`);
            res.status(400).json({ message: `Invalid referenced data: ${detail}` });
            return;
        }
        console.error(`Error trying to update the delivery plan with ID ${id}:`, error);
        res.status(500).json({ message: `Error trying to update the delivery plan with ID ${id}.`})
        return;
    }
});

//Ruta DELETE para eliminar un delivery plan
deliveryRouter.delete('/delivery/:id', async (req: Request, res: Response): Promise<void> => {
    const {id} = req.params;
    if(!id){
        res.status(400).json({ message: 'Delivery Plan ID is required'});
        return;
    }
    try {
        const deleted = await DeliveryPlanModel.deleteDeliveryPlan(Number(id));
        if(!deleted){
            res.status(404).json({ message: `Delivery plan with ID ${id} not found`});
            return;
        }
        res.status(200).json({ message: `Delivery plan with ID ${id} successfully deleted`});
        return;
    } catch (error:any) {
        if(error.code === '23503'){
            const detail = error.detail || 'There are dependent records in other tables.'
            console.error(`ERROR (409 Conflict): Delivery plan cannot be deleted due to foreign key dependencies. ID: '${id}'. Detail: ${detail}`)
            res.status(409).json({ message: `The delivery plan with ID '${id}' cannot be deleted because ${detail}. Please delete the dependent records first.`})
            return;
        }
        console.error(`ERROR (500 Internal Server Error): Error deleting delivery plan with ID '${id}':`, error)
        res.status(500).json({ message: `Internal server error while deleting delivery plan with ID '${id}'.`})
        return;
    }
})


export default deliveryRouter;
