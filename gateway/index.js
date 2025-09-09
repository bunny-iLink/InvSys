// index.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import data from './config/config.js';
import { router } from './routes/routes.js';

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use('/api', router); 

app.get('/', (req, res) => {
  res.send('Welcome to the API Gateway');
});

app.listen(data.PORT, () => {
  console.log(`API Gateway is running on http://localhost:${data.PORT}`);
});
