const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener favoritos del usuario
router.get('/favorites', async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ favorites: result.rows });
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// Obtener calificaciones del usuario
router.get('/ratings', async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM ratings WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );

    res.json({ ratings: result.rows });
  } catch (error) {
    console.error('Error obteniendo calificaciones:', error);
    res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
});

// Obtener todas las listas del usuario con sus items
router.get('/lists', async (req, res) => {
  const userId = req.userId;

  try {
    // Obtener listas
    const listsResult = await pool.query(
      'SELECT * FROM lists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // Para cada lista, obtener sus items
    const listsWithItems = await Promise.all(
      listsResult.rows.map(async (list) => {
        const itemsResult = await pool.query(
          'SELECT * FROM list_items WHERE list_id = $1 ORDER BY created_at DESC',
          [list.id]
        );
        return {
          ...list,
          items: itemsResult.rows
        };
      })
    );

    res.json({ lists: listsWithItems });
  } catch (error) {
    console.error('Error obteniendo listas:', error);
    res.status(500).json({ error: 'Error al obtener listas' });
  }
});

// Obtener perfil del usuario
router.get('/profile', async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Obtener estadísticas del usuario
router.get('/stats', async (req, res) => {
  const userId = req.userId;

  try {
    const [favoritesCount, ratingsCount, listsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM favorites WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM ratings WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM lists WHERE user_id = $1', [userId])
    ]);

    res.json({
      stats: {
        favorites: parseInt(favoritesCount.rows[0].count),
        ratings: parseInt(ratingsCount.rows[0].count),
        lists: parseInt(listsCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;