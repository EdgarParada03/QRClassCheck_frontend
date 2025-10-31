import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { DocenteDashboard } from "./components/DocenteDashboard";
import { Asistencia } from "./components/Asistencia";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modoAsistencia, setModoAsistencia] = useState(false);
  const [idClase, setIdClase] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsAuthenticated(true);

    // Detectar si la URL contiene /asistencia/:idClase
    const pathname = window.location.pathname;
    if (pathname.startsWith("/asistencia/")) {
      const partes = pathname.split("/");
      const id = partes[2]; // /asistencia/abc123 → abc123
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
    <>
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DocenteDashboard onLogout={handleLogout} />
      )}
    </>
  );
}
