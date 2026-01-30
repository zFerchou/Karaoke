// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login'; 
import Home from './components/Home/Home';
import Registrar from './components/Registrar/Registrar'; 
import VoiceFilterStudio from './components/AudioService/VoiceFilterStudio'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas principales */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        
        {/* Rutas de Servicios Independientes */}
        <Route path="/separador" element={<VoiceFilterStudio mode="spleeter" />} />
        <Route path="/transcribir" element={<VoiceFilterStudio mode="transcribe" />} />
        <Route path="/karaoke" element={<VoiceFilterStudio mode="video" />} />
        <Route path="/filtros" element={<VoiceFilterStudio mode="filter" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;