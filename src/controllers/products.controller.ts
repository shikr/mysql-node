import type { Request, Response } from "express";
import pool from "../conf/dbConnection.js";

export class ProductController {
  getProducts(_req: Request, res: Response) {
    pool
      .execute("select * from products where active=1")
      .then(([result]) => {
        res
          .status(200)
          .json((<any>result).map((product: any) => ({ ...product, active: undefined })));
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "internal server error" });
      });
  }

  async getById(req: Request, res: Response) {
    const id = typeof req.params.id === "string" ? parseInt(req.params.id) : undefined;

    if (!id || isNaN(id) || id < 0) return res.status(400).json({ message: "expected id" });

    const [result] = await pool.execute("select * from products where id=? and active=1", [id]);

    if (!result) {
      res.status(404).json({ message: "product not found" });
      return;
    }

    res.json({ ...(result as any)[0], active: undefined });
  }

  createProduct(req: Request, res: Response) {
    const { name, price, stock, description, brand, img } = req.body;

    if (!name) return res.status(400).json({ message: "a name is required" });
    if (!price || !parseFloat(price))
      return res.status(400).json({ message: "a price is required" });
    if (!stock || isNaN(parseInt(stock)))
      return res.status(400).json({ message: "stock is required" });
    if (!description) return res.status(400).json({ message: "a description is required" });

    const query =
      "insert into products (name, price, stock, description, brand, img) values (?, ?, ?, ?, ?, ?)";

    pool
      .execute(query, [
        name,
        parseFloat(price),
        parseInt(stock),
        description,
        brand || null,
        img || null,
      ])
      .then(() => res.status(201).json({ message: "product created" }))
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "internal server error" });
      });
  }

  async updateProduct(req: Request, res: Response) {
    const id = typeof req.params.id === "string" ? parseInt(req.params.id) : undefined;
    const { name, price, stock, description, brand, img } = req.body;

    if (!id || isNaN(id) || id < 0) return res.status(400).json({ message: "expected id" });

    const [result] = await pool.execute("select * from products where id=? and active=1", [id]);

    if (!(result as any).length) {
      res.status(404).json({ message: "product not found" });
      return;
    }

    const query =
      "update products set name=?, price=?, stock=?, description=?, brand=?, img=? where id=? and active=1";

    await pool
      .execute(query, [
        name || (result as any)[0].name,
        price ? parseFloat(price) : (result as any)[0].price,
        stock ? parseInt(stock) : (result as any)[0].stock,
        description || (result as any)[0].description,
        brand || (result as any)[0].brand,
        img || (result as any)[0].img,
        id,
      ])
      .then(() => res.status(200).json({ message: "product updated" }))
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "internal server error" });
      });
  }

  async deleteProductSoft(req: Request, res: Response) {
    const id = typeof req.params.id === "string" ? parseInt(req.params.id) : undefined;

    if (!id || isNaN(id) || id < 0) return res.status(400).json({ message: "expected id" });

    try {
      const [result] = (await pool.execute("update products set active=0 where id=? and active=1", [
        id,
      ])) as any;

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "product not found" });
        return;
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "internal server error" });
    }

    res.status(200).json({ message: "product deleted" });
  }

  async changePrice(req: Request, res: Response) {
    const id = typeof req.params.id === "string" ? parseInt(req.params.id) : undefined;
    const price = req.body.price;

    if (!id || isNaN(id) || id < 0) return res.status(400).json({ message: "expected id" });
    if (!price || !parseFloat(price))
      return res.status(400).json({ message: "a price is required" });

    try {
      const [result] = (await pool.execute("update products set price=? where id=? and active=1", [
        parseFloat(price),
        id,
      ])) as any;

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "product not found" });
        return;
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "internal server error" });
    }

    res.status(200).json({ message: "product price updated" });
  }
}
