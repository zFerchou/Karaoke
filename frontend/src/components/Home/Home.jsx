import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, Cpu, FileText, Video, Wand2 } from 'lucide-react';
import Navbar from '../Navbar';
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
      {/* 1. USAMOS EL COMPONENTE ÚNICO */}
      <Navbar />

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
          <div className="info-card">
            <div className="card-icon"><Cpu size={24} color="#A78BFA" /></div>
            <h3>Separador IA</h3>
            <p>Divide tus canciones en pistas independientes. Extrae voces, batería y más.</p>
            <button className="card-action" onClick={() => handleServiceClick('/separador')}>
              {usuario ? 'Separar Audio' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>

          <div className="info-card">
            <div className="card-icon"><FileText size={24} color="#10B981" /></div>
            <h3>Transcriptor de Letras</h3>
            <p>Convierte el audio de cualquier canción en texto con tecnología Whisper.</p>
            <button className="card-action" onClick={() => handleServiceClick('/transcribir')}>
              {usuario ? 'Transcribir ahora' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>

          <div className="info-card">
            <div className="card-icon"><Video size={24} color="#F43F5E" /></div>
            <h3>Creador de Karaoke</h3>
            <p>Genera videos MP4 con subtítulos sincronizados automáticamente.</p>
            <button className="card-action" onClick={() => handleServiceClick('/karaoke')}>
              {usuario ? 'Generar Video' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>

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
              <span className="badge">{usuario.rol}</span>
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