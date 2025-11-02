import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Login } from "./components/Login";
import { DocenteDashboard } from "./components/DocenteDashboard";
import { Asistencia } from "./components/Asistencia";
import { Reporte } from "./components/Reporte";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modoAsistencia, setModoAsistencia] = useState(false);
  const [idClase, setIdClase] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsAuthenticated(true);

    const pathname = window.location.pathname;
    if (pathname.startsWith("/asistencia/")) {
      const partes = pathname.split("/");
      const id = partes[2];
      if (id) {
        setModoAsistencia(true);
        setIdClase(id);
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (modoAsistencia && idClase) {
    return <Asistencia idClase={idClase} />;
  }

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
