import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AnalyticsSummary {
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    lowStockCount: number;
    outOfStockCount: number;
    criticalStockCount: number;
    clientsServed: number;
}

export interface SalesTrend {
    labels: string[];
    data: number[];
}

export interface TopProducts {
    labels: string[];
    data: number[];
}

export interface SalesByCategory {
    labels: string[];
    data: number[];
}

export interface DeadStockItem {
    product: string;
    image: string;
    category: string;
    stock: number;
    lastSale: string;
    daysInactive: number | string;
}

export interface ProfitableProduct {
    product: string;
    category: string;
    unitsSold: number;
    revenue: number;
}

export interface ABCProduct {
    product: string;
    category: string;
    revenue: number;
    abcClass: 'A' | 'B' | 'C';
    cumulativePercentage: string;
}

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private apiUrl = 'http://localhost:3000/analytics';

    constructor(private http: HttpClient) { }

    getSummary(period: string = '7d'): Observable<AnalyticsSummary> {
        return this.http.get<AnalyticsSummary>(`${this.apiUrl}/summary?period=${period}`);
    }

    getSalesTrend(period: string = '7d', granularity: 'day' | 'week' | 'month' = 'day'): Observable<SalesTrend> {
        return this.http.get<SalesTrend>(`${this.apiUrl}/sales-trend?period=${period}&granularity=${granularity}`);
    }

    getSalesComparison(): Observable<SalesTrend> {
        return this.http.get<SalesTrend>(`${this.apiUrl}/sales-comparison`);
    }

    getTopProducts(period: string = '7d'): Observable<TopProducts> {
        return this.http.get<TopProducts>(`${this.apiUrl}/top-products?period=${period}`);
    }

    getSalesByCategory(period: string = '7d'): Observable<SalesByCategory> {
        return this.http.get<SalesByCategory>(`${this.apiUrl}/sales-by-category?period=${period}`);
    }

    getMostProfitable(period: string = '7d'): Observable<ProfitableProduct[]> {
        return this.http.get<ProfitableProduct[]>(`${this.apiUrl}/most-profitable?period=${period}`);
    }

    getDeadStock(days: number = 30): Observable<DeadStockItem[]> {
        return this.http.get<DeadStockItem[]>(`${this.apiUrl}/dead-stock?days=${days}`);
    }

    getTopProductsByRange(startDate: string, endDate: string): Observable<TopProducts> {
        return this.http.get<TopProducts>(`${this.apiUrl}/top-products-by-range?startDate=${startDate}&endDate=${endDate}`);
    }
    getStockoutPrediction(days: number = 30): Observable<StockoutPrediction[]> {
        return this.http.get<StockoutPrediction[]>(`${this.apiUrl}/stockout-prediction?days=${days}`);
    }

    getProductSalesHistory(productId: number, startDate: string, endDate: string): Observable<ProductHistoryItem[]> {
        return this.http.get<ProductHistoryItem[]>(`${this.apiUrl}/product-history?productId=${productId}&startDate=${startDate}&endDate=${endDate}`);
    }

    getClientAnalytics(startDate: string, endDate: string, search: string = ''): Observable<ClientAnalyticsItem[]> {
        return this.http.get<ClientAnalyticsItem[]>(`${this.apiUrl}/client-analytics?startDate=${startDate}&endDate=${endDate}&search=${search}`);
    }

    getProductsList(): Observable<{ id: number, nombre: string }[]> {
        return this.http.get<any>('http://localhost:3000/producto?limit=1000').pipe(
            map(response => response.data)
        );
    }
}

export interface StockoutPrediction {
    productId: number;
    productName: string;
    productImage: string;
    currentStock: number;
    dailyVelocity: number;
    daysLeft: number;
    suggestedPurchase?: number;
}

export interface ProductHistoryItem {
    date: string;
    quantity: number;
    total: number;
}

export interface ClientAnalyticsItem {
    clientId: number;
    clientName: string;
    clientNit: string;
    totalSpent: number;
    purchaseCount: number;
    averageTicket: number;
}
