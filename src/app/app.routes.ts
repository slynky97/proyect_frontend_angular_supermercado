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
                path: 'users',
                loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./features/admin/products/products.component').then(m => m.ProductsComponent)
            },
            {
                path: 'inventory',
                loadComponent: () => import('./features/admin/inventory/inventory.component').then(m => m.InventoryComponent)
            },
            {
                path: 'clients',
                loadComponent: () => import('./features/admin/clients/clients.component').then(m => m.ClientsComponent)
            },
            {
                path: 'sales',
                loadComponent: () => import('./features/admin/sales/sales.component').then(m => m.SalesComponent)
            },
            {
                path: 'analytics',
                loadComponent: () => import('./features/admin/analytics/analytics.component').then(m => m.AnalyticsComponent)
            }
        ]
    },
    {
        path: 'sales-manager',
        component: SalesManagerLayoutComponent,
        canActivate: [authGuard, vendedorGuard],
        children: [
            {
                path: '',
                component: SalesManagerDashboardComponent
            },
            {
                path: 'products',
                loadComponent: () => import('./features/sales-manager/products/sm-products.component').then(m => m.SmProductsComponent)
            },
            {
                path: 'inventory',
                loadComponent: () => import('./features/sales-manager/inventory/sm-inventory.component').then(m => m.SmInventoryComponent)
            },
            {
                path: 'clients',
                loadComponent: () => import('./features/admin/clients/clients.component').then(m => m.ClientsComponent)
            },
            {
                path: 'sales',
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

