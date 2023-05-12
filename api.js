import express from 'express';
import emailRoutes from './src/routes/emails.routes';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/emails', emailRoutes);

app.listen(3000, () => {
  console.log('Server is running on Port 3000');
});
