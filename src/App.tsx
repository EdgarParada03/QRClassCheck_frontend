// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./components/Login";
import { DocenteDashboard } from "./components/DocenteDashboard";
import { Asistencia } from "./components/Asistencia";
import { Reporte } from "./components/Reporte";
import { HorarioDocente } from "./components/HorarioDocente";


function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Routes>
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <DocenteDashboard onLogout={handleLogout} />
          )
        }
      />
      <Route path="/asistencia/:idClase" element={<Asistencia />} />
      <Route path="/reporte/:idClase" element={<Reporte />} />
      <Route path="/horario" element={<HorarioDocente docenteId={JSON.parse(localStorage.getItem("userInfo") || "{}")?.id} />} />
      
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
