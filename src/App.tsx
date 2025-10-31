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

    const pathname = window.location.pathname;
    if (pathname.startsWith("/asistencia/")) {
      const partes = pathname.split("/");
      const id = partes[2];
      if (id) {
        // Ya no redirigimos al login ni verificamos authToken
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

  // Si estamos en modo asistencia, renderizamos ese componente directamente
  if (modoAsistencia && idClase) {
    return <Asistencia idClase={idClase} />;
  }

  // Flujo normal para docentes
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
