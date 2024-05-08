import CustomRouter from "./custom/custom.router.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/products.controller.js";
import { isOwnerMiddleware } from "../middlewares/owner.middleware.js";

export default class ProductRouter extends CustomRouter {
  init() {
    this.get("/:id", ["PUBLIC"], async (req, res) => {
      getProductById(req, res);
    });

    this.get("/", ["PUBLIC"], async (req, res) => {
      getAllProducts(req, res);
    });

    this.post("/", ["ADMIN", "PREMIUM"], async (req, res) => {
      createProduct(req, res);
    });

    this.put(
      "/:id",
      ["ADMIN", "PREMIUM"],
      isOwnerMiddleware,
      async (req, res) => {
        updateProduct(req, res);
      }
    );

    this.delete(
      "/:id",
      ["ADMIN", "PREMIUM"],
      isOwnerMiddleware,
      async (req, res) => {
        deleteProduct(req, res);
      }
    );
  }
}
