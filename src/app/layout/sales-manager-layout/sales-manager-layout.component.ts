import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-sales-manager-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sales-manager-layout.component.html',
    styleUrl: './sales-manager-layout.component.css'
})
export class SalesManagerLayoutComponent {
    authService = inject(AuthService);
    router = inject(Router);

    sidebarOpen = signal(true);

    menuItems = [
        { icon: 'dashboard', label: 'Dashboard', route: '/sales-manager' },
        { icon: 'package', label: 'Productos', route: '/sales-manager/products' },
        { icon: 'warehouse', label: 'Inventario', route: '/sales-manager/inventory' },
        { icon: 'user-group', label: 'Clientes', route: '/sales-manager/clients' },
        { icon: 'receipt', label: 'Ventas', route: '/sales-manager/sales' },
    ];

    toggleSidebar() {
        this.sidebarOpen.update(v => !v);
    }

    logout() {
        this.authService.logout();
    }
}
