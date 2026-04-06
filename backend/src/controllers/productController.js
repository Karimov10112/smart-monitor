const productRepository = require('../repositories/ProductRepository');

// Get all products with filters
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { 'name.uz': { $regex: search, $options: 'i' } },
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
      ];
    }

    const products = await productRepository.find(query, { sort: { 'name.uz': 1 } });
    res.json({ success: true, products });
  } catch (err) {
    console.error('Get products error:', err.message);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Admin: Add new product
const addProduct = async (req, res) => {
  try {
    const product = await productRepository.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Add product error:', err.message);
    res.status(500).json({ success: false, message: 'Mahsulot qo\'shishda xato' });
  }
};

// Admin: Update product
const updateProduct = async (req, res) => {
  try {
    const product = await productRepository.findByIdAndUpdate(req.params.id, req.body);
    if (!product) return res.status(404).json({ success: false, message: 'Topilmadi' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Yangilashda xato' });
  }
};

// Admin: Delete product (Soft delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await productRepository.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!product) return res.status(404).json({ success: false, message: 'Topilmadi' });
    res.json({ success: true, message: 'Mahsulot o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'O\'chirishda xato' });
  }
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
