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

  rating: number;
  reviewCount: number;

  emergencia24h: boolean;
  estacionamiento: boolean;
  farmacia: boolean;
  laboratorio: boolean;
  imagenologia: boolean;
  servicioAmbulancia: boolean;
  unidadCuidadosIntensivos: boolean;
  hospitalizacion: boolean;
}
