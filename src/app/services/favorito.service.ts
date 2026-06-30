import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorito } from '../models/favorito';

@Injectable({
  providedIn: 'root',
})
export class FavoritoService {
  private apiUrl = 'http://localhost:8081/api/favorites';

  constructor(private http: HttpClient) {}

  // Criterio 3 y 5 del backend – Ver lista de favoritos del paciente
  listarFavoritos(patientId: number): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(this.apiUrl, { params: { patientId } });
  }

  // Criterio 1 y 2 – Agregar favorito (el backend evita duplicados)
  agregarFavorito(patientId: number, providerId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, { patientId, providerId });
  }

  // Criterio 4 – Eliminar favorito
  eliminarFavorito(patientId: number, providerId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.apiUrl, {
      params: { patientId, providerId },
    });
  }
}
