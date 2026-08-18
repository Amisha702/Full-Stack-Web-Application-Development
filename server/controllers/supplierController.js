const { Supplier, Product } = require('../models');

function validateSupplier(body) {
  const { name, email, phone } = body;
  const errors = {};
  if (!name) errors.name = 'Supplier name is required.';
  if (!email) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email must be a valid format.';
  if (!phone) errors.phone = 'Phone is required.';
  return errors;
}

exports.getAll = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      include: [{ model: Product, attributes: ['id'] }],
    });
    const result = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      productCount: s.Products ? s.Products.length : 0,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load suppliers.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
    res.json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load supplier.' });
  }
};

exports.create = async (req, res) => {
  try {
    const errors = validateSupplier(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }
    const { name, email, phone } = req.body;
    const supplier = await Supplier.create({ name, email, phone });
    res.status(201).json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create supplier.' });
  }
};

exports.update = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });

    const errors = validateSupplier(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }

    const { name, email, phone } = req.body;
    await supplier.update({ name, email, phone });
    res.json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update supplier.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });

    const productCount = await Product.count({ where: { supplierId: supplier.id } });
    if (productCount > 0) {
      return res.status(409).json({
        message: 'Supplier could not be deleted because it is associated with products.',
      });
    }

    await supplier.destroy();
    res.json({ message: 'Supplier deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete supplier.' });
  }
};
