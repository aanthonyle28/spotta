// Branded types for type safety per CLAUDE.md guidelines
export type Brand<T, B> = T & { __brand: B };

// Domain entity IDs
export type UserId = Brand<string, 'UserId'>;
export type WorkoutId = Brand<string, 'WorkoutId'>;
export type ExerciseId = Brand<string, 'ExerciseId'>;
export type SetEntryId = Brand<string, 'SetEntryId'>;
export type ClubId = Brand<string, 'ClubId'>;
export type MessageId = Brand<string, 'MessageId'>;
export type TemplateId = Brand<string, 'TemplateId'>;
export type ProgressPhotoId = Brand<string, 'ProgressPhotoId'>;
export type MeasurementId = Brand<string, 'MeasurementId'>;
export type PactId = Brand<string, 'PactId'>;
export type LadderId = Brand<string, 'LadderId'>;
export type PRPointId = Brand<string, 'PRPointId'>;
export type EquipmentId = Brand<string, 'EquipmentId'>;
export type MuscleGroupId = Brand<string, 'MuscleGroupId'>;
