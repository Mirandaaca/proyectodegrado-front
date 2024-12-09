export interface RespuestaApi<T> {
    succeded: boolean;
    message: string | null;
    errors: string[] | null;
    data: T;
  }