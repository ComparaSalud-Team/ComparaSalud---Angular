// Refleja el ClinicDTO del backend (ClinicController / ClinicService).
export interface Clinic {
  id: number;
  name: string;
  description: string;
  phone: string;
  email: string;
  street: string;
  district: string;
  city: string;
  country: string;
  isActive: boolean;
  providerCount: number;
  specialties: string[];
}
