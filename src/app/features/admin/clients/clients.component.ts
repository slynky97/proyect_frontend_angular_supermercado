import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/product.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Clientes</h1>
          <p class="text-gray-600 mt-2">Gestión de clientes</p>
        </div>
        <button 
          (click)="openCreateForm()"
          class="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
          + Nuevo Cliente
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtros y Búsqueda</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="relative">
            <input 
              type="text" 
              [ngModel]="searchTerm()" 
              (ngModelChange)="searchTerm.set($event)"
              placeholder="Buscar por nombre..."
              class="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          
          <div>
            <input 
              type="text" 
              [ngModel]="searchCI()" 
              (ngModelChange)="searchCI.set($event)"
              placeholder="Buscar por CI/NIT..."
              class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <select 
              [ngModel]="statusFilter()" 
              (ngModelChange)="statusFilter.set($event)"
              class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div class="flex items-end gap-3">
            <button 
              (click)="clearFilters()" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Limpiar Filtros
            </button>
            <button 
              (click)="downloadPDF()" 
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i class="fas fa-file-pdf"></i>
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      } @else {
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-primary-600 border-b-2 border-primary-700">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Nombre</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">CI/NIT/RUC/RUT</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Teléfono</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Correo</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Estado</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (client of filteredClients(); track client.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ client.razon_social }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ client.ci_nit_ruc_rut || '-' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ client.telefono || '-' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ client.correo || '-' }}</td>
                  <td class="px-6 py-4">
                    <span [class]="client.estado ? 'px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full' : 'px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full'">
                      {{ client.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <button (click)="editClient(client)" class="text-primary-600 hover:text-primary-800 font-medium">
                      Editar
                    </button>
                  </td>
                </tr>
              }
              @if (filteredClients().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No se encontraron clientes con los filtros seleccionados
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Create/Edit Client Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeForm()" (keydown.escape)="closeForm()">
          <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">{{ editingClient() ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
              <button (click)="closeForm()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            @if (errorMessage()) {
              <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ errorMessage() }}
              </div>
            }

            <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input 
                    type="text" 
                    formControlName="razon_social"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nombre del cliente"
                  />
                  @if (clientForm.get('razon_social')?.invalid && clientForm.get('razon_social')?.touched) {
                    <p class="text-red-500 text-sm mt-1">El nombre es requerido</p>
                  }
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">CI/NIT/RUC/RUT</label>
                    <input 
                      type="text" 
                      formControlName="ci_nit_ruc_rut"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Número de identificación"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input 
                      type="text" 
                      formControlName="telefono"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    formControlName="correo"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <textarea 
                    formControlName="direccion"
                    rows="2"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Dirección del cliente"
                  ></textarea>
                </div>

                @if (editingClient()) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select 
                      formControlName="estado"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option [ngValue]="true">Activo</option>
                      <option [ngValue]="false">Inactivo</option>
                    </select>
                  </div>
                }
              </div>

              <div class="mt-6 flex gap-3">
                <button 
                  type="button"
                  (click)="closeForm()"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  [disabled]="clientForm.invalid || saving()"
                  class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ saving() ? 'Guardando...' : (editingClient() ? 'Actualizar Cliente' : 'Crear Cliente') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ClientsComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);

  clients = signal<Cliente[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editingClient = signal<Cliente | null>(null);
  errorMessage = signal<string | null>(null);

  // Filters
  searchTerm = signal('');
  searchCI = signal('');
  statusFilter = signal('');

  clearFilters() {
    this.searchTerm.set('');
    this.searchCI.set('');
    this.statusFilter.set('');
  }

  downloadPDF() {
    const doc = new jsPDF();
    const clients = this.filteredClients();
    const headers = [['Nombre', 'CI/NIT/RUC', 'Teléfono', 'Correo', 'Dirección', 'Estado']];

    const data = clients.map(client => [
      client.razon_social,
      client.ci_nit_ruc_rut || '-',
      client.telefono || '-',
      client.correo || '-',
      client.direccion || '-',
      client.estado ? 'Activo' : 'Inactivo'
    ]);

    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Clientes', 14, 22);

    // Filter context
    doc.setFontSize(10);
    let yPos = 30;

    if (this.searchTerm()) {
      doc.text(`Filtro Nombre: ${this.searchTerm()}`, 14, yPos);
      yPos += 7;
    }

    if (this.searchCI()) {
      doc.text(`Filtro CI/NIT: ${this.searchCI()}`, 14, yPos);
      yPos += 7;
    }

    doc.text(`Total Clientes: ${clients.length}`, 14, yPos);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: yPos + 10,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`Clientes_${dateStr}.pdf`);
  }

  filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const ci = this.searchCI().toLowerCase();
    const status = this.statusFilter();

    return this.clients().filter(client => {
      const matchesName = client.razon_social?.toLowerCase().includes(term);
      const matchesCI = ci ? client.ci_nit_ruc_rut?.toLowerCase().includes(ci) : true;
      const matchesStatus = status ? client.estado.toString() === status : true;

      return matchesName && matchesCI && matchesStatus;
    });
  });

  clientForm: FormGroup;

  constructor() {
    this.clientForm = this.fb.group({
      razon_social: ['', Validators.required],
      ci_nit_ruc_rut: [''],
      telefono: [''],
      correo: ['', Validators.email],
      direccion: [''],
      estado: [true]
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading.set(true);
    this.clienteService.getAll().subscribe({
      next: (clients) => {
        // Filter only clients (tipo: 'cliente')
        this.clients.set(clients.filter(c => c.tipo === 'cliente'));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        this.loading.set(false);
      }
    });
  }

  openCreateForm() {
    this.editingClient.set(null);
    this.errorMessage.set(null);
    this.clientForm.reset({ estado: true });
    this.showForm.set(true);
  }

  editClient(client: Cliente) {
    this.editingClient.set(client);
    this.clientForm.patchValue({
      razon_social: client.razon_social,
      ci_nit_ruc_rut: client.ci_nit_ruc_rut,
      telefono: client.telefono,
      correo: client.correo,
      direccion: client.direccion,
      estado: client.estado
    });
    this.showForm.set(true);
  }

  onSubmit() {
    if (this.clientForm.invalid) return;

    this.saving.set(true);
    const formValue = this.clientForm.value;

    const clientData: any = {
      tipo: 'cliente', // Always set tipo as 'cliente'
      razon_social: formValue.razon_social,
      ci_nit_ruc_rut: formValue.ci_nit_ruc_rut || undefined,
      telefono: formValue.telefono || undefined,
      correo: formValue.correo || undefined,
      direccion: formValue.direccion || undefined,
      estado: formValue.estado
    };

    if (this.editingClient()) {
      // Update
      this.clienteService.update(this.editingClient()!.id, clientData).subscribe({
        next: () => {
          this.loadClients();
          this.closeForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error updating client:', err);
          if (err.error && err.error.message) {
            this.errorMessage.set(Array.isArray(err.error.message) ? err.error.message[0] : err.error.message);
          } else {
            this.errorMessage.set('Error al actualizar cliente');
          }
          this.saving.set(false);
        }
      });
    } else {
      // Create
      this.clienteService.create(clientData).subscribe({
        next: () => {
          this.loadClients();
          this.closeForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error creating client:', err);
          if (err.error && err.error.message) {
            this.errorMessage.set(Array.isArray(err.error.message) ? err.error.message[0] : err.error.message);
          } else {
            this.errorMessage.set('Error al crear cliente');
          }
          this.saving.set(false);
        }
      });
    }
  }

  closeForm() {
    this.showForm.set(false);
    this.clientForm.reset();
    this.editingClient.set(null);
    this.saving.set(false);
  }
}
