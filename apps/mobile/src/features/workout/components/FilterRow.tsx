import { XStack } from 'tamagui';
import { FilterDropdown } from './FilterDropdown';

export interface FilterRowProps {
  categoryOptions: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;

  muscleOptions: string[];
  selectedMuscle: string;
  onMuscleChange: (value: string) => void;

  equipmentOptions: string[];
  selectedEquipment: string;
  onEquipmentChange: (value: string) => void;

  // Optional custom placeholders
  categoryPlaceholder?: string;
  musclePlaceholder?: string;
  equipmentPlaceholder?: string;
}

export function FilterRow({
  categoryOptions,
  selectedCategory,
  onCategoryChange,
  muscleOptions,
  selectedMuscle,
  onMuscleChange,
  equipmentOptions,
  selectedEquipment,
  onEquipmentChange,
  categoryPlaceholder = 'Category',
  musclePlaceholder = 'Muscle',
  equipmentPlaceholder = 'Gear',
}: FilterRowProps) {
  return (
    <XStack
      paddingHorizontal="$4"
      paddingTop="$1"
      paddingBottom="$3"
      space="$3"
      overflow="visible"
      zIndex={1}
    >
      <FilterDropdown
        placeholder={categoryPlaceholder}
        options={categoryOptions}
        value={selectedCategory}
        onValueChange={onCategoryChange}
        accessibilityLabel={`Filter by ${categoryPlaceholder.toLowerCase()}`}
      />

      <FilterDropdown
        placeholder={musclePlaceholder}
        options={muscleOptions}
        value={selectedMuscle}
        onValueChange={onMuscleChange}
        accessibilityLabel={`Filter by ${musclePlaceholder.toLowerCase()}`}
      />

      <FilterDropdown
        placeholder={equipmentPlaceholder}
        options={equipmentOptions}
        value={selectedEquipment}
        onValueChange={onEquipmentChange}
        accessibilityLabel={`Filter by ${equipmentPlaceholder.toLowerCase()}`}
      />
    </XStack>
  );
}
