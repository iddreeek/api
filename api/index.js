const express = require('express');
const app = express();
const cors = require('cors')
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log('Server is Running');
});

const { burgers, burgersById, burgersPost } = require('../handler/burgers');
const { drinks, drinksById, drinksPost } = require('../handler/drinks');
const { products, productsPost} = require("../handler/products")
app.get('/product/burgers', burgers);
app.get('/product/burgers/id=:id', burgersById);
app.post('/product/burger', burgersPost);

app.get('/product/drinks', drinks);
app.get('/product/drinks/id=:id', drinksById);
app.post('/product/drink', drinksPost);

app.get('/products', products);
app.post('/products', productsPost)