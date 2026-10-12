import type { Culture, Intervention, Observation, Parcelle, Recolte } from '@/types';
import type { OfflineAction } from '@/types/offline.types';

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function pointsValue(value: unknown): Parcelle['pointsGPS'] {
  return Array.isArray(value)
    ? value.filter(
        (point): point is { latitude: number; longitude: number; ordre?: number } =>
          !!point && typeof point === 'object' &&
          typeof (point as Record<string, unknown>).latitude === 'number' &&
          typeof (point as Record<string, unknown>).longitude === 'number',
      )
    : [];
}

function localId(action: OfflineAction): string {
  return action.serverEntityId ?? action.entityId ?? action.id;
}

export function localParcelle(action: OfflineAction, accountId: string): Parcelle {
  const payload = action.payload;
  return {
    id: localId(action),
    nom: stringValue(payload.nom),
    superficie: numberValue(payload.superficie),
    typeSol: nullableString(payload.typeSol),
    latitude: numberValue(payload.latitude),
    longitude: numberValue(payload.longitude),
    description: nullableString(payload.description),
    statut: 'ACTIVE',
    utilisateurId: accountId,
    creeA: action.createdAt,
    modifieA: action.updatedAt,
    pointsGPS: pointsValue(payload.pointsGPS),
    _localOnly: action.status !== 'SYNCED',
    _syncStatus: action.status,
  };
}

export function localCulture(action: OfflineAction): Culture {
  const payload = action.payload;
  return {
    id: localId(action),
    nom: stringValue(payload.nom),
    type: nullableString(payload.type),
    variete: nullableString(payload.variete),
    datePlantation: nullableString(payload.datePlantation),
    datePrevueRecolte: nullableString(payload.datePrevueRecolte),
    description: nullableString(payload.description),
    stade: nullableString(payload.stade),
    // Le serveur reste l'autorité sur le statut métier; les éléments locaux
    // portent _localOnly/_syncStatus et le badge « à synchroniser ».
    statut: 'PLANIFIEE',
    parcelleId: stringValue(payload.parcelleId ?? payload.parcelle_id),
    pointsGPS: pointsValue(payload.pointsGPS),
    creeA: action.createdAt,
    modifieA: action.updatedAt,
    _localOnly: action.status !== 'SYNCED',
    _syncStatus: action.status,
  };
}

export function localIntervention(action: OfflineAction): Intervention {
  const payload = action.payload;
  return {
    id: localId(action),
    type: stringValue(payload.type, 'AUTRE'),
    description: nullableString(payload.description),
    date: stringValue(payload.date, action.createdAt),
    produit: nullableString(payload.produit),
    quantite: numberValue(payload.quantite),
    unite: nullableString(payload.unite),
    cout: numberValue(payload.cout),
    // Statut calculé par le serveur ; non confirmé tant que la file n'est pas synchronisée.
    statut: 'EN_COURS',
    cultureId: stringValue(payload.cultureId),
    creeA: action.createdAt,
    modifieA: action.updatedAt,
    _localOnly: action.status !== 'SYNCED',
    _syncStatus: action.status,
  };
}

export function localObservation(action: OfflineAction): Observation {
  const payload = action.payload;
  return {
    id: localId(action),
    description: stringValue(payload.description),
    date: stringValue(payload.date, action.createdAt),
    cultureId: stringValue(payload.cultureId),
    photos: [],
    _localOnly: action.status !== 'SYNCED',
    _syncStatus: action.status,
  };
}

export function localRecolte(action: OfflineAction): Recolte {
  const payload = action.payload;
  return {
    id: localId(action),
    dateRecolte: stringValue(payload.dateRecolte, action.createdAt.slice(0, 10)),
    quantite: numberValue(payload.quantite) ?? 0,
    unite: stringValue(payload.unite, 'kg'),
    description: nullableString(payload.description),
    prixVente: numberValue(payload.prixVente),
    coutRecolte: numberValue(payload.coutRecolte),
    cultureId: stringValue(payload.cultureId),
    creeA: action.createdAt,
    photos: [],
    _localOnly: action.status !== 'SYNCED',
    _syncStatus: action.status,
  };
}
