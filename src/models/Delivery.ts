import { query } from '../config/db'

export interface DeliveryPlan {
    id: number;
    week_start_date: Date;
    week_number: number;
    year: number;
    quantity_this_week: number;
    quantity_declared_this_week: number;
    quantity_pending_this_week: number;
    created_at: Date;
    updated_at: Date;
    part_id: string;
    // Campos obtenidos mediante JOIN
    part_number: string;
    part_description: string;
    part_quantity_remaining: number;
};

export class DeliveryPlanModel {
    private static getBaseDeliveryPlanQuery(): string {
        return `
        SELECT
            dp.id,
            dp.week_start_date,
            dp.week_number,
            dp.year,
            dp.quantity_this_week,
            dp.quantity_declared_this_week,
            dp.quantity_pending_this_week,
            dp.created_at,
            dp.updated_at,
            dp.part_id,
            p.part_number AS part_number,
            p.description AS part_description,
            p.quantity_remaining AS part_quantity_remaining
        FROM delivery_plan dp
        JOIN parts p ON dp.part_id = p.id
        `;
    }
    //Solicitud GET para obtener todas las partes
    static async getAllDeliveryPlan(): Promise<DeliveryPlan[]> {
        const result = await query(`${this.getBaseDeliveryPlanQuery()} ORDER BY dp.week_start_date ASC`);
        return result.rows as DeliveryPlan[];
    }

    //Solicitud GET para obtener una parte por ID
    static async getDeliveryPlanById(id:number): Promise<DeliveryPlan | null> {
        const result = await query(`${this.getBaseDeliveryPlanQuery()} WHERE dp.id = $1`, [id]);
        return result.rows.length > 0 ? result.rows[0] as DeliveryPlan : null
    }
    
    //Solicitud GET para obtener una parte por numero de parte
    static async getDeliveryPlanByPartNumber(part_number:string): Promise<DeliveryPlan[] | null> {
        const result = await query(`${this.getBaseDeliveryPlanQuery()} WHERE p.part_number = $1`, [part_number]);
        return result.rows.length > 0 ? result.rows as DeliveryPlan[] : null;
    }

    //Solicitud POST para crear una nueva parte
    static async createDeliveryPlan(newDeliveryPlan: Omit<DeliveryPlan, 'id' | 'created_at' | 'updated_at' | 'part_number' | 'part_description' | 'part_quantity_remaining' | 'quantity_pending_this_week'>): Promise<DeliveryPlan> {
        const {
            week_start_date,
            week_number,
            year,
            quantity_this_week,
            quantity_declared_this_week,
            part_id
        } = newDeliveryPlan;
        const result = await query(
            `INSERT INTO delivery_plan (week_start_date, week_number, year, quantity_this_week, quantity_declared_this_week, part_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [week_start_date, week_number, year, quantity_this_week, quantity_declared_this_week ?? 0,part_id]
        );
        return result.rows[0] as DeliveryPlan;
    }

    //Solicitud PATCH para actualizar parcialmente parts
    static async updateDeliveryPlan(id:number, updates: Partial<Omit<DeliveryPlan, 'id' | 'created_at' | 'updated_at' | 'part_number' | 'part_description' | 'part_quantity_remaining' | 'quantity_pending_this_week'>>): Promise<DeliveryPlan | null> {
        const setClauses: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        for (const key in updates) {
            if(Object.prototype.hasOwnProperty.call(updates, key) && !['id', 'created_at', 'updated_at', 'part_number', 'part_description', 'part_quantity_remaining', 'quantity_pending_this_week'].includes(key)) {
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
            `UPDATE delivery_plan 
            SET ${setClauses.join(', ')} 
            WHERE id = $${paramIndex} 
            RETURNING *`, 
            values
        );
        return result.rows.length > 0 ? result.rows[0] as DeliveryPlan : null;
    }

    static async deleteDeliveryPlan(id: number): Promise<boolean> {
        const result = await query('DELETE FROM delivery_plan WHERE id = $1 RETURNING id', [id]);
        return result.rows.length > 0;
    }
}
