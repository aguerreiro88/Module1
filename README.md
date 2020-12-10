# Module 1::NodeJS - Stock Levels Management Challenge

## Versions
- Postman - 7.27.1 
- Visual Studio Code -  1.48.1
- body-parser - 1.19.0
- express - 4.17.1
- mongodb - 3.6.0 
- mongoose - 5.10.0
- mongoose-long - 0.3.1
- mongoose-validator - 2.1.0
- nodemon - 2.0.4
- chai - 4.2.0
- chai-http - 4.3.0
- mocha - 8.1.3

## Initialize package.js
- npm init

## Installs 
- EXPRESS 
  - npm install express
  
- MONGODB  
  - brew tap mongodb/brew
  - brew install mongodb-community@4.4
  
- MONGOOSE, MONGOOSE-VALIDATOR and MONGOOSE-LONG  
  - npm install mongodb mongoose
  - npm install mongoose-validator
  - npm install mongoose-long 
  
- BODY-PARSER 
  - npm install body-parser
  
- NODEMON
  - npm install nodemon

## Start MongoDB service
mongod --config /usr/local/etc/mongod.conf --fork

## Start Server
On the terminal, go to the project directory and start the server with the command:
- npm start

## Run Unit Tests
- npm test

## Run Scenario 1 - Create a new Stock Level for a Product
- POST a request to url - http://localhost:3000/stock 
- Body: x-www-form-urlencoded 
- Request parameters:	              
	- KEY: productName   TYPE: String	 DESCRIPTION: Name of product to be created
	- KEY: quantity	     TYPE: Number	 DESCRIPTION: Quantity for the product
    
## Run Scenario 2 - Decrease a Stock Level for a Product
- PUT request to url - http://localhost:3000/stock/decreasestock/{productName}
- Body: x-www-form-urlencoded 
- Request parameters	
  - KEY: quantity	  TYPE:Number	  DESCRIPTION:Quantity to be decreased

## Run Scenario 3 - Check the Stock Level Info
- GET request to url - http://localhost:3000/stock/{productName}
- Body: none


