const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Establecer calificación
router.post('/set', async (req, res) => {
  const { movie_id, rating } = req.body;
  const userId = req.userId;

  try {
    if (!movie_id || !rating) {
      return res.status(400).json({ error: 'movie_id y rating son requeridos' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }

    // Intentar insertar o actualizar
    const result = await pool.query(
      `INSERT INTO ratings (user_id, movie_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, movie_id)
      DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [userId, movie_id, rating]
    );

    res.json({
      message: 'Calificación guardada',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Error guardando calificación:', error);
    res.status(500).json({ error: 'Error al guardar calificación' });
  }
});

// Obtener calificación de una película
router.get('/get/:movie_id', async (req, res) => {
  const { movie_id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT rating FROM ratings WHERE user_id = $1 AND movie_id = $2',
      [userId, movie_id]
    );

    if (result.rows.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: result.rows[0].rating });
  } catch (error) {
    console.error('Error obteniendo calificación:', error);
    res.status(500).json({ error: 'Error al obtener calificación' });
  }
});

// Eliminar calificación
router.delete('/remove/:movie_id', async (req, res) => {
  const { movie_id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'DELETE FROM ratings WHERE user_id = $1 AND movie_id = $2 RETURNING *',
      [userId, movie_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calificación no encontrada' });
    }

    res.json({
      message: 'Calificación eliminada',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Error eliminando calificación:', error);
    res.status(500).json({ error: 'Error al eliminar calificación' });
  }
});

module.exports = router;