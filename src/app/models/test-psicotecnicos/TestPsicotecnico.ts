export interface TestPsicotecnico {
    id?: number;
    nombre: string;
    descripcion: string;
    duracion: number;
}

export interface TestPsicotecnicosResponse {
    tests: TestPsicotecnico[];
    totalRecords: number;
}