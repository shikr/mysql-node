import { Router } from "express";
import { ProductController } from "../controllers/products.controller.js";

const router = Router();
const productController = new ProductController();

router.get("/getAll", productController.getProducts);
router.get("/getById/:id", productController.getById);
router.post("/create", productController.createProduct);
router.put("/update/:id", productController.updateProduct);
router.delete("/delete/:id", productController.deleteProductSoft);
router.patch("/change-price/:id", productController.changePrice);

export default router;
