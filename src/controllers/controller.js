const mongoose = require('mongoose');
const { StockLevelSchema } = require('../models/StockLevel');
const { StockErrorSchema } = require('../models/StockError');
const { StockLevelInfoSchema } = require('../models/StockLevelInfo');

const StockLevel = mongoose.model('StockLevel', StockLevelSchema);
const StockError = mongoose.model('StockError', StockErrorSchema);
const StockLevelInfo = mongoose.model('StockLevelInfo', StockLevelInfoSchema);

async function createNewStockError(request, response, err, msg, code) {
  let newStockError = new StockError({
    productName: request.body.productName
      ? request.body.productName
      : request.params.productName,
    errorCode: code ? code : err.code,
    errorMessage: msg ? msg : err.message,
  });
  // StockError.findOne(
  //   {
  //     productName: newStockError.productName,
  //     errorCode: newStockError.errorCode,
  //     errorMessage: newStockError.errorMessage,
  //   },
  //   (err) => {
  //     if (err) {
  //       response.send(err);
  //     } else {
  //       response.send(newStockError);
  //     }
  //   }
  // );
  newStockError.save((err) => {
    if (err) {
      response.send(err);
    }
    response.send(newStockError);
  });
}

async function createNewStockLevel(request, response) {
  let newStockLevel = new StockLevel(request.body);
  newStockLevel.save((err, stockLevel) => {
    if (err) {
      createNewStockError(request, response, err);
    } else {
      response.json(stockLevel);
    }
  });
}

async function createNewStockLevelInfo(
  newstockLevelAvailability,
  request,
  response
) {
  StockLevelInfo.findOneAndUpdate(
    { stockLevelAvailability: newstockLevelAvailability },
    { lastUpdate: new Date() },
    { upsert: true, new: true, useFindAndModify: false },
    (err, newStockLevelInfo) => {
      if (err) {
        createNewStockError(request, response, err);
      } else {
        response.send(newStockLevelInfo);
      }
    }
  );
}

async function checkStockLevelAvailability(quantity, request, response) {
  if (quantity < 1) {
    createNewStockLevelInfo('OUT', request, response);
  } else if (quantity > 0 && quantity <= 5) {
    createNewStockLevelInfo('LOW', request, response);
  } else if (quantity > 5 && quantity <= 15) {
    createNewStockLevelInfo('MEDIUM', request, response);
  } else if (quantity >= 16) {
    createNewStockLevelInfo('HIGH', request, response);
  }
}

async function getStockLevel(request, response) {
  StockLevel.find((err, stockLevel) => {
    if (err) {
      response.send(err);
    } else {
      response.json(stockLevel);
    }
  });
}

async function decreaseStockLevel(request, response) {
  StockLevel.findOne(
    { productName: request.params.productName },
    (err, stockLevel) => {
      try {
        if (err) {
          response.send(err);
        }
        if (Number(request.body.quantity) > Number(stockLevel.quantity)) {
          const msg = 'Quantity to be decreased is higher than the StockLevel!';
          const code = '0001';
          createNewStockError(request, response, err, msg, code);
        } else {
          if (Number(request.body.quantity) < 0) {
            const code = '0002';
            const msg = 'Quantity to be decreased needs to be a positive number!';
            createNewStockError(request, response, err, msg, code);
          } else {
            stockLevel.quantity -= request.body.quantity;
            stockLevel.lastUpdate = new Date();
            stockLevel.creationDate = stockLevel.creationDate;

            stockLevel.save((err) => {
              if (err) {
                createNewStockError(request, response, err);
              } else {
                response.json(stockLevel);
              }
            });
          }
        }
      } catch (e) {
        createNewStockError(request, response, e);
      }
    }
  );
}

async function getStockLevelForProduct(request, response) {
  StockLevel.findOne(
    { productName: request.params.productName },
    (err, stockLevel) => {
      if (err) {
        createNewStockError(request, response, err);
      } else {
        if(!stockLevel){
          const code = '0003';
          const msg = 'Product Name does not exist!';
          createNewStockError(request, response, err, msg, code);
        } else {
          checkStockLevelAvailability(stockLevel.quantity, request, response);
        }
      }
    }
  );
}

module.exports = {
  createNewStockLevel,
  getStockLevel,
  getStockLevelForProduct,
  decreaseStockLevel,
};
