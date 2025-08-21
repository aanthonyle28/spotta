import type { ExerciseId, WorkoutId, SetEntryId } from '@spotta/shared';
import type {
  ActiveSession,
  Exercise,
  SetData,
  Template,
  WorkoutSession,
} from '../types';
import {
  mockExercises,
  mockTemplates,
  mockRecentWorkouts,
  createMockActiveSession,
  createMockSet,
  searchExercises,
  getExercisesByIds,
} from './mockData';

// Simulate network delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class WorkoutService {
  private activeSession: ActiveSession | null = null;
  private sessionStorage: Map<WorkoutId, ActiveSession> = new Map();

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
      userId: 'user-1' as any, // In real app, this would come from auth
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

    this.activeSession = session;
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

    this.activeSession = session;
    this.sessionStorage.set(session.id, session);

    return session;
  }

  async getActiveSession(): Promise<ActiveSession | null> {
    await delay(100);
    return this.activeSession;
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
    await delay(150);

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

    const newSetNumber = exercise.sets.length + 1;
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

    // Clear active session
    this.activeSession = null;
    this.sessionStorage.delete(sessionId);

    return completedWorkout;
  }

  async discardSession(sessionId: WorkoutId): Promise<void> {
    await delay(200);

    if (this.activeSession?.id === sessionId) {
      this.activeSession = null;
    }
    this.sessionStorage.delete(sessionId);
  }

  async getRecentWorkouts(): Promise<WorkoutSession[]> {
    await delay(200);
    return mockRecentWorkouts;
  }

  // Rest timer operations
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
}

export const workoutService = new WorkoutService();
