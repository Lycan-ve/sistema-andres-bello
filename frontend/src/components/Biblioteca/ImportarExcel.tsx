import { useState } from 'react';
import { SelectExcelFile, ImportarLibrosExcel } from "../../../wailsjs/go/main/App";
import { FileSpreadsheet } from 'lucide-react';

interface Props {
    onSuccess: () => void;
}

export function BotonImportarExcel({ onSuccess }: Props) {
    const [loading, setLoading] = useState(false);

    const handleImportar = async () => {
        try {
            // Llamamos a la función expuesta desde Go
            const filepath = await SelectExcelFile();

            // Si el usuario seleccionó un archivo y no canceló
            if (filepath) {
                setLoading(true);
                await ImportarLibrosExcel(filepath);
                alert("¡Libros importados correctamente respetando las relaciones!");
                onSuccess();
            }
        } catch (e: any) {
            alert("Error en la importación: " + e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleImportar}
            disabled={loading}
            className="p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl border-2 border-emerald-100 hover:border-emerald-600 transition-all active:scale-90 flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-sm disabled:opacity-50"
            title="Importar libros desde Excel"
        >
            <FileSpreadsheet size={18} className={loading ? "animate-spin" : ""} />
            <span className="hidden lg:inline">{loading ? "Procesando..." : "Importar Excel"}</span>
        </button>
    );
}