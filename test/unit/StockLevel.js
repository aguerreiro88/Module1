const chai = require('chai');
const chaiHTTP = require('chai-http');
const should = chai.should();
const { expect } = chai;
const mongoose = require('mongoose');
const app = require('../../index');
const controller = require('../../src/controllers/controller');
const { StockLevelSchema } = require("../../src/models/StockLevel");
const { Server, Long } = require('mongodb');
const StockLevel = mongoose.model("StockLevel", StockLevelSchema);

chai.use(chaiHTTP);

describe('Stock Level', () => {
    beforeEach((done) => {
        StockLevel.deleteOne({productName:'newProduct' }, (err) => {
            done();
        });
    });
    afterEach((done) => {
        StockLevel.deleteOne({productName:'newProduct' }, (err) => {
            done();
        });
        
    });


    it('should create a stock level', (done) => {
        let stockLevel = {
            productName:'newProduct',
            quantity: 10
        };
        chai
            .request(app)                
            .post('/stock')
            .send(stockLevel)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).should.be.a('object');
                expect(res.body.productName).to.equals('newProduct');
                expect(res.body.quantity).to.equals('10');
                done();
            });
    });
    it('should not create a stock level without quantity', (done) => {
        let stockLevel = {
            productName:'newProduct'
            };
        chai
            .request(app)
            .post('/stock')
            .send(stockLevel)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).should.be.a('object');
                expect(res.body.errorMessage).to.equals('StockLevel validation failed: quantity: Quantity is required');
                done(err);
            });
    });
    it('should not create a stock level without product name', (done) => {
        let stockLevel = {
            quantity: 10
            };
        chai
            .request(app)
            .post('/stock')
            .send(stockLevel)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).should.be.a('object');
                expect(res.body.errorMessage).to.equals('StockLevel validation failed: productName: Product Name is required');
                done(err);
            });
    });
    it('should not create a stock level for quantity < 0', (done) => {
        let stockLevel = {
            productName:'newProduct',
            quantity: -10
        };
        chai
            .request(app)                
            .post('/stock')
            .send(stockLevel)
            .end((err, res) => {            
                expect(res).to.have.status(200);
                expect(res.body).should.be.a('object');
                expect(res.body.errorMessage).to.equals('StockLevel validation failed: quantity: Quantity must be a positive number.');                
                done();
            });
    });
    it('should not create a stock level for duplicated product name', (done) => {
        let stockLevel = {
            productName:'newProduct',
            quantity: 10
        };
        const requester = chai.request(app).keepOpen();

        Promise.all([
            requester.post('/stock').send(stockLevel),
            requester.post('/stock').send(stockLevel),    
        ])
        .then((res) => {
                expect(res[1]).to.have.status(200);
                expect(res[1].body).should.be.a('object');
                expect(res[1].body.errorCode).to.equals('11000');
                done();
        })
        .then(() => requester.close());           
    });
});
describe('Decrease Stock Level', () => {
    beforeEach((done) => {
        StockLevel.deleteOne({productName:'newProduct'}, (err) => {
            done();
        });
    });
    afterEach((done) => {
        StockLevel.deleteOne({productName:'newProduct' }, (err) => {
            done();
        }); 
    });
    it('should decrease a stock level for a product', (done) => {
        let stockLevel = {
            productName:'newProduct',
            quantity: 10,
            creationDate: '2020-08-20T09:00:00.000Z',
            lastUpdate: '2020-08-20T09:00:00.000Z'
        };
      
        const requester = chai.request(app).keepOpen();

        Promise.all([
            requester.post('/stock').send(stockLevel),
            requester.put(`/stock/decreasestock/${stockLevel.productName}`)
            .send({quantity: 1}),    
        ])
        .then((res) => {
            expect(res[1]).to.have.status(200);
            expect(res[1].body).should.be.a('object');
            expect(res[1].body.quantity).to.equals('9');
            expect(res[1].body.creationDate).to.equals('2020-08-20T09:00:00.000Z');
            expect(res[1].body.lastUpdate).to.not.equals('2020-08-20T09:00:00.000Z');
            done();
        })
        .then(() => requester.close());
    });
    it('should not decrease a stock level for a product if the quantity to be decreased is higher than the StockLevel', (done) => {
        let stockLevel = {
            productName:'newProduct',
            quantity: 10
        };
      
        const requester = chai.request(app).keepOpen();

        Promise.all([
            requester.post('/stock').send(stockLevel),
            requester.put(`/stock/decreasestock/${stockLevel.productName}`)
            .send({quantity: 11}),    
        ])
        .then((res) => {
            expect(res[1]).to.have.status(200);
            expect(res[1].body).should.be.a('object');
            expect(res[1].body.errorMessage).to.equals('Quantity to be decreased is higher than the StockLevel!');
            done();
        })
        .then(() => requester.close());
    });
});
describe('Stock Level Availability', () => {
    beforeEach((done) => {
        StockLevel.deleteOne({productName:'newProduct'}, (err) => {
            done();
        });
    });
    afterEach((done) => {
        StockLevel.deleteOne({productName:'newProduct' }, (err) => {
            done();
        }); 
    });
    it('should return error if product name does not exist', (done) => {
        let productName = 'newProduct';
        chai
            .request(app)                
            .get(`/stock/${productName}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).should.be.a('object');
                expect(res.body.errorMessage).to.equals('Product Name does not exist!');
                done();
            });

    });
    it('should return OUT if quantity is 0', (done) => {
        let stockLevel = {
            productName:'newProduct',
            quantity: 0
        };

        const requester = chai.request(app).keepOpen();

        Promise.all([
            requester.post('/stock').send(stockLevel),
            requester.get(`/stock/${stockLevel.productName}`),    
        ])
        .then((res) => {
            expect(res[1]).to.have.status(200);
            expect(res[1].body).should.be.a('object');
            expect(res[1].body.stockLevelAvailability).to.equals('OUT');
            done();
        })
        .then(() => requester.close());
    });
    it('should return LOW if quantity is 1 <= 5', (done) => {
        let stockLevel = {
            productName:'newProduct',
            quantity: 2
        };

        const requester = chai.request(app).keepOpen();

        Promise.all([
            requester.post('/stock').send(stockLevel),
            requester.get(`/stock/${stockLevel.productName}`),    
        ])
        .then((res) => {
            expect(res[1]).to.have.status(200);
            expect(res[1].body).should.be.a('object');
            expect(res[1].body.stockLevelAvailability).to.equals('LOW');
            done();
        })
        .then(() => requester.close());
    });
    it('should return MEDIUM if quantity is 6 <= 15', (done) => {
        let stockLevel = {
            productName:'newProduct',
            quantity: 10
        };

        const requester = chai.request(app).keepOpen();

        Promise.all([
            requester.post('/stock').send(stockLevel),
            requester.get(`/stock/${stockLevel.productName}`),    
        ])
        .then((res) => {
            expect(res[1]).to.have.status(200);
            expect(res[1].body).should.be.a('object');
            expect(res[1].body.stockLevelAvailability).to.equals('MEDIUM');
            done();
        })
        .then(() => requester.close());
    });
    it('should return HIGH if quantity is >= 16', (done) => {
        let stockLevel = {
            productName:'newProduct',
            quantity: 20
        };

        const requester = chai.request(app).keepOpen();

        Promise.all([
            requester.post('/stock').send(stockLevel),
            requester.get(`/stock/${stockLevel.productName}`),    
        ])
        .then((res) => {
            expect(res[1]).to.have.status(200);
            expect(res[1].body).should.be.a('object');
            expect(res[1].body.stockLevelAvailability).to.equals('HIGH');
            done();
        })
        .then(() => requester.close());
    });
});

