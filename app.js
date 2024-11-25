const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const articlesRouter = require('./routes/articles');

const app = express();
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Personal Blog API is running!');
});


app.use('/articles', articlesRouter);

module.exports = app;
