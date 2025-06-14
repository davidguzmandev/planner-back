import { query } from '../config/db';

export interface Part {
    id: string;
    part_number: string;
    description: string;
    coefficient: number;
    comments: string;
    quantity: number;
    unit: string;
    price: number;
    supplierId: string; // ID del proveedor
}
