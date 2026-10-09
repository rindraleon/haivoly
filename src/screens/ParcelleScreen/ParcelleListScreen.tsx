import { useMemo, useState } from 'react';

import { router } from 'expo-router';



import { useParcelles } from '@/hooks';





import { LoadingState } from '@/components/CommonComponent/LoadingState';
import { ErrorState } from '@/components/CommonComponent/ErrorState';








import { Filtre } from '@/screens/ParcelleScreen/ParcelleListScreen.helpers';

import { VueParcelles } from '@/components/ParcelleComponent/VueParcelles';
export default function ParcellesScreen() {
  const {
    data: parcellesPage,
    isLoading,
    isError,
    refetch,
  } = useParcelles({ limit: 200 });

  /** `useParcelles` renvoie une page paginée : l'écran travaille sur la liste. */
  const parcelles = useMemo(
    () => parcellesPage?.items ?? [],
    [parcellesPage],
  );

  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] =
    useState<Filtre>('TOUTES');
  const [showFiltres, setShowFiltres] =
    useState(false);
  const [refreshing, setRefreshing] =
    useState(false);

  const parcellesActivesBrutes = useMemo(
    () => parcelles ?? [],
    [parcelles],
  );

  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();

    return parcellesActivesBrutes
      .filter((p) => {
        if (
          filtre !== 'TOUTES' &&
          p.statut !== filtre
        ) {
          return false;
        }

        if (!q) return true;

        return (
          p.nom
            .toLowerCase()
            .includes(q) ||
          (p.description ?? '')
            .toLowerCase()
            .includes(q) ||
          (p.typeSol ?? '')
            .toLowerCase()
            .includes(q) ||
          p.statut
            .toLowerCase()
            .includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(
            b.modifieA ?? 0,
          ).getTime() -
          new Date(
            a.modifieA ?? 0,
          ).getTime(),
      );
  }, [
    parcellesActivesBrutes,
    recherche,
    filtre,
  ]);

  const stats = useMemo(() => {
    const actives =
      parcellesActivesBrutes.filter(
        (p) => p.statut === 'ACTIVE',
      ).length;

    const superficie =
      parcellesActivesBrutes
        .filter(
          (p) => p.statut === 'ACTIVE',
        )
        .reduce(
          (acc, p) =>
            acc + (p.superficie ?? 0),
          0,
        );

    return {
      actives,
      superficieHa:
        superficie / 10000,
      total:
        parcellesActivesBrutes.length,
    };
  }, [parcellesActivesBrutes]);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState message="Chargement des parcelles..." />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Impossible de charger les parcelles"
        message="Vérifiez votre connexion."
        onRetry={() => refetch()}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <VueParcelles
      filtre={filtre}
      filtrees={filtrees}
      onRefresh={onRefresh}
      recherche={recherche}
      refreshing={refreshing}
      setFiltre={setFiltre}
      setRecherche={setRecherche}
      setShowFiltres={setShowFiltres}
      showFiltres={showFiltres}
      stats={stats}
    />
  );
}

