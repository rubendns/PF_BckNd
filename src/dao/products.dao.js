import { productModel } from "../models/products.model.js";

class ProductDao {
  async getAllProducts({
    limit = 10,
    page = 1,
    sort = "asc",
    category = "all",
  }) {
    let filter = {
      status: true,
    };

    if (category.toLowerCase() !== "all") {
      filter.category = category;
    }

    const sorted = sort === "asc" ? 1 : -1;
    try {
      const result = await productModel.paginate(filter, {
        limit: limit,
        page: page,
        sort: { price: sorted },
      });
      if (page > result.totalPages) {
        throw new Error("Requested page exceeds total pages");
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getProductById(productId) {
    try {
      return await productModel.findById(productId);
    } catch (error) {
      throw error;
    }
  }

  async addProduct(productData) {
    try {
      await productModel.create(productData);
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(productId, updatedData) {
    try {
      return await productModel.findByIdAndUpdate(productId, updatedData);
    } catch (error) {
      throw error;
    }
  }

  async updateStock(productId, qtty) {
    try {
      return await productModel.updateOne(
        { _id: productId },
        { $set: { stock: qtty } }
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      return await productModel.findByIdAndDelete(productId);
    } catch (error) {
      throw error;
    }
  }
}

export default ProductDao;
