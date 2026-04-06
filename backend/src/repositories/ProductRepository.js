const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }
}

module.exports = new ProductRepository();
