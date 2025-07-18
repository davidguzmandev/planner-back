import { query } from "../config/db";

export interface Product {
    id: number;
    name: string;
    created_at: Date;
}

export class ProductModel {
    static async getAllProducts(): Promise<Product[]> {
        const sql = `SELECT id, name, created_at FROM products ORDER BY name ASC`;
        const { rows } = await query(sql);
        return rows as Product[];
    }
}