import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenService } from '../../../core/services/almacen.service';
import { SucursalService } from '../../../core/services/sucursal.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { Almacen, AlmacenProducto, Sucursal } from '../../../core/models/inventory.model';
import { Categoria, Product } from '../../../core/models/product.model';
import { StockFormComponent } from './stock-form.component';
import { ProductStockFormComponent } from './product-stock-form.component';

interface StockRow {
  productId: number;
  productName: string;
  productImage?: string;
  productDescription?: string;
  productBrand?: string;
  category?: string;
  unitOfMeasure: string;
  stockByWarehouse: Map<number, { stockId: number; cantidad: number }>;
  totalStock: number;
  stockLevel: 'out' | 'low' | 'medium' | 'good';
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, StockFormComponent, ProductStockFormComponent],
  template: `
    <div class="p-8">
      <div class="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-4 border-b border-gray-300 mb-6 -mx-8 px-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Inventario</h1>
          <p class="text-gray-600 mt-1 text-sm">Gestión de stock y almacenes</p>
        </div>
        <button 
          (click)="openProductForm()"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nuevo Producto
        </button>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtros y Búsqueda</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search Input -->
          <div class="lg:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
            <input 
              type="text" 
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              placeholder="Buscar por nombre, descripción o marca..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select 
              [ngModel]="selectedCategory()"
              (ngModelChange)="selectedCategory.set($event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option *ngFor="let cat of categories()" [value]="cat.nombre">{{ cat.nombre }}</option>
            </select>
          </div>

          <!-- Stock Level Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nivel de Stock</label>
            <select 
              [ngModel]="selectedStockLevel()"
              (ngModelChange)="selectedStockLevel.set($event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="out">Sin Stock</option>
              <option value="low">Bajo (< 10)</option>
              <option value="medium">Medio (10-50)</option>
              <option value="good">Bueno (> 50)</option>
            </select>
          </div>

          <!-- Clear Filters Button -->
          <div class="flex items-end lg:col-span-2">
            <button 
              (click)="clearFilters()"
              class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        <!-- Results Count -->
        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Mostrando <span class="font-semibold">{{ filteredStockRows().length }}</span> de <span class="font-semibold">{{ allStockRows().length }}</span> productos
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-700">Productos por página:</label>
            <select 
              [ngModel]="pageSize()"
              (ngModelChange)="changePageSize($event)"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option [value]="10">10</option>
              <option [value]="20">20</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      } @else {
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-primary-600 border-b-2 border-primary-700">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white sticky left-0 bg-primary-600 z-10">Producto</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Imagen</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Categoría</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-white">Unidad</th>
                  @for (warehouse of warehouses(); track warehouse.id) {
                    <th class="px-6 py-4 text-center text-sm font-semibold text-white bg-primary-600">
                      {{ warehouse.nombre }}
                      <div class="text-xs font-normal text-gray-200">{{ warehouse.sucursal?.nombre || '' }}</div>
                    </th>
                  }
                  <th class="px-6 py-4 text-center text-sm font-semibold text-white bg-primary-600">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @if (paginatedStockRows().length === 0) {
                  <tr>
                    <td [attr.colspan]="warehouses().length + 5" class="px-6 py-12 text-center text-gray-500">
                      <div class="flex flex-col items-center">
                        <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                        <p class="text-lg font-medium">No se encontraron productos</p>
                        <p class="text-sm">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                } @else {
                  @for (row of paginatedStockRows(); track row.productId) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 sticky left-0 bg-white">
                        <div class="font-medium text-gray-900">{{ row.productName }}</div>
                        <div class="text-sm text-gray-600">{{ row.productDescription }}</div>
                        @if (row.productBrand) {
                          <div class="text-xs text-gray-500 mt-1">Marca: {{ row.productBrand }}</div>
                        }
                      </td>
                      <td class="px-6 py-4">
                        @if (row.productImage) {
                          <img [src]="row.productImage" 
                               [alt]="row.productName" 
                               class="w-12 h-12 object-cover rounded-lg border border-gray-200"
                               (error)="$event.target.src='https://via.placeholder.com/48?text=Sin+Imagen'" />
                        } @else {
                          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <span class="text-gray-400 text-xs">Sin img</span>
                          </div>
                        }
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900">{{ row.category || '-' }}</td>
                      <td class="px-6 py-4 text-sm text-gray-700">{{ row.unitOfMeasure }}</td>
                      @for (warehouse of warehouses(); track warehouse.id) {
                        <td class="px-6 py-4 text-center">
                          @if (row.stockByWarehouse.get(warehouse.id); as stockInfo) {
                            <div class="flex items-center justify-center gap-2">
                              <span [class]="getStockClass(stockInfo.cantidad)">
                                {{ stockInfo.cantidad }}
                              </span>
                              <div class="flex gap-1">
                                <button 
                                  (click)="editStock(stockInfo.stockId)"
                                  class="text-blue-600 hover:text-blue-800"
                                  title="Editar stock"
                                >
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                </button>
                                <button 
                                  (click)="deleteStock(stockInfo.stockId)"
                                  class="text-red-600 hover:text-red-800"
                                  title="Eliminar stock"
                                >
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          } @else {
                            <span class="text-gray-400 text-sm">0</span>
                          }
                        </td>
                      }
                      <td class="px-6 py-4 text-center">
                        <span class="font-semibold text-gray-900">{{ row.totalStock }}</span>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div class="bg-gray-50 px-6 py-4 border-t border-gray-300 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Página <span class="font-semibold">{{ currentPage() }}</span> de <span class="font-semibold">{{ totalPages() }}</span>
              <span class="text-gray-500 ml-2">
                ({{ (currentPage() - 1) * pageSize() + 1 }} - {{ Math.min(currentPage() * pageSize(), filteredStockRows().length) }} de {{ filteredStockRows().length }})
              </span>
            </div>
            <div class="flex gap-2">
              <button 
                (click)="goToFirstPage()"
                [disabled]="currentPage() === 1"
                class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                « Primera
              </button>
              <button 
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ‹ Anterior
              </button>
              <button 
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente ›
              </button>
              <button 
                (click)="goToLastPage()"
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Última »
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Product-Stock Form Modal -->
      @if (showProductForm()) {
        <app-product-stock-form
          [warehouses]="warehouses()"
          [categories]="categories()"
          (saved)="handleProductSaved()"
          (cancelled)="closeProductForm()"
        />
      }

      <!-- Stock Edit Form Modal -->
      @if (showForm()) {
        <app-stock-form
          [stockEntry]="editingStock()"
          [warehouses]="warehouses()"
          [products]="products()"
          (saved)="handleStockSaved()"
          (cancelled)="closeStockForm()"
        />
      }
    </div>
  `
})
export class InventoryComponent implements OnInit {
  private almacenService = inject(AlmacenService);
  private sucursalService = inject(SucursalService);
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  // Expose Math for template
  Math = Math;

