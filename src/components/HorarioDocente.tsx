// src/components/HorarioDocente.tsx

import { useEffect, useState } from "react";
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
  const HORAS = Array.from({ length: 17 }, (_, i) => `${(6 + i).toString().padStart(2, "0")}:00`);

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

  const obtenerClaseEnCelda = (dia: string, hora: string) => {
    return clases.find((clase) => {
      if (clase.dia !== dia) return false;
      return hora >= clase.hora_inicio && hora < clase.hora_fin;
    });
  };

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Horario Académico</h2>
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 text-left">Hora</th>
            {DIAS.map((dia) => (
              <th key={dia} className="border p-2 bg-gray-100 text-center">{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HORAS.map((hora) => (
            <tr key={hora}>
              <td className="border p-2 text-sm text-gray-700">{hora}</td>
              {DIAS.map((dia) => {
                const clase = obtenerClaseEnCelda(dia, hora);
                return (
                  <td key={`${dia}-${hora}`} className="border p-2 text-sm text-center align-top">
                    {clase ? (
                      <div className="bg-blue-50 border border-blue-300 rounded p-1 space-y-1">
                        <p className="font-medium text-blue-900">{clase.asignatura.nombre}</p>
                        <p className="text-xs text-blue-700">{clase.asignatura.codigo}</p>
                        <div className="flex justify-center gap-1 pt-1">
                          <Button size="sm" className="text-xs px-2 py-1">QR</Button>
                          <Button size="sm" variant="outline" className="text-xs px-2 py-1">Reporte</Button>
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
  );
}
