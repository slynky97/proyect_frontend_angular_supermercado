export interface CartItem {
    producto: {
        id: number;
        nombre: string;
        precio_venta_actual: number;
        imagen?: string;
        unidad_medida: string;
    };
    almacenId: number;
    almacenNombre: string;
    cantidad: number;
    subtotal: number;
}

export interface CartSummary {
    items: CartItem[];
    subtotal: number;
    descuento: number;
    impuestos: number;
    total: number;
    itemCount: number;
}
