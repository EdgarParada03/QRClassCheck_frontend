// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Login } from "./components/Login";
import { DocenteDashboard } from "./components/DocenteDashboard";
import { Asistencia } from "./components/Asistencia";
import { Reporte } from "./components/Reporte";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

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
      {/* Ruta para registrar asistencia desde QR */}
      <Route path="/asistencia/:idClase" element={<Asistencia />} />
      {/* Ruta para ver el reporte de una clase */}
      <Route path="/reporte/:idClase" element={<Reporte />} />
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
