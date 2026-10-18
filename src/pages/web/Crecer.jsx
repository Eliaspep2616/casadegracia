import React from 'react';
import './Crecer.css';

// Componente para el logo de las barras (idéntico a las imágenes)
const LogoBarras = () => (
  <div className="logo-barras">
    <div className="barra b-corta bg-black"></div>
    <div className="barra-compuesta">
      <div className="barra b-top bg-white"></div>
      <div className="barra b-media bg-black"></div>
    </div>
    <div className="barra-compuesta">
      <div className="barra b-top-larga bg-white"></div>
      <div className="barra b-larga bg-black"></div>
    </div>
  </div>
);

const Crecer = () => {
  const pasosCrecimiento = [
    { 
      id: 1, 
      numero: "Paso 1",
      titulo: "Conoce a Dios", 
      desc: "Todo comienza aquí. Nuestras reuniones dominicales y retiros son el ambiente perfecto para experimentar Su presencia y escuchar Su palabra.", 
      colorClass: "bg-paso-1" // Verde pastel
    },
    { 
      id: 2, 
      numero: "Paso 2",
      titulo: "Encuentra Libertad", 
      desc: "Fuimos diseñados para vivir en comunidad. Únete a un Grupo Pequeño para compartir la vida, hacer amigos y crecer juntos.", 
      colorClass: "bg-paso-2" // Durazno pastel
    },
    { 
      id: 3, 
      numero: "Paso 3",
      titulo: "Descubre tu Propósito", 
      desc: "Nuestra Academia de Líderes está diseñada para ayudarte a descubrir tus dones, tu diseño original y el llamado de Dios para tu vida.", 
      colorClass: "bg-paso-3" // Azul pastel
    },
    { 
      id: 4, 
      numero: "Paso 4",
      titulo: "Haz la Diferencia", 
      desc: "Usa tus talentos para servir a otros. Únete a nuestro equipo de voluntarios y sé parte de lo que Dios está construyendo en la casa.", 
      colorClass: "bg-paso-4" // Mostaza/Amarillo pastel
    }
  ];

  return (
    <div className="crecer-page">
      
      {/* 🚀 HERO SECTION */}
      <section className="crecer-hero-section">
        <div className="crecer-hero-overlay"></div>
        <div className="crecer-hero-content">
          <LogoBarras />
          <h1 className="crecer-hero-title">C R E C E R</h1>
        </div>
      </section>

      {/* 🛣️ SECCIONES DE PASOS (SPLIT SCREEN) */}
      <div className="pasos-container">
        {pasosCrecimiento.map((paso) => (
          <section key={paso.id} className={`paso-section ${paso.colorClass}`}>
            
            {/* Lado Izquierdo: Logo y Número */}
            <div className="paso-izq">
              <LogoBarras />
              <h2 className="paso-brand">C R E C E R</h2>
              <h3 className="paso-numero">{paso.numero}</h3>
            </div>

            {/* Lado Derecho: Contenido e Información */}
            <div className="paso-der">
              <h4 className="paso-titulo">{paso.titulo}</h4>
              <p className="paso-desc">{paso.desc}</p>
            </div>

          </section>
        ))}
      </div>

      {/* 🤝 SECCIÓN EXTRA / INVITACIÓN */}
      <section className="crecer-cta">
        <div className="cta-content">
          <h2>¿No sabes por dónde empezar?</h2>
          <p>Escríbenos y alguien de nuestro equipo te guiará personalmente en tu proceso de crecimiento.</p>
          <a href="https://wa.me/593999999999" target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            Hablar con un Líder
          </a>
        </div>
      </section>
      
    </div>
  );
};

export default Crecer;