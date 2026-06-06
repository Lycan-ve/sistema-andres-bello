import { useState } from 'react';
import { db } from "../../wailsjs/go/models";
import { RegistroDocente } from "./Admin/RegistrarDocente";
import { TablaLibros } from './Biblioteca/TablaLibros';
import { RegistrarLibroModal } from './Biblioteca/RegistrarLibros';
// Importamos los iconos necesarios
import { 
  Library, 
  Users, 
  LogOut, 
  UserCircle, 
  GraduationCap, 
  Book
} from 'lucide-react';
import { TablaPrestamos } from './Prestamo/TablaPrestamo';

interface Props {
  usuario: db.Usuario;
  onLogout: () => void;
}

export function Dashboard({ usuario, onLogout }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const esDirector = usuario.rol === "director";
  
  // 1. Actualizamos el tipo del estado vista
  const [vista, setVista] = useState<'inventario' | 'usuarios' | 'prestamo'>('inventario');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <nav className="bg-white p-4 flex justify-between items-center shadow-sm">
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-2 border-r pr-6 border-slate-200">
            <div className="bg-cyan-600 p-1.5 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <span className="font-black text-cyan-800 text-xl uppercase tracking-tighter">
              Andrés Bello
            </span>
          </div>

          <div className="flex gap-2">
            {/* Botón Inventario */}
            <button 
              onClick={() => setVista('inventario')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-bold shadow-sm 
                hover:scale-105 active:scale-95 ${
                vista === 'inventario' 
                ? 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Library size={18} className={`${vista === 'inventario' ? 'animate-pulse' : ''}`} />
              Inventario
            </button>

            {/* Botón Préstamos */}
            <button
              onClick={() => setVista('prestamo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-bold shadow-sm 
                hover:scale-105 active:scale-95 ${
                vista === 'prestamo' 
                ? 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Book size={18} className={`${vista === 'prestamo' ? 'animate-pulse' : ''}`} />
              Préstamos
            </button>
            
            {esDirector && (
              <button 
                onClick={() => setVista('usuarios')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-bold shadow-sm 
                  hover:scale-105 active:scale-95 ${
                  vista === 'usuarios' 
                  ? 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200' 
                  : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Users size={18} className={`${vista === 'usuarios' ? 'animate-pulse' : ''}`} />
                Docentes
              </button>
            )}
          </div>
        </div>

        {/* Perfil y Salida */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
            <UserCircle size={20} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              Hola, <span className="text-cyan-700 font-bold">{usuario.nombre}</span>
            </span>
          </div>
          
          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-sm transition-all duration-300 group hover:translate-x-1"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-red-50 transition-colors">
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            </div>
            Salir
          </button>
        </div>
      </nav>

      {/* RENDERIZADO DINÁMICO DE VISTAS */}
      <main className="p-8 max-w-7xl mx-auto w-full">
        {vista === 'inventario' && (
          <TablaLibros 
            key={refreshKey} 
            rol={usuario.rol} 
            onOpenModal={() => setIsModalOpen(true)}
          />
        )}
        
        {vista === 'prestamo' && (
          <TablaPrestamos />
        )}

        {vista === 'usuarios' && esDirector && (
          <RegistroDocente rolAdmin={usuario.rol} />
        )}
      </main>

      <RegistrarLibroModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleBookAdded}
      />
    </div>
  );
}