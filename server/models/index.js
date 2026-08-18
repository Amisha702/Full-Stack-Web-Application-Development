const sequelize = require('../config/database');
const User = require('./User');
const Supplier = require('./Supplier');
const Product = require('./Product');

// A supplier can have many products; a product belongs to one supplier.
// onDelete: 'RESTRICT' backs up the app-level check in supplierController
// that blocks deleting a supplier that still has products.
Supplier.hasMany(Product, { foreignKey: 'supplierId', onDelete: 'RESTRICT' });
Product.belongsTo(Supplier, { foreignKey: 'supplierId' });

module.exports = { sequelize, User, Supplier, Product };
