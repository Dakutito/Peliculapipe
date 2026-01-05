import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getUserFavorites,
  getUserRatings,
  getUserLists,
  getUserStats,
  removeFromList,
  removeFavorite
} from '../services/api';
import axios from 'axios';

const MyAccount = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingsWithDetails, setRatingsWithDetails] = useState([]);
  const [lists, setLists] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      const [favRes, ratingsRes, listsRes, statsRes] = await Promise.all([
        getUserFavorites(),
        getUserRatings(),
        getUserLists(),
        getUserStats()
      ]);

      setFavorites(favRes.data.favorites);
      setRatings(ratingsRes.data.ratings);
      setLists(listsRes.data.lists);
      setStats(statsRes.data.stats);

      // Cargar detalles de las películas calificadas
      if (ratingsRes.data.ratings.length > 0) {
        loadRatingsDetails(ratingsRes.data.ratings);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatingsDetails = async (ratingsData) => {
    setLoadingRatings(true);
    try {
      const detailsPromises = ratingsData.map(rating =>
        axios.get(`${import.meta.env.VITE_API_URL}/movies/${rating.movie_id}`)
          .catch(err => {
            console.error(`Error cargando película ${rating.movie_id}:`, err);
            return null;
          })
      );

      const results = await Promise.all(detailsPromises);
      
      const ratingsWithMovieDetails = ratingsData.map((rating, index) => ({
        ...rating,
        movieDetails: results[index]?.data || null
      }));

      setRatingsWithDetails(ratingsWithMovieDetails);
    } catch (error) {
      console.error('Error cargando detalles de calificaciones:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleRemoveFromList = async (itemId, listId) => {
    if (!confirm('¿Eliminar esta película de la lista?')) return;

    try {
      await removeFromList(itemId);
      // Actualizar el estado local
      setLists(prevLists =>
        prevLists.map(list =>
          list.id === listId
            ? { ...list, items: list.items.filter(item => item.id !== itemId) }
            : list
        )
      );
    } catch (error) {
      alert('Error al eliminar de la lista');
      console.error(error);
    }
  };

  const handleRemoveFavorite = async (movieId) => {
    if (!confirm('¿Eliminar de favoritos?')) return;

    try {
      await removeFavorite(movieId);
      setFavorites(prevFavs => prevFavs.filter(fav => fav.movie_id !== movieId));
      // Actualizar stats
      if (stats) {
        setStats({ ...stats, favorites: stats.favorites - 1 });
      }
    } catch (error) {
      alert('Error al eliminar de favoritos');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">Cargando tu cuenta...</div>;
  }

  const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  return (
    <div className="my-account-page">
      <div className="account-header">
        <h1>👤 Mi Cuenta</h1>
        <div className="user-info">
          <h2>{user?.nombre}</h2>
          <p>{user?.email}</p>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.favorites}</span>
              <span className="stat-label">Favoritos</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.ratings}</span>
              <span className="stat-label">Calificaciones</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.lists}</span>
              <span className="stat-label">Listas</span>
            </div>
          </div>
        )}
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => setActiveTab('favorites')}
        >
          ❤️ Favoritos
        </button>
        <button
          className={activeTab === 'ratings' ? 'active' : ''}
          onClick={() => setActiveTab('ratings')}
        >
          ⭐ Calificaciones
        </button>
        <button
          className={activeTab === 'lists' ? 'active' : ''}
          onClick={() => setActiveTab('lists')}
        >
          📋 Mis Listas
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'favorites' && (
          <div className="favorites-grid">
            {favorites.length === 0 ? (
              <p className="empty-state">No tienes favoritos aún</p>
            ) : (
              favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="movie-card-small"
                >
                  <div className="movie-poster-container">
                    <img
                      src={fav.poster_path ? `${imageBaseUrl}${fav.poster_path}` : 'https://via.placeholder.com/200x300'}
                      alt={fav.movie_title}
                      onClick={() => navigate(`/movie/${fav.movie_id}`)}
                    />
                    <button
                      className="delete-btn"
                      onClick={() => handleRemoveFavorite(fav.movie_id)}
                      title="Eliminar de favoritos"
                    >
                      ✕
                    </button>
                  </div>
                  <h4>{fav.movie_title}</h4>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="ratings-list-improved">
            {loadingRatings ? (
              <p className="loading-ratings">Cargando detalles de películas...</p>
            ) : ratingsWithDetails.length === 0 ? (
              <p className="empty-state">No has calificado ninguna película</p>
            ) : (
              ratingsWithDetails.map((rating) => (
                <div
                  key={rating.id}
                  className="rating-card"
                  onClick={() => navigate(`/movie/${rating.movie_id}`)}
                >
                  <div className="rating-poster">
                    {rating.movieDetails?.poster_path ? (
                      <img
                        src={`${imageBaseUrl}${rating.movieDetails.poster_path}`}
                        alt={rating.movieDetails.title || 'Película'}
                      />
                    ) : (
                      <div className="no-poster">🎬</div>
                    )}
                  </div>
                  
                  <div className="rating-info">
                    <h4>{rating.movieDetails?.title || `Película ID: ${rating.movie_id}`}</h4>
                    <div className="rating-meta">
                      <div className="stars-display">
                        {'⭐'.repeat(rating.rating)}
                        <span className="rating-number">({rating.rating}/5)</span>
                      </div>
                      <span className="rating-date">
                        {new Date(rating.updated_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {rating.movieDetails?.overview && (
                      <p className="rating-overview">
                        {rating.movieDetails.overview.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'lists' && (
          <div className="lists-container">
            {lists.length === 0 ? (
              <p className="empty-state">No tienes listas creadas</p>
            ) : (
              lists.map((list) => (
                <div key={list.id} className="list-cardd">
                  <h3>{list.name}</h3>
                  {list.description && <p className="list-description">{list.description}</p>}
                  <span className="item-count">{list.items.length} películas</span>
                  
                  {list.items.length === 0 ? (
                    <p className="empty-list">Esta lista está vacía</p>
                  ) : (
                    <div className="list-movies-grid">
                      {list.items.map((item) => (
                        <div key={item.id} className="list-movie-item">
                          <div className="list-movie-poster">
                            <img
                              src={item.poster_path ? `${imageBaseUrl}${item.poster_path}` : 'https://via.placeholder.com/100x150'}
                              alt={item.movie_title}
                              onClick={() => navigate(`/movie/${item.movie_id}`)}
                            />
                            </div><button
                              className="remove-from-list-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromList(item.id, list.id);
                              }}
                              title="Eliminar de la lista"
                            >
                              ✕
                            </button>
                          
                          <p className="list-movie-title">{item.movie_title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;