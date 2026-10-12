import type { StatutHistorique, TypeTri } from '@/screens/ParcelleScreen/ParcelleHistoryScreen';
import { i18n } from '@/i18n/instance';
import { styles } from '@/screens/ParcelleScreen/ParcelleHistoryScreen.styles';

import { router } from 'expo-router';
import type { Dispatch, SetStateAction } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { formatDate } from '@/utils/date';
import type {
  Parcelle,
} from '@/types';
type Props = {
  filtreOuvert: boolean;
  formatSuperficie: (superficie?: number | null | undefined) => { m2: number; are: number; ha: number; } | null;
  parcellesHistoriques: Parcelle[];
  recherche: string;
  setFiltreOuvert: Dispatch<SetStateAction<boolean>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setStatutFiltre: Dispatch<SetStateAction<StatutHistorique>>;
  setTri: Dispatch<SetStateAction<TypeTri>>;
  setTriOuvert: Dispatch<SetStateAction<boolean>>;
  statutFiltre: StatutHistorique;
  tri: TypeTri;
  triOuvert: boolean;
};

export function VueHistoriqueParcelles({
  filtreOuvert,
  formatSuperficie,
  parcellesHistoriques,
  recherche,
  setFiltreOuvert,
  setRecherche,
  setStatutFiltre,
  setTri,
  setTriOuvert,
  statutFiltre,
  tri,
  triOuvert,
}: Props) {
  return (
<View style={styles.container}>

        {}

        <Text style={styles.title}>
          Historique des parcelles
        </Text>

        <Text style={styles.subtitle}>
          Parcelles abandonnées, archivées et supprimées
        </Text>

        {}

        <View style={styles.searchFilterRow}>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={i18n.t('libelles.rechercheParcelle')}
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

        {}

        {filtreOuvert && (
          <View style={styles.panel}>

            <Text style={styles.panelTitle}>
              Filtrer l&apos;historique
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

        {}

        {triOuvert && (
          <View style={styles.panel}>

            <Text style={styles.panelTitle}>
              Trier l&apos;historique
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

        {}

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
                      {formatDate(item.creeA)}
                    </Text>
                  )}

                  {/* DATE MODIFICATION */}

                  {item.modifieA && (
                    <Text style={styles.info}>
                      Modifiée le :{' '}
                      {formatDate(item.modifieA)}
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
                ? i18n.t('parcelles.aucuneHistorique')
                : statutFiltre !== 'TOUS'
                ? i18n.t('parcelles.aucuneStatut')
                : i18n.t('parcelles.aucuneParcelleLHistorique')}
            </Text>

          </View>
        )}

        {}

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
