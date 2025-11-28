import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Almacen, AlmacenProducto } from '../models/inventory.model';

@Injectable({
    providedIn: 'root'
})
export class AlmacenService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/almacen';

    getAll(): Observable<Almacen[]> {
        return this.http.get<Almacen[]>(this.apiUrl);
    }

    getById(id: number): Observable<Almacen> {
        return this.http.get<Almacen>(`${this.apiUrl}/${id}`);
    }

    getAllStock(): Observable<AlmacenProducto[]> {
        return this.http.get<AlmacenProducto[]>('http://localhost:3000/almacen-producto');
    }

    getStockByWarehouse(almacenId: number): Observable<AlmacenProducto[]> {
        return this.http.get<AlmacenProducto[]>(`http://localhost:3000/almacen-producto/almacen/${almacenId}`);
    }

    createStock(data: { productoId: number; almacenId: number; cantidad_actual: number }): Observable<AlmacenProducto> {
        return this.http.post<AlmacenProducto>('http://localhost:3000/almacen-producto', data);
    }

    updateStock(id: number, data: { cantidad_actual: number }): Observable<AlmacenProducto> {
        return this.http.patch<AlmacenProducto>(`http://localhost:3000/almacen-producto/${id}`, data);
    }

    deleteStock(id: number): Observable<void> {
        return this.http.delete<void>(`http://localhost:3000/almacen-producto/${id}`);
    }

    create(almacen: Partial<Almacen>): Observable<Almacen> {
        return this.http.post<Almacen>(this.apiUrl, almacen);
    }

    update(id: number, almacen: Partial<Almacen>): Observable<Almacen> {
        return this.http.patch<Almacen>(`${this.apiUrl}/${id}`, almacen);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
