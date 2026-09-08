import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { supabase } from '../../config/supabaseClient.js';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [eventos, setEventos] = useState([]);
  const [reuniones, setReuniones] = useState([]);

  // Cargar datos desde Supabase
  useEffect(() => {
    const cargarDatos = async () => {
      // Traer Banners del Slider
      const { data: dataEventos } = await supabase
        .from('home_eventos')
        .select('*')
        .order('orden', { ascending: true });
      if (dataEventos) setEventos(dataEventos);

      // Traer Reuniones del Grid
      const { data: dataReuniones } = await supabase
        .from('home_reuniones')
        .select('*')
        .order('orden', { ascending: true });
      if (dataReuniones) setReuniones(dataReuniones);
    };

    cargarDatos();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === eventos.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? eventos.length - 1 : prev - 1));

  useEffect(() => {
    if (eventos.length === 0) return;
    const itv = setInterval(nextSlide, 6000);
    return () => clearInterval(itv);
  }, [currentSlide, eventos.length]);

  return (
    <div className="home-container">
      
      {/* 🏠 CABECERA */}
      <section className="hero-reference-section">
        <h1 className="hero-header-text">Bienvenido<br/>a casa</h1>
        <div className="hero-main-rounded-container">
          <div className="hero-content-overlay">
            <h2 className="hero-inner-title">CONOCE MÁS DE NOSOTROS</h2>
            <div className="hero-inner-buttons">
              <a href="https://maps.app.goo.gl/GbWGq9fSqSsYG7yM9" target="_blank" rel="noopener noreferrer" className="btn-glass-white">
                DÓNDE ESTAMOS UBICADOS <MapPin size={18} />
              </a>
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

      <section className="about-section">
        <h2 className="about-title">Somos una iglesia que ama a las personas</h2>
        <p className="about-text">Creemos que su Palabra hace la obra y nos encantaría que esta sea una realidad en tu vida.</p>
        <Link to="/Liderazgo" className="link-arrow">Conoce a nuestros pastores ➔</Link>
      </section>

      {/* 🛸 SLIDER FUTURISTA (DINÁMICO) */}
      {eventos.length > 0 && (
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
                    <h2 className="f-title" style={{ whiteSpace: 'pre-line' }}>{ev.titulo}</h2>
                    <p className="f-description" style={{ whiteSpace: 'pre-line' }}>{ev.descripcion}</p>
                    {ev.link && (
                      <a href={ev.link} target="_blank" rel="noopener noreferrer" className="f-btn">
                        MÁS INFO <ArrowRight size={18} />
                      </a>
                    )}
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
      )}

      {/* 🗓️ REUNIONES (DINÁMICO) */}
      <section className="ministries-section">
        <h2 className="section-title">REUNIONES</h2>
        <div className="ministries-grid">
          {reuniones.map((reu) => (
            <div key={reu.id} className={`ministry-card ${reu.clase_bg}`}>
              <img src={reu.img} alt={reu.titulo} className="ministry-image" />
              <div className="ministry-content">
                <h3 style={{ whiteSpace: 'pre-line' }}>{reu.titulo}</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{reu.horario}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;