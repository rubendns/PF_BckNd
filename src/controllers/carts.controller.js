import { cartService } from "../services/repository/services.js";
import { updateStock } from "./products.controller.js";
import { createTicket } from "../controllers/tickets.controller.js";
import { sendEmail } from "./email.controller.js";

async function getAllCarts(req, res) {
  try {
    let carts = await cartService.getAllCarts();
    res.json({
      status: "success",
      carts,
    });
  } catch (error) {
    res.json({
      status: "Error",
      error,
    });
  }
}

async function getCartById(req, res) {
  try {
    let cid = req.params.cid;
    let cart = await cartService.getCartById(cid);
    res.json({
      status: "success",
      cart,
    });
  } catch (error) {
    res.send(error.message);
  }
}

async function getCartByUserIdController(req, res) {
  const userId = req.params.uid;
  try {
    const cart = await cartService.getCartByUserId(userId);
    if (!cart) {
      await cartService.createCart(userId);
    }
    res.render("cart", {
      fileCss: "styles.css",
      fileJs: "main.scripts.js",
      user: req.session.user,
      cart: cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createCart(req, res) {
  try {
    let cart = await cartService.createCart();
    res.json({
      status: "success",
      cart,
    });
  } catch (error) {
    res.json({
      status: "Error",
      error,
    });
  }
}

async function addProductToCartById(req, res) {
  const anID = req.params.cid;
  const productID = req.params.pid;
  const qtty = req.params.qtty;
  try {
    const updatedCart = await cartService.addProductToCart(
      anID,
      productID,
      qtty
    );
    if (!updatedCart) {
      return res.status(404).json({ error: "carrito no actualizado" });
    }
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteWholeCart(req, res) {
  const cartID = req.params.cid;
  try {
    const updatedCart = await cartDao.deleteCart(cartID);
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteProductFromCartById(req, res) {
  const cartID = req.params.cid;
  const productID = req.params.pid;
  try {
    const updatedCart = await cartService.deleteProductFromCart(
      cartID,
      productID
    );
    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito no actualizado" });
    }
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteProductFromCart(cartId, productId) {
  try {
    const url = `/api/carts/${cartId}/product/${productId}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error deleting product from cart`);
    }
    alert("Product deleted from cart");
    location.reload();
  } catch (error) {
    alert("Error deleting product from cart. Please try again.");
  }
}

async function updateCart(req, res) {
  try {
    let cid = req.params.cid;
    let products = req.body;
    let response = await cartService.updateCart(cid, products);
    res.json({
      status: "success",
      response,
    });
  } catch (error) {
    res.send(error.message);
  }
}

async function updateProductQuantity(req, res) {
  try {
    let cid = req.params.cid;
    let pid = req.params.pid;
    let quantity = req.body.quantity;
    let response = await cartService.updateProductQuantity(cid, pid, quantity);
    res.json({
      status: "success",
      response,
    });
  } catch (error) {
    res.send(error.message);
  }
}

async function deleteCart(req, res) {
  try {
    let cid = req.params.cid;
    await cartService.deleteCart(cid);
    res.json({
      status: "success",
      message: "Cart deleted",
    });
  } catch (error) {
    res.send(error.message);
  }
}

async function purchaseCart(cartId) {
  try {
    const url = `/api/carts/${cartId}/purchase`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error purchasing cart`);
    }
    alert("Cart purchased successfully");
    location.reload();
  } catch (error) {
    alert("Error purchasing cart. Please try again.");
  }
}

function evaluateStock(productsFromCart) {
  const validProducts = [];
  const invalidProducts = [];
  productsFromCart.forEach((product) => {
    if (product.quantity <= product.productId.stock) {
      validProducts.push(product);
    } else {
      invalidProducts.push(product);
    }
  });
  return { validProducts, invalidProducts };
}

export {
  purchaseCart,
  getAllCarts,
  getCartById,
  getCartByUserIdController,
  createCart,
  addProductToCartById,
  deleteProductFromCart,
  deleteWholeCart,
  deleteProductFromCartById,
  updateCart,
  updateProductQuantity,
  deleteCart,
};
