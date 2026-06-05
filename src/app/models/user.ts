export interface User {
  id?: string;
  nombre: string;
  email: string;
  rol: 'paciente' | 'doctor' | 'clinica';
  avatar?: string;
}