  // Data signals
  warehouses = signal<Almacen[]>([]);
  branches = signal<Sucursal[]>([]);
  categories = signal<Categoria[]>([]);
  products = signal<Product[]>([]);
  stockData = signal<AlmacenProducto[]>([]);
  loading = signal(true);

  // Form state
  showForm = signal(false);
  showProductForm = signal(false);
  editingStock = signal<AlmacenProducto | null>(null);

  // Filter signals
  searchTerm = signal('');
  selectedCategory = signal('');
  selectedStockLevel = signal('');

  // Pagination signals
  currentPage = signal(1);
  pageSize = signal(10);

  // Computed: Transform stock data into rows
  allStockRows = computed(() => {
    const stock = this.stockData();
    const productMap = new Map<number, StockRow>();

    stock.forEach(item => {
      const productId = item.producto.id;

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName: item.producto.nombre,
          productImage: item.producto.imagen,
          productDescription: item.producto.descripcion,
          productBrand: item.producto.marca,
          category: item.producto.categoria?.nombre,
          unitOfMeasure: item.producto.unidad_medida,
          stockByWarehouse: new Map(),
          totalStock: 0,
          stockLevel: 'out'
        });
      }

      const row = productMap.get(productId)!;
      row.stockByWarehouse.set(item.almacen.id, { stockId: item.id, cantidad: item.cantidad_actual });
      row.totalStock += item.cantidad_actual;
    });

    // Calculate stock level for each product
    productMap.forEach(row => {
      if (row.totalStock === 0) row.stockLevel = 'out';
      else if (row.totalStock < 10) row.stockLevel = 'low';
      else if (row.totalStock <= 50) row.stockLevel = 'medium';
      else row.stockLevel = 'good';
    });

    return Array.from(productMap.values());
  });

  // Computed: Filtered stock rows
  filteredStockRows = computed(() => {
    let rows = this.allStockRows();

    // Search filter
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      rows = rows.filter(r =>
        r.productName.toLowerCase().includes(term) ||
        (r.productDescription?.toLowerCase().includes(term)) ||
        (r.productBrand?.toLowerCase().includes(term))
      );
    }

    // Category filter
    const category = this.selectedCategory();
    if (category) {
      rows = rows.filter(r => r.category === category);
    }

    // Stock level filter
    const stockLevel = this.selectedStockLevel();
    if (stockLevel) {
      rows = rows.filter(r => r.stockLevel === stockLevel);
    }

    return rows;
  });

  // Computed: Total pages
  totalPages = computed(() => {
    const total = this.filteredStockRows().length;
    const size = this.pageSize();
    return Math.ceil(total / size) || 1;
  });

  // Computed: Paginated stock rows
  paginatedStockRows = computed(() => {
    const filtered = this.filteredStockRows();
    const page = this.currentPage();
    const size = this.pageSize();
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return filtered.slice(startIndex, endIndex);
  });

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    Promise.all([
      this.almacenService.getAll().toPromise(),
      this.sucursalService.getAll().toPromise(),
      this.categoryService.getAll().toPromise(),
      this.productService.getAll().toPromise(),
      this.almacenService.getAllStock().toPromise()
    ]).then(([warehouses, branches, categories, products, stock]) => {
      this.warehouses.set(warehouses || []);
      this.branches.set(branches || []);
      this.categories.set(categories || []);
      this.products.set(products || []);
      this.stockData.set(stock || []);
      console.log('Loaded inventory data:', { warehouses, products, stock });
      this.loading.set(false);
    }).catch(err => {
      console.error('Error loading inventory data:', err);
      this.loading.set(false);
    });
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.selectedStockLevel.set('');
    this.currentPage.set(1);
  }

  // Pagination methods
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToFirstPage() {
    this.currentPage.set(1);
  }

  goToLastPage() {
    this.currentPage.set(this.totalPages());
  }

  changePageSize(newSize: number) {
    this.pageSize.set(+newSize);
    this.currentPage.set(1);
  }

  // Helper methods for styling
  getStockClass(quantity: number): string {
    if (quantity === 0) return 'text-gray-400 text-sm';
    if (quantity < 10) return 'text-red-600 font-semibold text-sm';
    if (quantity <= 50) return 'text-yellow-600 font-medium text-sm';
    return 'text-green-600 font-medium text-sm';
  }

  getStockLevelBadge(level: string): string {
    const base = 'px-3 py-1 text-xs font-semibold rounded-full';
    switch (level) {
      case 'out': return `${base} bg-gray-100 text-gray-800`;
      case 'low': return `${base} bg-red-100 text-red-800`;
      case 'medium': return `${base} bg-yellow-100 text-yellow-800`;
      case 'good': return `${base} bg-green-100 text-green-800`;
      default: return base;
    }
  }

  getStockLevelText(level: string): string {
    switch (level) {
      case 'out': return 'Sin Stock';
      case 'low': return 'Bajo';
      case 'medium': return 'Medio';
      case 'good': return 'Bueno';
      default: return '-';
    }
  }

  // Stock management methods
  openStockForm(stockEntry?: AlmacenProducto): void {
    this.editingStock.set(stockEntry || null);
    this.showForm.set(true);
  }

  closeStockForm(): void {
    this.showForm.set(false);
    this.editingStock.set(null);
  }

  handleStockSaved(): void {
    this.loadData();
    this.closeStockForm();
  }

  editStock(stockId: number): void {
    const stockEntry = this.stockData().find(s => s.id === stockId);
    if (stockEntry) {
      this.openStockForm(stockEntry);
    }
  }

  deleteStock(stockId: number): void {
    if (!confirm('¿Estás seguro de eliminar esta asignación de stock?')) return;

    this.almacenService.deleteStock(stockId).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Error deleting stock:', err);
        alert('Error al eliminar el stock');
      }
    });
  }

  // Product form methods
  openProductForm(): void {
    this.showProductForm.set(true);
  }

  closeProductForm(): void {
    this.showProductForm.set(false);
  }

  handleProductSaved(): void {
    this.loadData();
    this.closeProductForm();
  }
}
