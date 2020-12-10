const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
const Long = mongoose.Schema.Types.Long;
const validate = require('mongoose-validator');

const quantityValidator = [
  validate({
    validator: (val) => {
      return val >= 0;
    },
    message: 'Quantity must be a positive number.',
  }),
];

const StockLevelSchema = mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product Name is required'],
    index: { unique: true },
  },
  quantity: {
    type: Long,
    required: [true, 'Quantity is required'],
    validate: quantityValidator,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StockLevel', StockLevelSchema);
