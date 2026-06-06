import { useCallback, useEffect, useState } from 'react';
import { 
  ObtenerPrestamos, 
  FinalizarPrestamo 
} from "../../../wailsjs/go/main/App"; 
import { 
  Search, Plus, BookOpen, User, Clock, 
  AlertCircle, CheckCircle2, Calendar, Hash,
  ChevronRight, GraduationCap,
  RefreshCw
} from 'lucide-react';
import { PrestamoModal } from './RegistrarPrestamo';

export function TablaPrestamos() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const cargarPrestamos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ObtenerPrestamos();
      setPrestamos(res || []);
    } catch (err) {
      console.error("Error en DB:", err);
    } finally {
      
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  const filtrados = prestamos.filter(p => {
    if (!busqueda) return true;
    const term = busqueda.toLowerCase();
    const nombreFull = `${p.Solicitante?.nombre} ${p.Solicitante?.apellido}`.toLowerCase();
    const cedula = p.Solicitante?.cedula?.toLowerCase() || "";
    const titulo = p.Libro?.titulo?.toLowerCase() || "";
    return nombreFull.includes(term) || cedula.includes(term) || titulo.includes(term);
  });

  const obtenerDiasRestantes = (fecha: string) => {
    const entrega = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diff = entrega.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER TIPO DASHBOARD */}
      <div className="flex justify-between items-end bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 bg-cyan-600 rounded-2xl shadow-lg shadow-cyan-100 text-white">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase italic">Control de Libros</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Préstamos y Devoluciones Activas</p>
            </div>
          </div>
        </div>
        
        <div className='flex gap-4 items-center'>
          <div className='relative group'>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors"/>
            <input 
              type="text" 
              placeholder="Buscar estudiante o material..." 
              className="pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] w-72 outline-none focus:border-cyan-500 focus:bg-white transition-all text-sm font-bold shadow-inner"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          
          <button
          onClick={cargarPrestamos}
          className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-white hover:text-cyan-600 border-2 border-transparent hover:border-cyan-100 transition-all active:scale-90"
          title="Refrescar datos">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)} 
            className="bg-slate-900 hover:bg-cyan-700 text-white px-7 py-3.5 rounded-[1.5rem] text-[11px] font-black flex items-center gap-3 transition-all shadow-xl active:scale-95 uppercase tracking-widest italic"
          >
            <Plus size={18} strokeWidth={3} /> Registrar Salida
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE TABLA MEJORADO */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto max-h-[550px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación del Usuario</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Material Bibliográfico</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ubicación Escolar</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado de Entrega</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtrados.map((p) => {
                const dias = obtenerDiasRestantes(p.fecha_entrega);
                const esMoroso = dias < 0;
                const esCritico = dias <= 2 && dias >= 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                    {/* SOLICITANTE: Nombre más grande y tipo claro */}
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${p.Solicitante?.tipo === 'docente' ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-600'}`}>
                          {p.Solicitante?.tipo === 'docente' ? <GraduationCap size={20} /> : <User size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-700 uppercase leading-none tracking-tight">
                            {p.Solicitante?.nombre} {p.Solicitante?.apellido}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                             <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${p.Solicitante?.tipo === 'docente' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'}`}>
                              {p.Solicitante?.tipo}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 italic">
                              C.I: {p.Solicitante?.cedula || 'Escolar'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* LIBRO: Badge con mejor contraste */}
                    <td className="p-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-slate-100 rounded-2xl group-hover:border-cyan-200 transition-colors shadow-sm">
                          <BookOpen size={16} className="text-cyan-500" />
                          <span className="text-xs font-black text-slate-600 uppercase italic">
                            {p.Libro?.titulo}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-amber-600">
                          <Hash size={12} strokeWidth={3}/>
                          <span className="text-[10px] font-black uppercase tracking-widest">Lote: {p.cantidad} unidades</span>
                        </div>
                      </div>
                    </td>

                    {/* GRADO: Visualmente jerarquizado */}
                    <td className="p-6 text-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 uppercase">
                          {p.Solicitante?.grado?.nombre || 'General'}
                        </span>
                        <span className="text-[10px] font-bold text-cyan-600 uppercase italic">
                          Sección "{p.Solicitante?.grado?.seccion || '-'}"
                        </span>
                      </div>
                    </td>

                    {/* ESTADO: Semáforo visual intuitivo */}
                    <td className="p-6 text-center">
                      <div className="flex justify-center">
                        {esMoroso ? (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 text-rose-700 border-2 border-rose-100 animate-pulse">
                            <AlertCircle size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase italic">Vencido</span>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all ${esCritico ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                            <Clock size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase italic">{dias} Días Restantes</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* BOTÓN DE ACCIÓN: Más grande y llamativo al hover */}
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => {
                          if(confirm(`¿Confirmar que ${p.Solicitante?.nombre} ha devuelto el material?`)) {
                            FinalizarPrestamo(p.id).then(cargarPrestamos);
                          }
                        }}
                        className="p-3.5 text-slate-300 hover:text-white hover:bg-emerald-500 rounded-2xl transition-all shadow-hover active:scale-90 bg-slate-50 border border-slate-100"
                        title="Marcar como entregado"
                      >
                        <CheckCircle2 size={24} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER DE TABLA */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Mostrando {filtrados.length} registros en circulación
            </p>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div> Al día
               </div>
               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-lg shadow-amber-200"></div> Por vencer
               </div>
               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-lg shadow-rose-200 animate-pulse"></div> Moroso
               </div>
            </div>
        </div>
      </div>

      <PrestamoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={cargarPrestamos}
      />
    </div>
  );
}