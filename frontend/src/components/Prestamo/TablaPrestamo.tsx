import { useCallback, useEffect, useState } from 'react';
import { 
  ObtenerPrestamos, 
  FinalizarPrestamo 
} from "../../../wailsjs/go/main/App"; 
import { 
  Search, Plus, BookOpen, User, Clock, 
  AlertCircle, CheckCircle2, Calendar, 
  GraduationCap,
  RefreshCw 
} from 'lucide-react';
import { PrestamoModal } from './RegistrarPrestamo';

export function TablaPrestamos() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

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
    const nombreFull = `${p.Solicitante?.nombre || ''} ${p.Solicitante?.apellido || ''}`.toLowerCase();
    const cedula = p.Solicitante?.cedula?.toLowerCase() || "";
    const titulo = p.Libro?.titulo?.toLowerCase() || "";
    return nombreFull.includes(term) || cedula.includes(term) || titulo.includes(term);
  });

  const obtenerDiasRestantes = (fechaStr: string) => {
    if (!fechaStr) return null;
    const entrega = new Date(fechaStr);
    if (isNaN(entrega.getTime())) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    entrega.setHours(0, 0, 0, 0);
    const diff = entrega.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatearDiaFormato = (fechaStr: string) => {
    if (!fechaStr) return 'No definida';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'No definida';

    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombreDia = diasSemana[fecha.getDay()];
    const numeroDia = fecha.getDate();

    return `${nombreDia} - ${numeroDia}`;
  };

  const handleFinalizar = async (id: number) => {
    setProcesandoId(id);
    try {
      await FinalizarPrestamo(id);
      await cargarPrestamos();
    } catch (err) {
      console.error("Error al finalizar préstamo:", err);
    } finally {
      setProcesandoId(null);
    }
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
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Solicitante</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Material / Libro</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Cant.</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Vencimiento</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Estado</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && prestamos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Cargando Préstamos...</p>
                    </div>
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <BookOpen size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-black uppercase text-xs">No se encontraron registros activos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => {
                  const fechaStr = p.fecha_entrega || p.FechaEntrega || p.fecha_devolucion || p.FechaDevolucion;
                  const dias = obtenerDiasRestantes(fechaStr);
                  const fechaValida = dias !== null;

                  const isVencido = fechaValida && dias < 0;
                  const isProximo = fechaValida && dias >= 0 && dias <= 2;

                  return (
                    <tr key={p.ID || p.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Solicitante */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.Solicitante?.tipo === 'docente' ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-600'}`}>
                            {p.Solicitante?.tipo === 'docente' ? <User size={20} /> : <GraduationCap size={20} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-800 uppercase text-xs truncate">
                              {p.Solicitante?.nombre || p.Solicitante?.Nombre} {p.Solicitante?.apellido || p.Solicitante?.Apellido}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                              C.I: {p.Solicitante?.cedula || p.Solicitante?.Cedula || 'Escolar'} • {p.Solicitante?.tipo || p.Solicitante?.Tipo || 'alumno'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Libro */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-700 text-xs uppercase truncate max-w-[240px]">
                            {p.Libro?.titulo || p.Libro?.Titulo || 'Libro Desconocido'}
                          </span>
                        </div>
                      </td>

                      {/* Cantidad */}
                      <td className="py-5 px-6 text-center">
                        <span className="inline-block bg-slate-100 text-slate-700 font-black text-xs px-2.5 py-1 rounded-lg">
                          {p.cantidad || p.Cantidad || 1}
                        </span>
                      </td>

                      {/* Vencimiento (Día de la semana - Número) */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-600 uppercase">
                            {formatearDiaFormato(fechaStr)}
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-5 px-6 text-center">
                        {!fechaValida ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                            Sin fecha
                          </span>
                        ) : isVencido ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700">
                            {Math.abs(dias)} dias vencido
                          </span>
                        ) : isProximo ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
                            {dias} dias restantes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                            {dias} dias restantes
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-5 px-6 text-right">
                        <button
                          disabled={procesandoId === (p.ID || p.id)}
                          onClick={() => handleFinalizar(p.ID || p.id)}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 shadow-sm inline-flex items-center gap-1.5"
                          title="Finalizar Préstamo / Registrar Devolución"
                        >
                          {procesandoId === (p.ID || p.id) ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Devolver
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer de la Tabla */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            Mostrando {filtrados.length} de {prestamos.length} préstamos activos
          </p>
        </div>
      </div>

      <PrestamoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          cargarPrestamos();
        }}
      />
    </div>
  );
}