const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

app.listen(PORT, () => {
  console.log('Server is Running');
});

const { burgers, burgersById, burgersPost } = require('./handler/burgers');

app.get('/product/burgers', burgers);
app.get('/product/burgers/id=:id', burgersById);
app.post('/product/burgers', burgersPost);
