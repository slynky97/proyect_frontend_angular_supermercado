import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlmacenService } from '../../../core/services/almacen.service';
import { ProductService } from '../../../core/services/product.service';
import { Almacen, AlmacenProducto } from '../../../core/models/inventory.model';
import { Product } from '../../../core/models/product.model';

@Component({
    selector: 'app-stock-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 class="text-2xl font-bold mb-4">{{ stockEntry ? 'Editar' : 'Asignar' }} Stock</h2>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Product Selector -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Producto *</label>
            <select 
              formControlName="productoId" 
              class="w-full border rounded px-3 py-2"
              [disabled]="!!stockEntry"
            >
              <option value="">Seleccionar producto...</option>
              <option *ngFor="let product of products" [value]="product.id">
                {{ product.nombre }} - {{ product.marca || 'Sin marca' }}
              </option>
            </select>
            <div *ngIf="form.get('productoId')?.invalid && form.get('productoId')?.touched" class="text-red-500 text-sm mt-1">
              Producto es requerido
            </div>
          </div>

          <!-- Warehouse Selector -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Almacén *</label>
            <select 
              formControlName="almacenId" 
              class="w-full border rounded px-3 py-2"
              [disabled]="!!stockEntry"
            >
              <option value="">Seleccionar almacén...</option>
              <option *ngFor="let warehouse of warehouses" [value]="warehouse.id">
                {{ warehouse.nombre }} - {{ warehouse.sucursal?.nombre || '' }}
              </option>
            </select>
            <div *ngIf="form.get('almacenId')?.invalid && form.get('almacenId')?.touched" class="text-red-500 text-sm mt-1">
              Almacén es requerido
            </div>
          </div>

          <!-- Quantity Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Cantidad *</label>
            <input 
              type="number" 
              formControlName="cantidad_actual" 
              min="0"
              class="w-full border rounded px-3 py-2"
              placeholder="Ingrese la cantidad"
            />
            <div *ngIf="form.get('cantidad_actual')?.invalid && form.get('cantidad_actual')?.touched" class="text-red-500 text-sm mt-1">
              Cantidad debe ser mayor o igual a 0
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-2 justify-end mt-6">
            <button 
              type="button" 
              (click)="onCancel()" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              [disabled]="form.invalid"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ stockEntry ? 'Actualizar' : 'Asignar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class StockFormComponent implements OnChanges {
    @Input() stockEntry: AlmacenProducto | null = null;
    @Input() warehouses: Almacen[] = [];
    @Input() products: Product[] = [];
    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private almacenService = inject(AlmacenService);

    form: FormGroup;

    constructor() {
        this.form = this.fb.group({
            productoId: ['', Validators.required],
            almacenId: ['', Validators.required],
            cantidad_actual: [0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnChanges(): void {
        if (this.stockEntry) {
            this.form.patchValue({
                productoId: this.stockEntry.producto.id,
                almacenId: this.stockEntry.almacen.id,
                cantidad_actual: this.stockEntry.cantidad_actual
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        const formValue = this.form.value;

        if (this.stockEntry) {
            // Update existing stock
            this.almacenService.updateStock(this.stockEntry.id, {
                cantidad_actual: formValue.cantidad_actual
            }).subscribe({
                next: () => {
                    this.saved.emit();
                },
                error: (err) => {
                    console.error('Error updating stock:', err);
                    alert('Error al actualizar el stock');
                }
            });
        } else {
            // Create new stock assignment
            this.almacenService.createStock({
                productoId: +formValue.productoId,
                almacenId: +formValue.almacenId,
                cantidad_actual: formValue.cantidad_actual
            }).subscribe({
                next: () => {
                    this.saved.emit();
                },
                error: (err) => {
                    console.error('Error creating stock:', err);
                    alert('Error al asignar el stock');
                }
            });
        }
    }

    onCancel(): void {
        this.cancelled.emit();
    }
}
