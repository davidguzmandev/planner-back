import { Router, Request, Response } from 'express';
import { ProductModel } from '../models/Product';
const productRouter = Router();

// Solicitud GET para obtener todos los productos
productRouter.get('/products', async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await ProductModel.getAllProducts();
        res.status(200).json(products);
        return;
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
        return;
    }
})

export default productRouter;