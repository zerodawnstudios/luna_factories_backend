import express from 'express';
import { connectDB } from './src/config/db.js';
import cors from 'cors';
import userRoute from './src/routes/user_route.js';
import cookieParser from 'cookie-parser';

const app = express();
const corsOptions = {
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

app.use(cookieParser());

app.use('/api/users', userRoute);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

export default app;
