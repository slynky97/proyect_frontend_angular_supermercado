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
        { icon: 'users', label: 'Usuarios', route: '/admin/usuarios' },
        { icon: 'package', label: 'Productos', route: '/admin/productos' },
        { icon: 'warehouse', label: 'Inventario', route: '/admin/inventario' },
        { icon: 'user-group', label: 'Clientes', route: '/admin/clientes' },
        { icon: 'receipt', label: 'Ventas', route: '/admin/ventas' },
        { icon: 'chart-bar', label: 'Análisis', route: '/admin/analisis' },
    ];

    toggleSidebar() {
        this.sidebarOpen.update(v => !v);
    }

    logout() {
        this.authService.logout();
    }
}
