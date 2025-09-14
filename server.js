import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import requestLogger from './src/middlewares/requestLogger.js';
import errorHandler from './src/middlewares/errorHandler.js';
import faqRoutes from './src/routes/faqRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import queryRoutes from './src/routes/queryRoutes.js';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger.requestLogger);
app.use('/api/faqs', faqRoutes);
app.use('/api/users', userRoutes);
app.use('/api/queries', queryRoutes);
app.use(errorHandler.errorHandler);
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});