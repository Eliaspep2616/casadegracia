import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Compass, HeartHandshake } from 'lucide-react';
import './Crecer.css';

const Crecer = () => {
  const pasosCrecimiento = [
    { 
      id: 1, 
      numero: "01",
      titulo: "Conoce a Dios", 
      desc: "Todo comienza aquí. Nuestras reuniones dominicales y retiros son el ambiente perfecto para experimentar Su presencia y escuchar Su palabra.", 
      icon: <BookOpen size={36} />, 
      link: "/retiro", 
      btnText: "Próximo Retiro" 
    },
    { 
      id: 2, 
      numero: "02",
      titulo: "Encuentra Libertad", 
      desc: "Fuimos diseñados para vivir en comunidad. Únete a un Grupo Pequeño para compartir la vida, hacer amigos y crecer juntos.", 
      icon: <Users size={36} />, 
      link: "/grupos", 
      btnText: "Buscar un Grupo" 
    },
    { 
      id: 3, 
      numero: "03",
      titulo: "Descubre tu Propósito", 
      desc: "Nuestra Academia de Líderes está diseñada para ayudarte a descubrir tus dones, tu diseño original y el llamado de Dios para tu vida.", 
      icon: <Compass size={36} />, 
      link: "/Academia-lideres", 
      btnText: "Ver Academia" 
    },
    { 
      id: 4, 
      numero: "04",
      titulo: "Haz la Diferencia", 
      desc: "Usa tus talentos para servir a otros. Únete a nuestro equipo de voluntarios y sé parte de lo que Dios está construyendo en la casa.", 
      icon: <HeartHandshake size={36} />, 
      link: "/Voluntario", 
      btnText: "Ser Voluntario" 
    }
  ];

  return (
    <div className="crecer-container">
      {/* 🚀 HERO SECTION */}
      <section className="crecer-hero">
        <div className="crecer-hero-content">
          <span className="crecer-tag">TU SIGUIENTE PASO</span>
          <h1 className="crecer-title">CRECER</h1>
          <p className="crecer-subtitle">
            Dios tiene un propósito increíble para tu vida. Nuestra ruta de crecimiento está diseñada para ayudarte a descubrirlo y vivirlo al máximo.
          </p>
        </div>
      </section>

      {/* 🛣️ RUTA DE CRECIMIENTO (PASOS) */}
      <section className="pasos-section">
        <div className="pasos-grid">
          {pasosCrecimiento.map((paso) => (
            <div key={paso.id} className="paso-card">
              <div className="paso-numero">{paso.numero}</div>
              <div className="paso-icon-wrapper">
                {paso.icon}
              </div>
              <h3 className="paso-titulo">{paso.titulo}</h3>
              <p className="paso-desc">{paso.desc}</p>
              <Link to={paso.link} className="paso-btn">
                {paso.btnText} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

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