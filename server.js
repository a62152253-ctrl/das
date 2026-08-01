import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// CORS self-contained middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Admin dashboard analytics stats endpoint
app.get('/api/admin-stats', (req, res) => {
  const stats = {
    monthlyRevenue: [
      { month: 'Mar', amount: 1200 },
      { month: 'Apr', amount: 1900 },
      { month: 'May', amount: 2400 },
      { month: 'Jun', amount: 3100 },
      { month: 'Jul', amount: 4800 }
    ],
    registrationTrends: [
      { name: 'Mieszkańcy', count: 120 },
      { name: 'Firmy', count: 45 },
      { name: 'Administratorzy', count: 3 }
    ],
    popularCategories: [
      { category: 'Uroda', searches: 450 },
      { category: 'Motoryzacja', searches: 320 },
      { category: 'Gastronomia', searches: 290 },
      { category: 'Usługi domowe', searches: 180 }
    ]
  };
  res.json(stats);
});

// Static assets handler
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Lokalnie Backend] Server successfully launched on port ${PORT}`);
});
