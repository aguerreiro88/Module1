const mongoose = require('mongoose');

const StockLevelInfoSchema = mongoose.Schema({
  stockLevelAvailability: {
    type: String,
    required: true,
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StockLevelInfo', StockLevelInfoSchema);
