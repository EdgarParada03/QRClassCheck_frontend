import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Clock } from "lucide-react";

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

interface DocenteDashboardProps {
  onLogout: () => void;
}

export function DocenteDashboard({ onLogout }: DocenteDashboardProps) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [qrModal, setQrModal] = useState<{ visible: boolean; clase: Clase | null }>({
    visible: false,
    clase: null,
  });

  const [formulario, setFormulario] = useState({
    dia: "",
    hora_inicio: "",
    hora_fin: "",
    asignaturaSeleccionada: "",
    semestreSeleccionado: "",
    nuevaAsignatura: { nombre: "", codigo: "" },
    nuevoSemestre: {
      nombre: "",
      año: "",
      periodo: "",
      fecha_inicio: "",
      fecha_fin: "",
    },
    tema: "",
  });

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const docente_id = userInfo.sub || userInfo.id || "docente-demo";
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resClases, resAsignaturas, resSemestres] = await Promise.all([
          fetch(`https://qrclasscheck-backend.onrender.com/clases?docente_id=${docente_id}`),
          fetch("https://qrclasscheck-backend.onrender.com/asignaturas"),
          fetch("https://qrclasscheck-backend.onrender.com/semestres"),
        ]);

        if (resClases.ok) setClases(await resClases.json());
        if (resAsignaturas.ok) setAsignaturas(await resAsignaturas.json());
        if (resSemestres.ok) setSemestres(await resSemestres.json());
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, [docente_id]);

  const handleGuardarClase = async () => {
    const {
      dia,
      hora_inicio,
      hora_fin,
      asignaturaSeleccionada,
      semestreSeleccionado,
      nuevaAsignatura,
      nuevoSemestre,
      tema,
    } = formulario;

    if (!dia || !hora_inicio || !hora_fin) {
      alert("Completa día y horas");
      return;
    }

    if (dia === "Domingo") {
      alert("No se pueden programar clases los domingos");
      return;
    }

    if (hora_inicio < "06:00" || hora_fin > "22:05") {
      alert("La hora debe estar entre 06:00 y 22:05");
      return;
    }

    if (hora_fin <= hora_inicio) {
      alert("La hora de fin debe ser mayor que la de inicio");
      return;
    }

    const asignatura =
      asignaturaSeleccionada === "nueva"
        ? nuevaAsignatura
        : asignaturas.find((a) => a.codigo === asignaturaSeleccionada);

    const semestre =
      semestreSeleccionado === "nuevo"
        ? { ...nuevoSemestre, año: parseInt(nuevoSemestre.año) }
        : semestres.find((s) => s.nombre === semestreSeleccionado);

    if (!asignatura || !semestre) {
      alert("Completa los datos de asignatura y semestre");
      return;
    }

    const payload = {
      dia,
      hora_inicio,
      hora_fin,
      asignatura,
      semestre,
      docente_id,
      tema,
    };

    try {
      const response = await fetch("https://qrclasscheck-backend.onrender.com/clases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setClases((prev) => [data, ...prev]);
        alert("✅ Clase creada correctamente");
        setFormulario({
          dia: "",
          hora_inicio: "",
          hora_fin: "",
          asignaturaSeleccionada: "",
          semestreSeleccionado: "",
          tema: "",
          nuevaAsignatura: { nombre: "", codigo: "" },
          nuevoSemestre: {
            nombre: "",
            año: "",
            periodo: "",
            fecha_inicio: "",
            fecha_fin: "",
          },
        });
      } else {
        alert("❌ Error al crear la clase");
      }
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      alert("❌ No se pudo conectar con el servidor");
    }
  };

  const handleGenerarQR = (clase: Clase) => {
    setQrModal({ visible: true, clase });
  };

  const handleVerReporte = (claseId: string) => {
    navigate(`/reporte/${claseId}`);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    onLogout();
  };
  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
            <h1 className="text-gray-900">Panel Docente</h1>
            <Button variant="outline" onClick={handleCerrarSesion} className="border-gray-300">
              Cerrar sesión
            </Button>
          </div>

          {/* Crear Clase */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-gray-900 mb-6">Crear Clase</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <SelectField label="Día" value={formulario.dia} onChange={(v) => setFormulario({ ...formulario, dia: v })} options={["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]} placeholder="Selecciona el día" />
              <InputField label="Hora Inicio" type="time" value={formulario.hora_inicio} onChange={(v) => setFormulario({ ...formulario, hora_inicio: v })} />
              <InputField label="Hora Fin" type="time" value={formulario.hora_fin} onChange={(v) => setFormulario({ ...formulario, hora_fin: v })} />

              <div className="md:col-span-3 space-y-2">
                <Label className="text-gray-700">Tema de la clase</Label>
                <textarea
                  value={formulario.tema}
                  onChange={(e) => {
                    const texto = e.target.value;
                    if (texto.length <= 500) {
                      setFormulario({ ...formulario, tema: texto });
                    }
                  }}
                  placeholder="Escribe el contenido o tema que se dictará en esta sesión"
                  className="w-full border border-gray-300 rounded-md p-2 resize-none min-h-[100px]"
                />
                <p className="text-sm text-gray-500">Máximo 500 caracteres. Campo opcional pero recomendado.</p>
              </div>

              <SelectField label="Asignatura" value={formulario.asignaturaSeleccionada} onChange={(v) => setFormulario({ ...formulario, asignaturaSeleccionada: v })} options={[...asignaturas.map((a) => a.codigo), "nueva"]} placeholder="Selecciona o crea una asignatura" />
              {formulario.asignaturaSeleccionada === "nueva" && (
                <>
                  <InputField label="Nombre Asignatura" value={formulario.nuevaAsignatura.nombre} onChange={(v) => setFormulario({ ...formulario, nuevaAsignatura: { ...formulario.nuevaAsignatura, nombre: v } })} />
                  <InputField label="Código Asignatura" value={formulario.nuevaAsignatura.codigo} onChange={(v) => setFormulario({ ...formulario, nuevaAsignatura: { ...formulario.nuevaAsignatura, codigo: v } })} />
                </>
              )}

              <SelectField label="Semestre" value={formulario.semestreSeleccionado} onChange={(v) => setFormulario({ ...formulario, semestreSeleccionado: v })} options={[...semestres.map((s) => s.nombre), "nuevo"]} placeholder="Selecciona o crea un semestre" />
              {formulario.semestreSeleccionado === "nuevo" && (
                <>
                  <InputField label="Nombre Semestre" value={formulario.nuevoSemestre.nombre} onChange={(v) => setFormulario({ ...formulario, nuevoSemestre: { ...formulario.nuevoSemestre, nombre: v } })} />
                  <InputField label="Año" type="number" value={formulario.nuevoSemestre.año} onChange={(v) => setFormulario({ ...formulario, nuevoSemestre: { ...formulario.nuevoSemestre, año: v } })} />
                  <SelectField label="Periodo" value={formulario.nuevoSemestre.periodo} onChange={(v) => setFormulario({ ...formulario, nuevoSemestre: { ...formulario.nuevoSemestre, periodo: v } })} options={["A", "B"]} placeholder="Selecciona periodo" />
                  <InputField label="Inicio Semestre" type="date" value={formulario.nuevoSemestre.fecha_inicio} onChange={(v) => setFormulario({ ...formulario, nuevoSemestre: { ...formulario.nuevoSemestre, fecha_inicio: v } })} />
                  <InputField label="Fin Semestre" type="date" value={formulario.nuevoSemestre.fecha_fin} onChange={(v) => setFormulario({ ...formulario, nuevoSemestre: { ...formulario.nuevoSemestre, fecha_fin: v } })} />
                </>
              )}
            </div>

            <Button onClick={handleGuardarClase} className="w-full bg-[#1a2332] hover:bg-[#2a3442] text-white">
              Guardar Clase
            </Button>
          </div>

          {/* Horario Generado */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-700" />
                <h2 className="text-gray-900 text-lg font-semibold">Horario Generado</h2>
              </div>
              <Button variant="outline" className="border-gray-300">Ver Horario Completo</Button>
            </div>

            <div className="space-y-4">
              {clases.map((clase) => (
                <div key={clase.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="text-gray-900 font-medium">{clase.asignatura.nombre} ({clase.asignatura.codigo})</h3>
                    <p className="text-gray-600">{clase.dia}: {clase.hora_inicio} - {clase.hora_fin}</p>
                    <p className="text-gray-500 text-sm">{clase.semestre.nombre} - {clase.semestre.año} ({clase.semestre.periodo})</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleGenerarQR(clase)} className="bg-[#1a2332] hover:bg-[#2a3442] text-white">Generar QR</Button>
                    <Button variant="outline" onClick={() => handleVerReporte(clase.id)} className="border-gray-300">Reporte</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal QR dinámico */}
      {qrModal.visible && qrModal.clase && <QRModalDinamico clase={qrModal.clase} onClose={() => setQrModal({ visible: false, clase: null })} />}
    </>
  );
}

// Modal QR dinámico
function QRModalDinamico({ clase, onClose }: { clase: Clase; onClose: () => void }) {
  const [qrUrl, setQrUrl] = useState("");

  // dentro de QRModalDinamico
  useEffect(() => {
    const generarQR = () => {
      const origin = window.location.origin;
      const baseUrl = `${origin}/asistencia/${clase.id}`;
      const qrData = `${baseUrl}#${Date.now()}`; // cambia cada 10s

      const qr = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=200x200`;
      setQrUrl(qr);
    };

    generarQR();
    const interval = setInterval(generarQR, 10000);
    return () => clearInterval(interval);
  }, [clase.id]);




  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[320px] text-center relative">
        <h3 className="text-gray-900 font-semibold mb-4">QR dinámico de la clase</h3>
        <img src={qrUrl} alt="QR dinámico" className="mx-auto w-48 h-48 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          {clase.asignatura.nombre} ({clase.asignatura.codigo})<br />
          {clase.dia}: {clase.hora_inicio} - {clase.hora_fin}
        </p>
        <Button onClick={onClose} variant="outline" className="w-full border-gray-300">Cerrar</Button>
      </div>
    </div>
  );
}

// Componentes auxiliares

function InputField({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-gray-300"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-gray-300">
          <SelectValue placeholder={placeholder || `Selecciona ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt === "nueva" || opt === "nuevo" ? `➕ ${label} nueva` : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
