export interface Libro {
    readonly id: string;
    titulo: string;
    autor: string;
    anio?: number; //el signo de interrogación indica que el campo es opcional
    ejemplares: number;
}

export type EstadoPrestamo = "activo" | "vencido" | "devuelto";

export type ID = number | string;

export interface Prestamo {
    readonly folio: string;
    readonly libroId: string;
    readonly socio: string;
    readonly venceEn: Date; 
    devueltoEn?: Date; 
}

export class LibroNoEncontradoError extends Error {}
export class SinEjemplarError extends Error {}