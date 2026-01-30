import React from 'react';
import { Navigate } from 'react-router-dom';

const PremiumRoute = ({ children }) => {
  // Obtenemos el usuario del localStorage (guardado en el Login)
  const usuarioString = localStorage.getItem('usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  // 1. Si no hay usuario logueado, mandar a login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si hay usuario pero NO es premium, mandar al home
  if (usuario.rol !== 'premium') {
    alert("Acceso denegado: Necesitas ser Premium para acceder a esta ruta.");
    return <Navigate to="/home" replace />;
  }

  // 3. Si es premium, renderizar el componente hijo
  return children;
};

export default PremiumRoute;