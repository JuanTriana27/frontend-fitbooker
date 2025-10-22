// Crea src/components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container text-center mt-5">
            <h2>404 - Página No Encontrada</h2>
            <p>La página que buscas no existe.</p>
            <Link to="/usuarios" className="btn btn-primary">
                Volver a Usuarios
            </Link>
        </div>
    );
};

export default NotFound;