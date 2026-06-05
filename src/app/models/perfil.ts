export interface Perfil {
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
  genero: string;
  tipoSangre: string;
  fechaNacimiento: string;
  dni: string;
  estadoCivil: string;
  profesion: string;
  alergias: string[];
  condicionesMedicas: string[];
  medicamentos: string[];
  seguroMedico: string;
  contactoEmergencia: {
    nombre: string;
    parentesco: string;
    telefono: string;
  };
}
