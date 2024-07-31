const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

app.listen(PORT, () => {
  console.log('Server is Running');
});

const { burgers, burgersById, burgersPost, burgersPostImg } = require('./handler/burgers');
app.get('/', (req, res) => {
  res.send('Hello World')
})
app.get('/product/burgers', burgers);
app.get('/product/burgers/id=:id', burgersById);
app.post('/product/burgers', burgersPost);
app.post('/product/burgersimg', burgersPostImg);
