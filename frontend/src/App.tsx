import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { 
  CerrarSesion, 
  ObtenerSesionActual, 
  FinalizarLogin 
} from "../wailsjs/go/main/App";
import { db } from "../wailsjs/go/models";

export default function App() {
  const [usuario, setUsuario] = useState<db.Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // 1. Efecto de recuperación de sesión (Al arrancar la app)
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const sesion = await ObtenerSesionActual();
        if (sesion) {
          setUsuario(sesion);
          // Si hay sesión, aseguramos que la ventana tenga el tamaño de Dashboard
          await FinalizarLogin();
        }
      } catch (error) {
        console.error("Error recuperando sesión:", error);
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
  }, []);

  const handleLoginSuccess = (user: db.Usuario) => {
    setUsuario(user);
  };

  const handleLogout = async () => {
    await CerrarSesion();
    setUsuario(null);
  };

  // Pantalla de carga opcional para que no parpadee el Login al recargar
  if (cargando) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f8fafc] text-cyan-600 font-bold uppercase tracking-widest text-xs">
        Cargando Sistema...
      </div>
    );
  }

  return (
  <main className="h-screen w-screen bg-[#f8fafc] antialiased overflow-hidden">
    {usuario ? (
      <Dashboard usuario={usuario} onLogout={handleLogout} />
    ) : (
      // Solo el Login se centra con fondo gris
      <div className="h-full w-full flex items-center justify-center bg-slate-200">
         <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    )}
  </main>
);
}