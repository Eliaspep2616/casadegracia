import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';
import logo from "../../assets/Logo.webp";
const Navbar = ({ cantidadCarrito }) => {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Cerramos el menú automáticamente cuando cambia la ruta
  useEffect(() => {
    setMenuAbierto(false);
  }, [location]);

  // Efecto visual de "glassmorphism" al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquea el scroll del fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (menuAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuAbierto]);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
        </Link>
        
        {/* Botón de hamburguesa accesible y con z-index alto */}
        <button 
          className="menu-icon" 
          onClick={toggleMenu}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
        >
          {menuAbierto ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Capa oscura de fondo para versión móvil */}
        <div 
          className={`nav-overlay ${menuAbierto ? 'active' : ''}`} 
          onClick={() => setMenuAbierto(false)}
        ></div>

        {/* La clase "active" controla la visibilidad en móviles */}
        <div className={`nav-right ${menuAbierto ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>INICIO</Link></li>
            <li><Link to="/CRECER" className={location.pathname === '/CRECER' ? 'active' : ''}>CRECER</Link></li>
            <li><Link to="/Academia-lideres" className={location.pathname === '/Academia-lideres' ? 'active' : ''}>ACADEMIA DE LÍDERES</Link></li>
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