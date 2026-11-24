import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { api } from './src/routes/api.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', api);

app.get('/', (_req, res) => {
  res.json({ name: 'Beauty Ritual API', version: '1.0.0', docs: '/api/health, /api/config, /api/state' });
});

app.listen(PORT, () => {
  console.log(`Beauty Ritual backend listening on http://localhost:${PORT}`);
});
