import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC8J6N_GkOF0EWe3sJjM6j68BBRQ1f0UZU",
  authDomain: "qrclasscheck-6e75e.firebaseapp.com",
  projectId: "qrclasscheck-6e75e",
  storageBucket: "qrclasscheck-6e75e.firebasestorage.app",
  messagingSenderId: "719624446695",
  appId: "1:719624446695:web:7c7e68b42086c8dc543842",
  measurementId: "G-F08SWNRW29",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar instancia de autenticación
export const auth = getAuth(app);
