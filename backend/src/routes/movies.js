const express = require('express');
const axios = require('axios');

const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Obtener películas trending
router.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=es-ES`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo trending:', error);
    res.status(500).json({ error: 'Error al obtener películas en tendencia' });
  }
});

// Obtener películas populares
router.get('/popular', async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=1`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo populares:', error);
    res.status(500).json({ error: 'Error al obtener películas populares' });
  }
});

// Obtener series recomendadas
router.get('/tv/recommended', async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&language=es-ES&page=1`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo series:', error);
    res.status(500).json({ error: 'Error al obtener series recomendadas' });
  }
});

// Buscar películas
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
  }

  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error al buscar películas' });
  }
});

// Obtener detalles de una película
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [movieResponse, creditsResponse] = await Promise.all([
      axios.get(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`
      ),
      axios.get(
        `${TMDB_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}&language=es-ES`
      )
    ]);

    res.json({
      ...movieResponse.data,
      credits: creditsResponse.data
    });
  } catch (error) {
    console.error('Error obteniendo detalles:', error);
    res.status(500).json({ error: 'Error al obtener detalles de la película' });
  }
});

module.exports = router;