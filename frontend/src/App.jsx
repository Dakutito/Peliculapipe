import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import MyAccount from './pages/MyAccount';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <div className="home-page">
              <h2>Gestión de peliculas y series</h2>
              <span>Hecho por Tito Pérez y Alan Moreira</span>
            </div>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/my-account" element={<MyAccount />} />
            </Routes>

          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
