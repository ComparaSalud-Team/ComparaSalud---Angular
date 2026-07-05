// Refleja el ClinicSpecialtyPriceDTO del backend
// (GET /api/clinics/{id}/pricing y GET /api/clinics/pricing).
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
