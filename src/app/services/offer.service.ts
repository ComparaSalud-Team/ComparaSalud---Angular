import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offer } from '../models/offer.model';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private apiUrl = 'http://localhost:8081/api/offers';

  constructor(private http: HttpClient) {}

  // "Ofertas exclusivas para ti" del dashboard.
  listarActivas(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/active`);
  }
}
