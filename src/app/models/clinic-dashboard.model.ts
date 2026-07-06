export interface ClinicMetrics {
  dailyAppointments: number;
  dailyAppointmentsDeltaPct: number | null;
  monthlyEarnings: number;
  earningsDeltaPct: number | null;
  newPatientsThisMonth: number;
  newPatientsDeltaPct: number | null;
  averageRating: number;
  reviewsCount: number;
}

export interface ClinicUpcomingAppointment {
  patientName: string;
  time: string;
  doctorName: string;
  specialty: string;
  status: string;
}

export interface ClinicTeamMember {
  name: string;
  specialty: string;
  photoUrl: string | null;
  online: boolean;
}

export interface ClinicDepartment {
  id: number;
  clinicId: number;
  name: string;
  currentPatients: number;
  capacity: number;
}

export interface ClinicStats {
  clinicId: number;
  bedOccupancyPct: number;
  surgeriesCompletedPct: number;
  staffAvailablePct: number;
  satisfactionPct: number;
}

export interface ClinicRevenuePoint {
  label: string;
  amount: number;
}

export interface ClinicRevenueChart {
  monthLabel: string;
  total: number;
  deltaVsPreviousMonthPct: number | null;
  points: ClinicRevenuePoint[];
}

export interface ClinicRecentReview {
  patientName: string;
  rating: number;
  comment: string;
  relativeDate: string;
}

export interface ClinicDashboardDTO {
  metrics: ClinicMetrics;
  upcomingAppointments: ClinicUpcomingAppointment[];
  medicalTeam: ClinicTeamMember[];
  departments: ClinicDepartment[];
  stats: ClinicStats;
  revenueChart: ClinicRevenueChart;
  recentReviews: ClinicRecentReview[];
}
