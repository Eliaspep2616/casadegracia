import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';
import './NotFound.css'; // Asegúrate de crear este archivo

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">¡Uy! Te has desviado un poco.</h2>
        <p className="error-text">
          La página que estás buscando no existe, ha sido movida o simplemente se perdió en el espacio.
          Pero no te preocupes, siempre puedes volver a casa.
        </p>
        
        <div className="error-buttons">
          <button onClick={() => window.history.back()} className="btn-glass-white">
            <ArrowLeft size={18} style={{ marginRight: '8px' }} />
            REGRESAR
          </button>
          <Link to="/" className="btn-glass-dark">
            <HomeIcon size={18} style={{ marginRight: '8px' }} />
            VOLVER A INICIO
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;