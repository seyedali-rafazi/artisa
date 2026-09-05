'use client';

import React, { useState } from 'react';
import { BannerItem, BannerTextElement } from '@/hooks/useBanners';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  X,
  Palette,
} from 'lucide-react';

interface BannerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: BannerItem | null;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export default function BannerPreviewModal({
  isOpen,
  onClose,
  banner,
}: BannerPreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');

  if (!banner) return null;

  // Scale factor for text elements depending on device preview mode
  const getScaleMultiplier = () => {
    switch (device) {
      case 'mobile':
        return 0.65;
      case 'tablet':
        return 0.82;
      case 'desktop':
      default:
        return 1.0;
    }
  };

  const scaleMultiplier = getScaleMultiplier();

  // Container width constraint based on device preview
  const getDeviceContainerClass = () => {
    switch (device) {
      case 'mobile':
        return 'w-[360px] h-[280px] shadow-2xl border-4 border-neutral-800 rounded-[32px]';
      case 'tablet':
        return 'w-[680px] h-[360px] shadow-2xl border-4 border-neutral-800 rounded-[28px]';
      case 'desktop':
      default:
        return 'w-full max-w-4xl h-[420px] rounded-3xl';
    }
  };

  const texts = banner.texts || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-card border-border/60 text-foreground"
        dir="rtl"
      >
        <DialogHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex flex-col gap-1 text-right">
            <DialogTitle className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              <span>پیش‌نمایش تعاملی بنر: {banner.title}</span>
            </DialogTitle>
            <span className="text-xs text-muted-foreground font-semibold">
              مشاهده نحوه نمایش بنر و چینش لایه‌های متنی در نمایشگرهای مختلف
            </span>
          </div>

          {/* Device Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border/60 shrink-0">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                device === 'desktop'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="size-3.5" />
              <span>دسکتاپ</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                device === 'tablet'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tablet className="size-3.5" />
              <span>تبلت</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                device === 'mobile'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="size-3.5" />
              <span>موبایل</span>
            </button>
          </div>
        </DialogHeader>

        {/* Device Stage Simulator */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-neutral-950/60 rounded-3xl min-h-[380px] overflow-hidden">
          <div
            className={`relative overflow-hidden transition-all duration-300 select-none bg-neutral-900 flex items-center justify-center ${getDeviceContainerClass()}`}
          >
            {/* Background Banner Image */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-300"
              style={{
                backgroundImage: `url(${banner.image})`,
              }}
            />

            {/* Subtle protective overlay for readability */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* Overlaid Texts positioned by normalized percentage */}
            {texts.length > 0 ? (
              texts.map((item: BannerTextElement) => {
                const scaledSize = Math.max(10, Math.round((item.fontSize || 24) * scaleMultiplier));
                const posX = item.position?.x ?? 50;
                const posY = item.position?.y ?? 50;

                return (
                  <div
                    key={item.id}
                    className="absolute pointer-events-none transition-all duration-150"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: `translate(-50%, -50%) scale(${item.scaleX ?? 1}, ${item.scaleY ?? 1})`,
                      transformOrigin: 'center center',
                      width: 'max-content',
                      maxWidth: 'none',
                      fontFamily: item.fontFamily === 'inherit' ? 'var(--font-vazirmatn), sans-serif' : item.fontFamily,
                      fontSize: `${scaledSize}px`,
                      fontWeight: item.fontWeight || 'normal',
                      color: item.color || '#FFFFFF',
                      textAlign: item.textAlign || 'center',
                      lineHeight: item.lineHeight || 1.3,
                      letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined,
                      textShadow: item.textShadow || '0 2px 8px rgba(0,0,0,0.65)',
                      whiteSpace: 'pre',
                    }}
                  >
                    {item.text}
                  </div>
                );
              })
            ) : (
              /* Fallback for legacy banners with title / subtitle / badge */
              <div className="absolute top-1/2 -translate-y-1/2 max-w-lg px-8 text-white flex flex-col gap-3 right-0 text-right">
                {banner.badge && (
                  <div className="inline-flex items-center gap-1.5 w-fit rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold">
                    <span>{banner.badge}</span>
                  </div>
                )}
                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow-md">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-sm sm:text-base text-white/80 font-medium drop-shadow-sm">
                    {banner.subtitle}
                  </p>
                )}
                {banner.buttonText && (
                  <Button className="rounded-xl px-5 py-2 font-bold text-white bg-primary w-fit mt-2 shadow-lg">
                    {banner.buttonText}
                  </Button>
                )}
              </div>
            )}

            {/* Optional Banner Link Badge / Preview Indicator */}
            {banner.link && (
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold border border-white/20">
                <ExternalLink className="size-3 text-primary" />
                <span>لینک کلیک: {banner.link}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2 font-semibold">
          <div className="flex items-center gap-4">
            <span>تعداد لایه‌های متنی: {texts.length}</span>
            <span>وضعیت: {banner.isActive ? '🟢 فعال در سایت' : '⚪ غیرفعال'}</span>
            <span>ترتیب نمایش: {banner.order}</span>
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-2xl text-xs font-bold w-full sm:w-auto cursor-pointer"
          >
            بستن پیش‌نمایش
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
