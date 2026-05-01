import React from 'react';
import './Footer.css';
import { FaInstagram, FaFacebook } from 'react-icons/fa'; /* 🚨 Importación de react-icons */
import { MapPin, Map } from 'lucide-react';


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
            <li><strong>Domingo:</strong> Familia con Propósito 10:00 AM</li>
            <li><strong>Viernes:</strong> Viernes de Discipulado 7:30 PM</li>
          </ul>
        </div>

        {/* Columna 2: Ubicación */}
<div className="footer-seccion">
          <h3 className="footer-titulo">Encuéntranos</h3>
          <a 
            href="https://maps.app.goo.gl/ZXtQLQtb9eMktU2w7" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {/* Cambiamos la <p> por un <div> y eliminamos los style conflictivos */}
            <div className="footer-texto">
              {/* Le puse el color celeste de tus títulos para que combine */}
              <MapPin size={28} color="#38bdf8" /> 
              
              <span>
                Domingo Norero C., 090409<br />
                (24 y Bolivia)<br />
                Guayaquil, Ecuador
              </span>
            </div>
          </a>
        </div>
        {/* Columna 3: Redes Sociales */}
        <div className="footer-seccion">
          <h3 className="footer-titulo">Síguenos</h3>
          <div className="footer-redes">
            
            <a href="https://www.instagram.com/casadegracia_ec" target="_blank" rel="noopener noreferrer" className="red-link">
              <FaInstagram size={20} /> @casadegracia_ec
            </a>

            <a href="https://www.facebook.com/CasaDeGraciaJNF" target="_blank" rel="noopener noreferrer" className="red-link">
              <FaFacebook size={20} /> Casa de Gracia JNF
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