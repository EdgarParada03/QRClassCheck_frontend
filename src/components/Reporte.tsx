import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";

interface Asistencia {
  estudiante: string;
  fecha: string;
  hora: string;
}

interface Clase {
  id: string;
  asignatura: { nombre: string; codigo: string };
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

export function Reporte() {
  const { idClase } = useParams();
  const navigate = useNavigate();
  const [clase, setClase] = useState<Clase | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);

  const docenteEmail = JSON.parse(localStorage.getItem("userInfo") || "{}")?.email;

  useEffect(() => {
    const cargarReporte = async () => {
      try {
        const res = await fetch(`https://qrclasscheck-backend.onrender.com/reporte/${idClase}`);
        if (res.ok) {
          const data = await res.json();
          setClase(data.clase);
          setAsistencias(data.asistencias);
        } else {
          alert("❌ Error al cargar el reporte");
        }
      } catch (error) {
        console.error("Error al conectar con el backend:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarReporte();
  }, [idClase]);

  const handleDescargarPDF = () => {
    window.open(`https://qrclasscheck-backend.onrender.com/reporte/${idClase}/pdf`, "_blank");
  };

  const handleEnviarCorreo = async () => {
    try {
      const res = await fetch(`https://qrclasscheck-backend.onrender.com/reporte/${idClase}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: docenteEmail }),
      });

      if (res.ok) {
        alert("📧 Reporte enviado al correo");
      } else {
        alert("❌ Error al enviar el correo");
      }
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }
  };

  if (loading) return <p className="p-6">Cargando reporte...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Reporte de Asistencia</h2>

        {clase && (
          <div className="text-gray-700 space-y-1">
            <p><strong>Clase:</strong> {clase.asignatura.nombre}</p>
            <p><strong>Código:</strong> {clase.asignatura.codigo}</p>
            <p><strong>Horario:</strong> {clase.dia} {clase.hora_inicio} - {clase.hora_fin}</p>
          </div>
        )}

        <table className="w-full border border-gray-300 rounded-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Estudiante</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Hora Registro</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map((a, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{a.estudiante}</td>
                <td className="p-2">{a.fecha}</td>
                <td className="p-2">{a.hora}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
          <Button onClick={handleDescargarPDF}>Descargar PDF</Button>
          <Button variant="outline" onClick={handleEnviarCorreo}>Enviar al Correo</Button>
        </div>
      </div>
    </div>
  );
}
