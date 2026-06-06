import { useState, useEffect } from "react";
import { X, Search, User, GraduationCap, School, ChevronRight, BadgeCheck } from "lucide-react"; 
import { ListarEstudiantes } from "../../../wailsjs/go/main/App";
import { db } from "../../../wailsjs/go/models";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (estudiante: db.Solicitante) => void; 
}

export function ListaEstudiantes({ isOpen, onClose, onSelect }: Props) {
  const [estudiantes, setEstudiantes] = useState<db.Solicitante[]>([]);
  const [filtro, setFiltro] = useState(""); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      ListarEstudiantes()
        .then((data) => setEstudiantes(data || []))
        .catch(err => console.error("Error:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const estudiantesFiltrados = estudiantes.filter(e => {
    const busqueda = filtro.toLowerCase();
    const nombreCompleto = `${e.nombre} ${e.apellido}`.toLowerCase();
    const cedula = e.cedula ? e.cedula.toLowerCase() : "";
    return nombreCompleto.includes(busqueda) || cedula.includes(busqueda);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl border border-white flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER MÁS ESPACIADO */}
        <div className="p-8 pb-4 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-cyan-600 text-white rounded-[1.5rem] shadow-xl shadow-cyan-100">
              <School size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase italic text-slate-800 leading-none">Registros</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Selecciona un solicitante para el préstamo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-rose-50 rounded-full text-slate-300 hover:text-rose-500 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* BUSCADOR MÁS GRANDE */}
        <div className="px-8 mb-6 shrink-0">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Escribe el nombre o cédula aquí..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-cyan-500 focus:bg-white transition-all font-bold text-lg text-slate-700 shadow-inner"
            />
          </div>
        </div>

        {/* LISTADO CON MÁS AIRE */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Consultando Archivos...</p>
            </div>
          ) : estudiantesFiltrados.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <User className="mx-auto text-slate-200 mb-4" size={50} />
              <p className="text-slate-500 font-black uppercase text-xs">No hay resultados para esta búsqueda</p>
            </div>
          ) : (
            estudiantesFiltrados.map((e) => (
              <div
                key={e.id}
                onClick={() => onSelect(e)}
                className="group relative p-6 bg-white border-2 border-slate-50 rounded-[2.2rem] hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-100/50 cursor-pointer transition-all flex items-center gap-5 overflow-hidden"
              >
                {/* Indicador lateral de tipo */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 transition-all group-hover:w-3 ${e.tipo === 'docente' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />

                {/* Avatar / Icono */}
                <div className={`w-14 h-14 shrink-0 rounded-[1.2rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${e.tipo === 'docente' ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-600'}`}>
                   {e.tipo === 'docente' ? <BadgeCheck size={28} /> : <GraduationCap size={28} />}
                </div>

                {/* Datos Principales */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-black text-slate-800 uppercase text-lg truncate tracking-tight">
                      {e.nombre} {e.apellido}
                    </p>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${e.tipo === 'docente' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      {e.tipo}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase italic">
                      <span className="text-slate-300">C.I:</span>
                      {e.cedula || <span className="text-amber-500 font-black">Escolar</span>}
                    </div>
                    <span className="text-slate-200">•</span>
                    <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase italic">
                      <span className="text-slate-300">Ubicación:</span>
                      {e.grado?.nombre || 'S/G'} "{e.grado?.seccion || '-'}"
                    </div>
                  </div>
                </div>
                
                {/* Botón de Selección Visual */}
                <div className="opacity-0 group-hover:opacity-100 transition-all bg-cyan-600 p-3 rounded-2xl text-white shadow-lg -translate-x-4 group-hover:translate-x-0">
                  <ChevronRight size={20} strokeWidth={3} />
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer Informativo */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
             Total de registros encontrados: {estudiantesFiltrados.length}
          </p>
        </div>
      </div>
    </div>
  );
}