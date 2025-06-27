import { query } from '../config/db'

export interface DeliveryPlan {
    id: number;
    week_start_date: Date;
    week_number: number;
    year: number;
    priority_rank: number;
    inspection_date: Date | null; // Nullable
    quantity_to_inspect: number; // NOT NULL, DEFAULT 0
    quantity_inspected: number; // NOT NULL, DEFAULT 0
    quantity_rejected: number; // NOT NULL, DEFAULT 0
    reasons: string | null; // Nullable
    qc_member: string | null; // Nullable
    responsible: string; // NOT NULL (como se define en tu schema)
    comment: string | null; // Nullable
    created_at: Date;
    updated_at: Date;
    part_id: string;
    // Campos obtenidos mediante JOIN
    part_number?: string;
    part_description?: string;
};

export class DeliveryPlanModel {
    private static getBaseDeliveryPlanQuery(): string {
        return `
        SELECT
            dp.id,
            dp.week_start_date,
            dp.week_number,
            dp.year,
            dp.priority_rank,
            dp.inspection_date,
            dp.quantity_to_inspect,
            dp.quantity_inspected,
            dp.quantity_rejected,
            dp.reasons,
            dp.qc_member,
            dp.responsible,
            dp.comment,
            dp.created_at,
            dp.updated_at,
            dp.part_id,
            p.part_number AS part_number,
            p.description AS part_description,
        FROM delivery_plan dp
        JOIN parts p ON dp.part_id = p.id
        `;
    }
    //Solicitud GET para obtener todas las partes
    static async getAllDeliveryPlan(): Promise<DeliveryPlan[]> {
        const result = await query(`${this.getBaseDeliveryPlanQuery()} ORDER BY dp.priority_rank ASC, dp.year ASC, dp.week_number ASC`);
        return result.rows as DeliveryPlan[];
    }

    //Solicitud GET para obtener una parte por ID
    static async getDeliveryPlanById(id:number): Promise<DeliveryPlan | null> {
        const result = await query(`${this.getBaseDeliveryPlanQuery()} WHERE dp.id = $1`, [id]);
        return result.rows.length > 0 ? result.rows[0] as DeliveryPlan : null
    }
    
    //Solicitud GET para obtener una parte por numero de parte
    static async getDeliveryPlanByPartNumber(part_number:string): Promise<DeliveryPlan[]> {
        const result = await query(`${this.getBaseDeliveryPlanQuery()} WHERE LOWER (p.part_number)LIKE $1 ORDER BY dp.year ASC, dp.week_number ASC`, [`%${part_number.toLowerCase()}%`]);
        return result.rows as DeliveryPlan[];
    }

    //Solicitud POST para crear una nueva parte
    static async createDeliveryPlan(newDeliveryPlan: Omit<DeliveryPlan, 'id' | 'created_at' | 'updated_at' | 'part_number' | 'part_description' > & { 
        inspection_date?: Date | null;
        quantity_to_inspect?: number;
        quantity_inspected?: number;
        quantity_rejected?: number;
        reasons?: string | null;
        qc_member?: string | null;
        comment?: string | null;
     }): Promise<DeliveryPlan> {
        const {
            part_id, 
            week_start_date, 
            week_number, 
            year,
            priority_rank, 
            inspection_date, 
            quantity_to_inspect, 
            quantity_inspected, 
            quantity_rejected,
            reasons, 
            qc_member, 
            responsible, 
            comment
        } = newDeliveryPlan;
        const result = await query(
            `NSERT INTO delivery_plan (
                part_id, week_start_date, week_number, year,
                priority_rank,
                inspection_date, quantity_to_inspect, quantity_inspected, quantity_rejected,
                reasons, qc_member, responsible, comment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [
                part_id,
                week_start_date,
                week_number,
                year,
                priority_rank, // Valor obligatorio
                inspection_date ?? null,
                quantity_to_inspect ?? 0,
                quantity_inspected ?? 0,
                quantity_rejected ?? 0,
                reasons ?? null,
                qc_member ?? null,
                responsible,
                comment ?? null
            ]
        );
        return result.rows[0] as DeliveryPlan;
    }

    //Solicitud PATCH para actualizar parcialmente parts
    static async updateDeliveryPlan(id: number, updates: Partial<Omit<DeliveryPlan,
        'id' | 'created_at' | 'updated_at' | 'part_number' | 'part_description'
    >>): Promise<DeliveryPlan | null> {
        const setClauses: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Lista de claves a excluir del objeto 'updates' para evitar intentar actualizarlas.
        const excludedKeys = [
            'id', 'created_at', 'updated_at', 'part_number',
            'part_description'
        ] as const;

        for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key) && !(excludedKeys as ReadonlyArray<string>).includes(key)) {
                setClauses.push(`${key} = $${paramIndex++}`);
                values.push((updates as any)[key]);
            }
        }

        if (setClauses.length === 0) {
            return null; 
        }

        values.push(new Date()); 
        setClauses.push(`updated_at = $${paramIndex++}`);

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
