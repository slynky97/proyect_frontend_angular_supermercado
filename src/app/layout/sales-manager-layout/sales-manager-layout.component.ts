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
        { icon: 'dashboard', label: 'Dashboard', route: '/usuario' },
        { icon: 'package', label: 'Productos', route: '/usuario/productos' },
        { icon: 'warehouse', label: 'Inventario', route: '/usuario/inventario' },
        { icon: 'user-group', label: 'Clientes', route: '/usuario/clientes' },
        { icon: 'receipt', label: 'Ventas', route: '/usuario/ventas' },
    ];

    toggleSidebar() {
        this.sidebarOpen.update(v => !v);
    }

    logout() {
        this.authService.logout();
    }
}
