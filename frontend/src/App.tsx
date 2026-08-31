import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ConfiguracionInicial } from './components/Admin/ConfiguracionInicial'; // Asegúrate de importar el componente
import { 
  CerrarSesion, 
  ObtenerSesionActual, 
  FinalizarLogin,
  CheakAdminExists
} from "../wailsjs/go/main/App";
import { db } from "../wailsjs/go/models";

export default function App() {
  const [estadoApp, setEstadoApp] = useState<'cargando' | 'configuracion' | 'login' | 'dashboard'>('cargando');
  const [usuario, setUsuario] = useState<db.Usuario | null>(null);

  // Un solo useEffect para manejar todo el flujo inicial
  useEffect(() => {
    const inicializarApp = async () => {
      try {
        // 1. Verificamos si existe el director en la BD
        const adminExiste = await CheakAdminExists();
        
        if (!adminExiste) {
          // Si no existe, cortamos aquí y mandamos a configurar
          setEstadoApp('configuracion');
          return; 
        }

        // 2. Si el admin existe, verificamos si hay una sesión activa
        const sesion = await ObtenerSesionActual();
        
        if (sesion) {
          setUsuario(sesion);
          await FinalizarLogin(); // Ajusta la ventana para el Dashboard
          setEstadoApp('dashboard');
        } else {
          setEstadoApp('login'); // Hay admin, pero no ha iniciado sesión
        }

      } catch (error) {
        console.error("Error inicializando la app:", error);
        // Por defecto, si hay error mandamos a login para evitar que se quede cargando infinito
        setEstadoApp('login'); 
      }
    };

    inicializarApp();
  }, []);

  const handleLoginSuccess = (user: db.Usuario) => {
    setUsuario(user);
    setEstadoApp('dashboard'); // Cambiamos el estado para renderizar el Dashboard
  };

  const handleLogout = async () => {
    await CerrarSesion();
    setUsuario(null);
    setEstadoApp('login'); // Devolvemos al usuario al Login
  };

  // --- RENDERIZADO ---

  // 1. Pantalla de carga unificada
  if (estadoApp === 'cargando') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f8fafc] flex-col gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        <span className="text-cyan-600 font-bold uppercase tracking-widest text-[10px]">
          Iniciando Sistema...
        </span>
      </div>
    );
  }

  // 2. Pantalla de primer uso
  if (estadoApp === 'configuracion') {
    return <ConfiguracionInicial onComplete={() => setEstadoApp('login')} />;
  }

  // 3. Sistema principal (Login o Dashboard)
  return (
    <main className="h-screen w-screen bg-[#f8fafc] antialiased overflow-hidden">
      {estadoApp === 'dashboard' && usuario ? (
        <Dashboard usuario={usuario} onLogout={handleLogout} />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-slate-200">
           <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
    </main>
  );
}