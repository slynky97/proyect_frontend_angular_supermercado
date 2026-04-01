import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MetabaseChartComponent } from './components/metabase-chart.component';
import { ChartData, ChartOptions } from 'chart.js';
import { AnalyticsService, DeadStockItem, ProfitableProduct, StockoutPrediction, ClientAnalyticsItem } from './analytics.service';
import { BaseChartDirective } from 'ng2-charts';

type TabType = 'resumen' | 'ventas' | 'inventario' | 'predicciones' | 'historial';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MetabaseChartComponent, RouterLink, BaseChartDirective],
  template: `
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Sticky Header -->
      <div class="sticky top-0 bg-white z-50 border-b border-gray-100 shadow-sm px-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between pt-8 mb-4 gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Analisis</h1>
            <p class="text-gray-500 mt-1">Visión clara del estado de tu empresa</p>
          </div>

        </div>

        <!-- Tab Navigation -->
        <div class="flex items-center overflow-x-auto py-3 px-1 gap-2 no-scrollbar pb-4">
          @for (tab of tabs; track tab.id) {
            <button 
              (click)="activeTab.set(tab.id)"
              [class]="activeTab() === tab.id 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 border border-transparent' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
              class="px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap shrink-0 transition-all flex items-center gap-2"
            >
              <i [class]="tab.icon"></i>
              {{ tab.label }}
            </button>
          }
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 px-8 py-6">
        
        <!-- Tab: Resumen -->
        @if (activeTab() === 'resumen') {
          <div class="animate-fade-in">

            <!-- Alert Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="p-3 rounded-xl" [class]="summary.outOfStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'">
                    <i class="fas fa-exclamation-circle text-2xl"></i>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 font-medium">Productos Sin Stock</div>
                    <div class="text-2xl font-bold text-gray-900">{{ summary.outOfStockCount }}</div>
                  </div>
                </div>
                @if (summary.outOfStockCount > 0) {
                  <a 
                    routerLink="/admin/inventario" 
                    [queryParams]="{ stockLevel: 'out' }"
                    class="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full cursor-pointer transition-colors"
                  >
                    Atención
                  </a>
                }
              </div>

              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="p-3 rounded-xl" [class]="summary.criticalStockCount > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 font-medium">Stock Crítico (<= 10)</div>
                    <div class="text-2xl font-bold text-gray-900">{{ summary.criticalStockCount }}</div>
                  </div>
                </div>
                @if (summary.criticalStockCount > 0) {
                  <a 
                    routerLink="/admin/inventario" 
                    [queryParams]="{ stockLevel: 'low' }"
                    class="bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full cursor-pointer transition-colors"
                  >
                    Revisar
                  </a>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Tendencia de Ventas -->
              <div class="h-[500px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/df9b7466-b425-4c01-9cd0-64b367798942"
                ></app-metabase-chart>
              </div>


              <!-- Ganancia Bruta -->
              <div class="h-[500px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/67f2e98b-b2a9-411f-b5f9-211e70d3e797"
                ></app-metabase-chart>
              </div>
            </div>

            <!-- Fila: Ventas Generales vs Cliente + Pie Chart Categorías -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Ventas Generales vs Ventas con Cliente -->
              <div class="h-[500px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/3f0d81f9-96f7-43cc-ae54-5a6e13ccfc90"
                ></app-metabase-chart>
              </div>
              
              <!-- Pie Chart: Ventas por Categoría -->
              <div class="h-[500px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/d9a4ea93-64aa-4e3e-97d5-eaeb83ec5f88"
                ></app-metabase-chart>
              </div>
            </div>

            <!-- Fila: Ventas por Usuario y Ganancia por Usuario -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Ventas por Usuario (Left) -->
              <div class="h-[600px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/bb8eafdd-b67c-462a-96a0-5069b678fc8c"
                ></app-metabase-chart>
              </div>

              <!-- Ganancia por Usuario (Right) -->
              <div class="h-[600px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/ebe78f5b-0fe0-4ad9-8156-f96df7e7f2bb"
                ></app-metabase-chart>
              </div>
            </div>

            <!-- Product Quantity Chart -->
            <div class="h-[500px] mt-6">
              <app-metabase-chart
                metabaseUrl="http://localhost:3001/public/question/731a2619-4148-4199-a40f-105b38e8f743"
              ></app-metabase-chart>
            </div>
          </div>
        }

        <!-- Tab: Ventas -->
        @if (activeTab() === 'ventas') {
          <div class="animate-fade-in">




            <!-- Detalle Venta por Categoría -->
            <div class="mb-6">
              <div class="h-[600px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/4f47e63b-f7de-47a7-a784-1fda071121c4"
                ></app-metabase-chart>
              </div>
            </div>

            <!-- Client Analysis Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Top 10 Clientes y Venta General</h3>
                  <p class="text-gray-500 text-sm">Clientes con mas compras y volumen de venta general</p>
                </div>
                
                <div class="flex flex-col md:flex-row gap-3">
                    <div class="relative">
                        <input 
                            type="text"
                            [value]="clientSearchTerm()"
                            (input)="onClientSearchInput($event)"
                            placeholder="Buscar cliente o NIT..."
                            class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 w-full md:w-64"
                        >
                        <i class="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                    </div>
                    <div class="flex gap-2">
                        <input 
                            type="date"
                            [value]="clientStartDate()"
                            (change)="clientStartDate.set($any($event).target.value); onClientDateChange()"
                            class="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                        <input 
                            type="date"
                            [value]="clientEndDate()"
                            (change)="clientEndDate.set($any($event).target.value); onClientDateChange()"
                            class="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                    </div>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">NIT/CI</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Compras</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ticket Promedio</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Gastado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (client of clientAnalyticsData(); track client.clientId) {
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="font-medium text-gray-900">{{ client.clientName }}</div>
                        </td>
                         <td class="px-6 py-4 text-sm text-gray-500">
                            {{ client.clientNit }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <span class="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                {{ client.purchaseCount }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right text-sm text-gray-900 font-medium">
                            Bs. {{ client.averageTicket.toFixed(2) }}
                        </td>
                        <td class="px-6 py-4 text-right text-sm font-bold text-gray-900">
                            Bs. {{ client.totalSpent.toFixed(2) }}
                        </td>
                      </tr>
                    }
                    @if (clientAnalyticsData().length === 0) {
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                                <i class="fas fa-users text-4xl mb-3 text-gray-300"></i>
                                <p>No se encontraron datos para los filtros seleccionados</p>
                            </td>
                        </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Productos Más Rentables -->
            <div class="mb-6">
              <div class="h-[600px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/220c895b-6a70-44c1-950e-36aa52ef2c24"
                ></app-metabase-chart>
              </div>
            </div>


            
            <div class="grid grid-cols-1 gap-6">
              <!-- Dead Stock Chart from Metabase -->
              <div class="h-[600px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/b7514d71-cfc2-4bba-9ed9-68dca98f1826"
                ></app-metabase-chart>
              </div>
            </div>



            <!-- Category charts moved to Ventas tab -->
          </div>
        }

        <!-- Tab: Inventario -->
        @if (activeTab() === 'inventario') {
          <div class="animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-bold text-gray-900">Alertas de Stock</h3>
                  <span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Crítico</span>
                </div>
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-red-100 text-red-600 rounded-xl">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                  </div>
                  <div>
                    <div class="text-3xl font-bold text-gray-900">{{ summary.lowStockCount }}</div>
                    <div class="text-sm text-gray-500">Productos con stock bajo (< 10 u.)</div>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-bold text-gray-900">Estado del Almacén</h3>
                  <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Normal</span>
                </div>
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <i class="fas fa-boxes text-2xl"></i>
                  </div>
                  <div>
                    <div class="text-3xl font-bold text-gray-900">Activo</div>
                    <div class="text-sm text-gray-500">Movimientos registrados hoy</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <h3 class="text-lg font-bold text-gray-900 mb-2">Gestión de Inventario</h3>
              <p class="text-gray-500 mb-6">Para ver el detalle completo de productos y realizar ajustes, ve al módulo de Inventario.</p>
              <a href="/admin/inventario" class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                Ir al Inventario
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </a>
            </div>
          </div>
        }


        <!-- Tab: Predicciones -->
        @if (activeTab() === 'predicciones') {
          <div class="animate-fade-in">
             <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
               <div class="flex items-center justify-between mb-6">
                 <div>
                   <h3 class="text-xl font-bold text-gray-900">Predicción de Agotamiento de Stock</h3>
                   <p class="text-gray-500 text-sm mt-1">Estimación basada en la velocidad de ventas de los últimos 30 días.</p>
                 </div>
                 <div class="flex items-center gap-2">
                   <div class="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm font-medium">
                     <i class="fas fa-fire mr-1"></i> Alto Riesgo (< 7 días)
                   </div>
                   <div class="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-sm font-medium">
                     <i class="fas fa-clock mr-1"></i> Riesgo Medio (< 30 días)
                   </div>
                 </div>
               </div>

               <div class="overflow-x-auto">
                 <table class="w-full">
                   <thead class="bg-gray-50 border-b border-gray-100">
                     <tr>
                       <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                       <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Actual</th>
                       <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Ventas Diarias (Promedio)</th>
                       <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Días Estimados</th>
                       <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Compra Sugerida (30d)</th>
                       <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                     </tr>
                   </thead>
                   <tbody class="divide-y divide-gray-100">
                     @for (item of getPaginatedPredictions(); track item.productId) {
                       <tr class="hover:bg-gray-50 transition-colors">
                         <td class="px-6 py-4">
                           <div class="flex items-center">
                             <div class="bg-gray-100 p-2 rounded-lg mr-3">
                               <i class="fas fa-box text-gray-500"></i>
                             </div>
                             <div>
                               <div class="text-sm font-medium text-gray-900">{{ item.productName }}</div>
                             </div>
                           </div>
                         </td>
                         <td class="px-6 py-4 text-center">
                           <span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                             {{ item.currentStock }} u.
                           </span>
                         </td>
                         <td class="px-6 py-4 text-center text-sm text-gray-600">
                           {{ item.dailyVelocity.toFixed(2) }} u/día
                         </td>
                         <td class="px-6 py-4 text-center">
                           <div class="flex items-center justify-center gap-1">
                             @if (item.daysLeft === 999) {
                               <span class="text-lg font-bold text-gray-400">N/A</span>
                             } @else {
                               <span class="text-lg font-bold" [class]="getRiskColor(item.daysLeft)">{{ item.daysLeft }}</span>
                               <span class="text-xs text-gray-500">días</span>
                             }
                           </div>
                         </td>
                         <td class="px-6 py-4 text-center">
                             @if (item.suggestedPurchase && item.suggestedPurchase > 0) {
                                 <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                     +{{ item.suggestedPurchase }} u.
                                 </span>
                             } @else {
                                 <span class="text-xs text-gray-400">-</span>
                             }
                         </td>
                         <td class="px-6 py-4 text-center">
                            @if (item.daysLeft <= 7) {
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <i class="fas fa-exclamation-circle mr-1"></i> Crítico
                              </span>
                            } @else if (item.daysLeft <= 30) {
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <i class="fas fa-exclamation-triangle mr-1"></i> Atento
                              </span>
                            } @else {
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <i class="fas fa-check-circle mr-1"></i> Estable
                              </span>
                            }
                         </td>
                       </tr>
                     }
                     @if (predictions.length === 0) {
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                                <div class="flex flex-col items-center">
                                    <i class="fas fa-chart-line text-4xl mb-3 text-gray-300"></i>
                                    <p>No hay suficientes datos de ventas para generar predicciones aún.</p>
                                </div>
                            </td>
                        </tr>
                     }
                   </tbody>
                 </table>
               </div>

               <!-- Paginación -->
               <div class="flex items-center justify-between border-t border-gray-100 px-6 py-4 mt-4">
                 <div class="flex items-center gap-2">
                   <span class="text-sm text-gray-500">Mostrar</span>
                   <select 
                     [value]="predictionsItemsPerPage()" 
                     (change)="onPredictionsItemsPerPageChange($event)"
                     class="border border-gray-200 rounded-lg text-sm px-2 py-1 focus:ring-primary-500 focus:border-primary-500"
                   >
                     <option value="10">10</option>
                     <option value="20">20</option>
                     <option value="50">50</option>
                   </select>
                   <span class="text-sm text-gray-500">por página</span>
                 </div>
                 
                 <div class="flex items-center gap-2">
                   <button 
                     (click)="onPredictionsPageChange(predictionsCurrentPage() - 1)"
                     [disabled]="predictionsCurrentPage() === 1"
                     class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                   >
                     Anterior
                   </button>
                   <span class="text-sm text-gray-600">
                     Página {{ predictionsCurrentPage() }} de {{ getTotalPredictionsPages() }}
                   </span>
                   <button 
                     (click)="onPredictionsPageChange(predictionsCurrentPage() + 1)"
                     [disabled]="predictionsCurrentPage() === getTotalPredictionsPages() || getTotalPredictionsPages() === 0"
                     class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                   >
                     Siguiente
                   </button>
                 </div>
               </div>
             </div>
          </div>
        }

        <!-- Tab: Historial -->
        @if (activeTab() === 'historial') {
          <div class="animate-fade-in">
             <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                <!-- Filters -->
                <div class="flex flex-col md:flex-row gap-4 mb-8">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                       <div class="relative">
                            <input 
                                type="text"
                                [value]="productSearchTerm()"
                                (input)="onProductSearchInput($event)"
                                (focus)="onProductFocus()"
                                (blur)="closeProductDropdown()"
                                placeholder="Buscar producto..."
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            >
                            @if (showProductDropdown() && filteredProducts.length > 0) {
                                <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    @for (prod of filteredProducts; track prod.id) {
                                        <div 
                                            (mousedown)="selectProduct(prod)"
                                            class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 hover:text-primary-600 transition-colors"
                                        >
                                            {{ prod.name }}
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input 
                            type="date" 
                            [value]="historyStartDate()"
                            (change)="historyStartDate.set($any($event).target.value); onHistoryDateChange()"
                            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input 
                            type="date" 
                            [value]="historyEndDate()"
                            (change)="historyEndDate.set($any($event).target.value); onHistoryDateChange()"
                            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                    </div>
                </div>

                <!-- Chart -->
                <div class="h-[500px]">
                    @if (historyProductId()) {
                        <canvas 
                            baseChart
                            [data]="productHistoryData"
                            [options]="productHistoryOptions"
                            [type]="'line'"
                        ></canvas>
                    } @else {
                        <div class="h-full flex flex-col items-center justify-center text-gray-400">
                            <i class="fas fa-search text-4xl mb-2"></i>
                            <p>Selecciona un producto para ver su historial</p>
                        </div>
                    }
                </div>
             </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `]
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  activeTab = signal<TabType>('resumen');
  selectedPeriod = signal<string>('7d');
  salesTrendGranularity = signal<'day' | 'week' | 'month'>('day');
  productQuantityPeriod = signal<'week' | 'month' | 'custom'>('month');
  customStartDate = signal<string>('');
  customEndDate = signal<string>('');
  deadStockDays = signal<number>(30);
  isRefreshing = signal<boolean>(false);

  private refreshInterval: any;

  tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'resumen', label: 'Resumen General', icon: 'fas fa-th-large' },
    { id: 'ventas', label: 'Análisis de Ventas', icon: 'fas fa-chart-bar' },
    { id: 'predicciones', label: 'Predicciones', icon: 'fas fa-brain' },
    { id: 'historial', label: 'Historial Producto', icon: 'fas fa-history' }
  ];

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.loadAnalytics();
    this.startAutoRefresh();
    this.loadProductList();
  }

  loadProductList() {
    this.analyticsService.getProductsList().subscribe({
      next: (data) => {
        this.allProducts = data.map(p => ({ id: p.id, name: p.nombre }));
      },
      error: (err) => console.error('Error loading products list:', err)
    });
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  startAutoRefresh() {
    // Refresh every 5 minutes (300000 ms)
    this.refreshInterval = setInterval(() => {
      console.log('Auto-refreshing analytics data...');
      this.loadAnalytics();
    }, 300000);
  }

  summary = {
    totalSales: 0,
    totalOrders: 0,
    averageTicket: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    criticalStockCount: 0,
    clientsServed: 0
  };

  todaySummary = {
    totalSales: 0,
    totalOrders: 0,
    averageTicket: 0,
    clientsServed: 0
  };

  salesTrend = { direction: 'up' as 'up' | 'down', value: '+8.5%' };
  ordersTrend = { direction: 'up' as 'up' | 'down', value: '+12.2%' };
  ticketTrend = { direction: 'down' as 'up' | 'down', value: '-1.8%' };
  stockTrend = { direction: 'down' as 'up' | 'down', value: '+4 Productos' };

  public salesData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Ventas Diarias',
      data: [],
      fill: true,
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: '#4f46e5',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  public categoryData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  public topProductsData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Unidades Vendidas',
      data: [],
      backgroundColor: '#4f46e5',
      borderRadius: 8,
      barThickness: 20,
      indexAxis: 'y'
    }]
  };

  public salesComparisonData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Ventas',
      data: [],
      backgroundColor: ['#9ca3af', '#4f46e5'],
      borderRadius: 8,
      barThickness: 40
    }]
  };

  public productQuantityData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Cantidad Vendida',
      data: [],
      backgroundColor: '#10b981',
      borderRadius: 8,
      barThickness: 20,
      indexAxis: 'y'
    }]
  };

  deadStockData: DeadStockItem[] = [];
  profitableProducts: ProfitableProduct[] = [];
  predictions: StockoutPrediction[] = [];

  // Pagination for predictions
  predictionsCurrentPage = signal<number>(1);
  predictionsItemsPerPage = signal<number>(20);

  getPaginatedPredictions(): StockoutPrediction[] {
    const start = (this.predictionsCurrentPage() - 1) * this.predictionsItemsPerPage();
    const end = start + this.predictionsItemsPerPage();
    return this.predictions.slice(start, end);
  }

  getTotalPredictionsPages(): number {
    const total = Math.ceil(this.predictions.length / this.predictionsItemsPerPage());
    return total === 0 ? 1 : total;
  }

  onPredictionsPageChange(page: number) {
    this.predictionsCurrentPage.set(page);
  }

  onPredictionsItemsPerPageChange(event: any) {
    const val = event.target.value;
    if (val) {
      this.predictionsItemsPerPage.set(parseInt(val, 10));
      this.predictionsCurrentPage.set(1);
    }
  }

  // Pagination for dead stock
  deadStockCurrentPage = signal<number>(1);
  deadStockItemsPerPage = signal<number>(10);

  // Pagination for profitable products
  profitableCurrentPage = signal<number>(1);
  profitableItemsPerPage = signal<number>(10);

  Math = Math; // Expose Math to template

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => `Ventas: Bs. ${(context.parsed.y || 0).toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { callback: (value) => 'Bs. ' + value }
      },
      x: { grid: { display: false } }
    }
  };

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              const dataset = data.datasets[0];
              const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
              return (data.labels as string[]).map((label, i) => {
                const value = dataset.data[i] as number;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: (dataset.backgroundColor as string[])[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const dataset = context.dataset.data as number[];
            const total = dataset.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: Bs. ${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Vendidos: ${context.parsed.x || 0} unidades`
        }
      }
    },
    scales: {
      x: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      y: { grid: { display: false } }
    }
  };

  public salesComparisonChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Ventas: Bs. ${(context.parsed.y || 0).toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { callback: (value) => 'Bs. ' + value }
      },
      x: { grid: { display: false } }
    }
  };

  public abcChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`
        }
      }
    },
    cutout: '65%'
  };



  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  manualRefresh() {
    this.isRefreshing.set(true);
    this.loadAnalytics();
    // Reset refreshing state after 1 second
    setTimeout(() => this.isRefreshing.set(false), 1000);
  }

  onPeriodChange(event: any) {
    this.selectedPeriod.set(event.target.value);
    this.loadAnalytics();
  }

  onGranularityChange(event: any) {
    this.salesTrendGranularity.set(event.target.value);
    this.loadSalesTrend();
  }

  onProductQuantityPeriodChange(event: any) {
    const value = event.target.value;
    this.productQuantityPeriod.set(value);

    if (value === 'custom') {
      // Set default dates if not set
      if (!this.customStartDate()) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        this.customStartDate.set(startDate.toISOString().split('T')[0]);
        this.customEndDate.set(endDate.toISOString().split('T')[0]);
      }
      return;
    }

    // loadProductQuantityData removed - now using Metabase
  }

  // Custom date handlers removed - now using Metabase

  loadAnalytics() {
    const period = this.selectedPeriod();

    this.analyticsService.getSummary(period).subscribe({
      next: (data) => {
        this.summary = data;
        this.updateTrends();
      },
      error: (err) => console.error('Error loading summary:', err)
    });

    // Always load today's summary for the top cards
    this.analyticsService.getSummary('today').subscribe({
      next: (data) => {
        this.todaySummary = {
          totalSales: data.totalSales,
          totalOrders: data.totalOrders,
          averageTicket: data.averageTicket,
          clientsServed: data.clientsServed
        };
      },
      error: (err) => console.error('Error loading today summary:', err)
    });

    this.loadSalesTrend();

    this.analyticsService.getSalesComparison().subscribe({
      next: (data) => {
        this.salesComparisonData.labels = data.labels;
        this.salesComparisonData.datasets[0].data = data.data;
      },
      error: (err) => console.error('Error loading sales comparison:', err)
    });

    // Top products now loaded from Metabase

    this.analyticsService.getSalesByCategory(period).subscribe({
      next: (data) => {
        this.categoryData.labels = data.labels;
        this.categoryData.datasets[0].data = data.data;
      },
      error: (err) => console.error('Error loading category sales:', err)
    });

    // Load new data
    this.loadDeadStock();

    this.analyticsService.getMostProfitable(period).subscribe({
      next: (data) => this.profitableProducts = data,
      error: (err) => console.error('Error loading profitable products:', err)
    });

    this.loadPermissions();
    this.loadClientAnalytics();
  }

  // Client Analytics State
  clientAnalyticsData = signal<ClientAnalyticsItem[]>([]);
  clientSearchTerm = signal<string>('');
  clientStartDate = signal<string>(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  clientEndDate = signal<string>(new Date().toISOString().split('T')[0]);

  async loadClientAnalytics() {
    this.analyticsService.getClientAnalytics(this.clientStartDate(), this.clientEndDate(), this.clientSearchTerm())
      .subscribe({
        next: (data) => this.clientAnalyticsData.set(data),
        error: (err) => console.error('Error loading client analytics:', err)
      });
  }

  onClientSearchInput(event: any) {
    this.clientSearchTerm.set(event.target.value);
    // Debounce could be added here, currently just reloading
    this.loadClientAnalytics();
  }

  onClientDateChange() {
    this.loadClientAnalytics();
  }

  loadPermissions() {
    this.analyticsService.getStockoutPrediction().subscribe({
      next: (data) => this.predictions = data,
      error: (err) => console.error('Error loading predictions:', err)
    });
  }

  loadSalesTrend() {
    const period = this.selectedPeriod();
    const granularity = this.salesTrendGranularity();

    this.analyticsService.getSalesTrend(period, granularity).subscribe({
      next: (data) => {
        this.salesData.labels = data.labels;
        this.salesData.datasets[0].data = data.data;
        this.salesData.datasets[0].label = 'Ventas';
      },
      error: (err) => console.error('Error loading sales trend:', err)
    });
  }

  // loadProductQuantityData removed - now using Metabase

  updateTrends() {
    if (this.summary.lowStockCount > 0) {
      this.stockTrend.value = `+${this.summary.lowStockCount} Productos`;
    }
  }

  calculatePercentage(value: number): string {
    const total = (this.categoryData.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  }

  getTopCategoryName(): string {
    return this.categoryData.labels?.[0] as string || 'N/A';
  }

  getTopCategoryValue(): string {
    const val = this.categoryData.datasets[0].data?.[0] as number || 0;
    return 'Bs ' + val.toFixed(2);
  }

  getTopProductName(): string {
    return this.topProductsData.labels?.[0] as string || 'N/A';
  }

  getTopProductValue(): string {
    const val = this.topProductsData.datasets[0].data?.[0] as number || 0;
    return val + ' Unidades';
  }

  getCategoryColor(index: number): string {
    const colors = this.categoryData.datasets[0].backgroundColor;
    if (Array.isArray(colors) && colors[index]) {
      return colors[index] as string;
    }
    return '#ccc';
  }

  loadDeadStock() {
    this.analyticsService.getDeadStock(this.deadStockDays()).subscribe({
      next: (data) => this.deadStockData = data,
      error: (err) => console.error('Error loading dead stock:', err)
    });
  }

  onDeadStockDaysChange(event: any) {
    const days = parseInt(event.target.value);
    if (days > 0) {
      this.deadStockDays.set(days);
      this.loadDeadStock();
    }
  }

  isDeadStock(days: number | string): boolean {
    if (typeof days === 'string') return true;
    return days > 60;
  }

  // Pagination methods for dead stock
  getPaginatedDeadStock(): DeadStockItem[] {
    const start = (this.deadStockCurrentPage() - 1) * this.deadStockItemsPerPage();
    const end = start + this.deadStockItemsPerPage();
    return this.deadStockData.slice(start, end);
  }

  getTotalDeadStockPages(): number {
    return Math.ceil(this.deadStockData.length / this.deadStockItemsPerPage());
  }

  onDeadStockPageChange(page: number) {
    this.deadStockCurrentPage.set(page);
  }

  onDeadStockItemsPerPageChange(event: any) {
    const val = event.target.value;
    if (val) {
      this.deadStockItemsPerPage.set(parseInt(val, 10));
      this.deadStockCurrentPage.set(1); // Reset to first page
    }
  }

  // Pagination methods for profitable products
  getPaginatedProfitable(): ProfitableProduct[] {
    const start = (this.profitableCurrentPage() - 1) * this.profitableItemsPerPage();
    const end = start + this.profitableItemsPerPage();
    return this.profitableProducts.slice(start, end);
  }

  getTotalProfitablePages(): number {
    return Math.ceil(this.profitableProducts.length / this.profitableItemsPerPage());
  }

  onProfitablePageChange(page: number) {
    this.profitableCurrentPage.set(page);
  }

  onProfitableItemsPerPageChange(event: any) {
    this.profitableItemsPerPage.set(parseInt(event.target.value, 10));
    this.profitableCurrentPage.set(1);
  }

  getRiskColor(days: number): string {
    if (days <= 7) return 'text-red-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  }

  // --- Product History Logic ---
  historyProductId = signal<number | null>(null);
  historyStartDate = signal<string>(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  historyEndDate = signal<string>(new Date().toISOString().split('T')[0]);
  allProducts: { id: number, name: string }[] = [];
  productSearchTerm = signal<string>('');
  showProductDropdown = signal<boolean>(false);

  public productHistoryData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: [],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        yAxisID: 'y'
      },
      {
        label: 'Ingresos Totales',
        data: [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1'
      }
    ]
  };

  public productHistoryOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Ingresos')) {
              return `${label}: Bs. ${(value || 0).toFixed(2)}`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Cantidad' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Ingresos (Bs)' }
      }
    }
  };

  get filteredProducts() {
    const term = this.productSearchTerm().toLowerCase();
    return this.allProducts.filter(p => p.name.toLowerCase().includes(term));
  }

  onProductSearchInput(event: any) {
    this.productSearchTerm.set(event.target.value);
    this.showProductDropdown.set(true);
  }

  onProductFocus() {
    this.showProductDropdown.set(true);
  }

  selectProduct(product: { id: number, name: string }) {
    this.productSearchTerm.set(product.name);
    this.historyProductId.set(product.id);
    this.showProductDropdown.set(false);
    this.loadProductHistory();
  }

  closeProductDropdown() {
    // Small delay to allow click event on option to fire before closing
    setTimeout(() => {
      this.showProductDropdown.set(false);
    }, 200);
  }

  onHistoryDateChange() {
    this.loadProductHistory();
  }

  loadProductHistory() {
    const pid = this.historyProductId();
    if (!pid) return;

    this.analyticsService.getProductSalesHistory(pid, this.historyStartDate(), this.historyEndDate())
      .subscribe(data => {
        this.productHistoryData.labels = data.map(d => d.date);
        this.productHistoryData.datasets[0].data = data.map(d => d.quantity);
        this.productHistoryData.datasets[1].data = data.map(d => d.total);

        // Trigger chart update
        this.productHistoryData = { ...this.productHistoryData };
      });
  }
}
