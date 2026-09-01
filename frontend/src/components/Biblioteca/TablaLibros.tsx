import { useEffect, useState, useCallback } from 'react';
import { ObtenerLibros, ObtenerNiveles } from "../../../wailsjs/go/main/App"; 
import { db } from "../../../wailsjs/go/models";
import { AlertCircle, CheckCircle2, Search, Plus, BookOpen, Layers, RefreshCw } from 'lucide-react';
import { BotonImportarExcel } from './ImportarExcel';

interface Props {
    rol: string;
    onOpenModal: () => void;
}

export function TablaLibros({ rol, onOpenModal }: Props) {
    const [libros, setLibros] = useState<db.Libro[]>([]);
    const [niveles, setNiveles] = useState<db.NivelAcademico[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [resLibros, resNiveles] = await Promise.all([
                ObtenerLibros(),
                ObtenerNiveles()
            ]);
            setLibros(resLibros || []);
            setNiveles(resNiveles || []);
        } catch (err) {
            console.error("Error al cargar libros:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Filtrado multicanal: Título, Asignatura o Grado
    const librosFiltrados = libros.filter(l => 
        l.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.asignatura?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.grado?.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ENCABEZADO Y ACCIONES */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-8 bg-cyan-600 rounded-full" />
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Inventario</h2>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] ml-5">
                        Proyecto Andrés Bello <span className="text-cyan-500/50 mx-2">•</span> Gestión de Recursos
                    </p>
                </div>
                
                <div className='flex gap-3 w-full lg:w-auto items-center'>
                    <div className='relative flex-1 lg:flex-none group'>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-cyan-500 transition-colors"/>
                        <input 
                            type="text" 
                            placeholder="Buscar título, materia o grado..." 
                            className="pl-12 p-4 bg-white border-2 border-slate-100 rounded-[1.5rem] w-full lg:w-96 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all text-xs font-black text-slate-600 shadow-sm placeholder:text-slate-300 placeholder:italic"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* BOTÓN DE IMPORTAR EXCEL COMO COMPONENTE */}
                    <BotonImportarExcel onSuccess={cargarDatos} />
                    
                    <button
                        onClick={cargarDatos}
                        className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-white hover:text-cyan-600 border-2 border-transparent hover:border-cyan-100 transition-all active:scale-90"
                        title="Refrescar datos"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>

                    <button
                        onClick={onOpenModal} 
                        className="group bg-slate-900 hover:bg-cyan-600 text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black flex items-center gap-3 transition-all shadow-2xl shadow-slate-200 hover:shadow-cyan-200 hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                        REGISTRAR LIBRO
                    </button>
                </div>
            </div>

            {/* CONTENEDOR DE TABLA */}
            <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden transition-all">
                <div className="max-h-[65vh] overflow-y-auto overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b border-slate-100">
                            <tr className="border-b border-slate-100">
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Información del Recurso</th>
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Clasificación Escolar</th>
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Disponibilidad</th>
                                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Existencia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative w-12 h-12">
                                                <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
                                                <div className="absolute inset-0 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse italic">Consultando Base de Datos...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : librosFiltrados.map((libro) => (
                                <tr key={libro.ID} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-cyan-600 group-hover:text-white group-hover:rotate-3 transition-all duration-500 shadow-sm">
                                                <BookOpen size={22} />
                                            </div>
                                            <div>
                                                <span className="block font-black text-slate-700 uppercase text-sm tracking-tight group-hover:text-cyan-700 transition-colors italic">
                                                    {libro.titulo}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 block">
                                                    ID: LIB-{libro.ID?.toString().padStart(4, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col gap-2">
                                            <span className="inline-flex w-fit px-3 py-1 rounded-lg bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase italic border border-cyan-100 shadow-sm">
                                                {libro.asignatura?.nombre || "Colección General"}
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                <Layers size={12} className="text-slate-200" /> 
                                                <span>{libro.grado?.nombre || "Multigrado"}</span>
                                                {libro.grado?.nivel_id && (
                                                    <>
                                                        <span className="text-slate-200">/</span>
                                                        <span className="text-slate-500 italic">
                                                            {niveles.find(n => n.id === libro.grado?.nivel_id)?.nombre}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex justify-center">
                                            {libro.cantidad > 0 ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="px-5 py-2 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center gap-2">
                                                        <CheckCircle2 size={12} strokeWidth={4} /> ACTIVO
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="px-5 py-2 rounded-full bg-rose-50 text-rose-500 text-[9px] font-black uppercase tracking-widest border-2 border-rose-100 flex items-center gap-2 italic">
                                                    <AlertCircle size={12} strokeWidth={4} /> SIN STOCK
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col items-center group/stock">
                                            {/* SOLUCIÓN CANTIDAD: Se muestra la cantidad real directamente sin padStart */}
                                            <div className={`text-xl font-black font-mono leading-none ${libro.cantidad <= 3 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                                                {libro.cantidad}
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Unidades</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
                
                {!loading && librosFiltrados.length === 0 && (
                    <div className="p-32 text-center bg-slate-50/20">
                        <div className="bg-white w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100 rotate-12">
                            <Search className="h-10 w-10 text-slate-100" />
                        </div>
                        <h3 className="text-slate-800 font-black uppercase italic text-sm mb-2">Sin coincidencias</h3>
                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em]">Intenta con otros términos de búsqueda</p>
                    </div>
                )}

                {/* FOOTER DE LA TABLA */}
                <div className="flex justify-between items-center px-6 py-2">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                        Mostrando {librosFiltrados.length} de {libros.length} registros totales
                    </p>
                </div>
            </div>
    );
}