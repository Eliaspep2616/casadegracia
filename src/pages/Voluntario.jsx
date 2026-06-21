import { useState } from 'react';
import { HeartHandshake, Users, Camera, Music, Smile, ArrowRight, Send } from 'lucide-react';
import './Voluntario.css';

const Voluntario = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    area: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos (API, Firebase, Supabase, etc.)
    console.log('Datos de voluntario:', formData);
    alert('¡Gracias por querer ser parte del equipo! Nos pondremos en contacto contigo pronto.');
  };

  const areasServicio = [
    {
      id: 1,
      titulo: "Bienvenida",
      icono: <Smile size={32} />,
      desc: "Sé el primer rostro amable que las personas ven al llegar a casa. Ideal si amas conectar con otros."
    },
    {
      id: 2,
      titulo: "Gracia Kids",
      icono: <Users size={32} />,
      desc: "Invierte en la próxima generación enseñando a los niños sobre el amor de Dios de forma divertida."
    },
    {
      id: 3,
      titulo: "Producción y Medios",
      icono: <Camera size={32} />,
      desc: "Cámaras, luces, sonido y pantallas. Ayuda a crear una experiencia sin distracciones."
    },
    {
      id: 4,
      titulo: "Alabanza",
      icono: <Music size={32} />,
      desc: "Usa tus talentos musicales o vocales para guiar a la iglesia en adoración cada semana."
    }
  ];

  return (
    <div className="voluntario-container">
      
      {/* 🚀 HERO SECTION (Estilo similar al Home) */}
      <section className="hero-reference-section">
        <h1 className="hero-header-text">Haz la<br/>diferencia</h1>
        
        <div className="hero-main-rounded-container hero-voluntario-bg">
          <div className="hero-content-overlay">
            <h2 className="hero-inner-title">SÉ PARTE DEL EQUIPO</h2>
            <p className="hero-subtitle">Descubre tu propósito sirviendo a Dios al servir a los demás.</p>
            
            <div className="hero-inner-buttons">
              <a href="#unete" className="btn-glass-white">
                QUIERO SERVIR <HeartHandshake size={18} style={{ marginLeft: '8px' }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 💡 INTRODUCCIÓN */}
      <section className="vision-section">
        <div className="vision-content">
          <h2 className="section-title">No fuimos creados solo para asistir, fuimos creados para contribuir</h2>
          <p className="vision-text">
            Creemos que Dios te ha dado dones y talentos únicos. No hay nada más gratificante que 
            usarlos para impactar la vida de otras personas. Ya sea saludando en la puerta, tocando 
            un instrumento o cuidando a los más pequeños, ¡hay un lugar para ti en la familia!
          </p>
        </div>
      </section>

      {/* 🛠️ ÁREAS DE SERVICIO (Grid de Tarjetas) */}
      <section className="areas-section">
        <h2 className="section-title text-center">Encuentra tu lugar</h2>
        <div className="areas-grid">
          {areasServicio.map((area) => (
            <div key={area.id} className="area-card">
              <div className="area-icon">{area.icono}</div>
              <h3 className="area-title">{area.titulo}</h3>
              <p className="area-desc">{area.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 📝 FORMULARIO DE INSCRIPCIÓN */}
      <section id="unete" className="join-section">
        <div className="join-wrapper">
          <div className="join-info">
            <h2>Da el siguiente paso</h2>
            <p>Llena este formulario y uno de nuestros líderes se pondrá en contacto contigo para guiarte en el proceso de integración al equipo.</p>
            <ul className="steps-list">
              <li><ArrowRight size={18} /> 1. Completa el formulario</li>
              <li><ArrowRight size={18} /> 2. Asiste a la orientación</li>
              <li><ArrowRight size={18} /> 3. ¡Empieza a servir!</li>
            </ul>
          </div>
          
          <div className="join-form-container">
            <form onSubmit={handleSubmit} className="volunteer-form">
              <div className="form-group">
                <label>Nombre y Apellido</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange} 
                  required 
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              
              <div className="form-group">
                <label>Teléfono / WhatsApp</label>
                <input 
                  type="tel" 
                  name="telefono" 
                  value={formData.telefono} 
                  onChange={handleChange} 
                  required 
                  placeholder="Ej: 0991234567"
                />
              </div>

              <div className="form-group">
                <label>Área de Interés</label>
                <select name="area" value={formData.area} onChange={handleChange} required>
                  <option value="">Selecciona un área...</option>
                  <option value="bienvenida">Bienvenida / Ujieres</option>
                  <option value="kids">Gracia Kids</option>
                  <option value="produccion">Producción y Medios</option>
                  <option value="alabanza">Alabanza</option>
                  <option value="aun-no-se">Aún no lo sé, quiero que me asesoren</option>
                </select>
              </div>

              <button type="submit" className="btn-submit">
                ENVIAR SOLICITUD <Send size={18} style={{ marginLeft: '8px' }} />
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Voluntario;