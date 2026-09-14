import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import type { StatutParcelle } from '@/api/parcelles';
import { useParcelles, useUpdateParcelle, } from '@/hooks/useParcelles';

const formatSuperficie = (superficie?: number) => {
  if (superficie === undefined || superficie === null) {
    return null;
  }

  return {
    m2: superficie,
    are: superficie / 100,
    ha: superficie / 10000,
  };
};

export default function ParcellesScreen() {
  const {
    data: parcelles,
    isLoading,
    isError,
    refetch,
  } = useParcelles();

  const updateParcelleMutation =
  useUpdateParcelle();

  const parcellesActives = (parcelles ?? []).filter(
  (parcelle) => parcelle.statut === 'ACTIVE'
);

const [recherche, setRecherche] = useState('');

const [statutFiltre, setStatutFiltre] =
  useState<StatutParcelle | 'TOUTES'>('TOUTES');

const [typeSolFiltre, setTypeSolFiltre] =
  useState<string>('TOUS');

const [superficieMin, setSuperficieMin] =
  useState('');

const [superficieMax, setSuperficieMax] =
  useState('');

const rechercheNormalisee = recherche
  .trim()
  .toLowerCase();

const [filtreOuvert, setFiltreOuvert] =
  useState(false);

const [triOuvert, setTriOuvert] =
  useState(false);


  const [tri, setTri] = useState<
  | 'DEFAUT'
  | 'DATE_CREATION_RECENTE'
  | 'DATE_CREATION_ANCIENNE'
  | 'DATE_MODIFICATION_RECENTE'
  | 'DATE_MODIFICATION_ANCIENNE'
  | 'SUPERFICIE_CROISSANTE'
  | 'SUPERFICIE_DECROISSANTE'
  | 'NOM_AZ'
  | 'NOM_ZA'
>('DEFAUT');


const parcellesFiltrees = parcellesActives.filter((parcelle) => {
    // ==========================================
    // RECHERCHE
    // ==========================================

    const correspondALaRecherche =
      rechercheNormalisee === '' ||
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
        .includes(rechercheNormalisee);

    // ==========================================
    // FILTRE STATUT
    // ==========================================

    const correspondAuStatut =
      statutFiltre === 'TOUTES' ||
      parcelle.statut === statutFiltre;

    // ==========================================
    // FILTRE TYPE DE SOL
    // ==========================================

    const correspondAuTypeSol =
      typeSolFiltre === 'TOUS' ||
      parcelle.typeSol === typeSolFiltre;

    // ==========================================
    // FILTRE SUPERFICIE
    // ==========================================

    const superficie = parcelle.superficie ?? 0;

    const min =
      superficieMin === ''
        ? null
        : Number(superficieMin);

    const max =
      superficieMax === ''
        ? null
        : Number(superficieMax);

    const correspondALaSuperficieMin =
      min === null || superficie >= min;

    const correspondALaSuperficieMax =
      max === null || superficie <= max;

    return (
      correspondALaRecherche &&
      correspondAuStatut &&
      correspondAuTypeSol &&
      correspondALaSuperficieMin &&
      correspondALaSuperficieMax
    );
  })
  .sort((a, b) => {

    // ==========================================
    // TRI
    // ==========================================

    switch (tri) {

      case 'DEFAUT':
        return 0;

      // DATE DE CREATION : plus récente
      case 'DATE_CREATION_RECENTE':
        return (
          new Date(b.creeA ?? 0).getTime() -
          new Date(a.creeA ?? 0).getTime()
        );

      // DATE DE CREATION : plus ancienne
      case 'DATE_CREATION_ANCIENNE':
        return (
          new Date(a.creeA ?? 0).getTime() -
          new Date(b.creeA ?? 0).getTime()
        );

      // DATE DE MODIFICATION : plus récente
      case 'DATE_MODIFICATION_RECENTE':
        return (
          new Date(b.modifieA ?? 0).getTime() -
          new Date(a.modifieA ?? 0).getTime()
        );

      // DATE DE MODIFICATION : plus ancienne
      case 'DATE_MODIFICATION_ANCIENNE':
        return (
          new Date(a.modifieA ?? 0).getTime() -
          new Date(b.modifieA ?? 0).getTime()
        );

      // SUPERFICIE : petite → grande
      case 'SUPERFICIE_CROISSANTE':
        return (
          (a.superficie ?? 0) -
          (b.superficie ?? 0)
        );

      // SUPERFICIE : grande → petite
      case 'SUPERFICIE_DECROISSANTE':
        return (
          (b.superficie ?? 0) -
          (a.superficie ?? 0)
        );

      // NOM : A → Z
      case 'NOM_AZ':
        return a.nom.localeCompare(b.nom);

      // NOM : Z → A
      case 'NOM_ZA':
        return b.nom.localeCompare(a.nom);

      default:
        return 0;
    }
  });

console.log('RECHERCHE:', recherche);
console.log(
  'PARCELLES TROUVEES:',
  parcellesFiltrees.map((p) => p.nom),
);

  const handleChangeStatus = (
  id: string,
  nom: string,
  statut: 'ACTIVE' | 'ABANDONNEE' | 'ARCHIVEE',
) => {
  Alert.alert(
    'Modifier le statut',
    `Voulez-vous changer le statut de "${nom}" vers ${statut} ?`,
    [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Confirmer',
        onPress: () => {
          updateParcelleMutation.mutate(
            {
              id,
              data: {
                statut,
              },
            },
            {
              onSuccess: () => {
                Alert.alert(
                  'Succès',
                  `Le statut de "${nom}" est maintenant ${statut}.`,
                );
              },

              onError: (error: any) => {
                console.log(
                  'UPDATE STATUS ERROR:',
                  error?.response?.data || error,
                );

                Alert.alert(
                  'Erreur',
                  'Impossible de modifier le statut.',
                );
              },
            },
          );
        },
      },
    ],
  );
};

  if (isLoading) {

    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text>
          Chargement des parcelles...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>
          Impossible de récupérer les parcelles.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={styles.container}>

  <View style={styles.searchFilterRow}>

  {/* RECHERCHE */}
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Rechercher une parcelle..."
      value={recherche}
      onChangeText={setRecherche}
    />
  </View>

  {/* FILTRE */}
  <TouchableOpacity
    style={[
      styles.actionButton,
      filtreOuvert && styles.actionButtonActive,
    ]}
    onPress={() => {
      setFiltreOuvert(!filtreOuvert);
      setTriOuvert(false);
    }}
  >
    <Text
      style={[
        styles.actionButtonText,
        filtreOuvert && styles.actionButtonTextActive,
      ]}
    >
      Filtre
    </Text>
  </TouchableOpacity>

  {/* TRI */}
  <TouchableOpacity
    style={[
      styles.actionButton,
      triOuvert && styles.actionButtonActive,
    ]}
    onPress={() => {
      setTriOuvert(!triOuvert);
      setFiltreOuvert(false);
    }}
  >
    <Text
      style={[
        styles.actionButtonText,
        triOuvert && styles.actionButtonTextActive,
      ]}
    >
      Tri
    </Text>
  </TouchableOpacity>
</View>

{/* PANNEAU FILTRE */}
{filtreOuvert && (
  <View style={styles.filterPanel}>

    <Text style={styles.filterTitle}>
      Filtrer les parcelles
    </Text>

    {/* STATUT */}
    <Text style={styles.filterLabel}>
      Statut
    </Text>

    <View style={styles.filterOptions}>
      {[
        'TOUTES',
        'ACTIVE',
        'ABANDONNEE',
        'ARCHIVEE',
        'SUPPRIMEE',
      ].map((statut) => (
        <TouchableOpacity
          key={statut}
          style={[
            styles.filterOption,
            statutFiltre === statut &&
              styles.filterOptionActive,
          ]}
          onPress={() =>
            setStatutFiltre(
              statut as StatutParcelle | 'TOUTES'
            )
          }
        >
          <Text
            style={[
              styles.filterOptionText,
              statutFiltre === statut &&
                styles.filterOptionTextActive,
            ]}
          >
            {statut}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* TYPE DE SOL */}
    <Text style={styles.filterLabel}>
      Type de sol
    </Text>

    <View style={styles.filterOptions}>

      <TouchableOpacity
        style={[
          styles.filterOption,
          typeSolFiltre === 'TOUS' &&
            styles.filterOptionActive,
        ]}
        onPress={() => setTypeSolFiltre('TOUS')}
      >
        <Text
          style={
            typeSolFiltre === 'TOUS'
              ? styles.filterOptionTextActive
              : styles.filterOptionText
          }
        >
          TOUS
        </Text>
      </TouchableOpacity>

      {Array.from(
        new Set(
          (parcelles ?? [])
            .map((p) => p.typeSol)
            .filter(
              (type): type is string => !!type
            )
        )
      ).map((typeSol) => (
        <TouchableOpacity
          key={typeSol}
          style={[
            styles.filterOption,
            typeSolFiltre === typeSol &&
              styles.filterOptionActive,
          ]}
          onPress={() => setTypeSolFiltre(typeSol)}
        >
          <Text
            style={
              typeSolFiltre === typeSol
                ? styles.filterOptionTextActive
                : styles.filterOptionText
            }
          >
            {typeSol}
          </Text>
        </TouchableOpacity>
      ))}

    </View>

    {/* SUPERFICIE */}
    <Text style={styles.filterLabel}>
      Superficie (m²)
    </Text>

    <View style={styles.superficieFilterRow}>

      <TextInput
        style={styles.superficieInput}
        placeholder="Minimum"
        value={superficieMin}
        onChangeText={setSuperficieMin}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.superficieInput}
        placeholder="Maximum"
        value={superficieMax}
        onChangeText={setSuperficieMax}
        keyboardType="numeric"
      />

    </View>

    {/* BOUTONS */}
    <View style={styles.filterActions}>

      <TouchableOpacity
        style={styles.resetFilterButton}
        onPress={() => {
          setStatutFiltre('TOUTES');
          setTypeSolFiltre('TOUS');
          setSuperficieMin('');
          setSuperficieMax('');
        }}
      >
        <Text style={styles.resetFilterText}>
          Réinitialiser
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.applyFilterButton}
        onPress={() => {
          setFiltreOuvert(false);
        }}
      >
        <Text style={styles.applyFilterText}>
          Appliquer
        </Text>
      </TouchableOpacity>

    </View>

  </View>
)}

{/* PANNEAU TRI */}
{triOuvert && (
  <View style={styles.sortPanel}>

    <Text style={styles.sortTitle}>
      Trier les parcelles
    </Text>

    {/* DATE DE CREATION */}
    <Text style={styles.sortLabel}>
      Date de création
    </Text>

    <View style={styles.sortOptions}>

      <TouchableOpacity
        style={[
          styles.sortOption,
          tri === 'DATE_CREATION_RECENTE' &&
            styles.sortOptionActive,
        ]}
        onPress={() =>
          setTri('DATE_CREATION_RECENTE')
        }
      >
        <Text
          style={
            tri === 'DATE_CREATION_RECENTE'
              ? styles.sortOptionTextActive
              : styles.sortOptionText
          }
        >
          Plus récente
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sortOption,
          tri === 'DATE_CREATION_ANCIENNE' &&
            styles.sortOptionActive,
        ]}
        onPress={() =>
          setTri('DATE_CREATION_ANCIENNE')
        }
      >
        <Text
          style={
            tri === 'DATE_CREATION_ANCIENNE'
              ? styles.sortOptionTextActive
              : styles.sortOptionText
          }
        >
          Plus ancienne
        </Text>
      </TouchableOpacity>

    </View>

    {/* DATE DE MODIFICATION */}
    <Text style={styles.sortLabel}>
      Date de modification
    </Text>

    <View style={styles.sortOptions}>

      <TouchableOpacity
        style={[
          styles.sortOption,
          tri === 'DATE_MODIFICATION_RECENTE' &&
            styles.sortOptionActive,
        ]}
        onPress={() =>
          setTri('DATE_MODIFICATION_RECENTE')
        }
      >
        <Text
          style={
            tri === 'DATE_MODIFICATION_RECENTE'
              ? styles.sortOptionTextActive
              : styles.sortOptionText
          }
        >
          Plus récente
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sortOption,
          tri === 'DATE_MODIFICATION_ANCIENNE' &&
            styles.sortOptionActive,
        ]}
        onPress={() =>
          setTri('DATE_MODIFICATION_ANCIENNE')
        }
      >
        <Text
          style={
            tri === 'DATE_MODIFICATION_ANCIENNE'
              ? styles.sortOptionTextActive
              : styles.sortOptionText
          }
        >
          Plus ancienne
        </Text>
      </TouchableOpacity>

    </View>

    {/* SUPERFICIE */}
    <Text style={styles.sortLabel}>
      Superficie
    </Text>

    <View style={styles.sortOptions}>

      <TouchableOpacity
        style={[
          styles.sortOption,
          tri === 'SUPERFICIE_CROISSANTE' &&
            styles.sortOptionActive,
        ]}
        onPress={() =>
          setTri('SUPERFICIE_CROISSANTE')
        }
      >
        <Text
          style={
            tri === 'SUPERFICIE_CROISSANTE'
              ? styles.sortOptionTextActive
              : styles.sortOptionText
          }
        >
          Petite → Grande
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sortOption,
          tri === 'SUPERFICIE_DECROISSANTE' &&
            styles.sortOptionActive,
        ]}
        onPress={() =>
          setTri('SUPERFICIE_DECROISSANTE')
        }
      >
        <Text
          style={
            tri === 'SUPERFICIE_DECROISSANTE'
              ? styles.sortOptionTextActive
              : styles.sortOptionText
          }
        >
          Grande → Petite
        </Text>
      </TouchableOpacity>

    </View>

    {/* NOM */}
    <Text style={styles.sortLabel}>
      Nom
    </Text>

    <View style={styles.sortOptions}>

      <TouchableOpacity
        style={[
          styles.sortOption,
          tri === 'NOM_AZ' &&
            styles.sortOptionActive,
        ]}
        onPress={() => setTri('NOM_AZ')}
      >
        <Text
          style={
            tri === 'NOM_AZ'
              ? styles.sortOptionTextActive
              : styles.sortOptionText
          }
        >
          A → Z
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sortOption,
          tri === 'NOM_ZA' &&
            styles.sortOptionActive,
        ]}
        onPress={() => setTri('NOM_ZA')}
      >
        <Text
          style={
            tri === 'NOM_ZA'
              ? styles.sortOptionTextActive
              : styles.sortOptionText
          }
        >
          Z → A
        </Text>
      </TouchableOpacity>

    </View>

    {/* FERMER */}
    <TouchableOpacity
      style={styles.closeSortButton}
      onPress={() => setTriOuvert(false)}
    >
      <Text style={styles.closeSortText}>
        Fermer
      </Text>
    </TouchableOpacity>

    {/* REINITIALISER */}
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


  {parcellesFiltrees.length > 0 ? (
<FlatList
  data={parcellesFiltrees}
  extraData={recherche}
  keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const superficie =
              formatSuperficie(item.superficie);

            return (
              <View style={styles.card}>

                {/* NOM */}
                <Text style={styles.nom}>
                  {item.nom}
                </Text>
                <Text style={styles.statut}>
                  Statut : {item.statut}
                </Text>

                <TouchableOpacity
  style={styles.detailButton}
  onPress={() =>
    router.push({
      pathname: '/detail-parcelle',
      params: {
        parcelleId: item.id,
      },
    })
  }
>
  <Text style={styles.detailText}>
    Voir le détail
  </Text>
</TouchableOpacity>

                {item.statut === 'SUPPRIMEE' && item.raisonSuppression && (
  <View style={styles.suppressionInfo}>
    <Text style={styles.suppressionTitle}>
      Raison de suppression
    </Text>

    <Text style={styles.suppressionText}>
      {item.raisonSuppression}
    </Text>
  </View>
)}

                {/* DESCRIPTION */}
                {item.description && (
                  <Text style={styles.description}>
                    {item.description}
                  </Text>
                )}

                {/* SUPERFICIE */}
                {superficie && (
                  <View style={styles.superficieContainer}>
                    <Text style={styles.superficieTitle}>
                      Superficie
                    </Text>

                    <Text style={styles.superficieInfo}>
                      {superficie.m2.toFixed(2)} m²
                    </Text>

                    <Text style={styles.superficieInfo}>
                      {superficie.are.toFixed(2)} a
                    </Text>

                    <Text style={styles.superficieInfo}>
                      {superficie.ha.toFixed(4)} ha
                    </Text>
                  </View>
                )}

                {/* TYPE DE SOL */}
                {item.typeSol && (
                  <Text style={styles.info}>
                    Type de sol : {item.typeSol}
                  </Text>
                )}
                {/* CHANGEMENT DE STATUT */}

{item.statut === 'ACTIVE' && (
  <>
    <TouchableOpacity
      style={styles.statusButton}
      onPress={() =>
        handleChangeStatus(
          item.id,
          item.nom,
          'ABANDONNEE',
        )
      }
    >
      <Text style={styles.statusButtonText}>
        Marquer comme abandonnée
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.statusButton}
      onPress={() =>
        handleChangeStatus(
          item.id,
          item.nom,
          'ARCHIVEE',
        )
      }
    >
      <Text style={styles.statusButtonText}>
        Archiver
      </Text>
    </TouchableOpacity>
  </>
)}

{item.statut === 'ABANDONNEE' && (
  <>
    <TouchableOpacity
      style={styles.statusButton}
      onPress={() =>
        handleChangeStatus(
          item.id,
          item.nom,
          'ACTIVE',
        )
      }
    >
      <Text style={styles.statusButtonText}>
        Réactiver
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.statusButton}
      onPress={() =>
        handleChangeStatus(
          item.id,
          item.nom,
          'ARCHIVEE',
        )
      }
    >
      <Text style={styles.statusButtonText}>
        Archiver
      </Text>
    </TouchableOpacity>
  </>
)}

{item.statut === 'ARCHIVEE' && (
  <TouchableOpacity
    style={styles.statusButton}
    onPress={() =>
      handleChangeStatus(
        item.id,
        item.nom,
        'ACTIVE',
      )
    }
  >
    <Text style={styles.statusButtonText}>
      Réactiver
    </Text>
  </TouchableOpacity>
)}
                {/* MODIFIER */}
                {item.statut !== 'SUPPRIMEE' && (
  <TouchableOpacity
    style={styles.editButton}
    onPress={() =>
      router.push({
        pathname: '/modifier-parcelle',
        params: {
          parcelleId: item.id,
        },
      })
    }
  >
    <Text style={styles.editText}>
      Modifier
    </Text>
  </TouchableOpacity>
)}

              {item.statut !== 'SUPPRIMEE' && (
  <TouchableOpacity
    style={styles.deleteButton}
    onPress={() =>
      router.push({
        pathname: '/confirmation-suppression',
        params: {
          parcelleId: item.id,
          nom: item.nom,
        },
      })
    }
  >
    <Text style={styles.deleteText}>
      Supprimer
    </Text>
  </TouchableOpacity>
)}

              </View>
            );
          }}
        />
      ) : (
        <View style={styles.empty}>
  <Text style={styles.emptyText}>
  {recherche.trim() !== ''
    ? 'Aucune parcelle ne correspond à votre recherche.'
    : 'Aucune parcelle ne correspond aux filtres sélectionnés.'}
</Text>
        </View>
      )}

      {/* HISTORIQUE */}
      <TouchableOpacity
  style={styles.historyButton}
  onPress={() =>
    router.push('/historique-parcelles')
  }
