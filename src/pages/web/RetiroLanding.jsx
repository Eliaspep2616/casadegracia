import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RetiroLanding.css';

const RetiroLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('mostrar-scroll');
        else entry.target.classList.remove('mostrar-scroll');
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.oculto-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const conferencistas = [
    { 
      nombre: "Abraham Estrada", 
      cargo: "Pst. Casa de Dios en la Roca", 
      bio: "Especialista en madurez espiritual.",
      imagen: "https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/Abraham_Estrada.webp"
    },
    { 
      nombre: "Josue Rincon", 
      cargo: "Pst. Familia de Dios", 
      bio: "Líder apasionado por la formación de familias.",
      imagen: "https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/Josue_Rincon.webp" 
    },
    { 
      nombre: "Diego Vasquez", 
      cargo: "Adoración y Palabra", 
      bio: "Guía en experiencias profundas de alabanza.",
      imagen: "https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/Diego_Vasquez.webp" 
    }
  ];

  return (
    <div className="landing-full">
      
      {/* --- NUEVA SECCIÓN DEL BANNER PRINCIPAL --- */}
      <section className="hero-banner-section">
        <img 
          src="https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/banner_grow.png" 
          alt="Banner GROW 2026" 
          className="banner-image-main"
        />
        <div className="banner-overlay-action">
          <button className="btn-foton-action" onClick={() => navigate('/inscripcion')}>
            ADQUIRIR TUS ENTRADAS ➔
          </button>
        </div>
      </section>

      <section className="concept-section-clean">
        <div className="concept-container">
          <div className="concept-line"></div>
          <p className="concept-text-main">
            UN ESPACIO INTENCIONAL PARA REENFOCARNOS Y RECIBIR CLARIDAD. 
            DISEÑADO PARA QUIENES BUSCAN CRECER, LIDERAR E INFLUIR CON MADUREZ ESPIRITUAL.
          </p>
          <div className="concept-line"></div>
        </div>
      </section>

      <section className="speakers-section-landing">
        <h2 className="landing-section-title">NUESTROS CONFERENCISTAS</h2>
        <div className="speakers-zigzag-container">
          {conferencistas.map((c, i) => (
            <div className={`speaker-row oculto-scroll ${i % 2 !== 0 ? 'reverso' : ''}`} key={i}>
              <div className="speaker-image-box">
                <img 
                  src={c.imagen} 
                  alt={c.nombre} 
                  loading="lazy" 
                />
              </div>
              <div className="speaker-text-box">
                <h3 className="speaker-name-zigzag">{c.nombre}</h3>
                <span className="speaker-role-zigzag">{c.cargo}</span>
                <p className="speaker-bio-zigzag">{c.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RetiroLanding;