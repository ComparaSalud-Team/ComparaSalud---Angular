export interface ClinicSpecialtyPrice {
  id: number;
  clinicId: number;
  clinicName: string;
  district: string;
  specialty: string;
  price: number;
  durationMinutes: number;
  includes: string[];
}
