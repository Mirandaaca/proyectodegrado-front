export interface Factor {
    id?: number;
    nombre: string;
    descripcion: string;
}
export interface FactoresResponse {
    factores: Factor[];
    totalRecords: number;
}