import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // <--- Importar Google
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
        console.log("Login correcto:", data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        navigate('/home'); 
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("No se pudo conectar con el servidor.");
    }
  };

  // --- FUNCIÓN PARA LOGIN CON GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:3000/usuarios/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Google Login correcto:", data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        navigate('/home');
      } else {
        setError("Error al iniciar sesión con Google");
      }
    } catch (error) {
      console.error("Error Google:", error);
      setError("No se pudo conectar con el servidor.");
    }
  };

  return (
    // REEMPLAZA CON TU CLIENT ID REAL DE GOOGLE CLOUD
    <GoogleOAuthProvider clientId="262428448408-i48oqhsei1hth1dgdrh2p6gu9u93fgid.apps.googleusercontent.com">
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">🎤 Karaoke Bar</h2>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                type="email"
                id="correo"
                className="form-input"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>

            {/* --- BOTÓN DE GOOGLE --- */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Falló el inicio de sesión con Google")}
                    theme="filled_blue"
                    shape="pill"
                    text="signin_with"
                />
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <p style={{ marginBottom: '10px', color: '#666' }}>¿No tienes cuenta?</p>
              <button 
                type="button" 
                className="register-button"
                onClick={() => navigate('/registrar')} 
              >
                Registrarse Manualmente
              </button>
            </div>

          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;