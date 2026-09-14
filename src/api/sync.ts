import { api } from './client';

export interface PointGPSSync {
  id: string;
  ordre: number;
  latitude: number;
  longitude: number;
  parcelleId: string;
}

export interface SyncData {
  pointsGPS?: PointGPSSync[];
}

export interface SyncResponse {
  success?: boolean;
  syncedAt?: string;
  changes?: {
    parcelles?: unknown[];
    cultures?: unknown[];
    interventions?: unknown[];
    observations?: unknown[];
    photos?: unknown[];
    pointsGPS?: unknown[];
  };
}

export async function synchronize(
  data: SyncData,
): Promise<SyncResponse> {
  const response = await api.post<SyncResponse>(
    '/sync',
    data,
  );

  return response.data;
}