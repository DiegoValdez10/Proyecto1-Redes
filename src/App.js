import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Inicio from './Paginas/Inicio';
import Chat from './Paginas/Chat';
import Registro from './Paginas/Registro';
import Contacto from './Paginas/Contacto';
import Status from './Paginas/StatusPage';
import Notificacion from './Componentes/Notificación';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/Registro" element={<Registro />} />
      <Route path="/Contacto" element={<Contacto />} />
      <Route path="/Status" element={<Status />} />
      <Route path="/Notificacion" element={<Notificacion />} />
    </Routes>
  );
}

export default App;
