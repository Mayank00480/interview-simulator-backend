const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./utils/db');
const userRouter = require('./router/user');
const interviewRouter = require('./router/interview');


app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRouter);
app.use('/api/interviews', interviewRouter);

connectDB().then(() => {
  console.log('Connected to the database');
  app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
})
