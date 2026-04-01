import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Categoria } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { AddToCartModalComponent } from './add-to-cart-modal.component';
import { CartSidebarComponent } from './cart-sidebar.component';
import { SalesFormComponent } from './sales-form.component';
import { ImagePreviewModalComponent } from '../../../shared/components/image-preview-modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AddToCartModalComponent, CartSidebarComponent, SalesFormComponent, ImagePreviewModalComponent],
  template: `
    <div class="p-8">
      <div class="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-4 border-b border-gray-300 mb-6 -mx-8 px-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Ventas</h1>
          <p class="text-gray-600 mt-1 text-sm">Catálogo de productos y carrito de compras</p>
        </div>
        <button 
          (click)="toggleCart()"
          class="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
          🛒 Carrito ({{ cartService.itemCount() }})
        </button>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtros y Búsqueda</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="lg:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input 
              type="text" 
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              placeholder="Buscar por nombre, descripción o marca..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select 
              [ngModel]="selectedCategory()"
              (ngModelChange)="selectedCategory.set($event)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>

          <div class="flex items-end">
            <button 
              (click)="clearFilters()"
              class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Mostrando <span class="font-semibold">{{ filteredProducts().length }}</span> de <span class="font-semibold">{{ allProducts().length }}</span> productos
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
          <table class="w-full table-fixed">
            <thead class="bg-primary-600 border-b-2 border-primary-700">
              <tr>
                <th class="w-full px-6 py-4 text-left text-sm font-semibold text-white">Nombre</th>
                <th class="w-24 px-6 py-4 text-center text-sm font-semibold text-white truncate">Imagen</th>
                <th class="w-32 px-6 py-4 text-left text-sm font-semibold text-white truncate">Categoría</th>
                <th class="w-28 px-6 py-4 text-left text-sm font-semibold text-white truncate">Precio</th>
                <th class="w-36 px-6 py-4 text-left text-sm font-semibold text-white truncate">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @if (paginatedProducts().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <p class="text-lg font-medium">No se encontraron productos</p>
                  </td>
                </tr>
              } @else {
                @for (product of paginatedProducts(); track product.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 align-middle">
                      <div class="flex flex-col justify-center pr-4">
                        <div class="font-medium text-gray-900 truncate" [title]="product.nombre">{{ product.nombre }}</div>
                        @if (product.descripcion) {
                          <div class="text-sm text-gray-600 line-clamp-2 mt-0.5" [title]="product.descripcion">{{ product.descripcion }}</div>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 align-middle">
                      <div class="flex justify-center flex-shrink-0">
                        @if (product.imagen) {
                          <img 
                            [src]="product.imagen" 
                            [alt]="product.nombre" 
                            class="w-16 h-16 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all" 
                            (click)="openImagePreview(product.imagen, product.nombre, product.descripcion)"
                          />
                        } @else {
                          <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span class="text-gray-400 text-xs text-center leading-tight">Sin<br>img</span>
                          </div>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm align-middle truncate" [title]="product.categoria?.nombre || '-'">
                      {{ product.categoria?.nombre || '-' }}
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold align-middle whitespace-nowrap">
                      Bs. {{ product.precio_venta_actual }}
                    </td>
                    <td class="px-6 py-4 align-middle">
                      <div class="flex justify-start">
                        <button 
                          (click)="openAddToCartModal(product)"
                          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                          </svg>
                          Agregar
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Página {{ currentPage() }} de {{ totalPages() }}
            </div>
            <div class="flex gap-2">
              <button (click)="previousPage()" [disabled]="currentPage() === 1" class="px-3 py-2 bg-white border rounded-lg text-sm disabled:opacity-50">Anterior</button>
              <button (click)="nextPage()" [disabled]="currentPage() === totalPages()" class="px-3 py-2 bg-white border rounded-lg text-sm disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </div>
      }

      <!-- Cart Sidebar -->
      @if (showCart()) {
        <app-cart-sidebar (closed)="toggleCart()" (proceedToSale)="openSalesForm()" />
      }

      <!-- Add to Cart Modal -->
      @if (showAddToCartModal()) {
        <app-add-to-cart-modal [product]="selectedProduct()!" (added)="handleProductAdded()" (cancelled)="closeAddToCartModal()" />
      }

      <!-- Sales Form -->
      @if (showSalesForm()) {
        <app-sales-form (completed)="handleSaleCompleted()" (cancelled)="closeSalesForm()" />
      }

      <!-- Image Preview Modal -->
      @if (showImagePreview()) {
        <app-image-preview-modal
          [imageUrl]="previewImageUrl()"
          [imageAlt]="previewImageAlt()"
          [imageDescription]="previewImageDescription()"
          (closed)="closeImagePreview()"
        />
      }
    </div>
  `
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  cartService = inject(CartService);

  Math = Math;
  allProducts = signal<Product[]>([]);
  categories = signal<Categoria[]>([]);
  loading = signal(true);

  searchTerm = signal('');
  selectedCategory = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  showCart = signal(false);
  showAddToCartModal = signal(false);
  showSalesForm = signal(false);
  selectedProduct = signal<Product | null>(null);

  // Image preview state
  showImagePreview = signal(false);
  previewImageUrl = signal('');
  previewImageAlt = signal('');
  previewImageDescription = signal('');

  filteredProducts = computed(() => {
    let products = this.allProducts();
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      products = products.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion?.toLowerCase().includes(term))
      );
    }
    const category = this.selectedCategory();
    if (category) {
      products = products.filter(p => p.categoria?.id === +category);
    }
    return products;
  });

  totalPages = computed(() => {
    const total = this.filteredProducts().length;
    return Math.ceil(total / this.pageSize()) || 1;
  });

  paginatedProducts = computed(() => {
    const filtered = this.filteredProducts();
    const start = (this.currentPage() - 1) * this.pageSize();
    return filtered.slice(start, start + this.pageSize());
  });

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts() {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading.set(false);
      }
    });
  }

  private loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.currentPage.set(1);
  }

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

  changePageSize(newSize: number) {
    this.pageSize.set(+newSize);
    this.currentPage.set(1);
  }

  toggleCart() {
    this.showCart.update(v => !v);
  }

  openAddToCartModal(product: Product) {
    this.selectedProduct.set(product);
    this.showAddToCartModal.set(true);
  }

  closeAddToCartModal() {
    this.showAddToCartModal.set(false);
    this.selectedProduct.set(null);
  }

  handleProductAdded() {
    this.closeAddToCartModal();
  }

  openSalesForm() {
    this.showCart.set(false);
    this.showSalesForm.set(true);
  }

  closeSalesForm() {
    this.showSalesForm.set(false);
  }

  handleSaleCompleted() {
    this.closeSalesForm();
    this.loadProducts();
  }

  // Image preview methods
  openImagePreview(imageUrl: string, alt: string, description?: string): void {
    this.previewImageUrl.set(imageUrl);
    this.previewImageAlt.set(alt);
    this.previewImageDescription.set(description || '');
    this.showImagePreview.set(true);
  }

  closeImagePreview(): void {
    this.showImagePreview.set(false);
    this.previewImageUrl.set('');
    this.previewImageAlt.set('');
    this.previewImageDescription.set('');
  }
}
