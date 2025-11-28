import { User } from "./auth.model";

export interface Categoria {
    id: number;
    nombre: string;
}

export interface Product {
    id: number;
    nombre: string;
    descripcion?: string;
    codigo_barra?: string;
    unidad_medida: string;
    marca?: string;
    precio_venta_actual: number;
    imagen?: string;
    estado: boolean;
    categoria?: Categoria;
}

export interface Cliente {
    id: number;
    tipo: 'cliente' | 'proveedor';
    razon_social: string;
    ci_nit_ruc_rut?: string;
    telefono?: string;
    direccion?: string;
    correo?: string;
    estado: boolean;
}

export interface Nota {
    id: number;
    fecha: string;
    tipo_nota: 'compra' | 'venta';
    impuestos?: number;
    descuento: number;
    total_calculado: number;
    estado_nota: string;
    observaciones?: string;
    cliente?: Cliente;
    user: User;
    movimientos?: Movimiento[];
}

export interface Almacen {
    id: number;
    nombre: string;
    ubicacion?: string;
    sucursal?: {
        id: number;
        nombre: string;
    };
}

export interface Movimiento {
    id?: number;
    producto_id: number;
    producto?: Product;
    almacen_id: number;
    almacen?: Almacen;
    cantidad: number;
    tipo_movimiento: 'ingreso' | 'salida' | 'devolucion';
    precio_unitario_compra?: number;
    precio_unitario_venta?: number;
    total_calculado: number;
    observaciones?: string;
}

export interface CreateNotaRequest {
    fecha: string;
    tipo_nota: 'compra' | 'venta';
    impuestos?: number;
    descuento: number;
    total_calculado: number;
    estado_nota: string;
    observaciones?: string;
    cliente?: number;
    user: string;
    movimientos: Omit<Movimiento, 'id' | 'producto'>[];
}
