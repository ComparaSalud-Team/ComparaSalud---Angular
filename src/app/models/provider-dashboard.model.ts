export interface UpcomingAppointment {
  appointmentId: number;
  date: string;
  time: string;
  patientName: string;
  service: string;
  status: string;
}

export interface DashboardMetrics {
  totalAppointmentsThisMonth: number;
  appointmentsDeltaPct: number | null;

  totalEarningsThisMonth: number;
  earningsDeltaPct: number | null;

  uniquePatientsThisMonth: number;
  patientsDeltaPct: number | null;

  averageRating: number;
  reviewsCount: number;

  cancellationRate: number;
  attendanceRate: number;
  averageConsultationMinutes: number | null;
}

export interface RecentActivity {
  type: string;
  description: string;
  date: string;
}

export interface RevenuePoint {
  label: string;
  date: string;
  amount: number;
}

export interface RevenueChart {
  points: RevenuePoint[];
  totalLast7Days: number;
  deltaVsPreviousWeekPct: number | null;
}

export interface ProviderReview {
  id: number;
  patientName: string;
  rating: number;
  comment: string;
  relativeDate: string;
  date: string;
}

export interface ProviderDashboardDTO {
  upcomingAppointments: UpcomingAppointment[];
  metrics: DashboardMetrics;
  recentActivity: RecentActivity[];
  revenueChart: RevenueChart;
  recentReviews: ProviderReview[];
}
