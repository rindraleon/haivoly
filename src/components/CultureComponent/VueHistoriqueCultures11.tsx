/**
 * Section `VueHistoriqueCultures11` extraite de `VueHistoriqueCultures1`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { styles } from '@/screens/CultureScreen/CultureHistoryScreen.styles';
import type { Dispatch, SetStateAction } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  delimitationFiltre: string;
  setDelimitationFiltre: Dispatch<SetStateAction<string>>;
  setFiltreOuvert: Dispatch<SetStateAction<boolean>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setStatutFiltre: Dispatch<SetStateAction<string>>;
  setTypeFiltre: Dispatch<SetStateAction<string>>;
  statutFiltre: string;
  typeFiltre: string;
  typesDisponibles: string[];
};

export function VueHistoriqueCultures11({
  delimitationFiltre,
  setDelimitationFiltre,
  setFiltreOuvert,
  setRecherche,
  setStatutFiltre,
  setTypeFiltre,
  statutFiltre,
  typeFiltre,
  typesDisponibles,
}: Props) {
  return (
<View
                  style={
                    styles.panel
                  }
                >

                  <Text
                    style={
                      styles.panelTitle
                    }
                  >
                    Filtrer l&apos;historique
                  </Text>


                  <Text
                    style={
                      styles.panelLabel
                    }
                  >
                    Statut
                  </Text>


                  <View
                    style={
                      styles.optionsContainer
                    }
                  >

                    {[
                      'TOUS',
                      'RECOLTEE',
                      'ABANDONNEE',
                      'SUPPRIMEE',
                    ].map(
                      (statut) => (

                        <TouchableOpacity
                          key={
                            statut
                          }

                          style={[
                            styles.optionButton,

                            statutFiltre ===
                              statut &&
                              styles.optionButtonActive,
                          ]}

                          onPress={() =>
                            setStatutFiltre(
                              statut,
                            )
                          }
                        >

                          <Text
                            style={[
                              styles.optionText,

                              statutFiltre ===
                                statut &&
                                styles.optionTextActive,
                            ]}
                          >
                            {statut ===
                            'TOUS'
                              ? 'Toutes'
                              : statut}
                          </Text>

                        </TouchableOpacity>

                      ),
                    )}

                  </View>


                  <Text
                    style={
                      styles.panelLabel
                    }
                  >
                    Type de culture
                  </Text>


                  <View
                    style={
                      styles.optionsContainer
                    }
                  >

                    <TouchableOpacity
                      style={[
                        styles.optionButton,

                        typeFiltre ===
                          'TOUS' &&
                          styles.optionButtonActive,
                      ]}

                      onPress={() =>
                        setTypeFiltre(
                          'TOUS',
                        )
                      }
                    >

                      <Text
                        style={[
                          styles.optionText,

                          typeFiltre ===
                            'TOUS' &&
                            styles.optionTextActive,
                        ]}
                      >
                        Tous
                      </Text>

                    </TouchableOpacity>


                    {typesDisponibles.map(
                      (type) => (

                        <TouchableOpacity
                          key={
                            type
                          }

                          style={[
                            styles.optionButton,

                            typeFiltre ===
                              type &&
                              styles.optionButtonActive,
                          ]}

                          onPress={() =>
                            setTypeFiltre(
                              type,
                            )
                          }
                        >

                          <Text
                            style={[
                              styles.optionText,

                              typeFiltre ===
                                type &&
                                styles.optionTextActive,
                            ]}
                          >
                            {type}
                          </Text>

                        </TouchableOpacity>

                      ),
                    )}

                  </View>


                  <Text
                    style={
                      styles.panelLabel
                    }
                  >
                    Délimitation GPS
                  </Text>


                  <View
                    style={
                      styles.optionsContainer
                    }
                  >

                    {[
                      'TOUTES',
                      'DELIMITEES',
                      'NON_DELIMITEES',
                    ].map(
                      (option) => (

                        <TouchableOpacity
                          key={
                            option
                          }

                          style={[
                            styles.optionButton,

                            delimitationFiltre ===
                              option &&
                              styles.optionButtonActive,
                          ]}

                          onPress={() =>
                            setDelimitationFiltre(
                              option,
                            )
                          }
                        >

                          <Text
                            style={[
                              styles.optionText,

                              delimitationFiltre ===
                                option &&
                                styles.optionTextActive,
                            ]}
                          >
                            {option ===
                            'TOUTES'
                              ? 'Toutes'
                              : option ===
                                'DELIMITEES'
                              ? 'Délimitées'
                              : 'Non délimitées'}
                          </Text>

                        </TouchableOpacity>

                      ),
                    )}

                  </View>


                  <TouchableOpacity
                    style={
                      styles.resetButton
                    }

                    onPress={() => {

                      setStatutFiltre(
                        'TOUS',
                      );

                      setTypeFiltre(
                        'TOUS',
                      );

                      setDelimitationFiltre(
                        'TOUTES',
                      );

                      setRecherche(
                        '',
                      );

                    }}
                  >

                    <Text
                      style={
                        styles.resetButtonText
                      }
                    >
                      Réinitialiser les filtres
                    </Text>

                  </TouchableOpacity>


                  <TouchableOpacity
                    onPress={() =>
                      setFiltreOuvert(
                        false,
                      )
                    }
                  >

                    <Text
                      style={
                        styles.closeButton
                      }
                    >
                      Fermer
                    </Text>

                  </TouchableOpacity>

                </View>
  );
}
