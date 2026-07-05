// Refleja el AvailabilityDTO del backend
// (GET /api/providers/{id}/availability?date=YYYY-MM-DD).
export interface Availability {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
