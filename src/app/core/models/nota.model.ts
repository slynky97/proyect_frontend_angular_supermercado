export interface Movimiento {
    producto_id: number;
    almacen_id: number;
    cantidad: number;
    tipo_movimiento: 'ingreso' | 'salida';
    precio_unitario_compra?: number;
    precio_unitario_venta?: number;
    total_calculado: number;
}

export interface Nota {
    id?: number;
    fecha: string;
    tipo_nota: 'compra' | 'venta';
    impuestos: number;
    descuento: number;
    total_calculado: number;
    estado_nota: 'en proceso' | 'completado' | 'cancelado';
    observaciones?: string;
    cliente?: number;
    user: string;
    movimientos: Movimiento[];
}

export interface CreateNotaDto {
    fecha: string;
    tipo_nota: 'compra' | 'venta';
    impuestos: number;
    descuento: number;
    total_calculado: number;
    estado_nota: 'en proceso' | 'completado';
    observaciones?: string;
    cliente?: number;
    user: string;
    movimientos: Movimiento[];
}
