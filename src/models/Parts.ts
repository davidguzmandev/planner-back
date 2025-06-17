import { query } from '../config/db';

export interface Part {
    id: string;
    part_number: string;
    description?: string;
    project_id: number;
    product_id: number;
    coefficient?: number;
    comments?: string;
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
    static  async getPartById(id: string): Promise<Part | null> {
        const result = await query('SELECT * FROM parts WHERE id =$1', [id]);
        return result.rows.length > 0 ? result.rows[0] as Part : null;
    }
    
    static async getPartByPartNumber(part_number:string): Promise<Part | null> {
        const result = await query (' SELECT * FROM parts WHERE part_number = $1', [part_number]);
        return result.rows.length > 0 ? result.rows[0] as Part : null;
    }
    static async createPart(newPart: Omit<Part, 'id' | 'created_at' | 'updated_at'>): Promise <Part> {
        const { part_number, description, project_id, product_id, coefficient, comments, destination_id, quantity_requested, quantity_remaining } = newPart;

        const result = await query (
            `INSERT INTO parts (
                part_number, description, project_id, product_id, coefficient, comments, destination_id, quantity_requested, quantity_remaining
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                part_number,
                description || null,
                project_id,
                product_id,
                coefficient || null,
                comments || null,
                destination_id,
                quantity_requested,
                quantity_remaining
            ]
        );
        return result.rows[0] as Part;
    }
    static async updatePart(id: string, updates: Partial<Omit<Part, 'id' | 'created_at' | 'updated_at'>>): Promise<Part | null> {
        const setClauses: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key) && !['id', 'created_at', 'update_at'].includes(key)) {
                setClauses.push(`${key} = $${paramIndex++}`);
                values.push((updates as any)[key]);
            }
        }
        if(setClauses.length === 0) {
            return null;
        }
        values.push(new Date());
        setClauses.push(`updated_at = $${paramIndex++}`)
        values.push(id);

        const result = await query(
            `UPDATE parts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values
        );
        return result.rows.length > 0 ? result.rows[0] as Part : null;
    }
    static async deletePart(id: string): Promise<boolean> {
        const result = await query (' DELETE FROM parts WHERE id = $1 RETURNING id', [id]);
        return result.rows.length > 0;
    }
}