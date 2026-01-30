import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Star, Info, ArrowRight, LogIn } from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token');
      
      // Si no hay token, no redirigimos, solo dejamos de cargar
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
          // Si el token es inválido, limpiamos pero nos quedamos en Home
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
    setUsuario(null); // Actualizamos el estado local inmediatamente
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
      {/* Navbar Dinámica */}
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
            <h1>¡Hola de nuevo, <span>{usuario.nombre}</span>! 👋</h1>
          ) : (
            <h1>Bienvenido a <span>Karaoke IA</span></h1>
          )}
          <p>La plataforma definitiva para transformar tu voz con inteligencia artificial.</p>
        </section>

        {/* Las tarjetas informativas siempre son visibles */}
        <div className="info-grid">
          <div className="info-card">
            <div className="card-icon"><Star size={24} color="#FFD36A" /></div>
            <h3>Separación de Voces</h3>
            <p>Sube tus canciones y obtén la pista instrumental y la voz por separado.</p>
            <button className="card-action" onClick={() => !usuario && navigate('/')}>
              {usuario ? 'Usar ahora' : 'Ingresa para usar'} <ArrowRight size={16} />
            </button>
          </div>

          <div className="info-card">
            <div className="card-icon"><Star size={24} color="#FFD36A" /></div>
            <h3>Remix con IA</h3>
            <p>Cambia el estilo de cualquier canción usando modelos entrenados.</p>
            <button className="card-action">Próximamente <ArrowRight size={16} /></button>
          </div>
        </div>

        {/* Sección condicional: Perfil vs Invitación */}
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
            <p>Crea una cuenta gratuita para empezar a procesar tus canciones.</p>
            <button className="login-redirect-btn" onClick={() => navigate('/registrar')}>
              Comenzar ahora
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;