// Refleja el SearchHistoryDTO del backend.
// Los campos marcados como NUEVOS no existen todavía en el backend actual: hay que
// agregarlos en SearchHistory (entidad), SearchHistoryDTO y SearchHistoryService/Repository
// para que la pestaña "Guardados" funcione con datos reales. Ver notas al final del archivo.
export interface BusquedaHistorial {
  id: number;
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  specialty?: string;
  district?: string;
  createdAt: string;

  // --- NUEVOS, agregar en backend ---
  saved?: boolean; // boolean en SearchHistory; default false
  doctorsCount?: number; // opcional: si se calcula al guardar o se trae vía join
  clinicsCount?: number; // opcional, idem
  tags?: string[]; // opcional: lista de tags libres para mostrar como chips (ej. "Deportiva", "Cirugía")
}

/*
  NOTAS PARA EL BACKEND (pestaña "Guardados"):

  1) Entidad SearchHistory: agregar
       @Column(name = "saved")
       private Boolean saved = false;

  2) SearchHistoryDTO: agregar campo `saved` (Boolean) y mapearlo en toDTO().

  3) SearchHistoryRepository: agregar
       List<SearchHistory> findByAuthUserIdAndSavedTrueOrderByCreatedAtDesc(Long userId);

  4) SearchHistoryService: agregar métodos
       - guardarComoFavorita(Long historyId, String callerEmail) -> marca saved = true
       - quitarDeGuardados(Long historyId, String callerEmail)   -> marca saved = false
       - obtenerGuardados(String callerEmail) -> usa el nuevo repository method

  5) SearchHistoryController: agregar endpoints
       PUT    /api/search-history/{id}/save     -> marca como guardada
       DELETE /api/search-history/{id}/save     -> desmarca/quita de guardados
       GET    /api/search-history/saved         -> lista solo las guardadas

  Los campos doctorsCount/clinicsCount/tags del mockup no existen en ningún lado del
  modelo actual (ni siquiera en MedicalService/Provider de forma agregada). Si los
  quieres reales habría que calcularlos en el momento de guardar la búsqueda (contar
  providers que matchean los filtros) o dejarlos fuera de la UI por ahora.
*/
