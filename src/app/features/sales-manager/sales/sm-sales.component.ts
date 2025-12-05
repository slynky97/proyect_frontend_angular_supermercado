import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesComponent } from '../../admin/sales/sales.component';

@Component({
    selector: 'app-sm-sales',
    standalone: true,
    imports: [CommonModule, SalesComponent],
    template: `
    <div class="p-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
        <p class="text-gray-600 mt-1 text-sm">Consulta de ventas realizadas (Solo lectura)</p>
      </div>
      <app-sales />
    </div>
  `
})
export class SmSalesComponent { }
