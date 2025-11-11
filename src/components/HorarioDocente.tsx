// src/components/HorarioDocente.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface Asignatura {
  nombre: string;
  codigo: string;
}

interface Semestre {
  nombre: string;
  año: number;
  periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
}

interface Clase {
  id: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  asignatura: Asignatura;
  semestre: Semestre;
  qrHash: string;
}

export function HorarioDocente({ docenteId }: { docenteId: string }) {
  const [clases, setClases] = useState<Clase[]>([]);
  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  // Generar todas las horas desde 06:00 hasta 22:00
  const HORAS = Array.from({ length: 17 }, (_, i) => `${(6 + i).toString().padStart(2, "0")}:00`);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarClases = async () => {
      try {
        const res = await fetch(
          `https://qrclasscheck-backend.onrender.com/clases?docente_id=${docenteId}`
        );
        if (res.ok) {
          const data = await res.json();
          setClases(data);
        } else {
          console.error("Error al cargar clases");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      }
    };

    cargarClases();
  }, [docenteId]);

  // Mostrar clase en todas las filas que cubren su rango horario
  const obtenerClaseEnCelda = (dia: string, hora: string) => {
    return clases.find((clase) => {
      if (clase.dia !== dia) return false;
      return hora >= clase.hora_inicio && hora < clase.hora_fin;
    });
  };

  const handleVerReporte = (claseId: string) => {
    navigate(`/reporte/${claseId}`);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        {/* Barra superior con acciones */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-gray-300"
          >
            Volver
          </Button>
          <Button
            variant="outline"
            onClick={handleCerrarSesion}
            className="border-gray-300"
          >
            Cerrar sesión
          </Button>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Horario Completo
        </h2>

        {/* Tabla del horario */}
        <table className="table-auto border-collapse w-full text-sm">
          <thead>
            <tr>
              <th className="border p-3 bg-gray-50 text-left">Hora</th>
              {DIAS.map((dia) => (
                <th
                  key={dia}
                  className="border p-3 bg-gray-50 text-center font-medium"
                >
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) => (
              <tr key={hora}>
                <td className="border p-3 font-medium text-gray-700">{hora}</td>
                {DIAS.map((dia) => {
                  const clase = obtenerClaseEnCelda(dia, hora);
                  return (
                    <td
                      key={`${dia}-${hora}`}
                      className="border p-3 text-center align-top"
                    >
                      {clase ? (
                        <div className="bg-blue-50 border border-blue-300 rounded-md p-2 space-y-1">
                          <p className="text-blue-900 font-semibold">
                            {clase.asignatura.nombre}
                          </p>
                          <p className="text-xs text-blue-700">
                            {clase.asignatura.codigo}
                          </p>
                          <div className="flex justify-center pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1"
                              onClick={() => handleVerReporte(clase.id)}
                            >
                              Reporte
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">–</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
