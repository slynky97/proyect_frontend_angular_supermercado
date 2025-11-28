import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { NotaService } from '../../core/services/nota.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, CreateNotaRequest, Movimiento } from '../../core/models/product.model';

interface CartItem {
    product: Product;
    quantity: number;
}

@Component({
    selector: 'app-pos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './pos.component.html',
    styleUrl: './pos.component.css'
})
export class PosComponent implements OnInit {
    private productService = inject(ProductService);
    private notaService = inject(NotaService);
    private authService = inject(AuthService);

    products = signal<Product[]>([]);
    cart = signal<CartItem[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    processingCheckout = signal(false);

    filteredProducts = computed(() => {
        const term = this.searchTerm().toLowerCase();
        if (!term) return this.products();
        return this.products().filter(p =>
            p.nombre.toLowerCase().includes(term) ||
            p.descripcion?.toLowerCase().includes(term)
        );
    });

    subtotal = computed(() =>
        this.cart().reduce((sum, item) => sum + (item.product.precio_venta_actual * item.quantity), 0)
    );

    tax = computed(() => this.subtotal() * 0.13); // 13% IVA
    total = computed(() => this.subtotal() + this.tax());

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.loading.set(true);
        this.productService.getAll().subscribe({
            next: (products: Product[]) => {
                this.products.set(products.filter((p: Product) => p.estado));
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading products:', err);
                this.loading.set(false);
            }
        });
    }

    addToCart(product: Product) {
        const currentCart = this.cart();
        const existingItem = currentCart.find(item => item.product.id === product.id);

        if (existingItem) {
            this.cart.set(currentCart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            this.cart.set([...currentCart, { product, quantity: 1 }]);
        }
    }

    updateQuantity(productId: number, quantity: number) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        this.cart.set(this.cart().map(item =>
            item.product.id === productId ? { ...item, quantity } : item
        ));
    }

    removeFromCart(productId: number) {
        this.cart.set(this.cart().filter(item => item.product.id !== productId));
    }

    clearCart() {
        this.cart.set([]);
    }

    checkout() {
        if (this.cart().length === 0) return;

        this.processingCheckout.set(true);

        const movimientos: Omit<Movimiento, 'id' | 'producto'>[] = this.cart().map(item => ({
            producto_id: item.product.id,
            almacen_id: 1, // Default warehouse
            cantidad: item.quantity,
            tipo_movimiento: 'salida' as const,
            precio_unitario_compra: item.product.precio_venta_actual, // Using sale price as purchase price
            precio_unitario_venta: item.product.precio_venta_actual,
            total_calculado: item.product.precio_venta_actual * item.quantity,
            observaciones: ''
        }));

        const currentUser = this.authService.currentUser();
        const nota: CreateNotaRequest = {
            fecha: new Date().toISOString(),
            tipo_nota: 'venta',
            impuestos: this.tax(),
            descuento: 0,
            total_calculado: this.total(),
            estado_nota: 'completada',
            observaciones: '',
            cliente: 1, // Default client
            user: currentUser?.id || '',
            movimientos
        };

        this.notaService.create(nota).subscribe({
            next: () => {
                alert('¡Venta completada exitosamente!');
                this.clearCart();
                this.processingCheckout.set(false);
            },
            error: (err: any) => {
                console.error('Error processing sale:', err);
                alert('Error al procesar la venta. Por favor intente nuevamente.');
                this.processingCheckout.set(false);
            }
        });
    }
}
