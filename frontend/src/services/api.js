import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Películas
export const getTrending = () => axios.get(`${API_URL}/movies/trending`);
export const getPopular = () => axios.get(`${API_URL}/movies/popular`);
export const getTVRecommended = () => axios.get(`${API_URL}/movies/tv/recommended`);
export const searchMovies = (query) => axios.get(`${API_URL}/movies/search?query=${query}`);
export const getMovieDetails = (id) => axios.get(`${API_URL}/movies/${id}`);

// Favoritos
export const addFavorite = (movieData) => axios.post(`${API_URL}/favorites/add`, movieData);
export const removeFavorite = (movieId) => axios.delete(`${API_URL}/favorites/remove/${movieId}`);
export const checkFavorite = (movieId) => axios.get(`${API_URL}/favorites/check/${movieId}`);
export const getUserFavorites = () => axios.get(`${API_URL}/user/favorites`);

// Calificaciones
export const setRating = (movieId, rating) => axios.post(`${API_URL}/ratings/set`, { movie_id: movieId, rating });
export const getRating = (movieId) => axios.get(`${API_URL}/ratings/get/${movieId}`);
export const removeRating = (movieId) => axios.delete(`${API_URL}/ratings/remove/${movieId}`);
export const getUserRatings = () => axios.get(`${API_URL}/user/ratings`);

// Listas
export const createList = (name, description) => axios.post(`${API_URL}/lists/create`, { name, description });
export const getMyLists = () => axios.get(`${API_URL}/lists/my-lists`);
export const getListItems = (listId) => axios.get(`${API_URL}/lists/${listId}/items`);
export const addToList = (listId, movieData) => axios.post(`${API_URL}/lists/add-item`, { list_id: listId, ...movieData });
export const removeFromList = (itemId) => axios.delete(`${API_URL}/lists/remove-item/${itemId}`);
export const deleteList = (listId) => axios.delete(`${API_URL}/lists/${listId}`);
export const getUserLists = () => axios.get(`${API_URL}/user/lists`);

// Usuario
export const getUserStats = () => axios.get(`${API_URL}/user/stats`);