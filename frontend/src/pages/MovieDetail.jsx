import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMovieDetails,
  addFavorite,
  removeFavorite,
  checkFavorite,
  setRating,
  getRating
} from '../services/api';
import AddToListModal from '../components/AddToListModal';

const MovieDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showListModal, setShowListModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovieDetails();
  }, [id]);

  const loadMovieDetails = async () => {
    try {
      const response = await getMovieDetails(id);
      setMovie(response.data);

      if (isAuthenticated) {
        const [favoriteRes, ratingRes] = await Promise.all([
          checkFavorite(id),
          getRating(id)
        ]);
        setIsFavorite(favoriteRes.data.isFavorite);
        setUserRating(ratingRes.data.rating || 0);
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión');
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(movie.id);
        setIsFavorite(false);
      } else {
        await addFavorite({
          movie_id: movie.id,
          movie_title: movie.title,
          poster_path: movie.poster_path
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error con favorito:', error);
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión');
      return;
    }

    try {
      await setRating(movie.id, rating);
      setUserRating(rating);
    } catch (error) {
      console.error('Error calificando:', error);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!movie) {
    return <div className="error">Película no encontrada</div>;
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

  return (
    <div className="movie-detail">
      {backdropUrl && (
        <div 
          className="backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}

      <div className="detail-content">
        <div className="poster-section">
          <img src={posterUrl} alt={movie.title} />
        </div>

        <div className="info-section">
          <h1>{movie.title}</h1>
          <p className="tagline">{movie.tagline}</p>

          <div className="meta-info">
            <span>⭐ {movie.vote_average?.toFixed(1)}</span>
            <span>📅 {movie.release_date}</span>
            <span>⏱️ {movie.runtime} min</span>
          </div>

          <div className="genres">
            {movie.genres?.map((genre) => (
              <span key={genre.id} className="genre-tag">
                {genre.name}
              </span>
            ))}
          </div>

          <h3>Sinopsis</h3>
          <p className="overview">{movie.overview}</p>

          {isAuthenticated && (
            <div className="user-actions">
              <button 
                className={`action-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleFavoriteToggle}
              >
                {isFavorite ? '❤️ En Favoritos' : '🤍 Agregar a Favoritos'}
              </button>

              <button 
                className="action-btn"
                onClick={() => setShowListModal(true)}
              >
                ➕ Agregar a Lista
              </button>

              <div className="rating-section">
                <span>Tu calificación: </span>
                <div className="stars-large">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= (hoveredStar || userRating) ? 'filled' : ''}`}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => handleRating(star)}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <div className="cast-section">
              <h3>Reparto Principal</h3>
              <div className="cast-grid">
                {movie.credits.cast.slice(0, 6).map((actor) => (
                  <div key={actor.id} className="cast-card">
                    {actor.profile_path ? (
                      <img 
                        src={`${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}${actor.profile_path}`}
                        alt={actor.name}
                      />
                    ) : (
                      <div className="no-image">👤</div>
                    )}
                    <p className="actor-name">{actor.name}</p>
                    <p className="character">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showListModal && (
        <AddToListModal
          movie={movie}
          onClose={() => setShowListModal(false)}
        />
      )}
    </div>
  );
};

export default MovieDetail;