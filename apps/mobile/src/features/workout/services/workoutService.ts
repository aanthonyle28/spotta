import type {
  ExerciseId,
  WorkoutId,
  SetEntryId,
  TemplateId,
} from '@spotta/shared';
import type {
  ActiveSession,
  Exercise,
  SetData,
  Template,
  CommunityTemplate,
  WorkoutSession,
  SessionExercise,
  PreviousSetData,
  ProgressionSuggestion,
} from '../types';
import type { UserId } from '@spotta/shared';
import {
  mockExercises,
  mockTemplates,
  mockCommunityTemplates,
  mockRecentWorkouts,
  createMockActiveSession,
  createMockSet,
  searchExercises,
  getExercisesByIds,
  mockPreviousExerciseData,
} from './mockData';
import { logger } from '../../../utils/logger';
import { storageService } from './storageService';

// Simulate network delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class WorkoutService {
  private sessionStorage: Map<WorkoutId, ActiveSession> = new Map();
  // Remove internal activeSession state - will be managed by hook only

  constructor() {
    // Mock session initialization now handled entirely by hook
  }

  // Development helper to clear mock session
  clearMockSession() {
    if (process.env.NODE_ENV === 'development') {
      this.sessionStorage.clear();
    }
  }

  // Store session in sessionStorage (for hook initialization)
  async storeSession(session: ActiveSession): Promise<void> {
    this.sessionStorage.set(session.id, session);
  }

  // Exercise operations
  async getAllExercises(): Promise<Exercise[]> {
    await delay(200);
    return mockExercises;
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    await delay(150);
    return searchExercises(query);
  }

  async getExerciseById(id: ExerciseId): Promise<Exercise | null> {
    await delay(100);
    return mockExercises.find((ex) => ex.id === id) || null;
  }

  async createCustomExercise(
    exerciseData: Omit<Exercise, 'id' | 'userId'>
  ): Promise<Exercise> {
    await delay(200);

    const newExercise: Exercise = {
      ...exerciseData,
      id: `custom-${Date.now()}` as ExerciseId,
      userId: 'user-1' as UserId, // In real app, this would come from auth
    };

    // Add to mock exercises (in real app, this would persist to backend)
    mockExercises.push(newExercise);

    return newExercise;
  }

  // Template operations
  async getAllTemplates(): Promise<Template[]> {
    await delay(200);
    return mockTemplates;
  }

  async getTemplateById(id: string): Promise<Template | null> {
    await delay(150);
    return mockTemplates.find((t) => t.id === id) || null;
  }

  async getTemplates(): Promise<Template[]> {
    return this.getAllTemplates();
  }

  async updateTemplateOrder(reorderedTemplates: Template[]): Promise<void> {
    await delay(200);
    // Update the template order in mock storage
    // In real app, this would persist to backend with orderIndex or position
    mockTemplates.splice(0, mockTemplates.length, ...reorderedTemplates);
  }

  async createTemplate(
    templateData: Omit<Template, 'id' | 'userId'>
  ): Promise<Template> {
    await delay(200);

    const newTemplate: Template = {
      ...templateData,
      id: `template-${Date.now()}` as TemplateId,
      userId: 'user-1' as UserId,
    };

    mockTemplates.push(newTemplate);
    return newTemplate;
  }

  async updateTemplate(
    templateId: TemplateId,
    updates: Partial<Template>
  ): Promise<Template> {
    await delay(200);

    const index = mockTemplates.findIndex((t) => t.id === templateId);
    if (index === -1) throw new Error('Template not found');

    mockTemplates[index] = { ...mockTemplates[index], ...updates };
    return mockTemplates[index];
  }

  async deleteTemplate(templateId: TemplateId): Promise<void> {
    await delay(150);

    const index = mockTemplates.findIndex((t) => t.id === templateId);
    if (index === -1) throw new Error('Template not found');

    mockTemplates.splice(index, 1);
  }

  async duplicateTemplate(templateId: TemplateId): Promise<Template> {
    await delay(200);

    const originalTemplate = mockTemplates.find((t) => t.id === templateId);
    if (!originalTemplate) throw new Error('Template not found');

    const duplicatedTemplate: Template = {
      ...originalTemplate,
      id: `template-${Date.now()}` as TemplateId,
      title: `${originalTemplate.title} (Copy)`,
      lastCompleted: undefined, // Reset completion date for duplicate
    };

    mockTemplates.push(duplicatedTemplate);
    return duplicatedTemplate;
  }

  // Community template operations
  async getCommunityTemplates(): Promise<CommunityTemplate[]> {
    await delay(300);
    return mockCommunityTemplates;
  }

  async searchCommunityTemplates(query: string): Promise<CommunityTemplate[]> {
    await delay(200);
    const lowercaseQuery = query.toLowerCase();

    return mockCommunityTemplates.filter(
      (template) =>
        template.title.toLowerCase().includes(lowercaseQuery) ||
        template.author.toLowerCase().includes(lowercaseQuery) ||
        template.tags?.some((tag) =>
          tag.toLowerCase().includes(lowercaseQuery)
        ) ||
        template.exercises.some(
          (ex) =>
            ex.name.toLowerCase().includes(lowercaseQuery) ||
            ex.primaryMuscles.some((muscle) =>
              muscle.toLowerCase().includes(lowercaseQuery)
            )
        )
    );
  }

  async getCommunityTemplateById(
    id: string
  ): Promise<CommunityTemplate | null> {
    await delay(150);
    return mockCommunityTemplates.find((t) => t.id === id) || null;
  }

  async startFromTemplate(templateId: string): Promise<ActiveSession> {
    await delay(300);

    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const exerciseIds = template.exercises.map((ex) => ex.exerciseId);
    const exercises = getExercisesByIds(exerciseIds);

    if (exercises.length === 0) {
      throw new Error('No exercises found in template');
    }

    const session = createMockActiveSession(exercises);
    session.name = template.title;
    session.templateId = template.id;

    // Transfer rest times from template to session exercises
    session.exercises = session.exercises.map((sessionExercise, index) => {
      const templateExercise = template.exercises[index];
      return {
        ...sessionExercise,
        restPreset: templateExercise?.restTime || sessionExercise.restPreset,
      };
    });

    // Set template rest time based on the first exercise or default
    session.templateRestTime = template.exercises[0]?.restTime || 120;

    logger.debug(
      `[StartFromTemplate] Created session with templateId: ${session.templateId} for template: ${template.title}`
    );

    // Only store in sessionStorage - activeSession managed by hook
    this.sessionStorage.set(session.id, session);

    return session;
  }

  // Session operations
  async startSession(
    exerciseIds: ExerciseId[],
    name?: string
  ): Promise<ActiveSession> {
    await delay(300);

    const exercises = getExercisesByIds(exerciseIds);
    if (exercises.length === 0) {
      throw new Error('No exercises found');
    }

    const session = createMockActiveSession(exercises);
    if (name) {
      session.name = name;
    }

    // Only store in sessionStorage - activeSession managed by hook
    this.sessionStorage.set(session.id, session);

    return session;
  }

  async getActiveSession(): Promise<ActiveSession | null> {
    await delay(100);
    // Return null - active session is now managed entirely by the hook
    return null;
  }

  async getSessionById(id: WorkoutId): Promise<ActiveSession | null> {
    await delay(150);
    return this.sessionStorage.get(id) || null;
  }

  async updateSet(
    sessionId: WorkoutId,
    exerciseId: ExerciseId,
    setId: SetEntryId,
    updates: Partial<SetData>
  ): Promise<SetData> {
    await delay(100);

    const session = this.sessionStorage.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const exercise = session.exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) {
      throw new Error('Exercise not found in session');
    }

    const setIndex = exercise.sets.findIndex((set) => set.id === setId);
    if (setIndex === -1) {
      throw new Error('Set not found');
    }

    const updatedSet = { ...exercise.sets[setIndex], ...updates };
    exercise.sets[setIndex] = updatedSet;

    // Update total volume if set is completed
    if (updatedSet.completed && updatedSet.weight && updatedSet.reps) {
      session.totalVolume = session.exercises.reduce((total, ex) => {
        return (
          total +
          ex.sets.reduce((exTotal, set) => {
            return set.completed && set.weight && set.reps
              ? exTotal + set.weight * set.reps
              : exTotal;
          }, 0)
        );
      }, 0);
    }

    this.sessionStorage.set(sessionId, session);
    return updatedSet;
  }

  async completeSet(
    sessionId: WorkoutId,
    exerciseId: ExerciseId,
    setId: SetEntryId,
    setData: Partial<SetData>
  ): Promise<{ set: SetData; restTime?: number }> {
    await delay(50);

    const completedSet = await this.updateSet(sessionId, exerciseId, setId, {
      ...setData,
      completed: true,
      completedAt: new Date(),
    });

    const session = this.sessionStorage.get(sessionId);
    const exercise = session?.exercises.find((ex) => ex.id === exerciseId);

    return {
      set: completedSet,
      restTime: exercise?.restPreset || 120,
    };
  }

  async addSet(sessionId: WorkoutId, exerciseId: ExerciseId): Promise<SetData> {
    await delay(100);

    const session = this.sessionStorage.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const exercise = session.exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) {
      throw new Error('Exercise not found in session');
    }

    // Fix set duplication: Find the highest set number and increment by 1
    const existingSetNumbers = exercise.sets.map((set) => set.setNumber);
    const maxSetNumber =
      existingSetNumbers.length > 0 ? Math.max(...existingSetNumbers) : 0;
    const newSetNumber = maxSetNumber + 1;

    const newSet = createMockSet(newSetNumber);
    exercise.sets.push(newSet);

    this.sessionStorage.set(sessionId, session);
    return newSet;
  }

  async finishSession(sessionId: WorkoutId): Promise<WorkoutSession> {
    await delay(300);

    const session = this.sessionStorage.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update template's lastCompleted date if this session was created from a template
    logger.debug(`[FinishSession] Session templateId: ${session.templateId}`);
    if (session.templateId) {
      const templateIndex = mockTemplates.findIndex(
        (t) => t.id === session.templateId
      );
      logger.debug(`[FinishSession] Template index found: ${templateIndex}`);
      if (templateIndex !== -1) {
        const oldDate = mockTemplates[templateIndex].lastCompleted;
        mockTemplates[templateIndex].lastCompleted = new Date();
        logger.debug(
          `[FinishSession] Updated template "${mockTemplates[templateIndex].title}" lastCompleted from ${oldDate} to ${mockTemplates[templateIndex].lastCompleted}`
        );
      }
    } else {
      logger.debug(
        '[FinishSession] No templateId found on session - this workout was not started from a template'
      );
    }

    const completedWorkout: WorkoutSession = {
      id: session.id,
      name: session.name,
      startedAt: session.startedAt,
      currentExercise: undefined,
      totalSets: session.exercises.reduce(
        (total, ex) => total + ex.sets.length,
        0
      ),
      completedSets: session.exercises.reduce(
        (total, ex) => total + ex.sets.filter((set) => set.completed).length,
        0
      ),
      isActive: false,
    };

    // Clear from storage - activeSession managed by hook
    this.sessionStorage.delete(sessionId);

    return completedWorkout;
  }

  async discardSession(sessionId: WorkoutId): Promise<void> {
    await delay(200);

    logger.debug(`[DiscardSession] Discarding session: ${sessionId}`);

    this.sessionStorage.delete(sessionId);

    logger.debug(`[DiscardSession] Session discarded from storage`);
  }

  async getRecentWorkouts(): Promise<WorkoutSession[]> {
    await delay(200);
    return mockRecentWorkouts;
  }

  // Rest timer operations
  async appendExercises(
    sessionId: WorkoutId,
    exerciseIds: ExerciseId[]
  ): Promise<void> {
    await delay(200);

    const session = this.sessionStorage.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const exercises = getExercisesByIds(exerciseIds);
    if (exercises.length === 0) {
      throw new Error('No exercises found for provided IDs');
    }

    const currentMaxOrderIndex = Math.max(
      ...session.exercises.map((ex) => ex.orderIndex),
      -1
    );

    exercises.forEach((exercise, index) => {
      const newSessionExercise = {
        id: exercise.id,
        exercise,
        sets: [createMockSet(1, false)],
        orderIndex: currentMaxOrderIndex + 1 + index,
        restPreset: 120,
      };
      session.exercises.push(newSessionExercise);
    });

    this.sessionStorage.set(sessionId, session);
  }

  async updateRestPreset(
    sessionId: WorkoutId,
    exerciseId: ExerciseId,
    restTime: number
  ): Promise<void> {
    await delay(100);

    const session = this.sessionStorage.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const exercise = session.exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) {
      throw new Error('Exercise not found in session');
    }

    exercise.restPreset = restTime;
    this.sessionStorage.set(sessionId, session);
  }

  async removeExercise(
    sessionId: WorkoutId,
    exerciseId: ExerciseId
  ): Promise<void> {
    await delay(150);

    const session = this.sessionStorage.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const exerciseIndex = session.exercises.findIndex(
      (ex) => ex.id === exerciseId
    );
    if (exerciseIndex === -1) {
      throw new Error('Exercise not found in session');
    }

    // Remove the exercise
    session.exercises.splice(exerciseIndex, 1);

    // Recalculate total volume
    session.totalVolume = session.exercises.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((exTotal, set) => {
          return set.completed && set.weight && set.reps
            ? exTotal + set.weight * set.reps
            : exTotal;
        }, 0)
      );
    }, 0);

    this.sessionStorage.set(sessionId, session);
  }

  async replaceExercise(
    sessionId: WorkoutId,
    oldExerciseId: ExerciseId,
    newExerciseId: ExerciseId
  ): Promise<void> {
    await delay(200);

    const session = this.sessionStorage.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const exerciseIndex = session.exercises.findIndex(
      (ex) => ex.id === oldExerciseId
    );
    if (exerciseIndex === -1) {
      throw new Error('Exercise not found in session');
    }

    const newExerciseData = mockExercises.find((ex) => ex.id === newExerciseId);
    if (!newExerciseData) {
      throw new Error('New exercise not found');
    }

    const oldExercise = session.exercises[exerciseIndex];

    // Replace with new exercise, preserving order and rest preset
    session.exercises[exerciseIndex] = {
      id: newExerciseId,
      exercise: newExerciseData,
      sets: [createMockSet(1, false)], // Start with one empty set
      orderIndex: oldExercise.orderIndex,
      restPreset: oldExercise.restPreset,
    };

    // Recalculate total volume
    session.totalVolume = session.exercises.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((exTotal, set) => {
          return set.completed && set.weight && set.reps
            ? exTotal + set.weight * set.reps
            : exTotal;
        }, 0)
      );
    }, 0);

    this.sessionStorage.set(sessionId, session);
  }

  async reorderExercises(
    sessionId: WorkoutId,
    reorderedExercises: SessionExercise[]
  ): Promise<void> {
    await delay(150);

    const session = this.sessionStorage.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update the order indices based on the new order
    const updatedExercises = reorderedExercises.map((exercise, index) => ({
      ...exercise,
      orderIndex: index,
    }));

    session.exercises = updatedExercises;
    this.sessionStorage.set(sessionId, session);
  }

  // Exercise rest preference methods
  async getExerciseRestPreference(
    exerciseName: string
  ): Promise<number | null> {
    await delay(50);

    try {
      const preferences = await storageService.getExerciseRestPreferences();
      return preferences[exerciseName] || null;
    } catch (error) {
      logger.error(
        '[WorkoutService] Error getting exercise rest preference:',
        error
      );
      return null;
    }
  }

  async setExerciseRestPreference(
    exerciseName: string,
    seconds: number
  ): Promise<void> {
    await delay(50);

    try {
      const preferences = await storageService.getExerciseRestPreferences();
      preferences[exerciseName] = seconds;
      await storageService.setExerciseRestPreferences(preferences);
      logger.debug(
        `[WorkoutService] Set rest preference for ${exerciseName}: ${seconds}s`
      );
    } catch (error) {
      logger.error(
        '[WorkoutService] Error setting exercise rest preference:',
        error
      );
      throw error;
    }
  }

  async getAllExerciseRestPreferences(): Promise<Record<string, number>> {
    await delay(50);

    try {
      return await storageService.getExerciseRestPreferences();
    } catch (error) {
      logger.error(
        '[WorkoutService] Error getting all exercise rest preferences:',
        error
      );
      return {};
    }
  }

  // Previous exercise data methods
  async getPreviousSetData(
    exerciseId: ExerciseId,
    setNumber: number
  ): Promise<PreviousSetData | null> {
    await delay(100);

    try {
      const exerciseData = mockPreviousExerciseData[exerciseId];
      if (!exerciseData) return null;

      const previousSet = exerciseData.find(
        (set) => set.setNumber === setNumber
      );
      return previousSet || null;
    } catch (error) {
      logger.error('[WorkoutService] Error getting previous set data:', error);
      return null;
    }
  }

  async getProgressionSuggestion(
    exerciseId: ExerciseId,
    setNumber: number
  ): Promise<ProgressionSuggestion | null> {
    await delay(100);

    try {
      const exerciseData = mockPreviousExerciseData[exerciseId];
      if (!exerciseData) {
        // No previous data - provide sensible defaults for new exercises
        return {
          weight: 45, // Empty barbell weight for most strength exercises
          reps: 8, // Start at bottom of rep range
          reasoning: 'maintain',
        };
      }

      // Get previous set data
      const previousSet = exerciseData.find(
        (set) => set.setNumber === setNumber
      );
      if (!previousSet || !previousSet.weight || !previousSet.reps) {
        // No data for this specific set number - provide sensible defaults
        return {
          weight: 45,
          reps: 8,
          reasoning: 'maintain',
        };
      }

      // Simple double-progression logic
      const repRange = { min: 8, max: 12 }; // Default rep range
      const weightIncrement = 2.5; // Default weight increment

      // Get all previous sets to analyze overall workout performance for context
      const allSets = exerciseData.filter((set) => set.weight && set.reps);
      if (allSets.length === 0) return null;

      // Analyze the specific set's performance
      const currentSetReps = previousSet.reps!;

      // Check overall workout performance for weight progression decisions
      const allAtMaxReps = allSets.every((set) => set.reps! >= repRange.max);
      const anyBelowMinReps = allSets.some((set) => set.reps! < repRange.min);

      if (allAtMaxReps) {
        // All sets hit max reps - increase weight, reset to min reps
        return {
          weight: previousSet.weight + weightIncrement,
          reps: repRange.min,
          reasoning: 'increase_weight',
        };
      } else if (anyBelowMinReps) {
        // Some sets fell below minimum - decrease weight
        return {
          weight: Math.max(previousSet.weight - weightIncrement, 0),
          reps: repRange.min,
          reasoning: 'decrease_weight',
        };
      } else if (
        currentSetReps >= repRange.min &&
        currentSetReps < repRange.max
      ) {
        // This specific set is in range but not at max - try to add reps
        return {
          weight: previousSet.weight,
          reps: Math.min(currentSetReps + 1, repRange.max),
          reasoning: 'add_reps',
        };
      } else {
        // Default: maintain previous values
        return {
          weight: previousSet.weight,
          reps: previousSet.reps,
          reasoning: 'maintain',
        };
      }
    } catch (error) {
      logger.error(
        '[WorkoutService] Error getting progression suggestion:',
        error
      );
      return null;
    }
  }
}

export const workoutService = new WorkoutService();
