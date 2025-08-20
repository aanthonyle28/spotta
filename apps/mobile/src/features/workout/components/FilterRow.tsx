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
        placeholder="Category"
        options={categoryOptions}
        value={selectedCategory}
        onValueChange={onCategoryChange}
        accessibilityLabel="Filter by category"
      />

      <FilterDropdown
        placeholder="Muscle"
        options={muscleOptions}
        value={selectedMuscle}
        onValueChange={onMuscleChange}
        accessibilityLabel="Filter by muscle group"
      />

      <FilterDropdown
        placeholder="Gear"
        options={equipmentOptions}
        value={selectedEquipment}
        onValueChange={onEquipmentChange}
        accessibilityLabel="Filter by equipment"
      />
    </XStack>
  );
}
