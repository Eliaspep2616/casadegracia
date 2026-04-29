import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const eventos = [
    { 
      id: 1, 
      titulo: "RETIRO DE PROVISIÓN", 
      tag: "GROW",
      desc: "Una experiencia de inmersión espiritual en el corazón de Guayaquil.",
      img: "https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/banner_grow.png", 
      link: "/retiro" 
    },
    { 
      id: 2, 
      titulo: "KNOCKOUT", 
      tag: "CAMPAMENTO",
      desc: "Redefiniendo el propósito de una nueva generación tecnológica.",
      img: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1600", 
      link: "#" 
    },
    { 
      id: 3, 
      titulo: "Extra"+"\n ordinarias",
      tag: "MUJERES VALIENTES",
      desc: "16 DE MAYO",
      img: "https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/Extraordinarias.webp", 
      link: "https://www.instagram.com/extraordinariascdg/" 
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === eventos.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? eventos.length - 1 : prev - 1));

  useEffect(() => {
    const itv = setInterval(nextSlide, 6000);
    return () => clearInterval(itv);
  }, [currentSlide]);

  return (
    <div className="home-container">
      
      {/* 🏠 NUEVA CABECERA ESTILO IMAGEN */}
      <section className="hero-reference-section">
        <h1 className="hero-header-text">bienvenido<br/>a casa</h1>
        
        <div className="hero-main-rounded-container">
          <div className="hero-content-overlay">
            <h2 className="hero-inner-title">conoce gracia guayaquil</h2>
            
            <div className="hero-inner-buttons">
              {/* Botón que abre el mapa de Guayaquil */}
              <a 
                href="https://maps.app.goo.gl/GbWGq9fSqSsYG7yM9" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-glass-white"
              >
                DÓNDE ESTAMOS UBICADOS <MapPin size={18} />
              </a>
              <Link to="/retiro" className="btn-glass-dark">PRÓXIMO EVENTO</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🎀 CINTA MARQUEE */}
      <div className="marquee-container">
        <div className="marquee-content">
          <span>JUNTOS LO ESTAMOS HACIENDO • JUNTOS LO ESTAMOS HACIENDO • JUNTOS LO ESTAMOS HACIENDO • JUNTOS LO ESTAMOS HACIENDO • &nbsp;</span>
          <span>JUNTOS LO ESTAMOS HACIENDO • JUNTOS LO ESTAMOS HACIENDO • JUNTOS LO ESTAMOS HACIENDO •&nbsp;</span>
        </div>
      </div>

      {/* 📖 CONOCE LA IGLESIA / PASTORES */}
      <section className="about-section">
        <h2 className="about-title">Somos una iglesia donde amamos a las personas</h2>
        <p className="about-text">Creemos que su Palabra hace la obra y nos encantaría que esta sea una realidad en tu vida.</p>
        <Link to="/Liderazgo" className="link-arrow">Conoce a nuestros pastores ➔</Link>
      </section>

      {/* 🛸 SLIDER FUTURISTA (AQUÍ ABAJO CON PUNTAS REDONDEADAS) */}
      <section className="slider-rounded-wrapper">
        <div className="futurist-slider">
          {eventos.map((ev, index) => (
            <div 
              key={ev.id} 
              className={`f-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${ev.img})` }}
            >
              <div className="f-overlay">
                <div className="f-glass-card">
                  <span className="f-tag">{ev.tag}</span>
                  <h2 className="f-title">{ev.titulo}</h2>
                  <p className="f-description">{ev.desc}</p>
                  <Link to={ev.link} className="f-btn">
                    EXPLORAR PROYECTO <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          <div className="f-controls">
            <button onClick={prevSlide} className="f-nav-btn"><ChevronLeft /></button>
            <div className="f-pagination">
              {eventos.map((_, i) => (
                <div 
                  key={i} 
                  className={`f-dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="f-nav-btn"><ChevronRight /></button>
          </div>
        </div>
      </section>

      {/* 🗓️ REUNIONES */}
     <section className="ministries-section">
  <h2 className="section-title">REUNIONES</h2>
  <div className="ministries-grid">
    
    <div className="ministry-card bg-kids">
      <img 
        src="https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/foto-kids.jpg" 
        alt="Gracia kids" 
        className="ministry-image" 
      />
      <div className="ministry-content">
        <h3>Gracia kids</h3>
        <p>Niños y Niñas</p>
      </div>
    </div>

    <div className="ministry-card bg-getup">
      <img 
        src="https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/foto-youth.jpg" 
        alt="Gracia Youth" 
        className="ministry-image" 
      />
      <div className="ministry-content">
        <h3>Gracia Youth</h3>
        <p>Jóvenes</p>
      </div>
    </div>

    <div className="ministry-card bg-central">
      <img 
        src="https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/foto-extraordinaria.jpg" 
        alt="Extraordinaria" 
        className="ministry-image" 
      />
      <div className="ministry-content">
        <h3>Extraordinaria</h3>
        <p>Para aprender</p>
      </div>
    </div>

    <div className="ministry-card bg-punto">
      <img 
        src="https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/foto-familia.jpg" 
        alt="Domingo de Familia" 
        className="ministry-image" 
      />
      <div className="ministry-content">
        <h3>Domingo de Familia</h3>
        <p>Toda la familia</p>
      </div>
    </div>

  </div>
</section>
      {/* 🤝 GRUPOS PEQUEÑOS */}
{/*
      <section className="groups-section">
        <div className="groups-content">
          <h2>Grupos Pequeños</h2>
          <p>La mejor forma de encontrar amigos, conectarnos como familia y crecer como personas en base a intereses comunes.</p>
          <Link to="/grupos" className="btn-primary dark-btn">VER DIRECTORIO</Link>
        </div>
      </section>*/}
    </div>
  );
};

export default Home;