// Refleja exactamente el FavoriteResponseDTO del backend (FavoriteController / FavoriteService).
// No inventar campos que el backend no devuelve (ej. teléfono, email, dirección completa,
// especialidades destacadas): si se necesitan a futuro, hay que agregarlos primero en el backend.
export interface Favorito {
  favoriteId: number;
  providerId: number;
  fullName: string;
  specialty: string;
  pricePerAppointment: number;
  averageRating: number;
  experienceYears: number;
  district: string;
  city: string;
  clinicIds: number[];
  clinicNames: string[];
}
