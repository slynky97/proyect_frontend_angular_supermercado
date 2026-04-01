import { Component, EventEmitter, Output, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { NotaService } from '../../../core/services/nota.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { CreateNotaRequest, Cliente } from '../../../core/models/product.model';

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">Procesar Venta</h2>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4">Detalles de la Venta</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2 relative">
                <label class="block text-sm font-medium mb-1">Cliente</label>
                
                <!-- Searchable Input -->
                <div class="relative">
                  <input 
                    type="text" 
                    [ngModel]="searchTerm()" 
                    (ngModelChange)="onSearch($event)"
                    [ngModelOptions]="{standalone: true}"
                    (focus)="showDropdown.set(true)"
                    placeholder="Buscar por nombre o CI/NIT..."
                    class="w-full border rounded px-3 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    [class.border-green-500]="selectedClient()"
                  />
                  
                  <!-- Clear/Status Icon -->
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    @if (selectedClient()) {
                      <button type="button" (click)="clearClient()" class="hover:text-red-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    }
                  </div>

                  <!-- Dropdown Results -->
                  @if (showDropdown()) {
                    <div class="absolute z-20 w-full bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1">
                      <div 
                        (click)="selectClient(null)" 
                        class="p-3 hover:bg-gray-50 cursor-pointer border-b text-gray-500 italic flex items-center gap-2"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        -- Sin Cliente (Venta General) --
                      </div>
                      
                      @for (client of filteredClients(); track client.id) {
                        <div 
                          (click)="selectClient(client)" 
                          class="p-3 hover:bg-primary-50 cursor-pointer border-b last:border-0 transition-colors"
                        >
                          <div class="font-medium text-gray-900">{{ client.razon_social }}</div>
                          <div class="text-xs text-gray-500 flex items-center gap-2">
                            <span class="bg-gray-100 px-1.5 py-0.5 rounded">NIT/CI: {{ client.ci_nit_ruc_rut || 'S/N' }}</span>
                            @if (client.telefono) {
                              <span>• Tel: {{ client.telefono }}</span>
                            }
                          </div>
                        </div>
                      }
                      
                      @if (filteredClients().length === 0) {
                        <div class="p-4 text-center text-gray-500 text-sm">
                          No se encontraron clientes
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Backdrop to close dropdown -->
                @if (showDropdown()) {
                  <div class="fixed inset-0 z-10" (click)="showDropdown.set(false)"></div>
                }
                
                <p class="text-xs text-gray-500 mt-1">
                  @if (selectedClient()) {
                    <span class="text-green-600 font-medium">Cliente seleccionado: {{ selectedClient()?.razon_social }}</span>
                  } @else {
                    Busque y seleccione un cliente, o deje vacío para venta general
                  }
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Descuento (Bs.)</label>
                <input type="number" formControlName="descuento" min="0" step="0.01" class="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Impuestos (Bs.)</label>
                <input type="number" formControlName="impuestos" min="0" step="0.01" class="w-full border rounded px-3 py-2" />
              </div>

              <div class="col-span-2">
                <label class="block text-sm font-medium mb-1">Observaciones</label>
                <textarea formControlName="observaciones" rows="2" class="w-full border rounded px-3 py-2" placeholder="Notas adicionales..."></textarea>
              </div>
            </div>
          </div>

          <div class="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3">Resumen del Carrito</h3>
            
            <div class="space-y-2 mb-3">
              @for (item of cartService.cartItems(); track item.producto.id + '-' + item.almacenId) {
                <div class="flex justify-between text-sm">
                  <span class="text-gray-700">
                    {{ item.producto.nombre }} × {{ item.cantidad }}
                    <span class="text-gray-500">({{ item.almacenNombre }})</span>
                  </span>
                  <span class="font-medium">Bs. {{ item.subtotal.toFixed(2) }}</span>
                </div>
              }
            </div>

            <div class="border-t pt-3 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">Bs. {{ cartService.subtotal().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Descuento:</span>
                <span class="font-medium text-red-600">- Bs. {{ form.get('descuento')?.value || 0 }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Impuestos:</span>
                <span class="font-medium">+ Bs. {{ form.get('impuestos')?.value || 0 }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span class="text-primary-600">Bs. {{ totalCalculado().toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2 justify-end">
            <button type="button" (click)="onCancel()" [disabled]="saving()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50">Cancelar</button>
            <button type="submit" [disabled]="form.invalid || saving()" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ saving() ? 'Procesando...' : 'Generar Venta' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SalesFormComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  private notaService = inject(NotaService);
  private authService = inject(AuthService);
  private clienteService = inject(ClienteService);

  form: FormGroup;
  saving = signal(false);
  totalCalculado = signal(0);

  // Client Search Signals
  clients = signal<Cliente[]>([]);
  searchTerm = signal('');
  showDropdown = signal(false);
  selectedClient = signal<Cliente | null>(null);

  filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.clients();

    return this.clients().filter(client =>
      client.razon_social.toLowerCase().includes(term) ||
      client.ci_nit_ruc_rut?.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.form = this.fb.group({
      cliente: [null],
      descuento: [0, [Validators.min(0)]],
      impuestos: [0, [Validators.min(0)]],
      observaciones: ['']
    });
  }

  ngOnInit() {
    this.loadClients();
    this.form.valueChanges.subscribe(() => {
      this.updateTotal();
    });
  }

  private loadClients() {
    this.clienteService.getAll().subscribe({
      next: (clients) => this.clients.set(clients.filter(c => c.estado && c.tipo === 'cliente')),
      error: (err) => console.error('Error loading clients:', err)
    });
  }

  ngDoCheck() {
    this.updateTotal();
  }

  private updateTotal() {
    const subtotal = this.cartService.subtotal();
    const descuento = +(this.form.get('descuento')?.value || 0);
    const impuestos = +(this.form.get('impuestos')?.value || 0);
    this.totalCalculado.set(subtotal - descuento + impuestos);
  }

  // Search Methods
  onSearch(term: string) {
    this.searchTerm.set(term);
    this.showDropdown.set(true);
    // If user types, we clear selection until they pick one
    if (this.selectedClient() && term !== this.selectedClient()?.razon_social) {
      this.form.patchValue({ cliente: null });
      this.selectedClient.set(null);
    }
  }

  selectClient(client: Cliente | null) {
    if (client) {
      this.selectedClient.set(client);
      this.searchTerm.set(client.razon_social);
      this.form.patchValue({ cliente: client.id });
    } else {
      this.clearClient();
    }
    this.showDropdown.set(false);
  }

  clearClient() {
    this.selectedClient.set(null);
    this.searchTerm.set('');
    this.form.patchValue({ cliente: null });
  }

  onSubmit(): void {
    if (this.form.invalid || this.cartService.itemCount() === 0) return;

    this.saving.set(true);
    const formValue = this.form.value;
    const user = this.authService.currentUser();

    if (!user) {
      alert('Usuario no autenticado');
      this.saving.set(false);
      return;
    }

    const movimientos = this.cartService.cartItems().map(item => ({
      producto_id: item.producto.id,
      almacen_id: item.almacenId,
      cantidad: item.cantidad,
      tipo_movimiento: 'salida' as const,
      precio_unitario_venta: item.producto.precio_venta_actual,
      total_calculado: item.subtotal
    }));

    const nota: any = {
      fecha: new Date().toISOString(),
      tipo_nota: 'venta',
      impuestos: (+(formValue.impuestos || 0)).toFixed(2),
      descuento: (+(formValue.descuento || 0)).toFixed(2),
      total_calculado: this.totalCalculado().toFixed(2),
      estado_nota: 'completado',
      user: user.id,
      movimientos
    };

    // Only include cliente if provided
    if (formValue.cliente) {
      nota.cliente = +formValue.cliente; // Ensure it's a number
    }

    // Only include observaciones if provided
    if (formValue.observaciones) {
      nota.observaciones = formValue.observaciones;
    }

    console.log('Sending nota:', nota);

    this.notaService.create(nota).subscribe({
      next: () => {
        alert('✅ Venta generada exitosamente');
        this.cartService.clearCart();
        this.saving.set(false);
        this.completed.emit();
      },
      error: (err) => {
        console.error('Error creating sale:', err);
        console.error('Error details:', err.error);
        const errorMsg = err.error?.message || err.message || 'Error desconocido';
        alert(`❌ Error al generar la venta: ${JSON.stringify(errorMsg)}`);
        this.saving.set(false);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
