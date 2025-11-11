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
  const HORAS = ["08:00", "10:00", "14:00", "16:00", "18:00"];
  const navigate = useNavigate();

  useEffect(() => {
    const cargarClases = async () => {
      try {
        const res = await fetch(`https://qrclasscheck-backend.onrender.com/clases?docente_id=${docenteId}`);
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

  const obtenerClaseExacta = (dia: string, hora: string) => {
    return clases.find((clase) => clase.dia === dia && clase.hora_inicio === hora);
  };

  const handleVerReporte = (claseId: string) => {
    navigate(`/reporte/${claseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Horario Completo</h2>
        <table className="table-auto border-collapse w-full text-sm">
          <thead>
            <tr>
              <th className="border p-3 bg-gray-50 text-left">Hora</th>
              {DIAS.map((dia) => (
                <th key={dia} className="border p-3 bg-gray-50 text-center">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) => (
              <tr key={hora}>
                <td className="border p-3 font-medium text-gray-700">{hora}</td>
                {DIAS.map((dia) => {
                  const clase = obtenerClaseExacta(dia, hora);
                  return (
                    <td key={`${dia}-${hora}`} className="border p-3 text-center align-top">
                      {clase ? (
                        <div className="bg-blue-50 border border-blue-300 rounded-md p-2 space-y-1">
                          <p className="text-blue-900 font-semibold">{clase.asignatura.nombre}</p>
                          <p className="text-xs text-blue-700">{clase.asignatura.codigo}</p>
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
