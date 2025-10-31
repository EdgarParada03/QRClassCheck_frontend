import { useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

export function Asistencia({ idClase }: { idClase: string }) {
  const [estado, setEstado] = useState<
    "cargando" | "registrado" | "error" | "no-autenticado"
  >("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const verificarAutenticacion = async () => {
      onAuthStateChanged(auth, async (usuario) => {
        if (!usuario) {
          setEstado("no-autenticado");
          return;
        }

        try {
          const idToken = await usuario.getIdToken(true); // fuerza refresco

          // Paso 1: registrar usuario como estudiante
          await fetch("https://qrclasscheck-backend.onrender.com/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken, es_docente: false }),
          });

          // Paso 2: registrar asistencia
          const response = await fetch(
            "https://qrclasscheck-backend.onrender.com/api/asistencia/con-token",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken, clase_id: idClase }),
            }
          );

          if (response.ok) {
            setEstado("registrado");
            setMensaje("✅ Asistencia registrada correctamente");
          } else {
            const error = await response.json();
            setEstado("error");
            setMensaje(
              `❌ Error: ${error.message || "No se pudo registrar la asistencia"}`
            );
          }
        } catch (err) {
          console.error("Error al registrar asistencia:", err);
          setEstado("error");
          setMensaje("❌ Error inesperado al conectar con el servidor");
        }
      });
    };

    verificarAutenticacion();
  }, [idClase]);

  const iniciarSesion = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setEstado("cargando");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setEstado("error");
      setMensaje("❌ No se pudo iniciar sesión con Google");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-md text-center space-y-6">
        <h1 className="text-gray-900 text-xl font-semibold">
          Registro de Asistencia
        </h1>

        {estado === "cargando" && (
          <p className="text-gray-600">Verificando autenticación...</p>
        )}

        {estado === "no-autenticado" && (
          <>
            <p className="text-gray-600">
              Debes iniciar sesión con Google para registrar tu asistencia.
            </p>
            <button
              onClick={iniciarSesion}
              className="bg-[#1a2332] hover:bg-[#2a3442] text-white px-4 py-2 rounded-md"
            >
              Iniciar sesión con Google
            </button>
          </>
        )}

        {(estado === "registrado" || estado === "error") && (
          <p
            className={`text-lg ${
              estado === "registrado" ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
