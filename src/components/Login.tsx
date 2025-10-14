import { useEffect } from "react";

interface LoginProps {
  onLoginSuccess: () => void;
}

// Declarar el tipo para Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function Login({ onLoginSuccess }: LoginProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: "485928313600-12l15gbi99ic35bp92gv2iud166fh1qk.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInButton")!,
          {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
          }
        );
      } else {
        console.error("Google Identity Services no está disponible");
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    const idToken = response.credential;

    try {
      const backendResponse = await fetch("https://qrclasscheck-backend.onrender.com/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        onLoginSuccess();
      } else {
        console.error("Error en la autenticación");
        alert("Error al iniciar sesión. Por favor, intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      alert("No se pudo conectar con el servidor. Verifica tu conexión.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-12 w-full max-w-md">
        <div className="text-center space-y-6">
          <h1 className="text-gray-900">Bienvenido a QRClassCheck</h1>
          <p className="text-gray-600">
            Inicia sesión con tu cuenta de Google para continuar
          </p>

          {/* Contenedor del botón oficial de Google */}
          <div id="googleSignInButton" className="flex justify-center" />
        </div>
      </div>
    </div>
  );
}
