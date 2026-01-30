import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, Cpu, FileText, Video, Wand2, Lock, XCircle } from 'lucide-react'; // Agregamos XCircle para el icono de la alerta
import Navbar from '../Navbar';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NUVEO ESTADO: Para controlar la visibilidad de la alerta personalizada
  const [showRestrictedAlert, setShowRestrictedAlert] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/usuarios/perfil', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUsuario(data.datosUsuario);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Error verificando sesión", error);
      } finally {
        setLoading(false);
      }
    };
    verificarSesion();
  }, []);

  const handleServiceClick = (path, requiresPremium = false) => {
    // 1. Si no está logueado
    if (!usuario) {
      navigate('/login'); 
      return;
    }

    // 2. Si requiere premium y el usuario NO lo es
    if (requiresPremium && usuario.rol !== 'premium') {
      // EN LUGAR DE ALERT, ACTIVAMOS NUESTRO ESTADO
      setShowRestrictedAlert(true);
      
      // Hacemos que desaparezca automáticamente después de 3.5 segundos
      setTimeout(() => {
        setShowRestrictedAlert(false);
      }, 3500);
      
      return; 
    }

    // 3. Si pasa las validaciones, navegar
    navigate(path);
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <p>Cargando Karaoke IA...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Navbar />

      {/* --- NUEVO: ALERTA PERSONALIZADA FLOTANTE --- */}
      {/* Se renderiza condicionalmente si showRestrictedAlert es true */}
      <div className={`custom-alert-toast ${showRestrictedAlert ? 'show' : ''}`}>
        <XCircle size={24} color="#FF6A6A" />
        <span>Acceso Restringido: La función de Karaoke es exclusiva para usuarios Premium.</span>
      </div>

      <main className="home-content">
        <section className="welcome-section">
          {usuario ? (
            <h1>¡Hola de nuevo, <span>{usuario.nombre}</span>! </h1>
          ) : (
            <h1>Bienvenido a <span>Karaoke IA</span></h1>
          )}
          <p>Potencia tu música con nuestras herramientas de inteligencia artificial de última generación.</p>
        </section>

        <div className="info-grid">
          
          {/* --- SEPARADOR (GRATIS) --- */}
          <div className="info-card">
            <div className="card-icon"><Cpu size={24} color="#A78BFA" /></div>
            <h3>Separador IA</h3>
            <p>Divide tus canciones en pistas independientes. Extrae voces, batería y más.</p>
            <button className="card-action" onClick={() => handleServiceClick('/separador')}>
              {usuario ? 'Separar Audio' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>

          {/* --- TRANSCRIPTOR (GRATIS) --- */}
          <div className="info-card">
            <div className="card-icon"><FileText size={24} color="#10B981" /></div>
            <h3>Transcriptor de Letras</h3>
            <p>Convierte el audio de cualquier canción en texto con tecnología Whisper.</p>
            <button className="card-action" onClick={() => handleServiceClick('/transcribir')}>
              {usuario ? 'Transcribir ahora' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>

          {/* --- KARAOKE (PREMIUM) --- */}
          <div className={`info-card ${usuario && usuario.rol !== 'premium' ? 'locked-card' : ''}`}>
            <div className="card-icon"><Video size={24} color="#F43F5E" /></div>
            <h3>Creador de Karaoke</h3>
            <p>Genera videos MP4 con subtítulos sincronizados automáticamente.</p>
            
            <button 
              className={`card-action ${usuario && usuario.rol !== 'premium' ? 'btn-disabled' : ''}`} 
              onClick={() => handleServiceClick('/karaoke', true)} 
            >
              {usuario && usuario.rol !== 'premium' ? (
                <>Bloqueado (Premium) <Lock size={16} /></>
              ) : (
                <>{usuario ? 'Generar Video' : 'Ingresa para usar'} <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          {/* --- FILTROS (GRATIS) --- */}
          <div className="info-card">
            <div className="card-icon"><Wand2 size={24} color="#3B82F6" /></div>
            <h3>Filtros de Audio</h3>
            <p>Aplica efectos avanzados y mejora la calidad de exportación de tus archivos.</p>
            <button className="card-action" onClick={() => handleServiceClick('/filtros')}>
              {usuario ? 'Aplicar Filtros' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {usuario ? (
          <div className="profile-summary-card">
            <div className="profile-avatar"><User size={40} color="#7C4DFF" /></div>
            <div className="profile-info">
              <h3>{usuario.nombre} {usuario.apellido}</h3>
              <p>{usuario.correo}</p>
              
              <div style={{ 
                marginTop: '8px', 
                display: 'inline-block',
                padding: '4px 12px', 
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                backgroundColor: usuario.rol === 'premium' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: usuario.rol === 'premium' ? '#FFD700' : '#A0A0A0',
                border: usuario.rol === 'premium' ? '1px solid #FFD700' : '1px solid #555'
              }}>
                {usuario.rol === 'premium' ? '✨ Cuenta Premium' : '👤 Cuenta Gratuita'}
              </div>

            </div>
          </div>
        ) : (
          <div className="cta-register-card">
            <h3>¿Listo para empezar?</h3>
            <p>Únete a nuestra comunidad y procesa tus canciones con IA.</p>
            <button className="login-redirect-btn" onClick={() => navigate('/registrar')}>
              Crear cuenta gratuita
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;