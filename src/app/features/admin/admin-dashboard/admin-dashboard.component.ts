import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { NotaService } from '../../../core/services/nota.service';
import { UserService } from '../../../core/services/user.service';

import { AnalyticsService } from '../analytics/analytics.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
    private productService = inject(ProductService);
    private notaService = inject(NotaService);
    private userService = inject(UserService);
    private analyticsService = inject(AnalyticsService);

    stats = signal({
        totalProducts: 0,
        totalSales: 0,
        totalUsers: 0,
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

        // Load basic stats
        Promise.all([
            this.productService.getAll().toPromise(),
            this.notaService.getAll().toPromise(),
            this.userService.getAll().toPromise(),
            this.analyticsService.getSummary('today').toPromise()
        ]).then(([products, notasResponse, users, analyticsSummary]) => {
            const notas = notasResponse?.data || [];
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today

            const todaySales = notas.filter(n => {
                const notaDate = new Date(n.fecha);
                notaDate.setHours(0, 0, 0, 0); // Start of nota date
                return notaDate.getTime() === today.getTime() && n.tipo_nota === 'venta';
            }) || [];

            const todayRevenue = todaySales.reduce((sum, n) => sum + (+n.total_calculado), 0);

            this.stats.set({
                totalProducts: products?.length || 0,
                totalSales: notas.filter(n => n.tipo_nota === 'venta').length || 0,
                totalUsers: users?.length || 0,
                todayRevenue,
                todaySalesCount: todaySales.length,
                lowStockCount: analyticsSummary?.criticalStockCount || 0
            });
            this.loading.set(false);
        }).catch(err => {
            console.error('Error loading stats:', err);
            this.loading.set(false);
        });
    }
}
