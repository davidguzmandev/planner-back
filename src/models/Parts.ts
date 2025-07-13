import { query } from "../config/db";

export interface PartRow {
  id: string;
  part_number: string;
  description?: string;
  coefficient?: number;
  comments?: string;
  quantity_requested: number;
  quantity_remaining: number;
  created_at: Date;
  updated_at: Date;
  project_id: number;
  product_id: number;
  destination_id: number;
}

export interface Part
  extends Omit<PartRow, "project_id" | "product_id" | "destination_id"> {
  project_name: string;
  product_name: string;
  destination_name: string;
}

export class PartModel {

  static async getAllParts(): Promise<Part[]> {
    const sql = `
      SELECT
        p.id,
        p.part_number,
        p.description,
        p.coefficient,
        p.comments,
        p.quantity_requested,
        p.quantity_remaining,
        p.created_at,
        p.updated_at,
        proj.name  AS project_name,
        prod.name  AS product_name,
        dest.name  AS destination_name
      FROM parts p
      JOIN projects    proj ON p.project_id     = proj.id
      JOIN products    prod ON p.product_id     = prod.id
      JOIN destinations dest ON p.destination_id = dest.id
      ORDER BY p.part_number ASC;
    `
    const result = await query(sql)
    return result.rows as Part[]
  }

  static async getPartById(id: string): Promise<Part | null> {
    const sql = `
      SELECT
        p.id,
        p.part_number,
        p.description,
        p.coefficient,
        p.comments,
        p.quantity_requested,
        p.quantity_remaining,
        p.created_at,
        p.updated_at,
        proj.name  AS project_name,
        prod.name  AS product_name,
        dest.name  AS destination_name
      FROM parts p
      JOIN projects    proj ON p.project_id     = proj.id
      JOIN products    prod ON p.product_id     = prod.id
      JOIN destinations dest ON p.destination_id = dest.id
      WHERE p.id = $1;
    `
    const result = await query(sql, [id])
    return result.rows[0] as Part | null
  }

  static async getPartByPartNumber(fragment: string): Promise<Part[]> {
    const sql = `
      SELECT
        p.id,
        p.part_number,
        p.description,
        p.coefficient,
        p.comments,
        p.quantity_requested,
        p.quantity_remaining,
        p.created_at,
        p.updated_at,
        proj.name  AS project_name,
        prod.name  AS product_name,
        dest.name  AS destination_name
      FROM parts p
      JOIN projects    proj ON p.project_id     = proj.id
      JOIN products    prod ON p.product_id     = prod.id
      JOIN destinations dest ON p.destination_id = dest.id
      WHERE LOWER(p.part_number) LIKE $1
      ORDER BY p.part_number ASC;
    `
    const param = `%${fragment.toLowerCase()}%`
    const result = await query(sql, [param])
    return result.rows as Part[]
  }

  static async createPart(
    newPart: Omit<PartRow, "id" | "created_at" | "updated_at">
  ): Promise<Part> {
    const {
      part_number,
      description,
      coefficient,
      comments,
      quantity_requested,
      quantity_remaining,
      project_id,
      product_id,
      destination_id,
    } = newPart


    const insertSql = `
      INSERT INTO parts (
        part_number,
        description,
        coefficient,
        comments,
        quantity_requested,
        quantity_remaining,
        project_id,
        product_id,
        destination_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id;
    `
    const insertRes = await query(insertSql, [
      part_number,
      description ?? null,
      coefficient ?? null,
      comments ?? null,
      quantity_requested,
      quantity_remaining,
      project_id,
      product_id,
      destination_id,
    ])
    const newId = insertRes.rows[0].id

    return (await this.getPartById(newId))!
  }

  static async updatePart(
    id: string,
    updates: Partial<Omit<PartRow, "id" | "created_at" | "updated_at">>
  ): Promise<Part | null> {
    const setClauses: string[] = []
    const values: any[] = []
    let idx = 1

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        setClauses.push(`${key} = $${idx}`)
        values.push(val)
        idx++
      }
    }
    if (setClauses.length === 0) return null

    setClauses.push(`updated_at = $${idx}`)
    values.push(new Date())
    idx++
    values.push(id)

    const sql = `
      UPDATE parts
      SET ${setClauses.join(", ")}
      WHERE id = $${idx}
      RETURNING id;
    `
    const res = await query(sql, values)
    if (res.rows.length === 0) return null

    return this.getPartById(res.rows[0].id)
  }
  static async deletePart(id: string): Promise<boolean> {
    const sql = `DELETE FROM parts WHERE id = $1 RETURNING id;`
    const res = await query(sql, [id])
    return res.rows.length > 0
  }
}
