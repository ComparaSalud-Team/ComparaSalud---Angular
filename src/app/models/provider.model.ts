export interface EducationItem {
  id?: number;
  titulo: string;
  institucion: string;
  periodo: string;
  detalle: string;
}

export interface PriceItem {
  nombre: string;
  monto: number;
}

export interface ProviderMedicalService {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
}

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
  durationMinutes?: number;

  street: string;
  district: string;
  city: string;
  country: string;

  isValidated: boolean;

  cedulaProfesional: string;
  registroMedico: string;
  areasEnfoque: string[];

  certificaciones: string[];
  horario: string[];
  educacion: EducationItem[];
  precios: PriceItem[];

  services: ProviderMedicalService[];

  photoUrl?: string;
}
