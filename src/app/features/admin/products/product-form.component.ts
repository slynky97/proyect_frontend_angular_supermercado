import { Component, EventEmitter, Input, Output, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Categoria } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">{{ product ? 'Editar' : 'Nuevo' }} Producto</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nombre *</label>
              <input type="text" formControlName="nombre" class="w-full border rounded px-2 py-1" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">Imagen del Producto</label>
              <input 
                type="text" 
                formControlName="imagen" 
                placeholder="URL de la imagen" 
                class="w-full border rounded px-2 py-1 mb-2" 
              />
              <div *ngIf="imagePreview" class="mt-2">
                <img [src]="imagePreview" alt="Vista previa" class="w-32 h-32 object-cover rounded border" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Unidad de Medida *</label>
              <select formControlName="unidad_medida" class="w-full border rounded px-2 py-1">
                <option value="">Seleccionar...</option>
                <option value="UNIDAD">Unidad</option>
                <option value="KG">Kilogramo</option>
                <option value="LITRO">Litro</option>
                <option value="CAJA">Caja</option>
                <option value="PAQUETE">Paquete</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Precio Venta *</label>
              <input type="number" step="0.01" formControlName="precio_venta_actual" class="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Precio Compra</label>
              <input type="number" step="0.01" formControlName="precio_unitario_compra" class="w-full border rounded px-2 py-1" />
            </div>
            <div class="col-span-2" *ngIf="form.errors?.['invalidPrice'] && (form.touched || form.dirty)">
              <p class="text-red-500 text-sm">El precio de venta tiene que ser mayor al precio de compra.</p>
            </div>
            <div class="col-span-2" *ngIf="errorMessage">
              <p class="text-red-500 text-sm font-bold">{{ errorMessage }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Categoría *</label>
              <select formControlName="categoriaId" class="w-full border rounded px-2 py-1">
                <option value="">Seleccionar...</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Código de Barras</label>
              <input type="text" formControlName="codigo_barra" class="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Marca</label>
              <input type="text" formControlName="marca" class="w-full border rounded px-2 py-1" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">Descripción</label>
              <textarea formControlName="descripcion" rows="2" class="w-full border rounded px-2 py-1"></textarea>
            </div>
            <div class="flex items-center mt-4">
              <input type="checkbox" formControlName="estado" class="mr-2" id="estado" />
              <label for="estado" class="text-sm font-medium">Activo</label>
            </div>
          </div>
          <div class="flex justify-end mt-6 space-x-3">
            <button type="button" (click)="cancel.emit()" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
            <button type="submit" [disabled]="form.invalid" class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Output() saved = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  categories: Categoria[] = [];
  form: FormGroup;
  imagePreview: string | null = null;
  errorMessage: string | null = null;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      imagen: [''],
      descripcion: [''],
      codigo_barra: [''],
      unidad_medida: ['', Validators.required],
      marca: [''],
      precio_venta_actual: [0, [Validators.required, Validators.min(0)]],
      precio_unitario_compra: [0, [Validators.min(0)]],
      categoriaId: [null, Validators.required],
      estado: [true]
    }, { validators: this.priceValidator });
    this.loadCategories();

    // Watch for changes in the imagen field to update preview
    this.form.get('imagen')?.valueChanges.subscribe(url => {
      this.imagePreview = url || null;
    });
  }

  ngOnChanges(): void {
    if (this.product) {
      this.form.patchValue({
        nombre: this.product.nombre,
        imagen: this.product.imagen ?? '',
        descripcion: this.product.descripcion ?? '',
        codigo_barra: this.product.codigo_barra ?? '',
        unidad_medida: this.product.unidad_medida,
        marca: this.product.marca ?? '',
        precio_venta_actual: this.product.precio_venta_actual,
        precio_unitario_compra: this.product.precio_unitario_compra ?? 0,
        categoriaId: this.product.categoria?.id ?? null,
        estado: this.product.estado
      });
      this.imagePreview = this.product.imagen ?? null;
    }
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: cats => (this.categories = cats),
      error: err => console.error('Error loading categories', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.errorMessage = null;
    const formValue = this.form.value;
    const payload: any = {
      nombre: formValue.nombre,
      imagen: formValue.imagen || undefined,
      descripcion: formValue.descripcion || undefined,
      codigo_barra: formValue.codigo_barra || undefined,
      unidad_medida: formValue.unidad_medida,
      marca: formValue.marca || undefined,
      precio_venta_actual: +formValue.precio_venta_actual,
      precio_unitario_compra: +formValue.precio_unitario_compra,
      estado: formValue.estado,
      categoria: +formValue.categoriaId
    };

    if (this.product && this.product.id) {
      this.productService.update(this.product.id, payload).subscribe({
        next: updated => this.saved.emit(updated),
        error: err => {
          console.error('Error updating product', err);
          if (err.status === 400) {
            this.errorMessage = 'El precio de venta tiene que ser mayor al precio de compra';
          } else {
            this.errorMessage = 'Error al actualizar el producto';
          }
        }
      });
    } else {
      this.productService.create(payload).subscribe({
        next: created => this.saved.emit(created),
        error: err => {
          console.error('Error creating product', err);
          if (err.status === 400) {
            this.errorMessage = 'El precio de venta tiene que ser mayor al precio de compra';
          } else {
            this.errorMessage = 'Error al crear el producto';
          }
        }
      });
    }
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
