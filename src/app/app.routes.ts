import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { PosLayoutComponent } from './layout/pos-layout/pos-layout.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { PosComponent } from './features/pos/pos.component';
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
        path: 'pos',
        component: PosLayoutComponent,
        canActivate: [authGuard, vendedorGuard],
        children: [
            {
                path: '',
                component: PosComponent
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
