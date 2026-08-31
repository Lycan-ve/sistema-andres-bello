import { useState } from 'react';
import { ShieldAlert, User, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { CreatefirstAdmin } from "../../../wailsjs/go/main/App";

export function ConfiguracionInicial({ onComplete }: { onComplete: () => void }) {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCrearAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !password) return setError("Todos los campos obligatorios");
    
    setLoading(true);
    setError(null);
    try {
      await CreatefirstAdmin(nombre, password);
      onComplete(); 
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor principal que llena la ventana
    <div className="h-full w-full flex items-center justify-center bg-slate-200 p-4">
      {/* Tarjeta con distribución horizontal (side-by-side) */}
      <div className="bg-white w-full h-full max-h-[400px] rounded-3xl shadow-xl flex overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* LADO IZQUIERDO - INFORMACIÓN (Igualando tu estilo de bloque de color) */}
        <div className="w-1/2 bg-cyan-600 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-cyan-700/30 blur-2xl rounded-full translate-x-[-20%] scale-150"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg border border-white/30">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase leading-tight">
              Configuración<br />Inicial
            </h2>
            <p className="text-[12px] text-cyan-50 mt-4 leading-relaxed px-4">
              No se ha detectado ningún administrador. Crea la cuenta principal del director para habilitar el sistema.
            </p>
          </div>
        </div>

        {/* LADO DERECHO - FORMULARIO */}
        <div className="w-1/2 p-8 flex flex-col justify-center bg-white">
          <div className="mb-6 text-center">
            <h3 className="text-3xl font-black text-[#153448] tracking-tight">Bienvenido</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Crea tu cuenta maestra</p>
          </div>

          <form onSubmit={handleCrearAdmin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-xl border border-rose-100 flex items-center gap-2">
                <ShieldAlert size={14} /> {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="relative flex items-center">
                <User className="absolute left-4 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="NOMBRE DE USUARIO" 
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full py-3 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[12px] outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="CONTRASEÑA" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full py-3 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[12px] outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || !nombre || !password}
              className="w-full py-4 mt-2 bg-[#48a9b8] text-white font-bold rounded-xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#3d919e] transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Crear Administrador <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}