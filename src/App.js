import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

// Importar componentes/páginas
import Navbar from './components/Navbar';
import UsuarioList from './pages/UsuarioList';
import HorarioList from './pages/HorarioList';
import ClaseList from './pages/ClaseList';
import ReservaList from './pages/ReservaList';
import Ia from './pages/ia';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/usuarios" replace />} />
            <Route path="/usuarios" element={<UsuarioList />} />
            <Route path="/horarios" element={<HorarioList />} />
            <Route path="/clases" element={<ClaseList />} />
            <Route path="/reservas" element={<ReservaList />} />
            <Route path="/ia" element={<Ia />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;