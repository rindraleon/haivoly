/**
 * Sous-composant `InterventionCard` extrait de `InterventionListScreen`.
 *
 * Regroupe la présentation d'un élément de liste et ses interactions
 * locales, ce qui allège nettement le composant principal.
 */
import { Badge } from '@/components/CommonComponent/Badge';
import { CalendarDays, ChevronRight, Clock3, FileText, FlaskConical, MapPin, Package, Pencil, Sprout, Trash2 } from 'lucide-react-native';
import { Card } from '@/components/CommonComponent/Card';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/theme';
import { Intervention, StatutCulture, badgeVariant, formaterDate, formaterMontant, interventionDate, libelleStatut } from '@/screens/InterventionScreen/InterventionListScreen.helpers';
import { PhotosIntervention } from '@/components/InterventionComponent/PhotosIntervention';
import { styles } from '@/screens/InterventionScreen/InterventionListScreen.styles';

export function InterventionCard({
  intervention,
  parcelleId,
  cultureId,
  cultureNom,
  parcelleNom,
  statutCulture,
  modificationAutorisee,
  onModifier,
  onSupprimer,
}: {
  intervention: Intervention;
  parcelleId: string;
  cultureId: string;
  cultureNom: string;
  parcelleNom: string;
  statutCulture?: StatutCulture;
  modificationAutorisee: boolean;
  onModifier: (intervention: Intervention) => void;
  onSupprimer: (intervention: Intervention) => void;
}) {
  return (
    <Card style={styles.interventionCard}>
      <View style={styles.interventionHeader}>
        <View style={styles.interventionHeaderLeft}>
          <View style={styles.interventionIcon}>
            <Sprout
              size={21}
              color={colors.primary[600]}
              strokeWidth={2}
            />
          </View>

          <View style={styles.interventionHeaderContent}>
            <Text
              numberOfLines={1}
              style={styles.interventionType}
            >
              {intervention.type || 'Intervention'}
            </Text>

            <View style={styles.interventionSubtitleRow}>
              <Sprout
                size={11}
                color={colors.neutral[500]}
                strokeWidth={2}
              />
              <Text
                numberOfLines={1}
                style={styles.interventionSubtitle}
              >
                {cultureNom || 'Culture'}
              </Text>

              <MapPin
                size={11}
                color={colors.neutral[500]}
                strokeWidth={2}
              />
              <Text
                numberOfLines={1}
                style={styles.interventionSubtitle}
              >
                {parcelleNom || 'Parcelle'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Badge
            label={libelleStatut(statutCulture)}
            variant={badgeVariant(statutCulture)}
            dot
          />
        </View>
      </View>

      <View style={styles.cardSeparator} />

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <View style={styles.infoCardIcon}>
            <CalendarDays
              size={16}
              color={colors.primary[600]}
              strokeWidth={2}
            />
          </View>
          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardLabel}>DATE</Text>
            <Text style={styles.infoCardValue}>
              {formaterDate(interventionDate(intervention))}
            </Text>
          </View>
        </View>

        {intervention.produit ? (
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <FlaskConical
                size={16}
                color={colors.primary[600]}
                strokeWidth={2}
              />
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>PRODUIT</Text>
              <Text
                style={styles.infoCardValue}
                numberOfLines={2}
              >
                {intervention.produit}
              </Text>
            </View>
          </View>
        ) : null}

        {intervention.quantite !== undefined &&
        intervention.quantite !== null ? (
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <Package
                size={16}
                color={colors.primary[600]}
                strokeWidth={2}
              />
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>QUANTITÉ</Text>
              <Text style={styles.infoCardValue}>
                {intervention.quantite}{' '}
                {intervention.unite || ''}
              </Text>
            </View>
          </View>
        ) : null}

        {intervention.cout !== undefined &&
        intervention.cout !== null ? (
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <Text style={styles.currencyIcon}>Ar</Text>
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>COÛT</Text>
              <Text style={styles.infoCardValue}>
                {formaterMontant(intervention.cout)}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.descriptionCard}>
        <View style={styles.descriptionHeader}>
          <View style={styles.infoCardIcon}>
            <FileText
              size={15}
              color={colors.primary[600]}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.infoCardLabel}>DESCRIPTION</Text>
        </View>

        <Text style={styles.interventionDescription}>
          {intervention.description || 'Aucune description.'}
        </Text>
      </View>

      <PhotosIntervention
        parcelleId={parcelleId}
        cultureId={cultureId}
        interventionId={intervention.id}
        modificationAutorisee={modificationAutorisee}
      />

      <View style={styles.cardFooter}>
        <View style={styles.modifiedInfo}>
          <Clock3
            size={14}
            color={colors.neutral[400]}
            strokeWidth={1.9}
          />
          <Text style={styles.modifiedText} numberOfLines={1}>
            Enregistrée le {formaterDate(interventionDate(intervention))}
          </Text>
        </View>

        <View style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Détails</Text>
          <ChevronRight
            size={16}
            color={colors.primary[700]}
            strokeWidth={2.2}
          />
        </View>
      </View>

      {modificationAutorisee ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onModifier(intervention)}
            activeOpacity={0.8}
          >
            <Pencil
              size={16}
              color="#166534"
              strokeWidth={2.1}
            />
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onSupprimer(intervention)}
            activeOpacity={0.8}
          >
            <Trash2
              size={16}
              color="#DC2626"
              strokeWidth={2.1}
            />
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.readOnlyFooter}>
          <Text style={styles.readOnlyFooterText}>
            Lecture seule
          </Text>
        </View>
      )}
    </Card>
  );
}
