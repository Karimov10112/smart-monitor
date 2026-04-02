const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const passport = require('../config/passport');
const { requireSuperAdmin } = require('../middleware/auth');

const auth = passport.authenticate('jwt', { session: false });

// Public: Get all products
router.get('/', productController.getProducts);

// Admin: Add new product
router.post('/', auth, requireSuperAdmin, productController.addProduct);

// Admin: Update product
router.patch('/:id', auth, requireSuperAdmin, productController.updateProduct);

// Admin: Delete product
router.delete('/:id', auth, requireSuperAdmin, productController.deleteProduct);

module.exports = router;
