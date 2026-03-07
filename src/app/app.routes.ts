import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { SalesManagerLayoutComponent } from './layout/sales-manager-layout/sales-manager-layout.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { SalesManagerDashboardComponent } from './features/sales-manager/sales-manager-dashboard/sales-manager-dashboard.component';
import { authGuard, adminGuard, vendedorGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [authGuard, adminGuard],
        children: [
            {
                path: '',
                component: AdminDashboardComponent
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent)
            },
            {
                path: 'productos',
                loadComponent: () => import('./features/admin/products/products.component').then(m => m.ProductsComponent)
            },
            {
                path: 'inventario',
                loadComponent: () => import('./features/admin/inventory/inventory.component').then(m => m.InventoryComponent)
            },
            {
                path: 'clientes',
                loadComponent: () => import('./features/admin/clients/clients.component').then(m => m.ClientsComponent)
            },
            {
                path: 'ventas',
                loadComponent: () => import('./features/admin/sales/sales.component').then(m => m.SalesComponent)
            },
            {
                path: 'analisis',
                loadComponent: () => import('./features/admin/analytics/analytics.component').then(m => m.AnalyticsComponent)
            }
        ]
    },
    {
        path: 'usuario',
        component: SalesManagerLayoutComponent,
        canActivate: [authGuard, vendedorGuard],
        children: [
            {
                path: '',
                component: SalesManagerDashboardComponent
            },
            {
                path: 'productos',
                loadComponent: () => import('./features/sales-manager/products/sm-products.component').then(m => m.SmProductsComponent)
            },
            {
                path: 'inventario',
                loadComponent: () => import('./features/sales-manager/inventory/sm-inventory.component').then(m => m.SmInventoryComponent)
            },
            {
                path: 'clientes',
                loadComponent: () => import('./features/admin/clients/clients.component').then(m => m.ClientsComponent)
            },
            {
                path: 'ventas',
                loadComponent: () => import('./features/sales-manager/sales/sm-sales.component').then(m => m.SmSalesComponent)
            }
        ]
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];

