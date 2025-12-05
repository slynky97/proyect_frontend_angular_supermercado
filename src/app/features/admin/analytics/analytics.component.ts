import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MetabaseChartComponent } from './components/metabase-chart.component';
import { ChartData, ChartOptions } from 'chart.js';
import { AnalyticsService, DeadStockItem, ProfitableProduct } from './analytics.service';

type TabType = 'resumen' | 'ventas' | 'inventario';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MetabaseChartComponent, RouterLink],
  template: `
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Sticky Header -->
      <div class="sticky top-0 bg-white z-50 border-b border-gray-100 shadow-sm px-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between pt-8 mb-4 gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Analytics</h1>
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
                  <span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Atención</span>
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
                    routerLink="/admin/inventory" 
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
            <!-- Ventas Generales vs Cliente + Pie Chart Categorías -->
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

            <!-- Detalle Venta por Categoría (tabla completa) -->
            <div class="mb-6">
              <div class="h-[500px]">
                <app-metabase-chart
                  metabaseUrl="http://localhost:3001/public/question/4f47e63b-f7de-47a7-a784-1fda071121c4"
                ></app-metabase-chart>
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
              <a href="/admin/inventory" class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                Ir al Inventario
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </a>
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
    { id: 'ventas', label: 'Análisis de Ventas', icon: 'fas fa-chart-bar' }
  ];

  constructor(private analyticsService: AnalyticsService) { }

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

  ngOnInit() {
    this.loadAnalytics();
    this.startAutoRefresh();
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
    this.deadStockItemsPerPage.set(parseInt(event.target.value, 10));
    this.deadStockCurrentPage.set(1); // Reset to first page
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
}
