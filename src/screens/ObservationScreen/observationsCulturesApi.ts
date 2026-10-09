import { culturesApi, observationsApi } from '@/services';
import { asItems } from '@/utils/api';
import type { Culture, Observation } from '@/types';

export const observationsCulturesApi = Object.assign(
  (parcelleId: string): Promise<Culture[]> =>
    culturesApi.listByParcelle(parcelleId, { limit: 200 }).then(asItems),
  {
    observations: (cultureId: string): Promise<Observation[]> =>
      observationsApi.listByCulture(cultureId, { limit: 200 }).then(asItems),
  },
);
