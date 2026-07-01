export interface Patient {
  id: number;
  authUserId: number;
  name: string;
  phone: string;
  email: string;
  country: string;
  birthday: string;

  dni: string;
  estadoCivil: string;
  profesion: string;
  idiomaPreferido: string;
  direccion: string;
  genero: string;

  tipoSangre: string;
  alergias: string;
  condicionesMedicas: string;
  medicamentosActuales: string;
  seguroMedicoNombre: string;
  seguroMedicoPlan: string;

  emergenciaNombre: string;
  emergenciaParentesco: string;
  emergenciaTelefono: string;
  emergenciaDireccion: string;
}
