const { Product, Supplier } = require('../models');
const { Op } = require('sequelize');

function validateProduct(body) {
  const { name, description, price, stockQuantity, supplierId } = body;
  const errors = {};
  if (!name) errors.name = 'Product name is required.';
  if (!description) errors.description = 'Description is required.';
  if (price === undefined || price === '') errors.price = 'Price is required.';
  else if (Number(price) < 0) errors.price = 'Price cannot be negative.';
  if (stockQuantity === undefined || stockQuantity === '') errors.stockQuantity = 'Stock quantity is required.';
  else if (Number(stockQuantity) < 0) errors.stockQuantity = 'Stock quantity cannot be negative.';
  if (!supplierId) errors.supplierId = 'Supplier is required.';
  return errors;
}

exports.getAll = async (req, res) => {
  try {
    const { search, supplierId } = req.query;
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (supplierId) where.supplierId = supplierId;

    const products = await Product.findAll({
      where,
      include: [{ model: Supplier, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load products.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Supplier, attributes: ['id', 'name'] }],
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load product.' });
  }
};

exports.create = async (req, res) => {
  try {
    const errors = validateProduct(req.body);

    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors,
      });
    }

    const { name, description, price, stockQuantity, supplierId } = req.body;

    const supplier = await Supplier.findByPk(supplierId);

    if (!supplier) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: {
          supplierId: 'Selected supplier does not exist.',
        },
      });
    }

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const product = await Product.create({
      name,
      description,
      price,
      stockQuantity,
      supplierId,
      imageUrl,
    });

    // Reload the product with its supplier
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(201).json(createdProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Unable to create product.',
    });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const errors = validateProduct(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }

    const { name, description, price, stockQuantity, supplierId } = req.body;
    const updates = { name, description, price, stockQuantity, supplierId };
    if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;

    await product.update(updates);

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update product.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    await product.destroy();
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete product.' });
  }
};
