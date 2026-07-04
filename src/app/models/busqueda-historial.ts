// Refleja el SearchHistoryDTO del backend.
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

  // Estos dos no existen en el backend (ni en SearchHistory ni en ningún join agregado).
  // Se dejan opcionales por si el HTML los referencia, pero hoy nunca llegan con datos.
  doctorsCount?: number;
  clinicsCount?: number;
  tags?: string[];
}
