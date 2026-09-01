import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Login as LoginAction } from "../../wailsjs/go/main/App";
import { db } from "../../wailsjs/go/models";
// Iconos
import { User, LockKeyhole, LogIn, Loader2, ShieldCheck } from 'lucide-react';
import logo from "@/assets/images/LOGO.svg"; 

interface LoginProps {
  onLoginSuccess: (user: db.Usuario) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nombre || !password) return;
    setLoading(true);
    try {
      // Normalizamos el nombre de usuario a minúsculas y sin espacios sobrantes
      const usuarioNormalizado = nombre.trim().toLowerCase();
      const res = await LoginAction(usuarioNormalizado, password);
      if (res) onLoginSuccess(res);
    } catch (err) {
      alert("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-[800px] h-[450px] bg-white overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500">
      {/* SECCIÓN IZQUIERDA: Identidad */}
      <div className="flex flex-col items-center justify-center w-1/2 bg-[#f8fafc] p-6 select-none">
        <div className="text-center space-y-4 flex flex-col items-center group">
          <div className="flex items-center gap-2 mb-2 transition-transform duration-300 group-hover:-translate-y-1">
             <h1 className="text-4xl font-black text-[#1e293b] tracking-tighter uppercase leading-tight">
               Sistema <br /> Andrés Bello
             </h1>
          </div>
          <img 
            src={logo} 
            alt="Logo" 
            className="w-56 h-56 object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-1" 
          />
          <div className="h-1.5 w-40 bg-cyan-600 rounded-full opacity-20 transition-all group-hover:w-48 group-hover:opacity-40" /> 
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario */}
      <div 
        className="flex flex-col items-center justify-center w-1/2 p-10 bg-white"
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
      >
        <div className="w-full max-w-[280px] space-y-8">
          <div className="space-y-1 text-center transition-all duration-300 hover:scale-105">
            <h2 className="text-4xl font-black text-[#1e293b] tracking-tight">Acceso</h2>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Gestión de Biblioteca</p>
          </div>

          <div className="space-y-4">
            {/* Input Usuario */}
            <div className="grid gap-2 group">
              <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-cyan-600">
                Usuario
              </Label>
              <div className="relative transition-transform duration-200 group-focus-within:translate-x-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-cyan-500" />
                <Input 
                  id="user" 
                  placeholder="Nombre de usuario"
                  className="pl-10 h-10 bg-slate-50 border-slate-200 text-sm focus-visible:ring-cyan-500/20 transition-all"
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                />
              </div>
            </div>
            
            {/* Input Contraseña */}
            <div className="grid gap-2 group">
              <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-cyan-600">
                Contraseña
              </Label>
              <div className="relative transition-transform duration-200 group-focus-within:translate-x-1">
                <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-cyan-500" />
                <Input 
                  id="pass" 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-10 h-10 bg-slate-50 border-slate-200 text-sm focus-visible:ring-cyan-500/20 transition-all"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Button 
            className='
              w-full h-11 rounded-xl flex items-center justify-center gap-2 
              font-black text-xs uppercase tracking-widest transition-all duration-300
              
              bg-cyan-600 text-white shadow-lg shadow-cyan-200
              
              hover:bg-cyan-700 hover:-translate-y-0.5 hover:shadow-cyan-300
              
              active:scale-95 active:translate-y-0
              
              disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
            ' 
            onClick={handleLogin}
            disabled={loading || !nombre || !password}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span>Ingresar</span>
              </>
            )}
        </Button>
        </div>
      </div>
    </div>
  );
}