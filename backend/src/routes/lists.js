const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear nueva lista
router.post('/create', async (req, res) => {
  const { name, description } = req.body;
  const userId = req.userId;

  try {
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la lista es requerido' });
    }

    const result = await pool.query(
      'INSERT INTO lists (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, description || '']
    );

    res.status(201).json({
      message: 'Lista creada exitosamente',
      list: result.rows[0]
    });
  } catch (error) {
    console.error('Error creando lista:', error);
    res.status(500).json({ error: 'Error al crear lista' });
  }
});

// Obtener todas las listas del usuario
router.get('/my-lists', async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT l.*, COUNT(li.id) as items_count
        FROM lists l
        LEFT JOIN list_items li ON l.id = li.list_id
        WHERE l.user_id = $1
        GROUP BY l.id
        ORDER BY l.created_at DESC`,
      [userId]
    );

    res.json({ lists: result.rows });
  } catch (error) {
    console.error('Error obteniendo listas:', error);
    res.status(500).json({ error: 'Error al obtener listas' });
  }
});

// Obtener items de una lista específica
router.get('/:list_id/items', async (req, res) => {
  const { list_id } = req.params;
  const userId = req.userId;

  try {
    // Verificar que la lista pertenece al usuario
    const listCheck = await pool.query(
      'SELECT id FROM lists WHERE id = $1 AND user_id = $2',
      [list_id, userId]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const result = await pool.query(
      'SELECT * FROM list_items WHERE list_id = $1 ORDER BY created_at DESC',
      [list_id]
    );

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Error obteniendo items de lista:', error);
    res.status(500).json({ error: 'Error al obtener items de lista' });
  }
});

// Agregar película a lista
router.post('/add-item', async (req, res) => {
  const { list_id, movie_id, movie_title, poster_path } = req.body;
  const userId = req.userId;

  try {
    if (!list_id || !movie_id || !movie_title) {
      return res.status(400).json({ error: 'list_id, movie_id y movie_title son requeridos' });
    }

    // Verificar que la lista pertenece al usuario
    const listCheck = await pool.query(
      'SELECT id FROM lists WHERE id = $1 AND user_id = $2',
      [list_id, userId]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    // Verificar si ya existe en la lista
    const existing = await pool.query(
      'SELECT id FROM list_items WHERE list_id = $1 AND movie_id = $2',
      [list_id, movie_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'La película ya está en esta lista' });
    }

    const result = await pool.query(
      'INSERT INTO list_items (list_id, movie_id, movie_title, poster_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [list_id, movie_id, movie_title, poster_path]
    );

    res.status(201).json({
      message: 'Película agregada a la lista',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Error agregando item a lista:', error);
    res.status(500).json({ error: 'Error al agregar película a la lista' });
  }
});

// Remover película de lista
router.delete('/remove-item/:item_id', async (req, res) => {
  const { item_id } = req.params;
  const userId = req.userId;

  try {
    // Verificar que el item pertenece a una lista del usuario
    const result = await pool.query(
      `DELETE FROM list_items
      WHERE id = $1
      AND list_id IN (SELECT id FROM lists WHERE user_id = $2)
       RETURNING *`,
      [item_id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json({
      message: 'Película eliminada de la lista',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Error eliminando item de lista:', error);
    res.status(500).json({ error: 'Error al eliminar película de la lista' });
  }
});

// Eliminar lista completa
router.delete('/:list_id', async (req, res) => {
  const { list_id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'DELETE FROM lists WHERE id = $1 AND user_id = $2 RETURNING *',
      [list_id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    res.json({
      message: 'Lista eliminada exitosamente',
      list: result.rows[0]
    });
  } catch (error) {
    console.error('Error eliminando lista:', error);
    res.status(500).json({ error: 'Error al eliminar lista' });
  }
});

module.exports = router;