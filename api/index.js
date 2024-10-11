const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
  res.send('Hello');
});

module.exports = app;
