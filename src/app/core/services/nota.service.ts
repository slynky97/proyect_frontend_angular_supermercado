import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nota, CreateNotaRequest } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class NotaService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:3000/nota';

    getAll(params?: any): Observable<{ data: Nota[], total: number }> {
        return this.http.get<{ data: Nota[], total: number }>(this.API_URL, { params });
    }

    getById(id: number): Observable<Nota> {
        return this.http.get<Nota>(`${this.API_URL}/${id}`);
    }

    create(nota: CreateNotaRequest): Observable<Nota> {
        return this.http.post<Nota>(this.API_URL, nota);
    }

    update(id: number, nota: Partial<CreateNotaRequest>): Observable<Nota> {
        return this.http.patch<Nota>(`${this.API_URL}/${id}`, nota);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }
}
