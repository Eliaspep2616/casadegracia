import React from 'react';
import './Liderazgo.css';

const Liderazgo = () => {
  return (
    <div className="liderazgo-container">
      
      {/* HERO SECTION - Título gigante */}
      <section className="liderazgo-hero">
        <h1 className="liderazgo-title">NUESTROS<br />PASTORES.</h1>
      </section>

      {/* SECCIÓN PASTORES PRINCIPALES - Estilo Editorial a 2 columnas */}
      <section className="pastores-principales-section">
        <div className="pastores-layout">
          <div className="pastores-imagen-wrapper">
            {/* Reemplaza el src con tu foto */}
            <img 
              src="/assets/Pastores.webp" 
              alt="Pastores Principales" 
              className="img-pastores" 
            />
          </div>
          <div className="pastores-info">
            <h2 className="pastores-nombres">Reinaldo & Adriana <br/> Romero</h2>
            <span className="pastores-rol">PASTORES PRINCIPALES</span>
            <p className="pastores-bio">
             Casa de Gracia  cuenta con un equipo ministerial comprometido, enfocado en conducir a cada persona a una 
             comunión genuina y transformadora con Jesús. Los pastores Reinaldo y Adriana Romero, 
             lideran este equipo con una fe firme, un amor sincero y una entrega total por la iglesia y por ti. 
            </p>
            <p className="pastores-bio">
              Nuestros pastores enseñan la Palabra con sabiduría y la respaldan con un
              testimonio diario guiado por el Espíritu Santo, reflejando el amor de Dios en cada acción.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN EQUIPO / OTROS PASTORES - Cuadrícula
      <section className="equipo-section">
        <h2 className="equipo-titulo">EQUIPO PASTORAL</h2>
        
        <div className="equipo-grid">
           Tarjeta de Líder 1 
          <div className="lider-card">
            <div className="lider-foto bg-gris"></div>
            <h3 className="lider-nombre">Juan y María</h3>
            <p className="lider-area">Campus Norte</p>
          </div>

          Tarjeta de Líder 2
          <div className="lider-card">
            <div className="lider-foto bg-gris"></div>
            <h3 className="lider-nombre">Carlos Pérez</h3>
            <p className="lider-area">Jóvenes & Get Up</p>
          </div>

         Tarjeta de Líder 3 
          <div className="lider-card">
            <div className="lider-foto bg-gris"></div>
            <h3 className="lider-nombre">Ana Gómez</h3>
            <p className="lider-area">Kids</p>
          </div>

         Tarjeta de Líder 4
           <div className="lider-card">
            <div className="lider-foto bg-gris"></div>
            <h3 className="lider-nombre">Luis y Carmen</h3>
            <p className="lider-area">Grupos Pequeños</p>
          </div>
        </div>
      </section>*/}

    </div> 
  );
};

export default Liderazgo;