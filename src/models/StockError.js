const mongoose = require('mongoose');

const StockErrorSchema = mongoose.Schema({
  productName: {
    type: String,
  },
  errorCode: {
    type: String,
  },
  errorMessage: {
    type: String,
  },
});

module.exports = mongoose.model('StockError', StockErrorSchema);
