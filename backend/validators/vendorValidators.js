const { body } = require('express-validator');

const vendorValidator = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('category').notEmpty().withMessage('Category is required').isIn([
    'Electronics', 'Furniture', 'Clothing', 'Food & Beverages',
    'Raw Materials', 'Machinery', 'Chemicals', 'Packaging',
    'IT Services', 'Logistics', 'Other',
  ]),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode').trim().notEmpty().withMessage('Pincode is required'),
];

const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required').toUpperCase(),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

module.exports = { vendorValidator, productValidator };
