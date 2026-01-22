// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login'; 
import Home from './components/Home/Home';
import Registrar from './components/Registrar/Registrar'; 
// 1. IMPORTA EL COMPONENTE NUEVO
// Asegúrate de que el archivo VoiceFilterStudio.jsx esté en la carpeta components
import VoiceFilterStudio from './components/AudioService/VoiceFilterStudio'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/registrar" element={<Registrar />} />
        
        <Route path="/studio" element={<VoiceFilterStudio />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;