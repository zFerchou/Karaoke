import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/'); // Si no hay token, fuera
        return;
      }

      try {
        // Llamamos al Backend para que ÉL verifique y decodifique el token
        const response = await fetch('http://localhost:3000/usuarios/perfil', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Enviamos el token en el header
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // data.datosUsuario contiene lo que decodificó el backend
          setUsuario(data.datosUsuario);
        } else {
          // Si el token expiró o es falso, el backend devuelve error
          console.error("Token inválido");
          handleLogout();
        }
      } catch (error) {
        console.error("Error conectando al servidor", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Verificando sesión...</div>;

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      
      {usuario ? (
        <>
          <h1>🎉 ¡Bienvenido al Karaoke, {usuario.nombre}!</h1>
          
          <div style={{ margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', maxWidth: '400px', backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h3>🔐 Datos del usuario:</h3>
            <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
            <p><strong>Correo:</strong> {usuario.correo}</p>
            <p><strong>Rol:</strong> <span style={{ fontWeight: 'bold', color: 'blue' }}>{usuario.rol}</span></p>
          </div>

          <button 
            onClick={handleLogout}
            style={{ padding: '10px 20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
          >
            Cerrar Sesión
          </button>
        </>
      ) : (
        <p>No se pudo cargar la información.</p>
      )}

    </div>
  );
};

export default Home;