const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const favoritesRoutes = require('./routes/favorites');
const ratingsRoutes = require('./routes/ratings');
const listsRoutes = require('./routes/lists');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS (ANTES DE LAS RUTAS)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://peliculapipe.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/user', userRoutes);

// Ruta base API
app.get('/api', (req, res) => {
  res.json({
    message: 'API de Películas funcionando correctamente (Docker)',
    status: 'OK'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: '🎬 API de Catálogo de Películas funcionando correctamente' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Start
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
