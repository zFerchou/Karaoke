import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registrar.css'; // Reusamos los mismos estilos

const Registrar = () => {
  const navigate = useNavigate();
  
  // Estados para el registro
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    contrasena: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Enviamos rol: "usuario" por defecto
      const datosEnvar = { ...formData, rol: 'usuario' };

      const response = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnvar),
      });

      if (response.ok) {
        alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
        navigate('/'); // Redirigir al Login
      } else {
        const data = await response.json();
        setError(data.message || "Error al registrarse");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Crear Cuenta</h2>
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" className="form-input" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="apellidos">Apellidos</label>
            <input type="text" id="apellidos" className="form-input" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input type="email" id="correo" className="form-input" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input type="password" id="contrasena" className="form-input" onChange={handleChange} required />
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button type="submit" className="login-button">
            Registrarse
          </button>

          <button 
            type="button" 
            className="register-button" 
            style={{ backgroundColor: '#6c757d', marginTop: '10px' }}
            onClick={() => navigate('/')}
          >
            Volver al Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registrar;