import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registrar.css"; // Usamos el CSS específico de registro

const Registrar = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    correo: "",
    contrasena: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Para deshabilitar botón mientras carga

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    // Limpiamos error apenas el usuario escribe de nuevo
    if (error) setError(null);
  };

  // --- NUEVA FUNCIÓN DE VALIDACIÓN ---
  const validarFormulario = () => {
    // 1. Validar campos vacíos (aunque el HTML tiene 'required', esto es doble seguridad)
    if (
      !formData.nombre ||
      !formData.apellidos ||
      !formData.correo ||
      !formData.contrasena
    ) {
      return "Por favor, completa todos los campos.";
    }

    // 2. Validar Formato de Correo (Regex)
    // Esto verifica que tenga texto + @ + texto + . + extensión (ej. .com, .mx)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.correo)) {
      return "El formato del correo no es válido. (Ejemplo: usuario@dominio.com)";
    }

    // 3. Validar Longitud de Contraseña
    if (formData.contrasena.length < 6) {
      return "La contraseña es muy corta. Debe tener al menos 6 caracteres.";
    }

    return null; // Si retorna null, es que todo está bien
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errorMsg = validarFormulario();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setLoading(true);

    // PASO 1: Ejecutamos las validaciones antes de contactar al servidor
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return; // Detenemos la función aquí si hay errores
    }

    try {
      const datosEnvar = { ...formData, rol: "usuario" };

      const response = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnvar),
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
        navigate("/");
      } else {
        // Aquí capturamos si el backend dice que el correo ya existe
        // (Asegúrate de que tu backend devuelva un mensaje claro si hay duplicados)
        setError(
          data.message || "Error al registrarse. Intente con otro correo.",
        );
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor. Intente más tarde.");
    }
  };

  return (
    // NOTA: Usamos las clases de Registrar.css (register-container, register-card, etc.)
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
            />
          </div>

          {/* Mensaje de error visible */}
          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-submit-register">
            Registrarse
          </button>

          <button
            type="button"
            className="btn-back-login"
            onClick={() => navigate("/")}
          >
            Volver al Login
          </button>
        </form>
      </div>
    </div>
  );
};
export default Registrar;
