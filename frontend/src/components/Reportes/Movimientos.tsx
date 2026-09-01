import { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, AlertCircle, CheckCircle, Calendar, RefreshCw } from 'lucide-react';
import { ObtenerEstadisticasReporte, ObtenerHistorialMovimientos } from "../../../wailsjs/go/main/App";

export function Reportes() {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalPrestamos: 0,
    activos: 0,
    morosos: 0,
    fondoEditorial: 0
  });
  const [movimientos, setMovimientos] = useState<any[]>([]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const stats = await ObtenerEstadisticasReporte();
      const movs = await ObtenerHistorialMovimientos();
      setEstadisticas(stats);
      setMovimientos(movs || []);
    } catch (error) {
      console.error("Error al cargar los reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-[#00a2b9] rounded-full"></div>
            <h1 className="text-3xl font-black text-[#153448] uppercase italic tracking-tight">Reportes</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-5">
            Proyecto Andrés Bello • Estadísticas y Auditoría
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={cargarDatos} className="py-3 px-6 bg-[#153448] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#1a415a] transition-all shadow-md">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar Datos
          </button>
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Préstamos Totales</p>
            <h3 className="text-3xl font-black text-[#153448]">{estadisticas.totalPrestamos}</h3>
          </div>
          <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-[#00a2b9]">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En Circulación</p>
            <h3 className="text-3xl font-black text-emerald-500">{estadisticas.activos}</h3>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entregas Morosas</p>
            <h3 className="text-3xl font-black text-rose-500">{estadisticas.morosos}</h3>
          </div>
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fondo Editorial</p>
            <h3 className="text-3xl font-black text-[#153448]">{estadisticas.fondoEditorial}</h3>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-black text-[#153448] uppercase tracking-widest flex items-center gap-2">
            <Calendar size={18} className="text-[#00a2b9]" /> Registro de Movimientos
          </h2>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-5 pl-8">Tipo de Operación</th>
                <th className="p-5">Usuario / Solicitante</th>
                <th className="p-5">Material Bibliográfico</th>
                <th className="p-5">Fecha</th>
                <th className="p-5 pr-8 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-bold text-slate-600 uppercase">
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No hay movimientos registrados en la base de datos.</td>
                </tr>
              )}
              {movimientos.map((mov) => (
                <tr key={mov.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 pl-8">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest ${
                      mov.tipoOperacion === 'PRÉSTAMO' ? 'bg-orange-50 text-orange-500' : 
                      mov.tipoOperacion === 'DEVOLUCIÓN' ? 'bg-emerald-50 text-emerald-500' : 
                      'bg-cyan-50 text-cyan-600'
                    }`}>
                      {mov.tipoOperacion}
                    </span>
                  </td>
                  <td className="p-5">{mov.usuario}</td>
                  <td className="p-5 text-[#153448]">{mov.material}</td>
                  <td className="p-5 text-slate-400">{new Date(mov.fecha).toLocaleDateString()}</td>
                  <td className="p-5 pr-8 text-right">
                    <span className={`flex items-center justify-end gap-2 text-[10px] font-black tracking-widest ${
                      mov.estado === 'ACTIVO' ? 'text-emerald-500' : 
                      mov.estado === 'MOROSO' ? 'text-rose-500' : 'text-slate-400'
                    }`}>
                      {mov.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}