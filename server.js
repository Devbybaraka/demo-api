const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/Markets');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Slime Fish API is running', database: 'PostgreSQL + Prisma' });
});

app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body contains invalid JSON' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

const requiredEnvironmentVariables = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvironmentVariables = requiredEnvironmentVariables.filter((name) => !process.env[name]);

if (missingEnvironmentVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`);
}

const port = Number(process.env.PORT) || 10000;

app.listen(port, () => {
  console.log(`Slime Fish API listening on port ${port}`);
});