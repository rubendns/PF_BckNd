import productsService from "../dao/products.dao.js";

async function getAllProducts(req, res) {
	try {
		const { limit = 10, page = 1, sort } = req.query;
		const products = await productsService.getAllProducts(page, limit, sort);
		res.json(products);
	} catch (error) {
		res.status(400).json(error);
	}
}

async function getProductById(req, res) {
	try {
		const pid = req.params.pid;
		const product = await productsService.getProductById(pid);
		if (!product) {
		return res.status(404).json({ message: "Product not found" });
		}
		res.json({
		message: "success",
		product,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function createProduct(req, res) {
	try {
		const product = req.body;
		await productsService.createProduct(product);
		res.redirect("/productManager");
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function updateProduct(req, res) {
	try {
		const pid = req.params.pid;
		const product = req.body;
		const updatedProduct = await productsService.updateProduct(pid, product);
		if (!updatedProduct) {
		return res.status(404).json({ message: "Product not found" });
		}
		res.json({
		message: "success",
		updatedProduct,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function deleteProduct(req, res) {
	try {
		const pid = req.params.pid;
		const deletedProduct = await productsService.deleteProduct(pid);
		if (!deletedProduct) {
		return res.status(404).json({ message: "Product not found" });
		}
		res.json({
		message: "Product deleted",
		deletedProduct,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

async function updateStock(prod, qtty) {
	const productId = prod._id;
	const actualStock = prod.stock;
	const updatedStock = actualStock - qtty;
	try {
		const updatedProduct = await productsService.updateStock(
		productId,
		updatedStock
		);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

export {
	getAllProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
	updateStock,
};
