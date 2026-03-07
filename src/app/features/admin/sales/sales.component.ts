import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotaService } from '../../../core/services/nota.service';
import { Nota } from '../../../core/models/product.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 relative">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Registro de Ventas</h1>
        <p class="text-gray-600 mt-2">Historial de ventas y reportes</p>
      </div>

      <!-- Filters (Sticky) -->
      <div class="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-4 -mx-4 px-4 mb-2 border-b border-gray-300">
        <div class="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input 
                type="text" 
                [ngModel]="clienteFilter()" 
                (ngModelChange)="clienteFilter.set($event)"
                placeholder="Buscar por nombre o 'Venta General'..." 
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <input 
                type="text" 
                [ngModel]="productoFilter()" 
                (ngModelChange)="productoFilter.set($event)"
                placeholder="Buscar por producto..." 
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input 
                type="date" 
                [ngModel]="fechaInicioFilter()" 
                (ngModelChange)="fechaInicioFilter.set($event)"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input 
                type="date" 
                [ngModel]="fechaFinFilter()" 
                (ngModelChange)="fechaFinFilter.set($event)"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div class="md:col-span-4 flex justify-end gap-3">
              <button 
                (click)="clearFilters()" 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium whitespace-nowrap"
              >
                Limpiar Filtros
              </button>
              <button 
                (click)="triggerManualReport()" 
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                title="Enviar resporte de ayer"
              >
                <i class="fas fa-envelope"></i>
                Reporte Ayer
              </button>
              <button 
                (click)="downloadPDF()" 
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <i class="fas fa-file-pdf"></i>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      } @else {
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-primary-600 border-b-2 border-primary-700">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">ID</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Fecha</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Cliente</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Productos</th>
                  <th class="px-6 py-4 text-right text-sm font-semibold text-white">Total</th>
                  <th class="px-6 py-4 text-center text-sm font-semibold text-white">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (nota of paginatedSales(); track nota.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 text-sm text-gray-900">#{{ nota.id }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">{{ nota.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                      <div class="font-medium">{{ nota.cliente?.razon_social || 'Venta General' }}</div>
                      @if (nota.cliente?.ci_nit_ruc_rut) {
                        <div class="text-xs text-gray-500">{{ nota.cliente?.ci_nit_ruc_rut }}</div>
                      }
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ nota.movimientos?.length || 0 }} item(s)</td>
                    <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">Bs. {{ (+nota.total_calculado).toFixed(2) }}</td>
                    <td class="px-6 py-4 text-center">
                      <button 
                        (click)="viewDetails(nota)"
                        class="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                }
                @if (paginatedSales().length === 0) {
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                      No se encontraron ventas con los filtros seleccionados
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-300 flex items-center justify-between bg-gray-50">
            <div class="flex items-center gap-4">
              <div class="text-sm text-gray-700">
                Mostrando <span class="font-medium">{{ (currentPage() - 1) * pageSize() + 1 }}</span> a <span class="font-medium">{{ Math.min(currentPage() * pageSize(), filteredSales().length) }}</span> de <span class="font-medium">{{ filteredSales().length }}</span> resultados
              </div>
              <select 
                [ngModel]="pageSize()" 
                (ngModelChange)="changeLimit($event)"
                class="border rounded-md text-sm py-1 px-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option [value]="5">5 por página</option>
                <option [value]="10">10 por página</option>
                <option [value]="20">20 por página</option>
                <option [value]="50">50 por página</option>
              </select>
            </div>
            <div class="flex gap-2">
              <button 
                [disabled]="currentPage() === 1"
                (click)="changePage(currentPage() - 1)"
                class="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button 
                [disabled]="currentPage() === totalPages()"
                (click)="changePage(currentPage() + 1)"
                class="px-3 py-1 border rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Detail Modal -->
      @if (selectedNota()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeDetails()">
          <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Detalle de Venta #{{ selectedNota()?.id }}</h2>
                <p class="text-sm text-gray-500">{{ selectedNota()?.fecha | date:'medium' }}</p>
              </div>
              <button (click)="closeDetails()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="p-6">
              <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <span class="text-sm text-gray-500 block mb-1">Cliente</span>
                  <span class="font-medium text-gray-900">{{ selectedNota()?.cliente?.razon_social || 'Venta General' }}</span>
                  @if (selectedNota()?.cliente?.ci_nit_ruc_rut) {
                    <span class="text-xs text-gray-500 block mt-1">{{ selectedNota()?.cliente?.ci_nit_ruc_rut }}</span>
                  }
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <span class="text-sm text-gray-500 block mb-1">Vendedor</span>
                  <span class="font-medium text-gray-900">{{ selectedNota()?.user?.name || selectedNota()?.user?.email || 'Desconocido' }}</span>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <span class="text-sm text-gray-500 block mb-1">Resumen</span>
                  <div class="flex justify-between text-sm">
                    <span>Descuento:</span>
                    <span class="font-medium text-red-600">Bs. {{ selectedNota()?.descuento || 0 }}</span>
                  </div>
                  <div class="flex justify-between text-sm mt-1">
                    <span>Impuestos:</span>
                    <span class="font-medium">Bs. {{ selectedNota()?.impuestos || 0 }}</span>
                  </div>
                </div>
              </div>

              <h3 class="font-semibold text-gray-900 mb-4">Productos</h3>
              <div class="border rounded-lg overflow-hidden mb-6">
                <table class="w-full">
                  <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th class="px-4 py-3 text-left">Producto</th>
                      <th class="px-4 py-3 text-left">Almacén / Sucursal</th>
                      <th class="px-4 py-3 text-right">Cant.</th>
                      <th class="px-4 py-3 text-right">Precio Unit.</th>
                      <th class="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    @for (mov of selectedNota()?.movimientos; track mov.id) {
                      <tr>
                        <td class="px-4 py-3 text-sm text-gray-900">{{ mov.producto?.nombre }}</td>
                        <td class="px-4 py-3 text-sm text-gray-500">
                          <div class="font-medium text-gray-900">{{ mov.almacen?.nombre }}</div>
                          @if (mov.almacen?.sucursal) {
                            <div class="text-xs">{{ mov.almacen?.sucursal?.nombre }}</div>
                          }
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ mov.cantidad }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 text-right">Bs. {{ mov.precio_unitario_venta || 0 }}</td>
                        <td class="px-4 py-3 text-sm font-medium text-gray-900 text-right">Bs. {{ mov.total_calculado }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot class="bg-gray-50">
                    <tr>
                      <td colspan="4" class="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total</td>
                      <td class="px-4 py-3 text-sm font-bold text-primary-600 text-right">Bs. {{ (+selectedNota()!.total_calculado).toFixed(2) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              @if (selectedNota()?.observaciones) {
                <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <h4 class="text-sm font-semibold text-yellow-800 mb-1">Observaciones</h4>
                  <p class="text-sm text-yellow-700">{{ selectedNota()?.observaciones }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SalesComponent implements OnInit {
  private notaService = inject(NotaService);

  // Data signals
  allSales = signal<Nota[]>([]);
  loading = signal(true);
  selectedNota = signal<Nota | null>(null);

  // Filter signals
  clienteFilter = signal('');
  productoFilter = signal('');
  fechaInicioFilter = signal('');
  fechaFinFilter = signal('');

  // Pagination signals
  currentPage = signal(1);
  pageSize = signal(10);
  Math = Math;

  // Computed: Filtered Sales
  filteredSales = computed(() => {
    let sales = this.allSales();

    // Filter by Client Name
    const clientTerm = this.clienteFilter().toLowerCase().trim();
    if (clientTerm) {
      sales = sales.filter(nota =>
        (nota.cliente?.razon_social || 'Venta General').toLowerCase().includes(clientTerm)
      );
    }

    // Filter by Product Name
    const productTerm = this.productoFilter().toLowerCase().trim();
    if (productTerm) {
      sales = sales.filter(nota =>
        nota.movimientos?.some(mov =>
          mov.producto?.nombre.toLowerCase().includes(productTerm)
        )
      );
    }

    // Filter by Date Range
    const startDate = this.fechaInicioFilter();
    const endDate = this.fechaFinFilter();

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      sales = sales.filter(nota => new Date(nota.fecha) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      sales = sales.filter(nota => new Date(nota.fecha) <= end);
    }

    return sales;
  });

  // Computed: Pagination
  totalPages = computed(() => {
    return Math.ceil(this.filteredSales().length / this.pageSize()) || 1;
  });

  paginatedSales = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredSales().slice(start, start + this.pageSize());
  });

  ngOnInit() {
    this.loadSales();
  }

  loadSales() {
    this.loading.set(true);
    // Fetch all sales (or a large limit) for local filtering
    this.notaService.getAll({ tipo_nota: 'venta', limit: 1000 }).subscribe({
      next: (response) => {
        console.log('Sales loaded:', response);
        this.allSales.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading sales:', err);
        this.loading.set(false);
      }
    });
  }

  // Filter methods
  clearFilters() {
    this.clienteFilter.set('');
    this.productoFilter.set('');
    this.fechaInicioFilter.set('');
    this.fechaFinFilter.set('');
    this.currentPage.set(1);
  }

  triggerManualReport() {
    // Manual trigger implies user wants "Yesterday's" missing report, or just "Daily Report".
    // Let's assume they want yesterday's report as per conversation.
    if (!confirm('¿Enviar el reporte diario de ventas de AYER por correo?')) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    this.notaService.sendDailyReport(yesterday.toISOString()).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert(`Reporte enviado. Ventas: ${res.count}, Ingreso: Bs. ${res.revenue}`);
        } else {
          alert('No se encontraron ventas para ayer.');
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error al enviar el reporte.');
      }
    });
  }

  downloadPDF() {
    const doc = new jsPDF();
    const sales = this.filteredSales();
    const headers = [['ID', 'Fecha', 'Cliente', 'NIT/CI', 'Vendedor', 'Total']];

    const data = sales.map(sale => [
      sale.id,
      new Date(sale.fecha).toLocaleString(),
      sale.cliente?.razon_social || 'Venta General',
      sale.cliente?.ci_nit_ruc_rut || '-',
      sale.user?.name || sale.user?.email || 'Desconocido',
      `Bs. ${(+sale.total_calculado).toFixed(2)}`
    ]);

    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Ventas', 14, 22);

    // Filter context if any
    doc.setFontSize(10);
    let yPos = 30;

    if (this.fechaInicioFilter() || this.fechaFinFilter()) {
      const start = this.fechaInicioFilter() || 'Inicio';
      const end = this.fechaFinFilter() || 'Hoy';
      doc.text(`Período: ${start} - ${end}`, 14, yPos);
      yPos += 7;
    }

    if (this.clienteFilter()) {
      doc.text(`Filtro Cliente: ${this.clienteFilter()}`, 14, yPos);
      yPos += 7;
    }

    // Totals
    const totalAmount = sales.reduce((sum, sale) => sum + (+sale.total_calculado), 0);
    doc.text(`Total Ventas: ${sales.length}`, 14, yPos);
    doc.text(`Monto Total: Bs. ${totalAmount.toFixed(2)}`, 100, yPos);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: yPos + 10,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Primary color
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`Ventas_${dateStr}.pdf`);
  }

  // Pagination methods
  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage.set(newPage);
    }
  }

  changeLimit(newLimit: number) {
    this.pageSize.set(+newLimit);
    this.currentPage.set(1);
  }

  // Details methods
  viewDetails(nota: Nota) {
    this.selectedNota.set(nota);
  }

  closeDetails() {
    this.selectedNota.set(null);
  }
}
