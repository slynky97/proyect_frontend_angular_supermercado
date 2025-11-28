import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:3000/cliente';

    getAll(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(this.API_URL);
    }

    getById(id: number): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.API_URL}/${id}`);
    }

    create(data: Partial<Cliente>): Observable<Cliente> {
        return this.http.post<Cliente>(this.API_URL, data);
    }

    update(id: number, data: Partial<Cliente>): Observable<Cliente> {
        return this.http.patch<Cliente>(`${this.API_URL}/${id}`, data);
    }
}
