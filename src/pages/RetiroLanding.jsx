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
     { nombre: "Abraham", cargo: "Conferencista Invitado", bio: "Especialista en madurez espiritual." },
    { nombre: "Josue Rincon", cargo: "Pst. Familia de Dios", bio: "Líder apasionado por la formación de familias." },
   
   { nombre: "Diego", cargo: "Adoración y Palabra", bio: "Guía en experiencias profundas de alabanza." }
  ];

  return (
    <div className="landing-full">
      <section className="hero-foton">
        <div className="hero-overlay-dark">
          <h1 className="hero-title-main">GROW</h1>
          <p className="hero-subtitle-main">GUAYAQUIL | 29 - 31 DE MAYO</p>
          <button className="btn-foton-action" onClick={() => navigate('/inscripcion')}>
            ADQUIRIR TUS ENTRADAS ➔
          </button>
        </div>
      </section>

      {/* CONCEPTO NO INVASIVO ABAJO DEL HEADER */}
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
  src="https://lzvolnnndwpyxyoyldea.supabase.co/storage/v1/object/public/assets/Abraham_Estrada.webp"
  alt="Abraham Estrada"
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