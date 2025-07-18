import { query } from "../config/db";

export interface Destination {
    id: number;
    name: string;
    created_at: Date;
}

export class DestinationModel {
    static async getAllDestinations(): Promise<Destination[]> {
        const sql = `SELECT id, name, created_at FROM destinations ORDER BY name ASC`;
        const { rows } = await query(sql);
        return rows as Destination[];
    }
}