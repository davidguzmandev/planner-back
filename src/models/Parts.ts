import { query } from "../config/db";

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

export interface PartWithRelations extends Part {
  project_name: string;
  product_name: string;
  destination_name: string;
}

export class PartModel {
  static async getAllParts(): Promise<Part[]> {
    const result = await query(`
      SELECT
        p.*,
        proj.name         AS project_name,
        prod.name         AS product_name,
        dest.name         AS destination_name
      FROM parts p
      JOIN projects proj       ON p.project_id     = proj.id
      JOIN products prod       ON p.product_id     = prod.id
      JOIN destinations dest   ON p.destination_id = dest.id
      ORDER BY p.part_number ASC
    `);
    return result.rows as PartWithRelations[];
  }
  static async getPartById(id: string): Promise<PartWithRelations | null> {
    const result = await query(
      `
      SELECT
        p.*,
        proj.name         AS project_name,
        prod.name         AS product_name,
        dest.name         AS destination_name
      FROM parts p
      JOIN projects proj       ON p.project_id     = proj.id
      JOIN products prod       ON p.product_id     = prod.id
      JOIN destinations dest   ON p.destination_id = dest.id
      WHERE p.id = $1
      `,
      [id]
    );
    return result.rows.length > 0
      ? (result.rows[0] as PartWithRelations)
      : null;
  }

  static async getPartByPartNumber(
    fragment: string
  ): Promise<PartWithRelations[]> {
    const result = await query(
      `
      SELECT
        p.*,
        proj.name         AS project_name,
        prod.name         AS product_name,
        dest.name         AS destination_name
      FROM parts p
      JOIN projects proj       ON p.project_id     = proj.id
      JOIN products prod       ON p.product_id     = prod.id
      JOIN destinations dest   ON p.destination_id = dest.id
      WHERE LOWER(p.part_number) LIKE $1
      ORDER BY p.part_number ASC
      `,
      [`%${fragment.toLowerCase()}%`]
    );
    return result.rows as PartWithRelations[];
  }
  static async createPart(
    newPart: Omit<Part, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Part> {
    const {
      part_number,
      description,
      project_id,
      product_id,
      coefficient,
      comments,
      destination_id,
      quantity_requested,
      quantity_remaining,
    } = newPart;

    const result = await query(
      `
      INSERT INTO parts (
        part_number, description, project_id,
        product_id, coefficient, comments,
        destination_id, quantity_requested,
        quantity_remaining
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        part_number,
        description || null,
        project_id,
        product_id,
        coefficient || null,
        comments || null,
        destination_id,
        quantity_requested,
        quantity_remaining,
      ]
    );
    return result.rows[0] as Part;
  }
  static async updatePart(
    id: string,
    updates: Partial<Omit<Part, "id" | "created_at" | "updated_at">>
  ): Promise<Part | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const key in updates) {
      if (
        Object.prototype.hasOwnProperty.call(updates, key) &&
        !["id", "created_at", "update_at"].includes(key)
      ) {
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
      `UPDATE parts SET ${setClauses.join(
        ", "
      )} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows.length > 0 ? (result.rows[0] as Part) : null;
  }
  static async deletePart(id: string): Promise<boolean> {
    const result = await query(
      " DELETE FROM parts WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows.length > 0;
  }
}
