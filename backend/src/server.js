/*
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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/user', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Catálogo de Películas funcionando correctamente' });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
*/
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

// Middleware - CORS configurado
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://peliculapipe-g5oy-bnkudk9qr-jairfingers-gmailcoms-projects.vercel.app/', // ← Reemplaza con tu URL de Vercel
    'https://dakutito.github.io'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/user', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '🎬 API de Catálogo de Películas funcionando correctamente' });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});