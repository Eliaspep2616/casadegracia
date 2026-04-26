import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';
import logo from "../assets/Logo.webp";

const Navbar = ({ cantidadCarrito }) => {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cerramos el menú automáticamente cuando cambia la ruta
  useEffect(() => {
    setMenuAbierto(false);
  }, [location]);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
        </Link>
        
        {/* Botón de hamburguesa con z-index alto */}
        <div className="menu-icon" onClick={toggleMenu}>
          {menuAbierto ? <X size={28} /> : <Menu size={28} />}
        </div>

        {/* La clase "active" controla la visibilidad */}
        <div className={`nav-right ${menuAbierto ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>INICIO</Link></li>
            <li><Link to="/retiro" className={location.pathname === '/retiro' ? 'active' : ''}>RETIRO DE PROVISIÓN</Link></li>
          </ul>

          <Link to="/carrito" className="cart-icon-container">
            <ShoppingCart size={24} color="#0f172a" />
            {cantidadCarrito > 0 && (
              <span className="cart-badge">{cantidadCarrito}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;