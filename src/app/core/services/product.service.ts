import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:3000/producto';

    getAll(): Observable<Product[]> {
        return this.http.get<{ data: Product[] }>(`${this.API_URL}?limit=1000`).pipe(
            map(response => response.data)
        );
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.API_URL}/${id}`);
    }

    create(product: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(this.API_URL, product);
    }

    update(id: number, product: Partial<Product>): Observable<Product> {
        return this.http.patch<Product>(`${this.API_URL}/${id}`, product);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }
}
