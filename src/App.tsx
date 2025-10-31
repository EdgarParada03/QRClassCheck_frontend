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
        const token = localStorage.getItem("authToken");
        if (!token) {
          localStorage.setItem("asistenciaPendiente", id);
          window.location.href = "/";
        } else {
          setModoAsistencia(true);
          setIdClase(id);
        }
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);

    const asistenciaPendiente = localStorage.getItem("asistenciaPendiente");
    if (asistenciaPendiente) {
      localStorage.removeItem("asistenciaPendiente");
      window.location.href = `/asistencia/${asistenciaPendiente}`;
    }
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
