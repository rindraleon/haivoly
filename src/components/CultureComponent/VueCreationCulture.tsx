


import { styles } from '@/screens/CultureScreen/CultureCreateScreen.styles';
import type { CulturePayload, Culture } from '@/types';
import { colors } from '@/theme';
import type { UseMutationResult } from '@tanstack/react-query';
import { Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';


import { VueCreationCulture1 } from '@/components/CultureComponent/VueCreationCulture1';
type Props = {
  createCulture: UseMutationResult<Culture, Error, { parcelleId: string; body: CulturePayload; }, unknown>;
  currentStep: number;
  datePicker: "plantation" | "recolte" | null;
  datePlantation: Date | null;
  datePrevueRecolte: Date | null;
  demanderDelimitation: boolean;
  description: string;
  enregistrer: () => void;
  formaterDate: (date: Date | null) => string;
  goBackStep: () => void;
  goToStep2: () => void;
  goToStep3: () => void;
  hasDates: boolean;
  nom: string;
  parcelleId: string;
  parcelleNom: string | undefined;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setDatePicker: Dispatch<SetStateAction<"plantation" | "recolte" | null>>;
  setDatePlantation: Dispatch<SetStateAction<Date | null>>;
  setDatePrevueRecolte: Dispatch<SetStateAction<Date | null>>;
  setDemanderDelimitation: Dispatch<SetStateAction<boolean>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setNom: Dispatch<SetStateAction<string>>;
  setStade: Dispatch<SetStateAction<string>>;
  setType: Dispatch<SetStateAction<string>>;
  setVariete: Dispatch<SetStateAction<string>>;
  stade: string;
  stepLabels: string[];
  type: string;
  variete: string;
};

export function VueCreationCulture({
  createCulture,
  currentStep,
  datePicker,
  datePlantation,
  datePrevueRecolte,
  demanderDelimitation,
  description,
  enregistrer,
  formaterDate,
  goBackStep,
  goToStep2,
  goToStep3,
  hasDates,
  nom,
  parcelleId,
  parcelleNom,
  setCurrentStep,
  setDatePicker,
  setDatePlantation,
  setDatePrevueRecolte,
  setDemanderDelimitation,
  setDescription,
  setNom,
  setStade,
  setType,
  setVariete,
  stade,
  stepLabels,
  type,
  variete,
}: Props) {
  return (
<KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={goBackStep}
            style={styles.headerButton}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>
          </TouchableOpacity>

          <View
            style={styles.headerContent}
          >
            <Text
              style={styles.headerTitle}
            >
              Nouvelle culture
            </Text>

            <Text
              style={styles.headerSubtitle}
            >
              Étape {currentStep} sur 3
            </Text>
          </View>

          <View
            style={styles.headerLeaf}
          >
            <Sprout
              size={18}
              color={
                colors.primary[700]
              }
            />
          </View>
        </View>

        <VueCreationCulture1
          createCulture={createCulture}
          currentStep={currentStep}
          datePicker={datePicker}
          datePlantation={datePlantation}
          datePrevueRecolte={datePrevueRecolte}
          demanderDelimitation={demanderDelimitation}
          description={description}
          enregistrer={enregistrer}
          formaterDate={formaterDate}
          goBackStep={goBackStep}
          goToStep2={goToStep2}
          goToStep3={goToStep3}
          hasDates={hasDates}
          nom={nom}
          parcelleId={parcelleId}
          parcelleNom={parcelleNom}
          setCurrentStep={setCurrentStep}
          setDatePicker={setDatePicker}
          setDatePlantation={setDatePlantation}
          setDatePrevueRecolte={setDatePrevueRecolte}
          setDemanderDelimitation={setDemanderDelimitation}
          setDescription={setDescription}
          setNom={setNom}
          setStade={setStade}
          setType={setType}
          setVariete={setVariete}
          stade={stade}
          stepLabels={stepLabels}
          type={type}
          variete={variete}
        />
      </KeyboardAvoidingView>
  );
}
