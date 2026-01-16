import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registrar.css'; 

const Registrar = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    contrasena: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Para deshabilitar botón mientras carga

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    // Limpiamos error apenas el usuario escribe de nuevo
    if (error) setError(null);
  };

  const validarFormulario = () => {
    // Trim elimina espacios al inicio y final para verificar que no esté vacío "   "
    if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.correo.trim() || !formData.contrasena) {
      return "Por favor, completa todos los campos correctamente.";
    }

    // Regex estándar para emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      return "Introduce un correo electrónico válido.";
    }

    if (formData.contrasena.length < 6) {
      return "La contraseña es muy corta. Mínimo 6 caracteres.";
    }

    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errorMsg = validarFormulario();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      // Limpiamos espacios extra antes de enviar
      const datosEnvar = { 
          nombre: formData.nombre.trim(),
          apellidos: formData.apellidos.trim(),
          correo: formData.correo.trim(),
          contrasena: formData.contrasena, // La contraseña no se trimea usualmente (por si incluye espacios)
          rol: 'usuario' 
      };

      const response = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnvar),
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Cuenta creada con éxito!");
        navigate('/'); 
      } else {
        setError(data.message || "Error al registrarse.");
      }
    } catch (err) {
      console.error(err);
      setError("No hay conexión con el servidor.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Crear Cuenta</h2>
        
        <form onSubmit={handleRegister}>
          <div className="register-form-group">
            <label htmlFor="nombre">Nombre</label>
            <input 
              type="text" 
              id="nombre" 
              className="register-input" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="apellidos">Apellidos</label>
            <input 
              type="text" 
              id="apellidos" 
              className="register-input" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input 
              type="email" 
              id="correo" 
              className="register-input" 
              placeholder="nombre@ejemplo.com"
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input 
              type="password" 
              id="contrasena" 
              className="register-input" 
              placeholder="Mínimo 6 caracteres"
              onChange={handleChange} 
              required 
              minLength="6" // Validación nativa de HTML también ayuda
            />
          </div>

          {error && <p className="error-message" style={{color: 'red', fontSize: '0.9rem'}}>{error}</p>}

          <button type="submit" className="btn-submit-register" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <button 
            type="button" 
            className="btn-back-login" 
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