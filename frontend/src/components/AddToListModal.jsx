import React, { useState, useEffect } from 'react';
import { getMyLists, createList, addToList } from '../services/api';

const AddToListModal = ({ movie, onClose }) => {
  const [lists, setLists] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const response = await getMyLists();
      setLists(response.data.lists);
    } catch (error) {
      console.error('Error cargando listas:', error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setLoading(true);
    try {
      await createList(newListName, newListDescription);
      setNewListName('');
      setNewListDescription('');
      setShowCreateForm(false);
      await loadLists();
    } catch (error) {
      alert('Error al crear lista');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (listId) => {
    setLoading(true);
    try {
      await addToList(listId, {
        movie_id: movie.id,
        movie_title: movie.title || movie.name,
        poster_path: movie.poster_path
      });
      alert('Película agregada a la lista');
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al agregar a la lista');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agregar a Lista</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="movie-title">{movie.title || movie.name}</p>

          {!showCreateForm ? (
            <>
              <div className="lists-container">
                {lists.length === 0 ? (
                  <p className="no-lists">No tienes listas aún</p>
                ) : (
                  lists.map((list) => (
                    <div
                      key={list.id}
                      className="list-item"
                      onClick={() => handleAddToList(list.id)}
                    >
                      <div>
                        <h4>{list.name}</h4>
                        <p>{list.items_count} películas</p>
                      </div>
                      <span>→</span>
                    </div>
                  ))
                )}
              </div>

              <button
                className="create-list-btn"
                onClick={() => setShowCreateForm(true)}
              >
                ➕ Crear Nueva Lista
              </button>
            </>
          ) : (
            <form onSubmit={handleCreateList} className="create-list-form">
              <input
                type="text"
                placeholder="Nombre de la lista"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                required
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                rows="3"
              />
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Creando...' : 'Crear Lista'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToListModal;