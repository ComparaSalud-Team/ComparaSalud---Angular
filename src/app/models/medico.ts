export interface Medico {
  id: string;
  nombre: string;
  especialidad: string;
  calificacion: number;
  totalResenas: number;
  precio: number;
  moneda: string;
  ubicacion: string;
  imagen: string;
  idiomas: string[];
  tags: string[];
  pacientes: number;
  sesiones: number;
  reservas: number;
}
