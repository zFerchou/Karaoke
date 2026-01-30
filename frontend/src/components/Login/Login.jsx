import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowLeft } from 'lucide-react'; 
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        navigate('/'); 
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <GoogleOAuthProvider clientId="TU_CLIENT_ID">
      <div className="login-container">
        <div className="wave-bg"></div>
        
        <div className="login-card">
          <div className="login-header">
             <h1 className="brand-title">Karaoke <span>IA</span></h1>
             <p className="brand-subtitle">Tu voz, potenciada con IA.</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="login-submit-btn">
              Iniciar Sesión
            </button>

            <a href="#!" className="forgot-password">¿Olvidaste tu contraseña?</a>

            <div className="separator">
               <span>O continúa con</span>
            </div>

            <div className="social-login">
              <GoogleLogin
                onSuccess={(res) => console.log(res)}
                onError={() => setError("Error con Google")}
                theme="filled_blue"
                shape="rect"
                width="100%"
              />
            </div>

            <p className="register-text">
              ¿Nuevo en Karaoke IA? <br />
              <span onClick={() => navigate('/registrar')}>¡Regístrate!</span>
            </p>

            {/* BOTÓN PARA VOLVER AL HOME */}
            <button 
              type="button" 
              className="btn-back-home" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </button>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;