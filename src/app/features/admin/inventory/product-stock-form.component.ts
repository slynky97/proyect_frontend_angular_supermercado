import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { AlmacenService } from '../../../core/services/almacen.service';
import { Almacen } from '../../../core/models/inventory.model';
import { Categoria, Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-stock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" (click)="onCancel()" (keydown.escape)="onCancel()">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <h2 class="text-2xl font-bold mb-6">{{ product ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Product Data Section -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              Datos del Producto
            </h3>
            
            <div class="grid grid-cols-2 gap-4">
              <!-- Nombre -->
              <div class="col-span-2">
                <label class="block text-sm font-medium mb-1">Nombre *</label>
                <input type="text" formControlName="nombre" class="w-full border rounded px-3 py-2" />
                <div *ngIf="form.get('nombre')?.invalid && form.get('nombre')?.touched" class="text-red-500 text-sm mt-1">
                  Nombre es requerido
                </div>
              </div>

              <!-- Descripción -->
              <div class="col-span-2">
                <label class="block text-sm font-medium mb-1">Descripción</label>
                <textarea formControlName="descripcion" rows="2" class="w-full border rounded px-3 py-2"></textarea>
              </div>

              <!-- Código de Barras -->
              <div>
                <label class="block text-sm font-medium mb-1">Código de Barras</label>
                <input type="text" formControlName="codigo_barra" class="w-full border rounded px-3 py-2" />
              </div>

              <!-- Marca -->
              <div>
                <label class="block text-sm font-medium mb-1">Marca</label>
                <input type="text" formControlName="marca" class="w-full border rounded px-3 py-2" />
              </div>

              <!-- Precio Venta -->
              <div>
                <label class="block text-sm font-medium mb-1">Precio de Venta *</label>
                <input type="number" formControlName="precio_venta_actual" step="0.01" min="0" class="w-full border rounded px-3 py-2" />
                <div *ngIf="form.get('precio_venta_actual')?.invalid && form.get('precio_venta_actual')?.touched" class="text-red-500 text-sm mt-1">
                  Precio es requerido
                </div>
              </div>

              <!-- Precio Compra -->
              <div>
                <label class="block text-sm font-medium mb-1">Precio de Compra (Ref.)</label>
                <input type="number" formControlName="precio_unitario_compra" step="0.01" min="0" class="w-full border rounded px-3 py-2" placeholder="Opcional" />
              </div>

              <!-- Validation Error Message -->
              <div class="col-span-2" *ngIf="form.errors?.['invalidPrice'] && (form.touched || form.dirty)">
                 <p class="text-red-500 text-sm">El precio de venta tiene que ser mayor al precio de compra.</p>
              </div>

              <!-- Backend Error Message -->
              <div class="col-span-2" *ngIf="errorMessage">
                <p class="text-red-500 text-sm font-bold">{{ errorMessage }}</p>
              </div>

              <!-- Categoría -->
              <div>
                <label class="block text-sm font-medium mb-1">Categoría *</label>
                <select formControlName="categoria" class="w-full border rounded px-3 py-2">
                  <option value="">Seleccionar...</option>
                  <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.nombre }}</option>
                </select>
                <div *ngIf="form.get('categoria')?.invalid && form.get('categoria')?.touched" class="text-red-500 text-sm mt-1">
                  Categoría es requerida
                </div>
              </div>

              <!-- Unidad de Medida -->
              <div>
                <label class="block text-sm font-medium mb-1">Unidad de Medida *</label>
                <select formControlName="unidad_medida" class="w-full border rounded px-3 py-2">
                  <option value="">Seleccionar...</option>
                  <option value="UNIDAD">Unidad</option>
                  <option value="CAJA">Caja</option>
                  <option value="PAQUETE">Paquete</option>
                  <option value="KG">Kilogramo</option>
                  <option value="LITRO">Litro</option>
                </select>
                <div *ngIf="form.get('unidad_medida')?.invalid && form.get('unidad_medida')?.touched" class="text-red-500 text-sm mt-1">
                  Unidad es requerida
                </div>
              </div>

              <!-- Imagen URL -->
              <div class="col-span-2">
                <label class="block text-sm font-medium mb-1">URL de Imagen</label>
                <input type="text" formControlName="imagen" class="w-full border rounded px-3 py-2" placeholder="https://..." />
                @if (imagePreview()) {
                  <img [src]="imagePreview()" alt="Preview" class="mt-2 w-24 h-24 object-cover rounded border" />
                }
              </div>
            </div>
          </div>

          <!-- Stock Assignment Section (Only for new products) -->
          @if (!product) {
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Asignación de Stock (Opcional)
              </h3>

            <div class="space-y-2" formArrayName="stockAssignments">
              @for (warehouse of warehouses; track warehouse.id; let i = $index) {
                <div [formGroupName]="i" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    formControlName="selected"
                    class="w-4 h-4 text-primary-600 rounded"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ warehouse.nombre }}</div>
                    <div class="text-sm text-gray-600">{{ warehouse.sucursal?.nombre || '' }}</div>
                  </div>
                  <div class="w-32">
                    <input 
                      type="number" 
                      formControlName="cantidad"
                      [disabled]="!getStockControl(i).get('selected')?.value"
                      min="0"
                      placeholder="Cantidad"
                      class="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
                    />
                  </div>
                </div>
              }
            </div>

            @if (warehouses.length === 0) {
              <p class="text-gray-500 text-sm">No hay almacenes disponibles</p>
            }
          </div>
          }

          <!-- Buttons -->
          <div class="flex gap-2 justify-end mt-6 pt-4 border-t">
            <button 
              type="button" 
              (click)="onCancel()" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              [disabled]="form.invalid || saving()"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ saving() ? 'Guardando...' : 'Guardar Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductStockFormComponent implements OnInit {
  @Input() product: Product | null = null;
  @Input() warehouses: Almacen[] = [];
  @Input() categories: Categoria[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private almacenService = inject(AlmacenService);

  form: FormGroup;
  imagePreview = signal<string | null>(null);
  saving = signal(false);
  errorMessage: string | null = null;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      codigo_barra: [''],
      marca: [''],
      precio_venta_actual: [0, [Validators.required, Validators.min(0)]],
      precio_unitario_compra: [0, [Validators.min(0)]],
      categoria: ['', Validators.required],
      unidad_medida: ['', Validators.required],
      imagen: [''],
      stockAssignments: this.fb.array([])
    }, { validators: this.priceValidator });

    // Watch imagen field for preview
    this.form.get('imagen')?.valueChanges.subscribe(url => {
      this.imagePreview.set(url || null);
    });
  }

  ngOnInit() {
    this.initStockAssignments();

    if (this.product) {
      this.form.patchValue({
        nombre: this.product.nombre,
        descripcion: this.product.descripcion,
        codigo_barra: this.product.codigo_barra,
        marca: this.product.marca,
        precio_venta_actual: this.product.precio_venta_actual,
        precio_unitario_compra: this.product.precio_unitario_compra,
        categoria: this.product.categoria?.id,
        unidad_medida: this.product.unidad_medida,
        imagen: this.product.imagen
      });
    }
  }

  private initStockAssignments() {
    const stockArray = this.form.get('stockAssignments') as FormArray;
    this.warehouses.forEach(warehouse => {
      stockArray.push(this.fb.group({
        almacenId: [warehouse.id],
        selected: [false],
        cantidad: [0, [Validators.min(0)]]
      }));
    });
  }

  getStockControl(index: number): FormGroup {
    const stockArray = this.form.get('stockAssignments') as FormArray;
    return stockArray.at(index) as FormGroup;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.errorMessage = null;
    this.saving.set(true);
    const formValue = this.form.value;

    const productData: any = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || undefined,
      codigo_barra: formValue.codigo_barra || undefined,
      marca: formValue.marca || undefined,
      precio_venta_actual: +formValue.precio_venta_actual,
      precio_unitario_compra: formValue.precio_unitario_compra ? +formValue.precio_unitario_compra : undefined,
      categoria: +formValue.categoria,
      unidad_medida: formValue.unidad_medida,
      imagen: formValue.imagen || undefined,
      estado: true
    };

    if (this.product) {
      // Update existing product
      this.productService.update(this.product.id, productData).subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.emit();
        },
        error: (err) => {
          console.error('Error updating product:', err);
          if (err.status === 400) {
            this.errorMessage = 'El precio de venta tiene que ser mayor al precio de compra';
          } else {
            this.errorMessage = 'Error al actualizar el producto';
          }
          this.saving.set(false);
        }
      });
    } else {
      // Create new product
      this.productService.create(productData).subscribe({
        next: (product) => {
          // Step 2: Assign stock to selected warehouses
          const selectedStocks = formValue.stockAssignments
            .filter((s: any) => s.selected && s.cantidad > 0)
            .map((s: any) => ({
              productoId: product.id,
              almacenId: s.almacenId,
              cantidad_actual: s.cantidad
            }));

          if (selectedStocks.length === 0) {
            this.saving.set(false);
            this.saved.emit();
            return;
          }

          const stockPromises = selectedStocks.map((stock: any) =>
            this.almacenService.createStock(stock).toPromise()
          );

          Promise.all(stockPromises).then(() => {
            this.saving.set(false);
            this.saved.emit();
          }).catch(err => {
            console.error('Error creating stock assignments:', err);
            alert('Producto creado pero hubo error al asignar stock');
            this.saving.set(false);
            this.saved.emit();
          });
        },
        error: (err) => {
          console.error('Error creating product:', err);
          if (err.status === 400) {
            this.errorMessage = 'El precio de venta tiene que ser mayor al precio de compra';
          } else {
            this.errorMessage = 'Error al crear el producto';
          }
          this.saving.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  priceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const venta = control.get('precio_venta_actual')?.value;
    const compra = control.get('precio_unitario_compra')?.value;

    if (venta !== null && compra !== null && +compra > +venta) {
      return { invalidPrice: true };
    }
    return null;
  };
}
