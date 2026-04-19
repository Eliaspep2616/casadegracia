import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* HERO SECTION - Estilo audaz y tipográfico */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="main-title">BIENVENIDO.<br/>A CASA.</h1>
          <div className="hero-buttons">
            <Link to="/campus" className="btn-primary">CAMPUS Y HORARIOS</Link>
            <Link to="/siguiente-paso" className="btn-secondary">CONOCE CDG</Link>
          </div>
        </div>
      </section>

      {/* CINTA DE TEXTO EN MOVIMIENTO (MARQUEE) */}
      <div className="marquee-container">
        <div className="marquee-content">
          <span>EN LA TIERRA COMO EN EL CIELO • EN LA TIERRA COMO EN EL CIELO • EN LA TIERRA COMO EN EL CIELO • EN LA TIERRA COMO EN EL CIELO •&nbsp;</span>
          {/* Se repite para que la animación fluya sin cortes */}
          <span>EN LA TIERRA COMO EN EL CIELO • EN LA TIERRA COMO EN EL CIELO • EN LA TIERRA COMO EN EL CIELO • EN LA TIERRA COMO EN EL CIELO •&nbsp;</span>
        </div>
      </div>

      {/* SECCIÓN "CONOCE LA IGLESIA" */}
      <section className="about-section">
        <h2 className="about-title">
          Somos una iglesia donde amamos a las personas
        </h2>
        <p className="about-text">
          Creemos que su Palabra hace la obra y nos encantaría que esta sea una realidad en tu vida.
        </p>
      <Link to="/Liderazgo" className="link-arrow">Conoce a nuestros pastores ➔</Link>
      </section>

      {/* REUNIONES POR EDADES */}
      <section className="ministries-section">
        <h2 className="section-title">REUNIONES</h2>
        <div className="ministries-grid">
          <div className="ministry-card bg-kids">
            <h3>Gracia kids Kids</h3>
            <p>Niños y Niñas</p>
          </div>
          <div className="ministry-card bg-getup">
            <h3>Gracia Youth</h3>
            <p>Jóvenes de Secundaria</p>
          </div>
          <div className="ministry-card bg-central">
            <h3>viernes de enseñanza</h3>
            <p>Para aprender</p>
          </div>
          <div className="ministry-card bg-punto">
            <h3>Domingo de Familia</h3>
            <p>tpoda la familia</p>
          </div>
        </div>
      </section>

      {/* GRUPOS PEQUEÑOS */}
      <section className="groups-section">
        <div className="groups-content">
          <h2>Grupos Pequeños</h2>
          <p>La mejor forma de encontrar amigos, conectarnos como familia y crecer como personas en base a intereses comunes.</p>
          <Link to="/grupos" className="btn-primary dark-btn">VER DIRECTORIO</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;