import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Categoria } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { AddToCartModalComponent } from '../../admin/products/add-to-cart-modal.component';
import { CartSidebarComponent } from '../../admin/products/cart-sidebar.component';
import { SalesFormComponent } from '../../admin/products/sales-form.component';
import { ImagePreviewModalComponent } from '../../../shared/components/image-preview-modal.component';

@Component({
    selector: 'app-sm-products',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, AddToCartModalComponent, CartSidebarComponent, SalesFormComponent, ImagePreviewModalComponent],
    templateUrl: './sm-products.component.html'
})
export class SmProductsComponent implements OnInit {
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
