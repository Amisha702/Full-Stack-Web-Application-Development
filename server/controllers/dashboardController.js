const { Product, Supplier } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalSuppliers = await Supplier.count();
    const lowStockProducts = await Product.count({ where: { stockQuantity: { [Op.lt]: 5 } } });
    const recentProducts = await Product.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: Supplier, attributes: ['id', 'name'] }],
    });

    res.json({ totalProducts, totalSuppliers, lowStockProducts, recentProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load dashboard stats.' });
  }
};
