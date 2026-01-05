const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Agregar a favoritos
router.post('/add', async (req, res) => {
  const { movie_id, movie_title, poster_path } = req.body;
  const userId = req.userId;

  try {
    if (!movie_id || !movie_title) {
      return res.status(400).json({ error: 'movie_id y movie_title son requeridos' });
    }

    // Verificar si ya existe
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, movie_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'La película ya está en favoritos' });
    }

    const result = await pool.query(
      'INSERT INTO favorites (user_id, movie_id, movie_title, poster_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, movie_id, movie_title, poster_path]
    );

    res.status(201).json({
      message: 'Agregado a favoritos',
      favorite: result.rows[0]
    });
  } catch (error) {
    console.error('Error agregando favorito:', error);
    res.status(500).json({ error: 'Error al agregar a favoritos' });
  }
});

// Remover de favoritos
router.delete('/remove/:movie_id', async (req, res) => {
  const { movie_id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2 RETURNING *',
      [userId, movie_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorito no encontrado' });
    }

    res.json({
      message: 'Eliminado de favoritos',
      favorite: result.rows[0]
    });
  } catch (error) {
    console.error('Error eliminando favorito:', error);
    res.status(500).json({ error: 'Error al eliminar de favoritos' });
  }
});

// Verificar si es favorito
router.get('/check/:movie_id', async (req, res) => {
  const { movie_id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, movie_id]
    );

    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Error verificando favorito:', error);
    res.status(500).json({ error: 'Error al verificar favorito' });
  }
});

module.exports = router;