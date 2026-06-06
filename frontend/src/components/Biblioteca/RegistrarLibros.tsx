import { useEffect, useState } from 'react';
import { RegistrarLibro, ObtenerAsignaturas, ObtenerNiveles } from "../../../wailsjs/go/main/App";
import { db } from "../../../wailsjs/go/models";
import { 
  BookPlus, X, BookOpen, Layers, Hash, Save, Ban, AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegistrarLibroModal({ isOpen, onClose, onSuccess }: Props) {
  const [asignaturas, setAsignaturas] = useState<db.Asignatura[]>([]);
  const [niveles, setNiveles] = useState<db.NivelAcademico[]>([]);
  // form.gradoId añadido
  const [form, setForm] = useState({ titulo: '', asigId: 0, nivelId: 0, gradoId: 0, cant: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener los grados del nivel seleccionado
  const gradosDisponibles = niveles.find(n => n.id === form.nivelId)?.grados || [];

  useEffect(() => {
    if (isOpen) {
      setError(null); // Limpiar errores al abrir
      ObtenerAsignaturas().then(setAsignaturas);
      ObtenerNiveles().then(setNiveles);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const guardar = async () => {
    if (!form.titulo || !form.asigId || !form.gradoId) return setError("Completa los campos obligatorios");
    
    setLoading(true);
    try {
      await RegistrarLibro(form.titulo, form.asigId, form.gradoId, form.cant);
      setForm({ titulo: '', asigId: 0, nivelId: 0, gradoId: 0, cant: 1 }); // Resetear form
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* HEADER DEL MODAL */}
        <div className="p-6 px-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-600 text-white rounded-2xl shadow-lg shadow-cyan-100">
              <BookPlus size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nuevo Ingreso</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Gestión de Biblioteca • Proyecto Andrés Bello</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24} /></button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-shake">
              <AlertCircle size={18} />
              <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
            </div>
          )}

          {/* DISEÑO HORIZONTAL (GRID DE 2 COLUMNAS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* COLUMNA IZQUIERDA: INFORMACIÓN BÁSICA */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-cyan-700 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={16} /> Datos del Ejemplar
              </h4>

              <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                {/* Título */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Título del ejemplar</label>
                  <input 
                    placeholder="Ej. Cardenalito 1er Grado"
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-slate-700"
                    value={form.titulo}
                    onChange={e => setForm({...form, titulo: e.target.value})}
                  />
                </div>

                {/* Asignatura */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Asignatura / Materia</label>
                  <select 
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-slate-600 appearance-none"
                    value={form.asigId}
                    onChange={e => setForm({...form, asigId: Number(e.target.value)})}
                  >
                    <option value="0">SELECCIONAR MATERIA...</option>
                    {asignaturas.map(a => <option key={a.id} value={a.id}>{a.nombre.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: UBICACIÓN Y CANTIDAD */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                <Layers size={16} /> Ubicación y Cantidad
              </h4>

              <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  {/* Selector de Nivel */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nivel</label>
                    <select 
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none focus:border-cyan-500"
                      value={form.nivelId}
                      onChange={e => setForm({...form, nivelId: Number(e.target.value), gradoId: 0})}
                    >
                      <option value="0">NIVEL...</option>
                      {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre.toUpperCase()}</option>)}
                    </select>
                  </div>

                  {/* Selector de Grado (Filtrado) */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Grado</label>
                    <select 
                      disabled={!form.nivelId}
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none focus:border-cyan-500 disabled:opacity-50"
                      value={form.gradoId}
                      onChange={e => setForm({...form, gradoId: Number(e.target.value)})}
                    >
                      <option value="0">GRADO...</option>
                      {/* Mostrar nombres únicos para evitar duplicados por sección */}
                      {Array.from(new Set(gradosDisponibles.map(g => g.nombre))).map(nombreGrado => {
                        const grado = gradosDisponibles.find(g => g.nombre === nombreGrado);
                        return <option key={grado?.id} value={grado?.id}>{nombreGrado.toUpperCase()}</option>
                      })}
                    </select>
                  </div>
                </div>

                {/* Cantidad */}
                <div className="space-y-1 pt-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1.5">
                    <Hash size={12} className="text-cyan-600" /> Cantidad Inicial en Stock
                  </label>
                  <input 
                    type="number" min="1"
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-black text-sm text-slate-700"
                    value={form.cant}
                    onChange={e => setForm({...form, cant: Number(e.target.value)})}
                  />
                </div>
              </div>

              {/* BOTONES DE ACCIÓN (GRANDES Y VISIBLES) */}
              <div className="flex gap-4 pt-4">
                <button onClick={onClose} disabled={loading} className="flex-1 py-4 flex items-center justify-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all">
                  <Ban size={16} /> Cancelar
                </button>
                <button 
                  onClick={guardar} 
                  disabled={loading} 
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all
                            ${loading ? 'bg-slate-400' : 'bg-cyan-600 hover:bg-cyan-700 hover:-translate-y-1 shadow-cyan-100 hover:shadow-cyan-200 active:scale-95'}`}
                >
                  {loading ? 'Procesando...' : <><Save size={16} /> Guardar Libro</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}