import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LogIn, Home as HomeIcon } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUsuario(true); 
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/login');
  };

  return (
    <header className="home-header">
      {/* LADO IZQUIERDO: SOLO EL LOGO */}
      <div className="header-logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
        Karaoke <span>IA</span>
      </div>
      
      {/* LADO DERECHO: ACCIONES CON EL MISMO ESTILO */}
      <div className="nav-actions">
        {usuario ? (
          <>
            {/* Botón Home (Estilo Morado) */}
            <button onClick={() => navigate('/home')} className="nav-home-btn">
              <HomeIcon size={18} />
              <span>Inicio</span>
            </button>

            {/* Botón Salir (Estilo Coral/Rojo) */}
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="login-btn-nav">
            <LogIn size={18} />
            <span>Iniciar Sesión</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;