import { useState, useEffect } from 'react';
import { CrearDocente, ListarDocentes } from "../../../wailsjs/go/main/App";
import { db } from "../../../wailsjs/go/models";
import { 
  UserPlus, 
  User, 
  KeyRound, 
  UserCheck, 
  ShieldCheck, 
  Users2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export function RegistroDocente({ rolAdmin }: { rolAdmin: string }) {
  const [docentes, setDocentes] = useState<db.Usuario[]>([]);
  const [nombre, setNombre] = useState('');
  const [pass, setPass] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setErrorStatus(null);
    try {
      const res = await ListarDocentes();
      setDocentes(res || []);
    } catch (e: any) {
      console.error(e);
      setErrorStatus(e.toString());
      setDocentes([]); 
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

const Guardar = async () => {
  if (!nombre || !pass) return alert("Por favor, completa todos los campos");
  
  setCargando(true);
  try {
    // LLAMADA CORREGIDA: Solo pasamos nombre y pass
    await CrearDocente(nombre, pass);
    
    setNombre(''); 
    setPass('');
    await cargar(); // Recarga la tabla automáticamente
    alert("¡Bibliotecario registrado con éxito!");
    
  } catch (e: any) { 
    console.error("Error en el registro:", e);
    // Manejo de errores basado en el mensaje que enviamos desde Go
    if (e.includes("denegado") || e.includes("permisos")) {
      alert("Error: Solo el Director tiene permiso para crear nuevos usuarios.");
    } else {
      alert(`No se pudo registrar: ${e}`);
    }
  } finally {
    setCargando(false);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Users2 className="text-cyan-600" /> Gestión de Personal
        </h2>
        <button 
          onClick={cargar} 
          className="p-2 text-slate-400 hover:text-cyan-600 transition-colors"
          disabled={cargando}
        >
          <RefreshCw size={20} className={cargando ? "animate-spin" : ""} />
        </button>
      </div>

      {errorStatus && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          <span>Error de permisos: No puedes visualizar esta lista sin rango de Director.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <UserPlus size={18} />
            </div>
            <h3 className="font-bold text-slate-700 text-base">Nuevo Bibliotecario</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  className="w-full pl-10 p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" 
                  placeholder="Nombre y Apellido" 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña de Acceso</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  className="w-full pl-10 p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" 
                  type="password" 
                  placeholder="••••••••" 
                  value={pass} 
                  onChange={e => setPass(e.target.value)} 
                />
              </div>
            </div>

            <button 
              onClick={Guardar} 
              disabled={cargando}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-cyan-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <UserCheck size={18} /> {cargando ? "Registrando..." : "Registrar Docente"}
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nombre del Usuario</th>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Rol de Sistema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docentes.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                      {d.nombre?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="font-semibold text-slate-700">{d.nombre}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                      d.rol === 'director' 
                      ? 'bg-amber-50 text-amber-700 border-amber-100' 
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      <ShieldCheck size={12} />
                      {d.rol}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {docentes.length === 0 && !cargando && (
            <div className="p-12 text-center text-slate-400 italic">
              No hay personal registrado o no tienes permisos para ver la lista.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}