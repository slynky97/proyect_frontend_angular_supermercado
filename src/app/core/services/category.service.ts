import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
    id: number;
    nombre: string;
    descripcion?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:3000/categoria';

    getAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.API_URL);
    }
}
