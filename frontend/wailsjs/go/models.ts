export namespace db {
	
	export class Asignatura {
	    ID: number;
	    CreatedAt: time.Time;
	    UpdatedAt: time.Time;
	    // Go type: gorm
	    DeletedAt: any;
	    id: number;
	    nombre: string;
	
	    static createFrom(source: any = {}) {
	        return new Asignatura(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], time.Time);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], time.Time);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.id = source["id"];
	        this.nombre = source["nombre"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NivelAcademico {
	    ID: number;
	    CreatedAt: time.Time;
	    UpdatedAt: time.Time;
	    // Go type: gorm
	    DeletedAt: any;
	    id: number;
	    nombre: string;
	    grados: Grado[];
	
	    static createFrom(source: any = {}) {
	        return new NivelAcademico(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], time.Time);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], time.Time);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.id = source["id"];
	        this.nombre = source["nombre"];
	        this.grados = this.convertValues(source["grados"], Grado);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Grado {
	    ID: number;
	    CreatedAt: time.Time;
	    UpdatedAt: time.Time;
	    // Go type: gorm
	    DeletedAt: any;
	    id: number;
	    nombre: string;
	    seccion: string;
	    nivel_id: number;
	    nivel: NivelAcademico;
	
	    static createFrom(source: any = {}) {
	        return new Grado(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], time.Time);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], time.Time);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.id = source["id"];
	        this.nombre = source["nombre"];
	        this.seccion = source["seccion"];
	        this.nivel_id = source["nivel_id"];
	        this.nivel = this.convertValues(source["nivel"], NivelAcademico);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Libro {
	    ID: number;
	    CreatedAt: time.Time;
	    UpdatedAt: time.Time;
	    // Go type: gorm
	    DeletedAt: any;
	    titulo: string;
	    asig_id: number;
	    asignatura: Asignatura;
	    grado_id: number;
	    grado: Grado;
	    cantidad: number;
	
	    static createFrom(source: any = {}) {
	        return new Libro(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], time.Time);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], time.Time);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.titulo = source["titulo"];
	        this.asig_id = source["asig_id"];
	        this.asignatura = this.convertValues(source["asignatura"], Asignatura);
	        this.grado_id = source["grado_id"];
	        this.grado = this.convertValues(source["grado"], Grado);
	        this.cantidad = source["cantidad"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Solicitante {
	    ID: number;
	    CreatedAt: time.Time;
	    UpdatedAt: time.Time;
	    // Go type: gorm
	    DeletedAt: any;
	    id: number;
	    cedula?: string;
	    nombre: string;
	    apellido: string;
	    tipo: string;
	    grado_id: number;
	    grado: Grado;
	
	    static createFrom(source: any = {}) {
	        return new Solicitante(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], time.Time);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], time.Time);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.id = source["id"];
	        this.cedula = source["cedula"];
	        this.nombre = source["nombre"];
	        this.apellido = source["apellido"];
	        this.tipo = source["tipo"];
	        this.grado_id = source["grado_id"];
	        this.grado = this.convertValues(source["grado"], Grado);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Prestamo {
	    id: number;
	    solicitante_id: number;
	    Solicitante: Solicitante;
	    libro_id: number;
	    Libro: Libro;
	    cantidad: number;
	    fecha_salida: time.Time;
	    fecha_entrega: time.Time;
	    devuelto: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Prestamo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.solicitante_id = source["solicitante_id"];
	        this.Solicitante = this.convertValues(source["Solicitante"], Solicitante);
	        this.libro_id = source["libro_id"];
	        this.Libro = this.convertValues(source["Libro"], Libro);
	        this.cantidad = source["cantidad"];
	        this.fecha_salida = this.convertValues(source["fecha_salida"], time.Time);
	        this.fecha_entrega = this.convertValues(source["fecha_entrega"], time.Time);
	        this.devuelto = source["devuelto"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Usuario {
	    ID: number;
	    CreatedAt: time.Time;
	    UpdatedAt: time.Time;
	    // Go type: gorm
	    DeletedAt: any;
	    nombre: string;
	    password?: string;
	    rol: string;
	    nueva_pass?: string;
	
	    static createFrom(source: any = {}) {
	        return new Usuario(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], time.Time);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], time.Time);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.nombre = source["nombre"];
	        this.password = source["password"];
	        this.rol = source["rol"];
	        this.nueva_pass = source["nueva_pass"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace time {
	
	export class Time {
	
	
	    static createFrom(source: any = {}) {
	        return new Time(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

