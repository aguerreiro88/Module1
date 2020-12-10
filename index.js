const express = require('express');
const routes = require('./src/routes/routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

//mongoose connection
mongoose.Promise = global.Promise;
mongoose
  .connect('mongodb://localhost/STOCKdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('Database connected successfully');
  },
  error => {
    console.log('Could not connect to database: ' + error);
  });

//body-parser setup
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

routes(app);

app.get('/', (request, response) => {
  response.send('Hello Express');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}!`);
});

module.exports = app;