const {
  createNewStockLevel,
  getStockLevel,
  getStockLevelForProduct,
  decreaseStockLevel,
} = require('../controllers/controller');

const routes = (app) => {
  app.route('/stock').get(getStockLevel).post(createNewStockLevel);

  app.route('/stock/:productName').get(getStockLevelForProduct);

  app.route('/stock/decreasestock/:productName').put(decreaseStockLevel);
};

module.exports = routes;
