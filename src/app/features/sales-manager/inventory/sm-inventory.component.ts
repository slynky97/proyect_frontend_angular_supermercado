import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenService } from '../../../core/services/almacen.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { Almacen, AlmacenProducto } from '../../../core/models/inventory.model';
import { Categoria, Product } from '../../../core/models/product.model';
import { ImagePreviewModalComponent } from '../../../shared/components/image-preview-modal.component';

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
    selector: 'app-sm-inventory',
    standalone: true,
    imports: [CommonModule, FormsModule, ImagePreviewModalComponent],
    templateUrl: './sm-inventory.component.html'
})
export class SmInventoryComponent implements OnInit {
    private almacenService = inject(AlmacenService);
    private categoryService = inject(CategoryService);
    private productService = inject(ProductService);

    Math = Math;

    warehouses = signal<Almacen[]>([]);
    categories = signal<Categoria[]>([]);
    products = signal<Product[]>([]);
    stockData = signal<AlmacenProducto[]>([]);
    loading = signal(true);

    showImagePreview = signal(false);
    previewImageUrl = signal('');
    previewImageAlt = signal('');
    previewImageDescription = signal('');

    searchTerm = signal('');
    selectedCategory = signal('');
    selectedStockLevel = signal('');

    currentPage = signal(1);
    pageSize = signal(10);

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

        productMap.forEach(row => {
            if (row.totalStock === 0) row.stockLevel = 'out';
            else if (row.totalStock <= 10) row.stockLevel = 'low';
            else if (row.totalStock <= 50) row.stockLevel = 'medium';
            else row.stockLevel = 'good';
        });

        return Array.from(productMap.values());
    });

    filteredStockRows = computed(() => {
        let rows = this.allStockRows();

        const term = this.searchTerm().trim().toLowerCase();
        if (term) {
            rows = rows.filter(r =>
                r.productName.toLowerCase().includes(term) ||
                (r.productDescription?.toLowerCase().includes(term)) ||
                (r.productBrand?.toLowerCase().includes(term))
            );
        }

        const category = this.selectedCategory();
        if (category) {
            rows = rows.filter(r => r.category === category);
        }

        const stockLevel = this.selectedStockLevel();
        if (stockLevel) {
            rows = rows.filter(r => r.stockLevel === stockLevel);
        }

        return rows;
    });

    totalPages = computed(() => {
        const total = this.filteredStockRows().length;
        const size = this.pageSize();
        return Math.ceil(total / size) || 1;
    });

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
            this.categoryService.getAll().toPromise(),
            this.productService.getAll().toPromise(),
            this.almacenService.getAllStock().toPromise()
        ]).then(([warehouses, categories, products, stock]) => {
            this.warehouses.set(warehouses || []);
            this.categories.set(categories || []);
            this.products.set(products || []);
            this.stockData.set(stock || []);
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

    getStockClass(quantity: number): string {
        if (quantity === 0) return 'text-gray-400 text-sm';
        if (quantity < 10) return 'text-red-600 font-semibold text-sm';
        if (quantity <= 50) return 'text-yellow-600 font-medium text-sm';
        return 'text-green-600 font-medium text-sm';
    }

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
