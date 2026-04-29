import React from 'react';
import './Footer.css';

const Footer = () => {
  // Obtenemos el año actual automáticamente para el Copyright
  const añoActual = new Date().getFullYear();

  return (
    <footer className="footer-principal">
      <div className="footer-contenido">
        
        {/* Columna 1: Horarios */}
        <div className="footer-seccion">
          <h3 className="footer-titulo">Nuestros Horarios</h3>
          <ul className="footer-lista">
            <li><strong>Domingo:</strong> Servicio de familia 10:00 AM</li>
            <li><strong>Viernes:</strong> Enseñanza 7:30 PM</li>
         
          </ul>
        </div>

        {/* Columna 2: Ubicación */}
        <div className="footer-seccion">
          <h3 className="footer-titulo">Encuéntranos</h3>
          <p className="footer-texto">
           Domingo Norero C., 090409 Guayaquil<br />
            Guayaquil, Ecuador
          </p>
        </div>

        {/* Columna 3: Redes Sociales */}
        <div className="footer-seccion">
          <h3 className="footer-titulo">Síguenos</h3>
          <div className="footer-redes">
            <a href="https://www.instagram.com/casadegraciaecu" target="_blank" rel="noopener noreferrer" className="red-link">
              Instagram
            </a>
            <a href="https://www.facebook.com/CasaDeGraciaJNF" target="_blank" rel="noopener noreferrer" className="red-link">
              Facebook
            </a>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="footer-copyright">
        <p>&copy; {añoActual} Casa de Gracia. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;