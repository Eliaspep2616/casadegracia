import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react'; // Instala lucide-react si no lo tienes

const Navbar = ({ cantidadCarrito }) => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="logo-text">TU LOGO</div>
      
      <div className="nav-right">
        <ul className="nav-links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>INICIO</Link></li>
          <li><a href="#">CRECER</a></li>
          <li><a href="#">ADL</a></li>
          <li><Link to="/retiro" className={location.pathname === '/retiro' ? 'active' : ''}>RETIRO DE PROVISIÓN</Link></li>
          <li><a href="#">CAMP</a></li>
          <li><a href="#">GRACIA KIDS</a></li>
        </ul>

        {/* ICONO DE CARRITO CON BADGE */}
        <Link to="/carrito" className="cart-icon-container">
          <ShoppingCart size={24} color="#333" />
          {cantidadCarrito > 0 && (
            <span className="cart-badge">{cantidadCarrito}</span>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;