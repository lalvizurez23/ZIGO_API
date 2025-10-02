export class AuthResponseDto {
  accessToken: string;
  user: {
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
    estaActivo: boolean;
    fechaCreacion: Date;
  };
}

