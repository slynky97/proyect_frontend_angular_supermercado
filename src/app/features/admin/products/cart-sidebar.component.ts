import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

@Component({
    selector: 'app-cart-sidebar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-40 flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl font-bold text-gray-900">🛒 Carrito</h2>
          <button 
            (click)="onClose()"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600">{{ cartService.itemCount() }} producto(s)</p>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-6">
        @if (cartService.itemCount() === 0) {
          <div class="flex flex-col items-center justify-center h-full text-gray-400">
            <svg class="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <p class="text-lg font-medium">Carrito vacío</p>
            <p class="text-sm">Agrega productos para comenzar</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (item of cartService.cartItems(); track item.producto.id + '-' + item.almacenId) {
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex gap-3 mb-3">
                  @if (item.producto.imagen) {
                    <img [src]="item.producto.imagen" [alt]="item.producto.nombre" class="w-16 h-16 object-cover rounded" />
                  } @else {
                    <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span class="text-gray-400 text-xs">Sin img</span>
                    </div>
                  }
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">{{ item.producto.nombre }}</h3>
                    <p class="text-sm text-gray-600">{{ item.almacenNombre }}</p>
                    <p class="text-sm font-medium text-primary-600">Bs. {{ item.producto.precio_venta_actual }}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <button 
                      (click)="decreaseQuantity(item)"
                      class="w-8 h-8 bg-white border rounded hover:bg-gray-100"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      [value]="item.cantidad"
                      (change)="updateQuantity(item, $event)"
                      min="1"
                      class="w-16 text-center border rounded px-2 py-1"
                    />
                    <button 
                      (click)="increaseQuantity(item)"
                      class="w-8 h-8 bg-white border rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    (click)="removeItem(item)"
                    class="text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                <div class="mt-2 pt-2 border-t border-gray-200">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-semibold text-gray-900">Bs. {{ item.subtotal.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Footer with Summary -->
      @if (cartService.itemCount() > 0) {
        <div class="border-t border-gray-200 p-6 bg-gray-50">
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal:</span>
              <span class="font-medium">Bs. {{ cartService.subtotal().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span class="text-primary-600">Bs. {{ cartService.subtotal().toFixed(2) }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <button 
              (click)="onProceedToSale()"
              class="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Procesar Venta
            </button>
            <button 
              (click)="onClearCart()"
              class="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Vaciar Carrito
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-black/20 z-30"
      (click)="onClose()"
    ></div>
  `
})
export class CartSidebarComponent {
    @Output() closed = new EventEmitter<void>();
    @Output() proceedToSale = new EventEmitter<void>();

    cartService = inject(CartService);

    increaseQuantity(item: any): void {
        this.cartService.updateQuantity(item.producto.id, item.almacenId, item.cantidad + 1);
    }

    decreaseQuantity(item: any): void {
        if (item.cantidad > 1) {
            this.cartService.updateQuantity(item.producto.id, item.almacenId, item.cantidad - 1);
        }
    }

    updateQuantity(item: any, event: Event): void {
        const input = event.target as HTMLInputElement;
        const newQuantity = parseInt(input.value, 10);
        if (newQuantity > 0) {
            this.cartService.updateQuantity(item.producto.id, item.almacenId, newQuantity);
        }
    }

    removeItem(item: any): void {
        if (confirm(`¿Eliminar ${item.producto.nombre} del carrito?`)) {
            this.cartService.removeFromCart(item.producto.id, item.almacenId);
        }
    }

    onClearCart(): void {
        if (confirm('¿Vaciar todo el carrito?')) {
            this.cartService.clearCart();
        }
    }

    onClose(): void {
        this.closed.emit();
    }

    onProceedToSale(): void {
        this.proceedToSale.emit();
    }
}
