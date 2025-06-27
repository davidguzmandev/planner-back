import { Router, Request, Response } from 'express';
import { DeliveryPlanModel, DeliveryPlan } from '../models/DeliveryPlan';
const deliveryRouter = Router();

//Ruta GET para obtener todos los planes de entrega
deliveryRouter.get('/delivery', async (req: Request, res: Response): Promise<void> => {
    try {
        const deliveryPlans = await DeliveryPlanModel.getAllDeliveryPlan();
        res.status(200).json(deliveryPlans);
        return;
    } catch (error) {
        console.error('ERROR (500 Internal Server Error): Error fetching delivery plans:', error);
        res.status(500).json({ message: 'Internal server error while fetching delivery plans.' });
        return;
    }
});

//Ruta GET para obtener un plan de entrega por ID
deliveryRouter.get('/delivery/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Convierte el ID de la URL (string) a número.
    const deliveryPlanId = Number(id);

    // Validación del ID.
    if (!id || isNaN(deliveryPlanId)) {
        res.status(400).json({ message: 'The delivery plan ID (numeric) is required and must be valid.' });
        return;
    }

    try {
        const deliveryPlan = await DeliveryPlanModel.getDeliveryPlanById(deliveryPlanId);

        // Si el plan no se encuentra, la respuesta es 404 Not Found.
        if (!deliveryPlan) {
            res.status(404).json({ message: `Delivery plan with ID '${id}' not found.` });
            return;
        }

        res.status(200).json(deliveryPlan);
        return;

    } catch (error) {
        console.error(`ERROR (500 Internal Server Error): Error fetching delivery plan with ID '${id}':`, error);
        res.status(500).json({ message: `Internal server error while fetching the delivery plan.` });
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
        if(deliveryPlan.length === 0){
            res.status(200).json({ message: `Delivery plan with part number ${part_number} not found`})
            return;
        }
        res.status(200).json(deliveryPlan);
        return;
    } catch (error) {
        console.error(`Error fetching delivery plan with part number: ${part_number}: `, error);
        res.status(500).json({ message: `Internal server error while fetching delivery plan`});
        return;
    }
})

//Ruta POST para crear un nuevo Delivery Plan
deliveryRouter.post('/delivery', async (req: Request, res: Response): Promise<void> => {
    // El cuerpo de la petición debe coincidir con la interfaz DeliveryPlan (excluyendo campos generados/JOINed).
    const newDeliveryPlanData: Omit<DeliveryPlan,
        'id' | 'created_at' | 'updated_at' | 'part_number' | 'part_description'
    > & {
        inspection_date?: Date | null;
        quantity_to_inspect?: number;
        quantity_inspected?: number;
        quantity_rejected?: number;
        reasons?: string | null;
        qc_member?: string | null;
        comment?: string | null;
    } = req.body;

    // Extrae los campos obligatorios para la validación.
    const {
        part_id, week_start_date, week_number, year,
        priority_rank, responsible
    } = newDeliveryPlanData;

    // Validación básica de los campos requeridos (según tu esquema DB definitivo).
    if (!part_id || !week_start_date || week_number === undefined || year === undefined ||
        priority_rank === undefined ) {
        res.status(400).json({ message: 'Fields part_id, week_start_date, week_number, year, priority_rank, and responsible are required.' });
        return;
    }
    // Opcional: Validar tipos de datos si no confías en el cliente (ej. week_number es numérico)
    if (typeof week_number !== 'number' || typeof year !== 'number' || typeof priority_rank !== 'number') {
        res.status(400).json({ message: 'week_number, year, and priority_rank must be valid numbers.' });
        return;
    }


    try {
        const createdDeliveryPlan = await DeliveryPlanModel.createDeliveryPlan(newDeliveryPlanData);
        res.status(201).json({
            message: 'Delivery plan created successfully.',
            deliveryPlan: createdDeliveryPlan
        });
        return;

    } catch (error: any) {
        // Manejo de errores de clave foránea (código SQLSTATE 23503 para foreign_key_violation).
        if (error.code === '23503') {
            const detail = error.detail || 'Reference to a non-existent foreign key (e.g., invalid part_id).';
            console.error(`ERROR (400 Bad Request): Foreign key violation when creating delivery plan. Detail: ${detail}`);
            res.status(400).json({ message: `Invalid reference data for part_id: ${detail}` });
            return;
        }
        // Manejo de error de unicidad (código SQLSTATE 23505 para unique_violation).
        // Esto ocurrirá si intentas crear un plan para la misma parte, año y semana.
        if (error.code === '23505') {
            const detail = error.detail || `A plan for part ${part_id} in week ${week_number} of year ${year} already exists.`;
            console.error(`ERROR (409 Conflict): Uniqueness violation when creating delivery plan. Detail: ${detail}`);
            res.status(409).json({ message: `A delivery plan for this part in the specified week and year already exists: ${detail}` });
            return;
        }
        // Manejo de otros errores genéricos del servidor.
        console.error('ERROR (500 Internal Server Error): Error creating delivery plan:', error);
        res.status(500).json({ message: 'Internal server error when creating the delivery plan.' });
        return;
    }
});

//Ruta PATCH para actualizar parcialmente Delivery Plan
deliveryRouter.patch('/delivery/:id', async(req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates: Partial<Omit<DeliveryPlan, 'id' | 'created_at' | 'updated_at' | 'part_number' | 'part_description'>> = req.body;
    // id es un parámetro de URL string, necesitas convertirlo a Number
    const deliveryPlanId = Number(id);

    // Validación: ID y al menos un campo válido para actualizar son requeridos.
    if (!id || isNaN(deliveryPlanId) || Object.keys(updates).length === 0) {
        res.status(400).json({ message: 'Delivery plan ID and at least one valid field to update are required.' });
        return;
    }
    try {
        const updatedDeliveryPlan = await DeliveryPlanModel.updateDeliveryPlan(deliveryPlanId, updates);
        if(!updatedDeliveryPlan){
            res.status(404).json({ message: `Delivery plan with ID ${id} not found`});
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
        res.status(500).json({ message: `Internal server error while updating delivery plan`})
        return;
    }
});

//Ruta DELETE para eliminar un delivery plan
deliveryRouter.delete('/delivery/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const deliveryPlanId = Number(id);

    // Validación del ID.
    if (!id || isNaN(deliveryPlanId)) {
        res.status(400).json({ message: 'The delivery plan ID (numeric) is required for deletion.' });
        return;
    }

    try {
        const deleted = await DeliveryPlanModel.deleteDeliveryPlan(deliveryPlanId);

        if (!deleted) {
            res.status(404).json({ message: `Delivery plan with ID '${id}' not found.` });
            return;
        }

        res.status(200).json({ message: `Delivery plan with ID '${id}' deleted successfully.` });
        return;

    } catch (error: any) {
        // Aunque la FK a 'parts' tiene ON DELETE CASCADE, si 'delivery_plan' fuera referenciada por otra tabla,
        // este error 23503 podría ocurrir.
        if (error.code === '23503') {
            const detail = error.detail || 'Dependent records exist in other tables.';
            console.error(`ERROR (409 Conflict): Cannot delete delivery plan due to dependencies. ID: '${id}'. Detail: ${detail}`);
            res.status(409).json({ message: `Delivery plan with ID '${id}' cannot be deleted because ${detail}.` });
            return;
        }
        console.error(`ERROR (500 Internal Server Error): Error deleting delivery plan with ID '${id}':`, error);
        res.status(500).json({ message: `Internal server error while deleting the delivery plan with ID '${id}'.` });
        return;
    }
});


export default deliveryRouter;
