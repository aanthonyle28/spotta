import type { WorkoutId, ClubId } from '@spotta/shared';
import type { FinishWorkoutData } from '../types';
import { logger } from '../../../utils/logger';

export interface ImageUploadResult {
  url: string;
  id: string;
}

export interface WorkoutShareData {
  workoutId: WorkoutId;
  image?: string;
  description?: string;
}

class FinishWorkoutService {
  async uploadImage(imageUri: string): Promise<ImageUploadResult> {
    try {
      // Mock implementation for now
      logger.info('[FinishWorkout] Uploading image:', imageUri);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return mock result
      return {
        url: `https://mock-storage.supabase.co/workout-images/${Date.now()}.jpg`,
        id: `img_${Date.now()}`,
      };
    } catch (error) {
      logger.error('[FinishWorkout] Failed to upload image:', error);
      throw new Error('Failed to upload image');
    }
  }

  async shareToClub(
    clubId: ClubId,
    shareData: WorkoutShareData
  ): Promise<void> {
    try {
      logger.info(
        '[FinishWorkout] Sharing workout to club:',
        clubId,
        shareData
      );

      // Mock implementation - would call Supabase Edge Function
      await new Promise((resolve) => setTimeout(resolve, 500));

      logger.info('[FinishWorkout] Successfully shared workout to club');
    } catch (error) {
      logger.error('[FinishWorkout] Failed to share to club:', error);
      throw new Error('Failed to share workout');
    }
  }

  async processFinishWorkout(
    workoutId: WorkoutId,
    finishData: FinishWorkoutData
  ): Promise<void> {
    try {
      logger.info(
        '[FinishWorkout] Processing finish workout:',
        workoutId,
        finishData
      );

      // Upload image if provided
      let uploadedImageUrl: string | undefined;
      if (finishData.image) {
        const uploadResult = await this.uploadImage(finishData.image);
        uploadedImageUrl = uploadResult.url;
      }

      // Share to club if selected
      if (finishData.clubId) {
        await this.shareToClub(finishData.clubId as ClubId, {
          workoutId,
          image: uploadedImageUrl,
          description: finishData.description,
        });
      }

      logger.info('[FinishWorkout] Finish workflow completed successfully');
    } catch (error) {
      logger.error('[FinishWorkout] Failed to process finish workout:', error);
      throw error;
    }
  }
}

export const finishWorkoutService = new FinishWorkoutService();
