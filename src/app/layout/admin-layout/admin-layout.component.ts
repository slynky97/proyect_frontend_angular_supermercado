import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-layout.component.html',
    styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
    authService = inject(AuthService);
    router = inject(Router);

    sidebarOpen = signal(true);

    menuItems = [
        { icon: 'dashboard', label: 'Dashboard', route: '/admin' },
        { icon: 'users', label: 'Usuarios', route: '/admin/users' },
        { icon: 'package', label: 'Productos', route: '/admin/products' },
        { icon: 'warehouse', label: 'Inventario', route: '/admin/inventory' },
        { icon: 'user-group', label: 'Clientes', route: '/admin/clients' },
        { icon: 'receipt', label: 'Ventas', route: '/admin/sales' },
        { icon: 'chart-bar', label: 'Análisis', route: '/admin/analytics' },
    ];

    toggleSidebar() {
        this.sidebarOpen.update(v => !v);
    }

    logout() {
        this.authService.logout();
    }
}
