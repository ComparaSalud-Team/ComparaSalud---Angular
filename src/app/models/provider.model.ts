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

  street: string;
  district: string;
  city: string;
  country: string;

  isValidated: boolean;
}
