'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Archive, Trash2, Info, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'تأیید',
  cancelText = 'انصراف',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-right transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon Header */}
        <div className="flex items-center gap-3">
          {variant === 'danger' && (
            <div className="size-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Trash2 className="size-6" />
            </div>
          )}
          {variant === 'warning' && (
            <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Archive className="size-6" />
            </div>
          )}
          {variant === 'info' && (
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Info className="size-6" />
            </div>
          )}
          <div>
            <h2 className="text-base font-black text-foreground">{title}</h2>
          </div>
        </div>

        {/* Content Description */}
        <div className="text-xs font-semibold text-muted-foreground leading-relaxed">
          {description}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl text-xs font-extrabold flex-1 cursor-pointer"
          >
            {cancelText}
          </Button>

          {variant === 'danger' && (
            <Button
              type="button"
              size="sm"
              onClick={onConfirm}
              disabled={isLoading}
              className="rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white flex-1 gap-1.5 shadow-lg shadow-rose-600/25 cursor-pointer"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{confirmText}</span>
            </Button>
          )}

          {variant === 'warning' && (
            <Button
              type="button"
              size="sm"
              onClick={onConfirm}
              disabled={isLoading}
              className="rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white flex-1 gap-1.5 shadow-lg shadow-amber-600/25 cursor-pointer"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{confirmText}</span>
            </Button>
          )}

          {variant === 'info' && (
            <Button
              type="button"
              size="sm"
              onClick={onConfirm}
              disabled={isLoading}
              className="rounded-xl text-xs font-extrabold flex-1 gap-1.5 cursor-pointer shadow-lg shadow-primary/25"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{confirmText}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
