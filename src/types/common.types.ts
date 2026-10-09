export interface PointGPS {
  id?: string;
  ordre?: number;
  latitude: number;
  longitude: number;
}

/** Réponse paginée standard de l'API. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
