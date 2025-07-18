import { query } from "../config/db";

export interface Project {
    id: number;
    name: string;
    number: string;
    created_at: Date;
}

export class ProjectModel {
    static async getAllProjects(): Promise<Project[]> {
        const sql = `SELECT id, name, number, created_at FROM projects ORDER BY name ASC`;
        const { rows } = await query(sql);
        return rows as Project[];
    }
}