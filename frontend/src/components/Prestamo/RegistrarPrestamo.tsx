import { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, Search, X, AlertTriangle, 
  CheckCircle2, User, Layers, Plus, Trash2, ArrowRight,
  GraduationCap, Minus, ArrowLeft, ShoppingCart
} from "lucide-react";
import { RegistrarPrestamo, ObtenerLibros, ObtenerNiveles } from "../../../wailsjs/go/main/App";
import { db } from "../../../wailsjs/go/models";
import { ListaEstudiantes } from "./ModalEstudiantes";

export function PrestamoModal({ isOpen, onClose, onSuccess }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLista, setShowLista] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<'alumno' | 'docente' | null>(null);
  const [sinCedula, setSinCedula] = useState(false);

  // --- DATOS DB ---
  const [librosDisponibles, setLibrosDisponibles] = useState<db.Libro[]>([]);
  const [niveles, setNiveles] = useState<db.NivelAcademico[]>([]);
  const [gradosFiltrados, setGradosFiltrados] = useState<db.Grado[]>([]);

  // --- FORMULARIO ---
  const [carrito, setCarrito] = useState<any[]>([]);
  const [libroTemp, setLibroTemp] = useState<number>(0);
  const [cantidadTemp, setCantidadTemp] = useState<number | string>(1);
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number>(0);
  const [formSol, setFormSol] = useState<db.Solicitante>(new db.Solicitante({ 
    cedula: '', nombre: '', apellido: '', tipo: 'alumno', grado_id: 0 
  }));

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTipoUsuario(null);
      setSinCedula(false);
      setCarrito([]);
      setCantidadTemp(1);
      setFormSol(new db.Solicitante({ cedula: '', nombre: '', apellido: '', tipo: 'alumno', grado_id: 0 }));
      ObtenerLibros().then(setLibrosDisponibles);
      ObtenerNiveles().then(setNiveles);
    }
  }, [isOpen]);

  useEffect(() => {
    const nivel = niveles.find(n => n.id === nivelSeleccionado);
    setGradosFiltrados(nivel?.grados || []);
  }, [nivelSeleccionado, niveles]);

  const updateFormEst = (fields: Partial<db.Solicitante>) => {
    setFormSol(new db.Solicitante({ ...formSol, ...fields }));
  };

  const handleCantidadManual = (valor: string) => {
    if (valor === "") return setCantidadTemp("");
    const num = parseInt(valor);
    if (!isNaN(num)) {
      setCantidadTemp(num);
    }
  };

  const agregarAlCarrito = (id: number) => {
    if (id === 0) return;
    const cantFinal = typeof cantidadTemp === 'string' ? 1 : cantidadTemp;
    
    const libro = librosDisponibles.find(l => (l as any).ID === id || l.ID === id);
    if (!libro || libro.cantidad < cantFinal) {
        return setError(`Stock insuficiente (${libro?.cantidad || 0} disponibles)`);
    }
    if (carrito.find(item => item.libroId === id)) return setError("Este libro ya está en la lista.");

    setCarrito([...carrito, { 
      libroId: (libro as any).ID || libro.ID, 
      titulo: libro.titulo, 
      cantidad: cantFinal 
    }]);
    setLibroTemp(0);
    setCantidadTemp(1);
    setError(null);
  };

  if (!isOpen) return null;

  const manejarEnvioFinal = async () => {
    if (!fechaEntrega) return setError("Falta fecha de devolución.");
    setLoading(true);
    try {
      const dataEnvio = new db.Solicitante({ ...formSol, cedula: sinCedula ? null : formSol.cedula });
      for (const item of carrito) {
        await RegistrarPrestamo(dataEnvio, item.libroId, item.cantidad, new Date(fechaEntrega));
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-white">
        
        {/* HEADER CON INDICADOR DE PASOS */}
        <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 flex items-center justify-center text-white rounded-2xl shadow-lg transition-all duration-500 ${step === 1 ? 'bg-cyan-600' : 'bg-emerald-500'}`}>
              {step === 1 ? <User size={24} /> : <ShoppingCart size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic leading-none tracking-tight">
                {step === 1 ? 'Identificación' : 'Materiales'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">
                Paso {step} de 2 • Circulación Escolar
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-600 text-[11px] font-black uppercase flex items-center gap-3 italic animate-in slide-in-from-top-2">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setTipoUsuario('alumno'); updateFormEst({ tipo: 'alumno' }); }} 
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${tipoUsuario === 'alumno' ? 'border-cyan-500 bg-cyan-50 shadow-xl shadow-cyan-100' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <GraduationCap size={40} className={tipoUsuario === 'alumno' ? 'text-cyan-600' : 'text-slate-200'} />
                  <span className="font-black text-xs uppercase tracking-widest text-slate-600">Es un Alumno</span>
                </button>
                <button 
                  onClick={() => { setTipoUsuario('docente'); updateFormEst({ tipo: 'docente' }); }} 
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${tipoUsuario === 'docente' ? 'border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-100' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <BookOpen size={40} className={tipoUsuario === 'docente' ? 'text-emerald-600' : 'text-slate-200'} />
                  <span className="font-black text-xs uppercase tracking-widest text-slate-600">Es un Docente</span>
                </button>
              </div>

              {tipoUsuario && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center px-2">
                    <button onClick={() => setShowLista(true)} className="text-[10px] font-black text-cyan-700 bg-cyan-100/50 px-4 py-2 rounded-xl border border-cyan-200 flex items-center gap-2 hover:bg-cyan-600 hover:text-white transition-all shadow-sm">
                      <Search size={14} /> BUSCAR EN EL HISTORIAL
                    </button>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={sinCedula} onChange={(e) => setSinCedula(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase italic group-hover:text-cyan-600 transition-colors">Sin cédula de identidad</span>
                    </label>
                  </div>
                  
                  <div className="grid gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner">
                    <div className="relative">
                       <input 
                        disabled={sinCedula} 
                        placeholder={sinCedula ? "USUARIO SIN CÉDULA" : "NÚMERO DE CÉDULA"} 
                        value={formSol.cedula} 
                        onChange={e => updateFormEst({ cedula: e.target.value })} 
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-sm uppercase outline-none focus:border-cyan-500 transition-all disabled:opacity-50 shadow-sm" 
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="NOMBRE(S)" value={formSol.nombre} onChange={e => updateFormEst({ nombre: e.target.value })} className="p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-sm uppercase outline-none focus:border-cyan-500 transition-all shadow-sm" />
                      <input placeholder="APELLIDO(S)" value={formSol.apellido} onChange={e => updateFormEst({ apellido: e.target.value })} className="p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-sm uppercase outline-none focus:border-cyan-500 transition-all shadow-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <select value={nivelSeleccionado} onChange={e => setNivelSeleccionado(Number(e.target.value))} className="p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-[11px] uppercase italic outline-none focus:border-cyan-500 transition-all cursor-pointer shadow-sm">
                        <option value={0}>-- SELECCIONAR NIVEL --</option>
                        {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                      </select>
                      <select value={formSol.grado_id} onChange={e => updateFormEst({ grado_id: Number(e.target.value) })} disabled={nivelSeleccionado === 0} className="p-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-[11px] uppercase italic outline-none focus:border-cyan-500 transition-all disabled:opacity-30 shadow-sm">
                        <option value={0}>-- GRADO / SECCIÓN --</option>
                        {gradosFiltrados.map(g => <option key={g.id} value={g.id}>{g.nombre} - SECCIÓN "{g.seccion}"</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-400">
              <div className="bg-amber-50/50 p-6 rounded-[2.5rem] border-2 border-amber-100 shadow-sm">
                <h4 className="text-[11px] font-black text-amber-700 uppercase italic mb-4 flex items-center gap-2">
                  <Plus size={16} className="bg-amber-500 text-white rounded-full p-0.5" /> Agregar Libros al Préstamo
                </h4>
                
                <div className="flex gap-3">
                  <select 
                    value={libroTemp} 
                    onChange={(e) => setLibroTemp(Number(e.target.value))} 
                    className="flex-[3] p-4 bg-white border-2 border-amber-200 rounded-2xl font-black text-[11px] uppercase outline-none focus:border-amber-500 shadow-sm transition-all"
                  >
                    <option value={0}>BUSCAR TÍTULO DEL LIBRO...</option>
                    {librosDisponibles.map(l => (
                      <option key={(l as any).ID || l.ID} value={(l as any).ID || l.ID}>
                        {l.titulo} ({l.cantidad} Disp.)
                      </option>
                    ))}
                  </select>

                  {/* CONTROL DE CANTIDAD MEJORADO */}
                  <div className="flex items-center bg-white border-2 border-amber-200 rounded-2xl px-2 shadow-sm focus-within:border-amber-500 transition-all">
                    <button 
                      type="button"
                      onClick={() => setCantidadTemp(prev => Math.max(1, (Number(prev) || 1) - 1))} 
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors active:scale-90"
                    >
                      <Minus size={18}/>
                    </button>
                    
                    <input 
                      type="number" 
                      value={cantidadTemp} 
                      onChange={(e) => handleCantidadManual(e.target.value)}
                      onBlur={() => { if (!cantidadTemp || Number(cantidadTemp) < 1) setCantidadTemp(1); }}
                      className="w-12 text-center font-black text-sm outline-none bg-transparent text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    />
                    
                    <button 
                      type="button"
                      onClick={() => setCantidadTemp(prev => (Number(prev) || 0) + 1)} 
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors active:scale-90"
                    >
                      <Plus size={18}/>
                    </button>
                  </div>

                  <button 
                    onClick={() => agregarAlCarrito(libroTemp)} 
                    className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200 active:scale-90 transition-all hover:bg-amber-600 flex items-center justify-center"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* LISTA DE MATERIALES SELECCIONADOS */}
              <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2 py-1">
                {carrito.length === 0 ? (
                    <div className="py-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-2">
                        <ShoppingCart size={32} className="text-slate-100" />
                        <p className="text-[10px] font-black text-slate-300 uppercase italic">El carrito está vacío</p>
                    </div>
                ) : (
                    carrito.map(item => (
                    <div key={item.libroId} className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-slate-50 shadow-sm hover:border-cyan-100 transition-all animate-in zoom-in-95">
                        <div className="flex items-center gap-4">
                        <span className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded-xl font-black text-xs shadow-md italic">
                            {item.cantidad}
                        </span>
                        <span className="font-black text-slate-700 uppercase text-[11px] tracking-tight truncate max-w-[320px]">
                            {item.titulo}
                        </span>
                        </div>
                        <button onClick={() => setCarrito(carrito.filter(c => c.libroId !== item.libroId))} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 size={20} />
                        </button>
                    </div>
                    ))
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 ml-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase italic flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-500" /> Fecha Límite de Entrega
                    </h4>
                    {/* ALERTA DE FECHA SELECCIONADA */}
                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 w-fit px-3 py-1 rounded-lg border border-emerald-100 animate-in fade-in slide-in-from-left-2">
                      <AlertTriangle size={12} strokeWidth={3} />
                      El material debe ser devuelto en exactamente una semana
                    </div>
                  </div>

                  {/* BOTONES DE ACCESO RÁPIDO */}
                  <div className="grid grid-cols-3 gap-2 px-1">
                    {[
                      { label: "1 Semana", days: 7 },
                      { label: "15 Días", days: 15 },
                      { label: "1 Mes", days: 30 },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          const hoy = new Date();
                          hoy.setDate(hoy.getDate() + opt.days);
                          setFechaEntrega(hoy.toISOString().split("T")[0]);
                        }}
                        className="py-3 px-2 bg-white border-2 border-slate-100 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95 shadow-sm"
                      >
                        +{opt.label}
                      </button>
                    ))}
                  </div>

                  <input 
                    type="date" 
                    value={fechaEntrega} 
                    onChange={(e) => setFechaEntrega(e.target.value)} 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PIE DE PÁGINA CON BOTONES DE ACCIÓN */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
          <div className="flex gap-4">
            {step === 1 ? (
              <button 
                disabled={!formSol.nombre || (!sinCedula && !formSol.cedula) || formSol.grado_id === 0} 
                onClick={() => setStep(2)} 
                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 disabled:opacity-10 shadow-xl transition-all active:scale-[0.97] hover:bg-cyan-700"
              >
                Continuar a Materiales <ArrowRight size={20} />
              </button>
            ) : (
              <>
                <button onClick={() => setStep(1)} className="flex-1 py-5 font-black text-xs uppercase text-slate-400 hover:text-slate-600 hover:bg-white rounded-2xl transition-all flex items-center justify-center gap-2 border border-transparent hover:border-slate-100">
                  <ArrowLeft size={18} /> Volver
                </button>
                <button 
                  disabled={loading || carrito.length === 0 || !fechaEntrega} 
                  onClick={manejarEnvioFinal} 
                  className="flex-[2.5] py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-[0_15px_30px_-10px_rgba(16,185,129,0.4)] uppercase text-xs flex items-center justify-center gap-4 active:scale-95 disabled:opacity-20 transition-all hover:bg-emerald-700"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><CheckCircle2 size={20} /> Finalizar y Registrar</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ListaEstudiantes 
        isOpen={showLista} 
        onClose={() => setShowLista(false)} 
        onSelect={(e: db.Solicitante) => {
          setFormSol(new db.Solicitante(e));
          setTipoUsuario(e.tipo as any);
          setSinCedula(!e.cedula);
          if (e.grado_id) {
            const n = niveles.find(n => n.grados?.some(g => g.id === e.grado_id));
            if (n) setNivelSeleccionado(n.id);
          }
          setShowLista(false);
          setError(null);
          setStep(2);
        }} 
      />
    </div>
  );
}