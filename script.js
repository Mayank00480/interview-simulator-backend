const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./utils/db');

connectDB().then(() => {
  console.log('Connected to the database');
  app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
})
