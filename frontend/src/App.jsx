import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './Global.css'; 
import Login from './components/Login/Login'; 
import Home from './components/Home/Home';
import Registrar from './components/Registrar/Registrar'; 
import VoiceFilterStudio from './components/AudioService/VoiceFilterStudio'; 
import PremiumRoute from './components/PremiumRoute/PremiumRoute'; // <--- IMPORTAR

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        
        <Route path="/separador" element={<VoiceFilterStudio mode="spleeter" />} />
        <Route path="/transcribir" element={<VoiceFilterStudio mode="transcribe" />} />
        <Route path="/filtros" element={<VoiceFilterStudio mode="filter" />} />

        {/* --- RUTA PROTEGIDA PARA PREMIUM --- */}
        <Route 
          path="/karaoke" 
          element={
            <PremiumRoute>
              <VoiceFilterStudio mode="video" />
            </PremiumRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;