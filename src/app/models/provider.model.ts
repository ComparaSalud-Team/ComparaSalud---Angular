export interface Provider {
  id: number;
  authUserId: number;

  fullName: string;
  email: string;
  phone: string;

  specialty: string;
  description: string;

  rating: number;
  averageRating: number;

  pricePerAppointment: number;
  experienceYears: number;
  language: string;
  modality: string;

  street: string;
  district: string;
  city: string;
  country: string;

  isValidated: boolean;
}
