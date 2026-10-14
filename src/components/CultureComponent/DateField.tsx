import { CalendarDays, ChevronRight } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/theme';
import { styles } from '@/screens/CultureScreen/CultureCreateScreen.styles';

import React from 'react';
export function DateField({
  label,
  value,
  selected,
  onPress,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  iconColor: string;
}) {
  return (
    <View
      style={styles.formGroup}
    >
      <View
        style={styles.labelRow}
      >
        {icon || (
          <CalendarDays
            size={15}
            color={iconColor}
          />
        )}

        <Text
          style={styles.label}
        >
          {label}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.78}
        style={[
          styles.dateInput,
          selected &&
            styles.dateInputSelected,
        ]}
        onPress={onPress}
      >
        <View
          style={styles.dateInputLeft}
        >
          <CalendarDays
            size={17}
            color={
              selected
                ? colors.primary[700]
                : '#7D897F'
            }
          />

          <Text
            style={[
              styles.dateText,
              selected &&
                styles.dateTextSelected,
            ]}
          >
            {value}
          </Text>
        </View>

        <ChevronRight
          size={17}
          color="#7D897F"
        />
      </TouchableOpacity>
    </View>
  );
}
