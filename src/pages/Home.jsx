import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      {/* HERO SECTION - El impacto visual al entrar */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="subtitle">BIENVENIDOS A LA IGLESIA</span>
          <h1 className="main-title">Un lugar para toda la familia</h1>
          <Link to="/retiro" className="btn-hero-primary">VER EVENTOS</Link>
        </div>
      </section>

      {/* SECCIÓN DE TEXTO / INTRODUCCIÓN */}
      <section className="intro-section">
        <h2>Próximos Encuentros</h2>
        <p>No te pierdas lo que Dios está haciendo en nuestra casa.</p>
        <div className="divider"></div>
      </section>

      {/* AQUÍ PUEDES SEGUIR PONIENDO TU CONTENIDO */}
      <section className="contenido-usuario">
        {/* Tu contenido de Photoshop o texto aquí */}
      </section>
    </div>
  );
};

export default Home;