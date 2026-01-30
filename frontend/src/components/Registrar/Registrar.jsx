import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft } from "lucide-react"; // Usando iconos para mantener el estilo
import "./Registrar.css";

const Registrar = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    correo: "",
    contrasena: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    if (error) setError(null);
  };

  const validarFormulario = () => {
    if (!formData.nombre || !formData.apellidos || !formData.correo || !formData.contrasena) {
      return "Por favor, completa todos los campos.";
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.correo)) {
      return "El formato del correo no es válido.";
    }
    if (formData.contrasena.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
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
      const datosEnvar = { ...formData, rol: "usuario" };
      const response = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnvar),
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Cuenta creada con éxito!");
        navigate("/"); // Redirige al login
      } else {
        setError(data.message || "Error al registrarse.");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Opcional: Podrías añadir la capa wave-bg aquí también si quieres */}
      <div className="register-card">
        <h2 className="register-title">Crear Cuenta</h2>

        <form onSubmit={handleRegister}>
          <div className="register-form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              className="register-input"
              placeholder="Tu nombre"
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
              placeholder="Tus apellidos"
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

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-submit-register" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <button
            type="button"
            className="btn-back-login"
            onClick={() => navigate("/login")}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registrar;