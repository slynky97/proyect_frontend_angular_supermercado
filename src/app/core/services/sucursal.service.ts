import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sucursal } from '../models/inventory.model';

@Injectable({
    providedIn: 'root'
})
export class SucursalService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/sucursal';

    getAll(): Observable<Sucursal[]> {
        return this.http.get<Sucursal[]>(this.apiUrl);
    }

    getById(id: number): Observable<Sucursal> {
        return this.http.get<Sucursal>(`${this.apiUrl}/${id}`);
    }

    create(sucursal: Partial<Sucursal>): Observable<Sucursal> {
        return this.http.post<Sucursal>(this.apiUrl, sucursal);
    }

    update(id: number, sucursal: Partial<Sucursal>): Observable<Sucursal> {
        return this.http.patch<Sucursal>(`${this.apiUrl}/${id}`, sucursal);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
