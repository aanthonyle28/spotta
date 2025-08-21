import { useEffect, useRef } from 'react';
import type { RestTimerState } from '../types';

interface UseRestTimerProps {
  restTimer: RestTimerState;
  onComplete: () => void;
  onTick?: (remainingTime: number) => void;
}

export const useRestTimer = ({
  restTimer,
  onComplete,
  onTick,
}: UseRestTimerProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!restTimer.isActive || !restTimer.startedAt) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    // Calculate elapsed time since timer started
    const now = Date.now();
    const elapsed = Math.floor((now - restTimer.startedAt.getTime()) / 1000);
    const currentRemaining = Math.max(0, restTimer.remainingTime - elapsed);

    if (currentRemaining <= 0) {
      onComplete();
      return;
    }

    // Update tick immediately if enough time has passed
    if (onTick && now - lastTickRef.current >= 1000) {
      onTick(currentRemaining);
      lastTickRef.current = now;
    }

    // Set up interval for countdown
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const totalElapsed = Math.floor(
        (currentTime - restTimer.startedAt!.getTime()) / 1000
      );
      const remaining = Math.max(0, restTimer.remainingTime - totalElapsed);

      if (onTick) {
        onTick(remaining);
      }

      if (remaining <= 0) {
        onComplete();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
        }
      }

      lastTickRef.current = currentTime;
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [
    restTimer.isActive,
    restTimer.startedAt,
    restTimer.remainingTime,
    onComplete,
    onTick,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (restTimer.totalTime <= 0) return 0;
    return (
      (restTimer.totalTime - restTimer.remainingTime) / restTimer.totalTime
    );
  };

  const getRemainingTime = (): number => {
    if (!restTimer.isActive || !restTimer.startedAt) {
      return restTimer.remainingTime;
    }

    const elapsed = Math.floor(
      (Date.now() - restTimer.startedAt.getTime()) / 1000
    );
    return Math.max(0, restTimer.remainingTime - elapsed);
  };

  return {
    formatTime,
    getProgress,
    getRemainingTime,
    isActive: restTimer.isActive,
    isPaused: restTimer.isActive && !restTimer.startedAt,
  };
};
