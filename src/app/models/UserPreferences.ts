export interface UserPreferences {
  id?: number;
  idioma: string;
  zonaHoraria: string;
  formatoFecha: string;
  formatoHora: string;

  notifCorreo: boolean;
  notifPush: boolean;
  notifSms: boolean;

  notifRecordatoriosCitas: boolean;
  notifNuevosMensajes: boolean;
  notifActualizacionesSistema: boolean;
  notifCorreosMarketing: boolean;
  notifReportesSemanales: boolean;

  noMolestarDesde: string;
  noMolestarHasta: string;
}
