import { Injectable, signal, computed } from '@angular/core';
import { CartItem, CartSummary } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private items = signal<CartItem[]>([]);

    // Computed values
    cartItems = this.items.asReadonly();

    itemCount = computed(() => this.items().length);

    subtotal = computed(() =>
        this.items().reduce((sum, item) => sum + item.subtotal, 0)
    );

    summary = computed<CartSummary>(() => {
        const items = this.items();
        const subtotal = this.subtotal();
        const descuento = 0; // Se aplicará en el formulario de venta
        const impuestos = 0; // Se aplicará en el formulario de venta
        const total = subtotal - descuento + impuestos;

        return {
            items,
            subtotal,
            descuento,
            impuestos,
            total,
            itemCount: items.length
        };
    });

    addToCart(product: Product, almacenId: number, almacenNombre: string, cantidad: number): void {
        const existingIndex = this.items().findIndex(
            item => item.producto.id === product.id && item.almacenId === almacenId
        );

        if (existingIndex >= 0) {
            // Update existing item
            this.items.update(items => {
                const updated = [...items];
                updated[existingIndex].cantidad += cantidad;
                updated[existingIndex].subtotal = updated[existingIndex].cantidad * product.precio_venta_actual;
                return updated;
            });
        } else {
            // Add new item
            const newItem: CartItem = {
                producto: {
                    id: product.id,
                    nombre: product.nombre,
                    precio_venta_actual: product.precio_venta_actual,
                    imagen: product.imagen,
                    unidad_medida: product.unidad_medida
                },
                almacenId,
                almacenNombre,
                cantidad,
                subtotal: cantidad * product.precio_venta_actual
            };

            this.items.update(items => [...items, newItem]);
        }
    }

    updateQuantity(productId: number, almacenId: number, cantidad: number): void {
        if (cantidad <= 0) {
            this.removeFromCart(productId, almacenId);
            return;
        }

        this.items.update(items => {
            const index = items.findIndex(
                item => item.producto.id === productId && item.almacenId === almacenId
            );

            if (index >= 0) {
                const updated = [...items];
                updated[index].cantidad = cantidad;
                updated[index].subtotal = cantidad * updated[index].producto.precio_venta_actual;
                return updated;
            }

            return items;
        });
    }

    removeFromCart(productId: number, almacenId: number): void {
        this.items.update(items =>
            items.filter(item => !(item.producto.id === productId && item.almacenId === almacenId))
        );
    }

    clearCart(): void {
        this.items.set([]);
    }

    getCartItems(): CartItem[] {
        return this.items();
    }
}
