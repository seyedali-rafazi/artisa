'use client';

import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { RotateCw } from 'lucide-react';

interface ResendTimerProps {
  onResend: () => void;
  disabled?: boolean;
  cooldownSeconds?: number;
}

export default function ResendTimer({
  onResend,
  disabled = false,
  cooldownSeconds = 60,
}: ResendTimerProps) {
  const { secondsLeft, isFinished, startTimer } = useCountdown(cooldownSeconds);

  const handleResendClick = () => {
    if (!isFinished || disabled) return;
    onResend();
    startTimer(cooldownSeconds);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 text-xs">
      {!isFinished ? (
        <span className="text-muted-foreground font-semibold flex items-center gap-1">
          <span>ارسال مجدد کد تا</span>
          <span className="font-extrabold text-primary min-w-[20px] text-center" dir="ltr">
            {secondsLeft}
          </span>
          <span>ثانیه دیگر</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResendClick}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline cursor-pointer transition-colors disabled:opacity-50"
        >
          <RotateCw className="size-3.5" />
          <span>دریافت مجدد کد تایید</span>
        </button>
      )}
    </div>
  );
}
