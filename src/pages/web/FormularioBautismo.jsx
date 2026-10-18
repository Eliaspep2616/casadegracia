import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../config/supabaseClient'; 
import './Bautismo.css';

const FormularioBautismo = () => {
  const [formData, setFormData] = useState({
    nombresCompletos: '',
    edad: '',
    grupoCasa: '',
    bautizoVoluntario: 'Sí',
    reconocioJesus: 'Sí',
    bautizadoAntes: 'No',
    motivoBautismo: '',
    dispuestoPreparacion: 'Sí',
    significadoBautismo: '',
    numeroCelular: '',
    correoElectronico: '',
    contactosEmergencia: '',
    direccion: ''
  });

  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'edad' || name === 'numeroCelular') {
      const soloNumeros = value.replace(/[^0-9]/g, '');
      if (name === 'edad' && soloNumeros !== '' && parseInt(soloNumeros) > 120) return;
      setFormData({ ...formData, [name]: soloNumeros });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Number(formData.edad) < 8) {
      alert("Recomendamos una edad mínima de 8 años para comprender este paso. Por favor revisa la edad ingresada.");
      return;
    }

    setEnviando(true);

    try {
      const { error } = await supabase.from('bautismos').insert([{
        nombres_completos: formData.nombresCompletos,
        edad: parseInt(formData.edad),
        grupo_casa: formData.grupoCasa,
        reconocio_jesus: formData.reconocioJesus,
        bautizo_voluntario: formData.bautizoVoluntario,
        bautizado_antes: formData.bautizadoAntes,
        motivo_bautismo: formData.motivoBautismo,
        significado_bautismo: formData.significadoBautismo,
        dispuesto_preparacion: formData.dispuestoPreparacion,
        numero_celular: formData.numeroCelular,
        correo_electronico: formData.correoElectronico,
        direccion: formData.direccion,
        contactos_emergencia: formData.contactosEmergencia
      }]);

      if (error) throw error;
      setExito(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Tuvimos un problema enviando tus datos. Por favor, intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bautismo-wrapper">
      
      {/* LADO IZQUIERDO: IMAGEN, TÍTULO Y CITA */}
      <aside className="bautismo-sidebar">
        <div>
          <div className="brand-badge">Casa de Gracia</div>
          <h1>Da el paso<br/>de fe.</h1>
          <p>
            El bautismo en aguas es una declaración pública de tu fe en Jesús. 
            Demuestra al mundo que has decidido dejar atrás tu antigua vida y seguirle.
          </p>
        </div>

        <div className="sidebar-quote">
          "De modo que si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron; he aquí todas son hechas nuevas."
          <span>— 2 Corintios 5:17</span>
        </div>
      </aside>

      {/* LADO DERECHO: FORMULARIO */}
      <main className="bautismo-main">
        {exito ? (
          <div className="success-container">
            <CheckCircle size={80} color="#0284c7" style={{ marginBottom: '20px' }} />
            <h2>¡Registro Completo!</h2>
            <p style={{ color: '#475569', fontSize: '1.2rem', marginBottom: '40px' }}>
              Nos alegra muchísimo la decisión que has tomado hoy. Un líder de la iglesia se pondrá en contacto contigo muy pronto a través de WhatsApp.
            </p>
            <button 
              onClick={() => { setExito(false); setFormData({nombresCompletos: '', edad: '', grupoCasa: '', bautizoVoluntario: 'Sí', reconocioJesus: 'Sí', bautizadoAntes: 'No', motivoBautismo: '', dispuestoPreparacion: 'Sí', significadoBautismo: '', numeroCelular: '', correoElectronico: '', contactosEmergencia: '', direccion: ''}); }} 
              className="btn-secondary"
            >
              Registrar a otra persona
            </button>
          </div>
        ) : (
          <>
            <div className="form-header">
              <h2>Tu Registro</h2>
              <p>Llena este formulario para iniciar tu proceso.</p>
            </div>

            <form onSubmit={handleSubmit}>
              
              <h3 className="section-title">Datos Personales</h3>
              
              <div className="form-group">
                <label className="form-label">Nombres Completos</label>
                <input required type="text" name="nombresCompletos" value={formData.nombresCompletos} onChange={handleChange} className="form-input" placeholder="Tus nombres y apellidos" />
              </div>

              <div className="form-row">
                <div className="form-group no-margin">
                  <label className="form-label">Fecha de nacimiento</label>
                  <input required type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group no-margin">
                  <label className="form-label">Edad actual</label>
                  <input required type="text" inputMode="numeric" name="edad" value={formData.edad} onChange={handleChange} className="form-input" placeholder="Ej. 25" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">¿Asistes a algún grupo en casa?</label>
                <input type="text" name="grupoCasa" value={formData.grupoCasa} onChange={handleChange} className="form-input" placeholder="Nombre de tu líder o sector (Opcional)" />
              </div>

              <h3 className="section-title">Sobre tu decisión</h3>

              <div className="form-group">
                <label className="form-label">¿Has aceptado a Jesucristo como tu Señor y Salvador?</label>
                <select name="reconocioJesus" value={formData.reconocioJesus} onChange={handleChange} className="form-select">
                  <option value="Sí">Sí, lo he hecho</option>
                  <option value="No">Aún no estoy seguro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">¿Deseas bautizarte voluntariamente como expresión de tu fe?</label>
                <select name="bautizoVoluntario" value={formData.bautizoVoluntario} onChange={handleChange} className="form-select">
                  <option value="Sí">Sí, es una decisión personal</option>
                  <option value="No">No, alguien me lo pidió</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">¿Te has bautizado anteriormente?</label>
                <select name="bautizadoAntes" value={formData.bautizadoAntes} onChange={handleChange} className="form-select">
                  <option value="No">No, nunca</option>
                  <option value="Sí, cuando era bebé o niño">Sí, cuando era niño o bebé</option>
                  <option value="Sí, en otra iglesia de adulto">Sí, de adulto en otra iglesia</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Explícanos brevemente, ¿por qué deseas bautizarte?</label>
                <textarea required name="motivoBautismo" value={formData.motivoBautismo} onChange={handleChange} className="form-textarea" rows="3" placeholder="Escribe aquí con tus propias palabras..."></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Para ti, ¿qué significa el bautismo?</label>
                <textarea required name="significadoBautismo" value={formData.significadoBautismo} onChange={handleChange} className="form-textarea" rows="3" placeholder="¿Qué representa esto en tu vida?"></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">¿Estás dispuesto a participar en una capacitación antes de tu bautizo?</label>
                <select name="dispuestoPreparacion" value={formData.dispuestoPreparacion} onChange={handleChange} className="form-select">
                  <option value="Sí">Sí, estoy dispuesto</option>
                  <option value="No">Se me complica por tiempo</option>
                </select>
              </div>

              <h3 className="section-title">Datos de Contacto</h3>

              <div className="form-row">
                <div className="form-group no-margin">
                  <label className="form-label">Número de WhatsApp</label>
                  <input required type="text" inputMode="numeric" name="numeroCelular" value={formData.numeroCelular} onChange={handleChange} className="form-input" placeholder="099..." />
                </div>
                <div className="form-group no-margin">
                  <label className="form-label">Correo electrónico</label>
                  <input type="email" name="correoElectronico" value={formData.correoElectronico} onChange={handleChange} className="form-input" placeholder="correo@ejemplo.com" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dirección domiciliaria (Sector)</label>
                <input required type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="form-input" placeholder="Ej. Sauces 8..." />
              </div>

              <div className="form-group">
                <label className="form-label">Persona de contacto (En caso de emergencia)</label>
                <textarea required name="contactosEmergencia" value={formData.contactosEmergencia} onChange={handleChange} className="form-textarea" rows="2" placeholder="Nombre, parentesco y número de celular"></textarea>
              </div>

              <button type="submit" disabled={enviando} className="btn-submit">
                {enviando ? 'Enviando solicitud...' : 'Enviar mi solicitud'}
              </button>

            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default FormularioBautismo;