'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds: number = 60) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, secondsLeft]);

  const startTimer = useCallback((seconds: number = initialSeconds) => {
    setSecondsLeft(seconds);
    setIsActive(true);
  }, [initialSeconds]);

  const resetTimer = useCallback(() => {
    setSecondsLeft(0);
    setIsActive(false);
  }, []);

  return {
    secondsLeft,
    isFinished: secondsLeft === 0,
    isActive,
    startTimer,
    resetTimer,
  };
}
