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
const { drinks, drinksById, drinksPost, drinksPostImg } = require('../handler/drinks');
app.get('/', (req, res) => {
  res.send('Hello World')
})
app.get('/product/burgers', burgers);
app.get('/product/burgers/id=:id', burgersById);
app.post('/product/burgers', burgersPost);

app.get('/product/drinks', drinks);
app.get('/product/drinks/id=:id', drinksById);
app.post('/product/drinks', drinksPost);