>
  <Text style={styles.historyText}>
    Historique des parcelles
  </Text>
</TouchableOpacity>

      {/* AJOUTER */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          router.push('/ajout-parcelle')
        }
      >
        <Text style={styles.addText}>
          Ajouter une parcelle
        </Text>
      </TouchableOpacity>

      {/* RETOUR */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text>
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
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
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

  list: {
    paddingBottom: 130,
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

resetSortButton: {
  marginTop: 10,
  height: 45,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#d32f2f',
  justifyContent: 'center',
  alignItems: 'center',
},

historyButton: {
  position: 'absolute',
  bottom: 125,
  left: 20,
  right: 20,
  height: 45,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#2e7d32',
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
},

historyText: {
  color: '#2e7d32',
  fontWeight: 'bold',
  fontSize: 15,
},

resetSortText: {
  color: '#d32f2f',
  fontWeight: 'bold',
},

  card: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
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

  nom: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    marginBottom: 8,
  },

statusButton: {
  height: 45,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#f57c00',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
},

filterPanel: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 15,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#ddd',
},

filterTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 15,
},

sortPanel: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 15,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#ddd',
},

sortTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 15,
},

sortLabel: {
  fontSize: 15,
  fontWeight: 'bold',
  marginTop: 10,
  marginBottom: 8,
},

