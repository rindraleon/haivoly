import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

import type { StatutParcelle } from '@/api/parcelles';
import { useParcelles } from '@/hooks/useParcelles';

const formatSuperficie = (superficie?: number | null) => {
  if (superficie === undefined || superficie === null) {
    return null;
  }

  return {
    m2: superficie,
    are: superficie / 100,
    ha: superficie / 10000,
  };
};

type StatutHistorique =
  | 'TOUS'
  | 'ABANDONNEE'
  | 'ARCHIVEE'
  | 'SUPPRIMEE';

type TypeTri =
  | 'DEFAUT'
  | 'DATE_CREATION_RECENTE'
  | 'DATE_CREATION_ANCIENNE'
  | 'DATE_MODIFICATION_RECENTE'
  | 'DATE_MODIFICATION_ANCIENNE'
  | 'SUPERFICIE_CROISSANTE'
  | 'SUPERFICIE_DECROISSANTE'
  | 'NOM_AZ'
  | 'NOM_ZA';

export default function HistoriqueParcellesScreen() {
  const {
    data: parcelles,
    isLoading,
    isError,
    refetch,
  } = useParcelles();

  const [recherche, setRecherche] = useState('');

  const [statutFiltre, setStatutFiltre] =
    useState<StatutHistorique>('TOUS');

  const [filtreOuvert, setFiltreOuvert] =
    useState(false);

  const [triOuvert, setTriOuvert] =
    useState(false);

  const [tri, setTri] =
    useState<TypeTri>('DEFAUT');

  /*
   * ==========================================
   * PARCELLES HISTORIQUES
   * ==========================================
   *
   * On ne garde PAS :
   *
   * ACTIVE
   *
   * L'historique contient :
   *
   * ABANDONNEE
   * ARCHIVEE
   * SUPPRIMEE
   */

  const parcellesHistoriques = (parcelles ?? [])
    .filter((parcelle) => {
      return (
        parcelle.statut === 'ABANDONNEE' ||
        parcelle.statut === 'ARCHIVEE' ||
        parcelle.statut === 'SUPPRIMEE'
      );
    })
    .filter((parcelle) => {
      /*
       * ==========================================
       * RECHERCHE
       * ==========================================
       */

      const rechercheNormalisee =
        recherche.trim().toLowerCase();

      if (rechercheNormalisee === '') {
        return true;
      }

      return (
        parcelle.nom
          .toLowerCase()
          .includes(rechercheNormalisee) ||
        (parcelle.description ?? '')
          .toLowerCase()
          .includes(rechercheNormalisee) ||
        (parcelle.typeSol ?? '')
          .toLowerCase()
          .includes(rechercheNormalisee) ||
        parcelle.statut
          .toLowerCase()
          .includes(rechercheNormalisee)
      );
    })
    .filter((parcelle) => {
      /*
       * ==========================================
       * FILTRE STATUT
       * ==========================================
       */

      if (statutFiltre === 'TOUS') {
        return true;
      }

      return parcelle.statut === statutFiltre;
    })
    .sort((a, b) => {
      /*
       * ==========================================
       * TRI
       * ==========================================
       */

      switch (tri) {
        case 'DATE_CREATION_RECENTE':
          return (
            new Date(b.creeA ?? 0).getTime() -
            new Date(a.creeA ?? 0).getTime()
          );

        case 'DATE_CREATION_ANCIENNE':
          return (
            new Date(a.creeA ?? 0).getTime() -
            new Date(b.creeA ?? 0).getTime()
          );

        case 'DATE_MODIFICATION_RECENTE':
          return (
            new Date(b.modifieA ?? 0).getTime() -
            new Date(a.modifieA ?? 0).getTime()
          );

        case 'DATE_MODIFICATION_ANCIENNE':
          return (
            new Date(a.modifieA ?? 0).getTime() -
            new Date(b.modifieA ?? 0).getTime()
          );

        case 'SUPERFICIE_CROISSANTE':
          return (
            (a.superficie ?? 0) -
            (b.superficie ?? 0)
          );

        case 'SUPERFICIE_DECROISSANTE':
          return (
            (b.superficie ?? 0) -
            (a.superficie ?? 0)
          );

        case 'NOM_AZ':
          return a.nom.localeCompare(b.nom);

        case 'NOM_ZA':
          return b.nom.localeCompare(a.nom);

        case 'DEFAUT':
        default:
          return 0;
      }
    });

  /*
   * ==========================================
   * CHARGEMENT
   * ==========================================
   */

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Chargement de l'historique...
        </Text>
      </View>
    );
  }

  /*
   * ==========================================
   * ERREUR
   * ==========================================
   */

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Impossible de récupérer l'historique.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>
            Réessayer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButtonCenter}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ======================================
          TITRE
      ====================================== */}

      <Text style={styles.title}>
        Historique des parcelles
      </Text>

      <Text style={styles.subtitle}>
        Parcelles abandonnées, archivées et supprimées
      </Text>

      {/* ======================================
          RECHERCHE + FILTRE + TRI
      ====================================== */}

      <View style={styles.searchFilterRow}>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une parcelle..."
            value={recherche}
            onChangeText={setRecherche}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            filtreOuvert &&
              styles.actionButtonActive,
          ]}
          onPress={() => {
            setFiltreOuvert(!filtreOuvert);
            setTriOuvert(false);
          }}
        >
          <Text
            style={[
              styles.actionButtonText,
              filtreOuvert &&
                styles.actionButtonTextActive,
            ]}
          >
            Filtre
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            triOuvert &&
              styles.actionButtonActive,
          ]}
          onPress={() => {
            setTriOuvert(!triOuvert);
            setFiltreOuvert(false);
          }}
        >
          <Text
            style={[
              styles.actionButtonText,
              triOuvert &&
                styles.actionButtonTextActive,
            ]}
          >
            Tri
          </Text>
        </TouchableOpacity>

      </View>

      {/* ======================================
          PANNEAU FILTRE
      ====================================== */}

      {filtreOuvert && (
        <View style={styles.panel}>

          <Text style={styles.panelTitle}>
            Filtrer l'historique
          </Text>

          <Text style={styles.label}>
            Statut
          </Text>

          <View style={styles.options}>

            {[
              'TOUS',
              'ABANDONNEE',
              'ARCHIVEE',
              'SUPPRIMEE',
            ].map((statut) => (
              <TouchableOpacity
                key={statut}
                style={[
                  styles.option,
                  statutFiltre === statut &&
                    styles.optionActive,
                ]}
                onPress={() =>
                  setStatutFiltre(
                    statut as StatutHistorique,
                  )
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    statutFiltre === statut &&
                      styles.optionTextActive,
                  ]}
                >
                  {statut}
                </Text>
              </TouchableOpacity>
            ))}

          </View>

          <View style={styles.panelActions}>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setStatutFiltre('TOUS');
              }}
            >
              <Text style={styles.resetText}>
                Réinitialiser
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() =>
                setFiltreOuvert(false)
              }
            >
              <Text style={styles.applyText}>
                Appliquer
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      )}

      {/* ======================================
          PANNEAU TRI
      ====================================== */}

      {triOuvert && (
        <View style={styles.panel}>

          <Text style={styles.panelTitle}>
            Trier l'historique
          </Text>

          {/* DATE CREATION */}

          <Text style={styles.label}>
            Date de création
          </Text>

          <View style={styles.options}>

            <TouchableOpacity
              style={[
                styles.option,
                tri ===
                  'DATE_CREATION_RECENTE' &&
                  styles.optionActive,
              ]}
              onPress={() =>
                setTri(
                  'DATE_CREATION_RECENTE',
                )
              }
            >
              <Text
                style={
                  tri ===
                  'DATE_CREATION_RECENTE'
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                Plus récente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                tri ===
                  'DATE_CREATION_ANCIENNE' &&
                  styles.optionActive,
              ]}
              onPress={() =>
                setTri(
                  'DATE_CREATION_ANCIENNE',
                )
              }
            >
              <Text
                style={
                  tri ===
                  'DATE_CREATION_ANCIENNE'
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                Plus ancienne
              </Text>
            </TouchableOpacity>

          </View>

          {/* DATE MODIFICATION */}

          <Text style={styles.label}>
            Date de modification
          </Text>

          <View style={styles.options}>

            <TouchableOpacity
              style={[
                styles.option,
                tri ===
                  'DATE_MODIFICATION_RECENTE' &&
                  styles.optionActive,
              ]}
              onPress={() =>
                setTri(
                  'DATE_MODIFICATION_RECENTE',
                )
              }
            >
              <Text
                style={
                  tri ===
                  'DATE_MODIFICATION_RECENTE'
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                Plus récente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                tri ===
                  'DATE_MODIFICATION_ANCIENNE' &&
                  styles.optionActive,
              ]}
              onPress={() =>
                setTri(
                  'DATE_MODIFICATION_ANCIENNE',
                )
              }
            >
              <Text
                style={
                  tri ===
                  'DATE_MODIFICATION_ANCIENNE'
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                Plus ancienne
              </Text>
            </TouchableOpacity>

          </View>

          {/* SUPERFICIE */}

          <Text style={styles.label}>
            Superficie
          </Text>

          <View style={styles.options}>

            <TouchableOpacity
              style={[
                styles.option,
                tri ===
                  'SUPERFICIE_CROISSANTE' &&
                  styles.optionActive,
              ]}
              onPress={() =>
                setTri(
                  'SUPERFICIE_CROISSANTE',
                )
              }
            >
              <Text
                style={
                  tri ===
                  'SUPERFICIE_CROISSANTE'
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                Petite → Grande
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                tri ===
                  'SUPERFICIE_DECROISSANTE' &&
                  styles.optionActive,
              ]}
              onPress={() =>
                setTri(
                  'SUPERFICIE_DECROISSANTE',
                )
              }
            >
              <Text
                style={
                  tri ===
                  'SUPERFICIE_DECROISSANTE'
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                Grande → Petite
              </Text>
            </TouchableOpacity>

          </View>

          {/* NOM */}

          <Text style={styles.label}>
            Nom
          </Text>

          <View style={styles.options}>

            <TouchableOpacity
              style={[
                styles.option,
                tri === 'NOM_AZ' &&
                  styles.optionActive,
              ]}
              onPress={() =>
                setTri('NOM_AZ')
              }
            >
              <Text
                style={
                  tri === 'NOM_AZ'
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                A → Z
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                tri === 'NOM_ZA' &&
                  styles.optionActive,
              ]}
              onPress={() =>
                setTri('NOM_ZA')
              }
            >
              <Text
                style={
                  tri === 'NOM_ZA'
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                Z → A
              </Text>
            </TouchableOpacity>

          </View>

          {/* ACTIONS */}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() =>
              setTriOuvert(false)
            }
          >
            <Text style={styles.closeText}>
              Fermer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetSortButton}
            onPress={() => {
              setTri('DEFAUT');
              setTriOuvert(false);
            }}
          >
            <Text style={styles.resetSortText}>
              Réinitialiser le tri
            </Text>
          </TouchableOpacity>

        </View>
      )}

      {/* ======================================
          LISTE
      ====================================== */}

      {parcellesHistoriques.length > 0 ? (
        <FlatList
          data={parcellesHistoriques}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {

            const superficie =
              formatSuperficie(
                item.superficie,
              );

            return (
              <View style={styles.card}>

                {/* NOM */}

                <Text style={styles.nom}>
                  {item.nom}
                </Text>

                {/* STATUT */}

                <View
                  style={[
                    styles.statusBadge,
                    item.statut ===
                      'ABANDONNEE' &&
                      styles.statusAbandonnee,
                    item.statut ===
                      'ARCHIVEE' &&
                      styles.statusArchivee,
                    item.statut ===
                      'SUPPRIMEE' &&
                      styles.statusSupprimee,
                  ]}
                >
                  <Text
                    style={
                      styles.statusBadgeText
                    }
                  >
                    {item.statut}
                  </Text>
                </View>

                {/* DETAIL */}

                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/detail-parcelle',
                      params: {
                        parcelleId: item.id,
                      },
                    })
                  }
                >
                  <Text
                    style={styles.detailText}
                  >
                    Voir le détail
                  </Text>
                </TouchableOpacity>

                {/* RAISON SUPPRESSION */}

                {item.statut ===
                  'SUPPRIMEE' &&
                  item.raisonSuppression && (
                    <View
                      style={
                        styles.suppressionInfo
                      }
                    >
                      <Text
                        style={
                          styles.suppressionTitle
                        }
                      >
                        Raison de suppression
                      </Text>

                      <Text
                        style={
                          styles.suppressionText
                        }
                      >
                        {
                          item.raisonSuppression
                        }
                      </Text>
                    </View>
                  )}

                {/* DESCRIPTION */}

                {item.description && (
                  <Text
                    style={styles.description}
                  >
                    {item.description}
                  </Text>
                )}

                {/* SUPERFICIE */}

                {superficie && (
                  <View
                    style={
                      styles.superficieContainer
                    }
                  >
                    <Text
                      style={
                        styles.superficieTitle
                      }
                    >
                      Superficie
                    </Text>

                    <Text
                      style={
                        styles.superficieInfo
                      }
                    >
                      {superficie.m2.toFixed(
                        2,
                      )}{' '}
                      m²
                    </Text>

                    <Text
                      style={
                        styles.superficieInfo
                      }
                    >
                      {superficie.are.toFixed(
                        2,
                      )}{' '}
                      a
                    </Text>

                    <Text
                      style={
                        styles.superficieInfo
                      }
                    >
                      {superficie.ha.toFixed(
                        4,
                      )}{' '}
                      ha
                    </Text>
                  </View>
                )}

                {/* TYPE DE SOL */}

                {item.typeSol && (
                  <Text style={styles.info}>
                    Type de sol :{' '}
                    {item.typeSol}
                  </Text>
                )}

                {/* DATE CREATION */}

                {item.creeA && (
                  <Text style={styles.info}>
                    Créée le :{' '}
                    {new Date(
                      item.creeA,
                    ).toLocaleDateString(
                      'fr-FR',
                    )}
                  </Text>
                )}

                {/* DATE MODIFICATION */}

                {item.modifieA && (
                  <Text style={styles.info}>
                    Modifiée le :{' '}
                    {new Date(
                      item.modifieA,
                    ).toLocaleDateString(
                      'fr-FR',
                    )}
                  </Text>
                )}

              </View>
            );
          }}
        />
      ) : (
        <View style={styles.empty}>

          <Text style={styles.emptyText}>
            {recherche.trim() !== ''
              ? 'Aucune parcelle historique ne correspond à votre recherche.'
              : statutFiltre !== 'TOUS'
              ? 'Aucune parcelle ne correspond au statut sélectionné.'
              : 'Aucune parcelle dans l’historique.'}
          </Text>

        </View>
      )}

      {/* ======================================
          RETOUR
      ====================================== */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          Retour
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    padding: 20,
  },

  loadingText: {
    fontSize: 16,
  },

  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },

  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },

  searchContainer: {
    flex: 1,
  },

  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    fontSize: 15,
  },

  actionButton: {
    height: 45,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionButtonActive: {
    backgroundColor: '#2e7d32',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  actionButtonTextActive: {
    color: '#fff',
  },

  panel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },

  optionActive: {
    backgroundColor: '#2e7d32',
  },

  optionText: {
    color: '#2e7d32',
  },

  optionTextActive: {
    color: '#fff',
  },

  panelActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  resetButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resetText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },

  applyButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  applyText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  closeButton: {
    marginTop: 20,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  resetSortButton: {
    marginTop: 10,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resetSortText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },

  list: {
    paddingBottom: 80,
  },

  card: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#f1f1f1',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  nom: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
  },

  statusAbandonnee: {
    backgroundColor: '#fff3e0',
  },

  statusArchivee: {
    backgroundColor: '#eeeeee',
  },

  statusSupprimee: {
    backgroundColor: '#ffebee',
  },

  statusBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  detailButton: {
    height: 45,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  detailText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  suppressionInfo: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },

  suppressionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  suppressionText: {
    fontSize: 14,
  },

  description: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 8,
  },

  superficieContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },

  superficieTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  superficieInfo: {
    fontSize: 14,
    marginTop: 2,
    color: '#444',
  },

  info: {
    fontSize: 14,
    marginTop: 8,
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },

  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
  },

  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  backButton: {
    position: 'absolute',
    bottom: 15,
    left: 20,
  },

  backButtonCenter: {
    padding: 10,
  },

  backText: {
    fontWeight: 'bold',
  },
});
