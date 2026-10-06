/**
 * Section `Fermerajoutglobal2` extraite de `Fermerajoutglobal`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { styles } from '@/screens/ObservationScreen/ObservationListScreen.styles';


import type { UseQueryResult } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Fermerajoutglobal21 } from '@/components/ObservationComponent/Fermerajoutglobal21';
import type { Culture, Paginated, Parcelle } from '@/types';
type Props = {
  continuerAjoutGlobal: () => void;
  cultureAjout: string;
  culturesAjout: NoInfer<Culture[]>;
  culturesAjoutQuery: UseQueryResult<NoInfer<Culture[]>, Error>;
  fermerAjoutGlobal: () => void;
  parcelleAjout: string;
  parcelles: NoInfer<Parcelle[]>;
  parcellesQuery: UseQueryResult<NoInfer<Paginated<Parcelle>>, Error>;
  selectionCultureAjoutOuverte: boolean;
  selectionParcelleAjoutOuverte: boolean;
  setCultureAjout: Dispatch<SetStateAction<string>>;
  setParcelleAjout: Dispatch<SetStateAction<string>>;
  setSelectionCultureAjoutOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionParcelleAjoutOuverte: Dispatch<SetStateAction<boolean>>;
};

export function Fermerajoutglobal2({
  continuerAjoutGlobal,
  cultureAjout,
  culturesAjout,
  culturesAjoutQuery,
  fermerAjoutGlobal,
  parcelleAjout,
  parcelles,
  parcellesQuery,
  selectionCultureAjoutOuverte,
  selectionParcelleAjoutOuverte,
  setCultureAjout,
  setParcelleAjout,
  setSelectionCultureAjoutOuverte,
  setSelectionParcelleAjoutOuverte,
}: Props) {
  return (
<View
                      style={
                        styles.addSheet
                      }
                    >
                      <View
                        style={
                          styles.sheetHandle
                        }
                      />

                      <View
                        style={
                          styles.sheetHeader
                        }
                      >
                        <View
                          style={
                            styles.addSheetTitleBlock
                          }
                        >
                          <Text
                            style={
                              styles.sheetTitle
                            }
                          >
                            Nouvelle observation
                          </Text>

                          <Text
                            style={
                              styles.sheetSubtitle
                            }
                          >
                            Sélectionnez d&apos;abord la parcelle
                          </Text>
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={
                            fermerAjoutGlobal
                          }
                          style={
                            styles.sheetCloseButton
                          }
                        >
                          <X
                            size={20}
                            color="#374151"
                          />
                        </TouchableOpacity>
                      </View>

                      <Fermerajoutglobal21
                        cultureAjout={cultureAjout}
                        culturesAjout={culturesAjout}
                        culturesAjoutQuery={culturesAjoutQuery}
                        parcelleAjout={parcelleAjout}
                        parcelles={parcelles}
                        parcellesQuery={parcellesQuery}
                        selectionCultureAjoutOuverte={selectionCultureAjoutOuverte}
                        selectionParcelleAjoutOuverte={selectionParcelleAjoutOuverte}
                        setCultureAjout={setCultureAjout}
                        setParcelleAjout={setParcelleAjout}
                        setSelectionCultureAjoutOuverte={setSelectionCultureAjoutOuverte}
                        setSelectionParcelleAjoutOuverte={setSelectionParcelleAjoutOuverte}
                      />

                      <View
                        style={
                          styles.sheetActions
                        }
                      >
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={
                            styles.resetButton
                          }
                          onPress={
                            fermerAjoutGlobal
                          }
                        >
                          <Text
                            style={
                              styles.resetButtonText
                            }
                          >
                            Annuler
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={
                            parcelleAjout &&
                            cultureAjout
                              ? 0.85
                              : 1
                          }
                          disabled={
                            !parcelleAjout ||
                            !cultureAjout
                          }
                          style={[
                            styles.applyButton,
                            (!parcelleAjout ||
                              !cultureAjout) &&
                              styles.applyButtonDisabled,
                          ]}
                          onPress={
                            continuerAjoutGlobal
                          }
                        >
                          <Plus
                            size={18}
                            color={
                              parcelleAjout &&
                              cultureAjout
                                ? '#FFFFFF'
                                : '#9CA3AF'
                            }
                            strokeWidth={2.6}
                          />

                          <Text
                            style={[
                              styles.applyButtonText,
                              (!parcelleAjout ||
                                !cultureAjout) &&
                                styles.applyButtonTextDisabled,
                            ]}
                          >
                            Continuer
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
  );
}
