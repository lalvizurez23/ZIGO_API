export class AuthResponseDto {
  accessToken: string;
  user: {
    idUsuario: number;
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
    estaActivo: boolean;
    fechaCreacion: Date;
  };
}

