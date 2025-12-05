import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { NotaService } from '../../../core/services/nota.service';
import { AlmacenService } from '../../../core/services/almacen.service';

@Component({
    selector: 'app-sales-manager-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sales-manager-dashboard.component.html',
    styleUrl: './sales-manager-dashboard.component.css'
})
export class SalesManagerDashboardComponent implements OnInit {
    private productService = inject(ProductService);
    private notaService = inject(NotaService);
    private almacenService = inject(AlmacenService);

    stats = signal({
        totalProducts: 0,
        todayRevenue: 0,
        todaySalesCount: 0,
        lowStockCount: 0
    });

    currentDate = signal(new Date());
    loading = signal(true);

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        this.loading.set(true);

        Promise.all([
            this.productService.getAll().toPromise(),
            this.notaService.getAll().toPromise(),
            this.almacenService.getAllStock().toPromise()
        ]).then(([products, notasResponse, stockData]) => {
            const notas = notasResponse?.data || [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todaySales = notas.filter(n => {
                const notaDate = new Date(n.fecha);
                notaDate.setHours(0, 0, 0, 0);
                return notaDate.getTime() === today.getTime() && n.tipo_nota === 'venta';
            }) || [];

            const todayRevenue = todaySales.reduce((sum, n) => sum + (+n.total_calculado), 0);

            // Calculate low stock count from stock data
            const productStockMap = new Map<number, number>();

            // Sum up stock quantities by product
            stockData?.forEach(item => {
                const productId = item.producto.id;
                const currentTotal = productStockMap.get(productId) || 0;
                productStockMap.set(productId, currentTotal + item.cantidad_actual);
            });

            // Count products with total stock <= 10
            let lowStockCount = 0;
            productStockMap.forEach(totalStock => {
                if (totalStock <= 10) {
                    lowStockCount++;
                }
            });

            this.stats.set({
                totalProducts: products?.length || 0,
                todayRevenue,
                todaySalesCount: todaySales.length,
                lowStockCount
            });
            this.loading.set(false);
        }).catch(err => {
            console.error('Error loading stats:', err);
            this.loading.set(false);
        });
    }
}