sortOptions: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},

sortOption: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#2e7d32',
},

sortOptionActive: {
  backgroundColor: '#2e7d32',
},

sortOptionText: {
  color: '#2e7d32',
},

sortOptionTextActive: {
  color: '#fff',
},

closeSortButton: {
  marginTop: 20,
  height: 45,
  borderRadius: 8,
  backgroundColor: '#2e7d32',
  justifyContent: 'center',
  alignItems: 'center',
},

closeSortText: {
  color: '#fff',
  fontWeight: 'bold',
},

actionButtonActive: {
  backgroundColor: '#2e7d32',
},

actionButtonTextActive: {
  color: '#fff',
},

filterActions: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 20,
},

applyFilterButton: {
  flex: 1,
  height: 45,
  borderRadius: 8,
  backgroundColor: '#2e7d32',
  justifyContent: 'center',
  alignItems: 'center',
},

applyFilterText: {
  color: '#fff',
  fontWeight: 'bold',
},

filterLabel: {
  fontSize: 15,
  fontWeight: 'bold',
  marginTop: 10,
  marginBottom: 8,
},

filterOptions: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},

filterOption: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#2e7d32',
},

filterOptionActive: {
  backgroundColor: '#2e7d32',
},

filterOptionText: {
  color: '#2e7d32',
},

