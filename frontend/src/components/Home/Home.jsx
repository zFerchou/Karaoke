import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Star, ArrowRight, LogIn, 
  Cpu, FileText, Video, Wand2 
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // Función para manejar el click en los servicios
  const handleServiceClick = (path) => {
    if (!usuario) {
      navigate('/login');
    } else {
      navigate(path);
    }
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
      <header className="home-header">
        <div className="header-logo" onClick={() => navigate('/home')} style={{cursor: 'pointer'}}>
          Karaoke <span>IA</span>
        </div>
        
        {usuario ? (
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        ) : (
          <button onClick={() => navigate('/login')} className="login-btn-nav">
            <LogIn size={18} />
            <span>Iniciar Sesión</span>
          </button>
        )}
      </header>

      <main className="home-content">
        <section className="welcome-section">
          {usuario ? (
            <h1>¡Hola de nuevo, <span>{usuario.nombre}</span>!</h1>
          ) : (
            <h1>Bienvenido a <span>Karaoke IA</span></h1>
          )}
          <p>Potencia tu música con nuestras herramientas de inteligencia artificial de última generación.</p>
        </section>

        <div className="info-grid">
          {/* SERVICIO 1: SPLEETER */}
          <div className="info-card">
            <div className="card-icon"><Cpu size={24} color="#A78BFA" /></div>
            <h3>Separador IA (Spleeter)</h3>
            <p>Divide tus canciones en pistas independientes. Extrae voces, batería, bajo y piano con precisión profesional.</p>
            <button className="card-action" onClick={() => handleServiceClick('/studio')}>
              {usuario ? 'Separar Audio' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>

          {/* SERVICIO 2: TRANSCRIPCIÓN */}
          <div className="info-card">
            <div className="card-icon"><FileText size={24} color="#10B981" /></div>
            <h3>Transcriptor de Letras</h3>
            <p>Convierte el audio de cualquier canción en texto. Ideal para obtener letras rápidamente y sincronizarlas.</p>
            <button className="card-action" onClick={() => handleServiceClick('/studio')}>
              {usuario ? 'Transcribir ahora' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>

          {/* SERVICIO 3: KARAOKE */}
          <div className="info-card">
            <div className="card-icon"><Video size={24} color="#F43F5E" /></div>
            <h3>Creador de Karaoke</h3>
            <p>Genera videos MP4 con subtítulos .ASS automáticos. Crea tus propias pistas de karaoke en segundos.</p>
            <button className="card-action" onClick={() => handleServiceClick('/studio')}>
              {usuario ? 'Generar Video' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>

          {/* SERVICIO 4: FILTROS */}
          <div className="info-card">
            <div className="card-icon"><Wand2 size={24} color="#3B82F6" /></div>
            <h3>Filtros de Audio</h3>
            <p>Aplica efectos avanzados y mejora la calidad de exportación de tus archivos procesados.</p>
            <button className="card-action" onClick={() => handleServiceClick('/studio')}>
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
              <span className="badge">{usuario.rol}</span>
            </div>
          </div>
        ) : (
          <div className="cta-register-card">
            <h3>Empieza a crear hoy mismo</h3>
            <p>Únete a nuestra comunidad y obtén acceso a todas las herramientas de procesamiento de voz.</p>
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