// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login'; 
import Home from './components/Home/Home';
import Registrar from './components/Registrar/Registrar'; // <--- IMPORTAR

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/registrar" element={<Registrar />} /> {/* <--- NUEVA RUTA */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