filterOptionTextActive: {
  color: '#fff',
},

superficieFilterRow: {
  flexDirection: 'row',
  gap: 10,
},

superficieInput: {
  flex: 1,
  height: 45,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
},

resetFilterButton: {
  flex: 1,
  height: 45,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#d32f2f',
  justifyContent: 'center',
  alignItems: 'center',
},

resetFilterText: {
  color: '#d32f2f',
  fontWeight: 'bold',
},

statusButtonText: {
  color: '#f57c00',
  fontSize: 15,
  fontWeight: 'bold',
},

  info: {
    fontSize: 14,
    marginTop: 8,
  },

  superficieContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
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

actionButtonText: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#2e7d32',
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

  editButton: {
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  editText: {
    color: '#1565c0',
    fontSize: 15,
    fontWeight: 'bold',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterScroll: {
  marginBottom: 15,
},

filterContainer: {
  gap: 8,
  paddingRight: 10,
},

filterButton: {
  paddingHorizontal: 16,
  paddingVertical: 9,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#2e7d32',
  backgroundColor: '#fff',
},

filterButtonActive: {
  backgroundColor: '#2e7d32',
},

filterText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#2e7d32',
},

filterTextActive: {
  color: '#fff',
},

  emptyText: {
    fontSize: 17,
  },

  addButton: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  backButton: {
    position: 'absolute',
    bottom: 15,
    left: 20,
  },

  deleteButton: {
  height: 45,
  borderRadius: 8,
  backgroundColor: '#d32f2f',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
},

deleteText: {
  color: '#fff',
  fontSize: 15,
  fontWeight: 'bold',
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

  statut: {
  fontSize: 14,
  fontWeight: 'bold',
  marginBottom: 8,
},
});