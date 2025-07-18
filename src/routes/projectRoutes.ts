import { Router, Request, Response } from 'express';
import { ProjectModel } from '../models/Project';
const projectRouter = Router();

// Solicitud GET para obtener todos los proyectos
projectRouter.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const projects = await ProjectModel.getAllProjects();
        res.status(200).json(projects);
        return;
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects' });
        return;
    }
})

export default projectRouter;