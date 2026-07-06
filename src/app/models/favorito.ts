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

  photoUrl?: string;
}
