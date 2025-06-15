import { query } from '../config/db';

export interface Part {
    id: string;
    part_number: string;
    description?: string;
    project_id: number;
    product_id: number;
    coefficient?: number;
    comments?: string;
    quantity: number;
    destination_id: number;
    quantity_requested: number;
    quantity_remaining: number;
    created_at: Date;
    updated_at: Date;
}

export class PartModel {
    static async getAllParts(): Promise<Part[]> {
        const result = await query('SELECT * FROM parts ORDER BY part_number ASC');
        return result.rows as Part[];
    }
    static async getPartByPartNumber(part_number:string): Promise<Part | null> {
        const result = await query (' SELECT * FROM parts WHERE part_number = $1', [part_number]);
        return result.rows.length > 0 ? result.rows[0] as Part : null;
    }

    
}