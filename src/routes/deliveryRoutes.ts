import { Router, Request, Response } from 'express';
import { DeliveryPlanModel, DeliveryPlan } from '../models/Delivery';
const deliveryRouter = Router();

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

export default deliveryRouter;
