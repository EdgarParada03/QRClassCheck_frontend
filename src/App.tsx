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

  // Obtener docente_id igual que en el dashboard
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const docente_id = userInfo.sub || userInfo.id || "docente-demo";

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
      <Route path="/horario" element={<HorarioDocente docenteId={docente_id} />} />
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
