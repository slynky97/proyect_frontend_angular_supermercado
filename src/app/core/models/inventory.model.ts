import { Product } from "./product.model";

export interface Sucursal {
    id: number;
    nombre: string;
    direccion: string;
    ciudad: string;
}

export interface Almacen {
    id: number;
    nombre: string;
    codigo?: string;
    descripcion?: string;
    sucursal?: Sucursal;
}

export interface AlmacenProducto {
    id: number;
    cantidad_actual: number;
    fecha_actualizacion: Date | string;
    almacen: Almacen;
    producto: Product;
}

export interface StockByProduct {
    producto: Product;
    stockByWarehouse: {
        [almacenId: number]: {
            almacen: Almacen;
            cantidad: number;
        }
    };
    totalStock: number;
}
