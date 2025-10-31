import { useEffect, useState } from "react";

export function Asistencia({ idClase }: { idClase: string }) {
    const [estado, setEstado] = useState<"cargando" | "registrado" | "error" | "no-autenticado">("no-autenticado");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        window.google?.accounts.id.initialize({
            client_id: "485928313600-12l15gbi99ic35bp92gv2iud166fh1qk.apps.googleusercontent.com",
            callback: handleCredentialResponse,
        });

        window.google?.accounts.id.renderButton(
            document.getElementById("googleSignInDiv")!,
            { theme: "outline", size: "large" }
        );
    }, []);


    const handleCredentialResponse = async (response: any) => {
        const idToken = response.credential;

        try {
            // Paso 1: registrar usuario como estudiante
            await fetch("https://qrclasscheck-backend.onrender.com/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken, es_docente: false }),
            });

            // Paso 2: registrar asistencia
            const res = await fetch("https://qrclasscheck-backend.onrender.com/asistencia/con-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken, clase_id: idClase }),
            });

            if (res.ok) {
                setEstado("registrado");
                setMensaje("✅ Asistencia registrada correctamente");
            } else {
                const error = await res.json();
                setEstado("error");
                setMensaje(`❌ Error: ${error.message || "No se pudo registrar la asistencia"}`);
            }
        } catch (err) {
            console.error("Error al registrar asistencia:", err);
            setEstado("error");
            setMensaje("❌ Error inesperado al conectar con el servidor");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-md text-center space-y-6">
                <h1 className="text-gray-900 text-xl font-semibold">Registro de Asistencia</h1>

                {estado === "no-autenticado" && (
                    <>
                        <p className="text-gray-600">Inicia sesión con Google para registrar tu asistencia.</p>
                        <div id="googleSignInDiv" className="flex justify-center" />
                    </>
                )}

                {(estado === "registrado" || estado === "error") && (
                    <p className={`text-lg ${estado === "registrado" ? "text-green-600" : "text-red-600"}`}>
                        {mensaje}
                    </p>
                )}
            </div>
        </div>
    );
}
