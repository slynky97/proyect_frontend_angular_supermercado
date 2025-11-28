import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../core/models/product.model';
import { AlmacenService } from '../../../core/services/almacen.service';
import { CartService } from '../../../core/services/cart.service';
import { Almacen, AlmacenProducto } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-add-to-cart-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 class="text-2xl font-bold mb-4">Agregar al Carrito</h2>
        
        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            @if (product.imagen) {
              <img [src]="product.imagen" [alt]="product.nombre" class="w-16 h-16 object-cover rounded" />
            }
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{{ product.nombre }}</h3>
              <p class="text-sm text-gray-600">{{ product.marca || 'Sin marca' }}</p>
              <p class="text-lg font-bold text-primary-600">Bs. {{ product.precio_venta_actual }}</p>
            </div>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Almacén *</label>
            <select formControlName="almacenId" (change)="onWarehouseChange()" class="w-full border rounded px-3 py-2">
              <option value="">Seleccionar almacén...</option>
              @for (stock of availableStock(); track stock.almacen.id) {
                <option [value]="stock.almacen.id">
                  {{ stock.almacen.nombre }} - Stock Total: {{ stock.cantidad_actual }}
                </option>
              }
            </select>
            <div *ngIf="form.get('almacenId')?.invalid && form.get('almacenId')?.touched" class="text-red-500 text-sm mt-1">
              Seleccione un almacén
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Cantidad *</label>
            <div class="flex items-center gap-2">
              <button type="button" (click)="decreaseQuantity()" [disabled]="form.get('cantidad')?.value <= 1" class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">-</button>
              <input type="number" formControlName="cantidad" min="1" [max]="maxStock()" class="flex-1 border rounded px-3 py-2 text-center" />
              <button type="button" (click)="increaseQuantity()" [disabled]="form.get('cantidad')?.value >= maxStock()" class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">+</button>
            </div>
            @if (maxStock() > 0) {
              <p class="text-sm text-green-600 mt-1 font-medium">✓ Disponible para agregar: {{ maxStock() }}</p>
            } @else if (form.get('almacenId')?.value) {
              <p class="text-sm text-red-600 mt-1 font-medium">⚠ No hay stock disponible (ya está en el carrito)</p>
            }
            @if (getQuantityInCart() > 0) {
              <p class="text-sm text-orange-600 mt-1">📦 Ya tienes {{ getQuantityInCart() }} unidad(es) en el carrito</p>
            }
            <div *ngIf="form.get('cantidad')?.invalid && form.get('cantidad')?.touched" class="text-red-500 text-sm mt-1">
              Cantidad inválida
            </div>
          </div>

          <div class="mb-6 p-3 bg-primary-50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-gray-700">Subtotal:</span>
              <span class="text-xl font-bold text-primary-600">Bs. {{ subtotal() }}</span>
            </div>
          </div>

          <div class="flex gap-2 justify-end">
            <button type="button" (click)="onCancel()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" [disabled]="form.invalid || maxStock() === 0" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Agregar al Carrito</button>
          </div>
        </form>

        @if (availableStock().length === 0) {
          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-700 text-sm">Este producto no tiene stock disponible en ningún almacén.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class AddToCartModalComponent implements OnInit {
  @Input() product!: Product;
  @Output() added = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private almacenService = inject(AlmacenService);
  private cartService = inject(CartService);

  form: FormGroup;
  availableStock = signal<AlmacenProducto[]>([]);
  maxStock = signal(0);
  subtotal = signal(0);

  constructor() {
    this.form = this.fb.group({
      almacenId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadStock();
  }

  private loadStock() {
    this.almacenService.getAllStock().subscribe({
      next: (stock) => {
        const productStock = stock.filter(s => s.producto.id === this.product.id && s.cantidad_actual > 0);
        this.availableStock.set(productStock);
      },
      error: (err) => {
        console.error('Error loading stock:', err);
        this.availableStock.set([]);
      }
    });
  }

  onWarehouseChange() {
    const almacenId = +this.form.get('almacenId')?.value;
    const stock = this.availableStock().find(s => s.almacen.id === almacenId);

    if (stock) {
      // Calculate quantity already in cart for this product and warehouse
      const quantityInCart = this.getQuantityInCart();

      // Real available stock = total stock - quantity in cart
      const realAvailable = stock.cantidad_actual - quantityInCart;
      this.maxStock.set(realAvailable);
      this.form.patchValue({ cantidad: 1 });
    } else {
      this.maxStock.set(0);
    }
  }

  getQuantityInCart(): number {
    const almacenId = +this.form.get('almacenId')?.value;
    if (!almacenId) return 0;

    const cartItems = this.cartService.getCartItems();
    const inCart = cartItems.find(item =>
      item.producto.id === this.product.id && item.almacenId === almacenId
    );
    return inCart ? inCart.cantidad : 0;
  }

  increaseQuantity() {
    const current = this.form.get('cantidad')?.value || 0;
    if (current < this.maxStock()) {
      this.form.patchValue({ cantidad: current + 1 });
    }
  }

  decreaseQuantity() {
    const current = this.form.get('cantidad')?.value || 0;
    if (current > 1) {
      this.form.patchValue({ cantidad: current - 1 });
    }
  }

  ngDoCheck() {
    const cantidad = this.form.get('cantidad')?.value || 0;
    this.subtotal.set(cantidad * this.product.precio_venta_actual);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const almacenId = +this.form.get('almacenId')?.value;
    const cantidad = this.form.get('cantidad')?.value;
    const stock = this.availableStock().find(s => s.almacen.id === almacenId);

    if (!stock) return;

    this.cartService.addToCart(
      this.product,
      almacenId,
      stock.almacen.nombre,
      cantidad
    );

    this.added.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
