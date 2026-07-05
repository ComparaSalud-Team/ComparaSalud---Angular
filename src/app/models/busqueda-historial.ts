export interface BusquedaHistorial {
  id: number;
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  specialty?: string;
  district?: string;
  createdAt: string;
  saved?: boolean;

  doctorsCount?: number;
  clinicsCount?: number;
  tags?: string[];
}
