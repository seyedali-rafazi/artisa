'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BannerItem,
  BannerPayload,
  BannerTextElement,
  useCreateBanner,
  useUpdateBanner,
} from '@/hooks/useBanners';
import { axiosClient } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  Upload,
  X,
  Plus,
  Trash2,
  Move,
  Type,
  Palette,
  Eye,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';

interface BannerEditorFormProps {
  initialData?: BannerItem | null;
  isEditing?: boolean;
  nextOrder?: number;
}

const PRESET_COLORS = [
  { name: 'سفید خالص', hex: '#FFFFFF' },
  { name: 'طلایی لوکس', hex: '#B8934E' },
  { name: 'کرم ابریشمی', hex: '#E8DCCB' },
  { name: 'مشکی زغالی', hex: '#1A1A1A' },
  { name: 'خاکستری شنی', hex: '#D4C5B0' },
  { name: 'کهربایی روشن', hex: '#F59E0B' },
  { name: 'یاقوتی', hex: '#DC2626' },
  { name: 'آبی درباری', hex: '#2563EB' },
];

const PRESET_SHADOWS = [
  { label: 'بدون سایه', value: 'none' },
  { label: 'سایه ملایم', value: '0 2px 8px rgba(0,0,0,0.6)' },
  { label: 'سایه عمیق تیره', value: '0 4px 16px rgba(0,0,0,0.95)' },
  { label: 'هاله طلایی درخشان', value: '0 0 18px rgba(184, 147, 78, 0.9)' },
];

const FONT_WEIGHTS = [
  { label: 'عادی (400)', value: '400' },
  { label: 'متوسط (500)', value: '500' },
  { label: 'نیمه ضخیم (600)', value: '600' },
  { label: 'ضخیم (700)', value: '700' },
  { label: 'خیلی ضخیم (800)', value: '800' },
];

const FONT_FAMILIES = [
  { label: 'وزیرمتن (قلم رسمی سایت)', value: 'inherit' },
  { label: 'فونت استاندارد سیستم', value: 'system-ui, sans-serif' },
  { label: 'قلم کلاسیک و هنری (Serif)', value: 'serif' },
];

export default function BannerEditorForm({
  initialData,
  isEditing = false,
  nextOrder = 1,
}: BannerEditorFormProps) {
  const router = useRouter();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  // Basic Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(Boolean(initialData?.linkOpenInNewTab));
  const [order, setOrder] = useState<number>(initialData?.order ?? nextOrder);
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  // Text Elements State
  const [texts, setTexts] = useState<BannerTextElement[]>(() => {
    if (initialData?.texts && initialData.texts.length > 0) {
      return [...initialData.texts];
    }
    return [];
  });

  const [selectedTextId, setSelectedTextId] = useState<string | null>(() => {
    if (initialData?.texts && initialData.texts.length > 0) {
      return initialData.texts[0].id;
    }
    return null;
  });

  // Canvas Viewport Simulator (desktop / tablet / mobile)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dragging & Resizing state on canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  interface DragState {
    id: string;
    startMouseX: number;
    startMouseY: number;
    startElemX: number;
    startElemY: number;
  }

  type ResizeDirection = 't' | 'r' | 'b' | 'l' | 'tr' | 'tl' | 'br' | 'bl';

  interface ResizeState {
    id: string;
    direction: ResizeDirection;
    startX: number;
    startY: number;
    startFontSize: number;
    startScaleX: number;
    startScaleY: number;
  }

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);

  // Synchronize when initialData arrives (e.g. from async query)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setImage(initialData.image || '');
      setLink(initialData.link || '');
      setLinkOpenInNewTab(Boolean(initialData.linkOpenInNewTab));
      setOrder(initialData.order ?? nextOrder);
      setIsActive(initialData.isActive !== false);

      if (initialData.texts && initialData.texts.length > 0) {
        setTexts([...initialData.texts]);
        setSelectedTextId(initialData.texts[0].id);
      }
    }
  }, [initialData, nextOrder]);

  // Image upload via existing /api/v1/admin/upload endpoint
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('فایل انتخابی باید از نوع تصویر (JPG, PNG, WebP) باشد.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد.');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosClient.post('/api/v1/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const blobUrl = response.data?.url || response.data?.data?.url;
      if (blobUrl) {
        setImage(blobUrl);
        toast.success('تصویر بنر با موفقیت در فضای ابری بارگذاری شد.');
      } else {
        setUploadError('خطا در دریافت آدرس تصویر بارگذاری شده.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در آپلود تصویر بنر';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add a new Text Element
  const handleAddText = () => {
    const newId = 'text_' + Date.now();
    const newElement: BannerTextElement = {
      id: newId,
      text: texts.length === 0 ? (title || 'عنوان بنر') : 'متن جدید بنر',
      fontFamily: 'inherit',
      fontSize: texts.length === 0 ? 36 : 22,
      fontWeight: texts.length === 0 ? '700' : '500',
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: 1.3,
      letterSpacing: 0,
      textShadow: '0 2px 10px rgba(0,0,0,0.7)',
      position: {
        x: 50,
        y: texts.length === 0 ? 40 : Math.min(85, 40 + texts.length * 15),
      },
      scaleX: 1.0,
      scaleY: 1.0,
    };

    setTexts((prev) => [...prev, newElement]);
    setSelectedTextId(newId);
  };

  // Delete a Text Element
  const handleDeleteText = (idToDelete: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== idToDelete));
    if (selectedTextId === idToDelete) {
      const remaining = texts.filter((t) => t.id !== idToDelete);
      setSelectedTextId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Update selected element property
  const updateSelectedText = (updates: Partial<BannerTextElement>) => {
    if (!selectedTextId) return;
    setTexts((prev) =>
      prev.map((t) => (t.id === selectedTextId ? { ...t, ...updates } : t))
    );
  };

  // ─── Interactive Dragging & Border Resizing on Canvas ───
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    setSelectedTextId(id);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const elem = texts.find((t) => t.id === id);
    if (!elem) return;

    setDragState({
      id,
      startMouseX: clientX,
      startMouseY: clientY,
      startElemX: elem.position?.x ?? 50,
      startElemY: elem.position?.y ?? 50,
    });
  };

  const handleStartResize = (
    e: React.MouseEvent | React.TouchEvent,
    id: string,
    direction: ResizeDirection
  ) => {
    e.stopPropagation();
    setSelectedTextId(id);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const elem = texts.find((t) => t.id === id);
    if (!elem) return;

    setResizing({
      id,
      direction,
      startX: clientX,
      startY: clientY,
      startFontSize: elem.fontSize || 24,
      startScaleX: elem.scaleX ?? 1.0,
      startScaleY: elem.scaleY ?? 1.0,
    });
  };

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      // 1. Resizing border handles (stretching top, right, bottom, left, corners)
      if (resizing) {
        const deltaX = clientX - resizing.startX;
        const deltaY = clientY - resizing.startY;
        const sensitivity = 0.015;

        // TOP HANDLE: Pulling up (deltaY < 0) stretches HEIGHT
        if (resizing.direction === 't') {
          const change = -deltaY * sensitivity;
          const newScaleY = Math.round(Math.min(5.0, Math.max(0.2, resizing.startScaleY + change)) * 100) / 100;
          setTexts((prev) =>
            prev.map((t) =>
              t.id === resizing.id ? { ...t, scaleY: newScaleY } : t
            )
          );
          return;
        }

        // BOTTOM HANDLE: Pulling down (deltaY > 0) stretches HEIGHT
        if (resizing.direction === 'b') {
          const change = deltaY * sensitivity;
          const newScaleY = Math.round(Math.min(5.0, Math.max(0.2, resizing.startScaleY + change)) * 100) / 100;
          setTexts((prev) =>
            prev.map((t) =>
              t.id === resizing.id ? { ...t, scaleY: newScaleY } : t
            )
          );
          return;
        }

        // RIGHT HANDLE: Pulling right (deltaX > 0) stretches WIDTH
        if (resizing.direction === 'r') {
          const change = deltaX * sensitivity;
          const newScaleX = Math.round(Math.min(5.0, Math.max(0.2, resizing.startScaleX + change)) * 100) / 100;
          setTexts((prev) =>
            prev.map((t) =>
              t.id === resizing.id ? { ...t, scaleX: newScaleX } : t
            )
          );
          return;
        }

        // LEFT HANDLE: Pulling left (deltaX < 0) stretches WIDTH
        if (resizing.direction === 'l') {
          const change = -deltaX * sensitivity;
          const newScaleX = Math.round(Math.min(5.0, Math.max(0.2, resizing.startScaleX + change)) * 100) / 100;
          setTexts((prev) =>
            prev.map((t) =>
              t.id === resizing.id ? { ...t, scaleX: newScaleX } : t
            )
          );
          return;
        }

        // CORNER HANDLES: Stretch both WIDTH and HEIGHT proportionally
        let cornerDelta = 0;
        switch (resizing.direction) {
          case 'tr':
            cornerDelta = deltaX - deltaY;
            break;
          case 'tl':
            cornerDelta = -deltaX - deltaY;
            break;
          case 'br':
            cornerDelta = deltaX + deltaY;
            break;
          case 'bl':
            cornerDelta = -deltaX + deltaY;
            break;
        }

        const cornerChange = (cornerDelta / 2) * sensitivity;
        const newScaleX = Math.round(Math.min(5.0, Math.max(0.2, resizing.startScaleX + cornerChange)) * 100) / 100;
        const newScaleY = Math.round(Math.min(5.0, Math.max(0.2, resizing.startScaleY + cornerChange)) * 100) / 100;

        setTexts((prev) =>
          prev.map((t) =>
            t.id === resizing.id ? { ...t, scaleX: newScaleX, scaleY: newScaleY } : t
          )
        );
        return;
      }

      // 2. Dragging location (smooth offset-based tracking, NO jump, NO dimension change)
      if (dragState && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const deltaXPercent = ((clientX - dragState.startMouseX) / rect.width) * 100;
        const deltaYPercent = ((clientY - dragState.startMouseY) / rect.height) * 100;

        const clampedX = Math.round(Math.min(100, Math.max(0, dragState.startElemX + deltaXPercent)) * 10) / 10;
        const clampedY = Math.round(Math.min(100, Math.max(0, dragState.startElemY + deltaYPercent)) * 10) / 10;

        setTexts((prev) =>
          prev.map((t) =>
            t.id === dragState.id
              ? { ...t, position: { x: clampedX, y: clampedY } }
              : t
          )
        );
      }
    },
    [resizing, dragState]
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState && !resizing) return;
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if ((!dragState && !resizing) || !e.touches[0]) return;
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleStopInteraction = () => {
    setDragState(null);
    setResizing(null);
  };

  // Global window listeners while dragging or resizing for edge-to-edge smoothness
  useEffect(() => {
    if (!dragState && !resizing) return;

    const onWindowMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onWindowMouseUp = () => {
      setDragState(null);
      setResizing(null);
    };
    const onWindowTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onWindowTouchEnd = () => {
      setDragState(null);
      setResizing(null);
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    window.addEventListener('touchmove', onWindowTouchMove);
    window.addEventListener('touchend', onWindowTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
      window.removeEventListener('touchmove', onWindowTouchMove);
      window.removeEventListener('touchend', onWindowTouchEnd);
    };
  }, [dragState, resizing, handlePointerMove]);

  const selectedElement = texts.find((t) => t.id === selectedTextId);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('لطفاً عنوان بنر را وارد نمایید.');
      return;
    }

    if (!image.trim()) {
      setFormError('لطفاً تصویر بنر را بارگذاری نمایید.');
      return;
    }

    for (let i = 0; i < texts.length; i++) {
      if (!texts[i].text.trim()) {
        setFormError(`متن لایه ${i + 1} نمی‌تواند خالی باشد.`);
        setSelectedTextId(texts[i].id);
        return;
      }
    }

    const payload: BannerPayload = {
      title: trimmedTitle,
      image: image.trim(),
      texts: texts.map((t) => ({
        ...t,
        text: t.text.trim(),
        fontSize: Number(t.fontSize) || 24,
        scaleX: Number(t.scaleX) || 1.0,
        scaleY: Number(t.scaleY) || 1.0,
        position: {
          x: Math.round((t.position?.x ?? 50) * 10) / 10,
          y: Math.round((t.position?.y ?? 50) * 10) / 10,
        },
      })),
      link: link.trim(),
      linkOpenInNewTab,
      order: Number(order) || 0,
      isActive,
    };

    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, ...payload },
        {
          onSuccess: () => {
            toast.success('بنر با موفقیت بروزرسانی شد.');
            router.push('/admin/banners');
          },
          onError: (err: any) => {
            const msg = err?.message || 'خطا در بروزرسانی بنر';
            setFormError(msg);
            toast.error(msg);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('بنر جدید با موفقیت ایجاد و منتشر شد.');
          router.push('/admin/banners');
        },
        onError: (err: any) => {
          const msg = err?.message || 'خطا در ایجاد بنر جدید';
          setFormError(msg);
          toast.error(msg);
        },
      });
    }
  };

  // Canvas Viewport width constraints for simulation
  const getCanvasDeviceStyle = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-[360px] h-[280px] shadow-2xl border-4 border-neutral-800 rounded-[32px]';
      case 'tablet':
        return 'w-[680px] h-[360px] shadow-2xl border-4 border-neutral-800 rounded-[28px]';
      case 'desktop':
      default:
        return 'w-full h-[460px] rounded-3xl';
    }
  };

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full" dir="rtl">
      {/* ─── Top Navigation & Action Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-3xl border border-border/60 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/banners"
            className="size-10 rounded-2xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="بازگشت به لیست بنرها"
          >
            <ArrowRight className="size-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              <span>{isEditing ? `ویرایش بنر: ${title || initialData?.title || ''}` : 'طراحی و افزودن بنر جدید'}</span>
            </h1>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              مدیریت تصویر ابری، جایگذاری بصری لایه‌های متنی با درگ‌-اند-دراپ و کنترل ریسپانسیو
            </p>
          </div>
        </div>

        {/* Top Actions: Cancel & Save */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/banners')}
            disabled={isSubmitting}
            className="rounded-2xl text-xs font-bold cursor-pointer"
          >
            انصراف
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-2xl text-xs font-extrabold gap-2 cursor-pointer shadow-lg shadow-primary/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>{isEditing ? 'ذخیره تغییرات بنر' : 'انتشار و ثبت بنر'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-3xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="size-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* ─── Main 2-Column Full-Page Editor ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Canvas & Typography Controls): lg:col-span-8 */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Canvas Section */}
          <div className="bg-card rounded-3xl border border-border/60 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-primary" />
                <span className="text-sm font-black text-foreground">
                  بوم طراحی تعاملی بنر (Drag & Drop Canvas)
                </span>
              </div>

              {/* Viewport Simulation Buttons */}
              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Monitor className="size-3.5" />
                  <span>دسکتاپ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    previewDevice === 'tablet'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Tablet className="size-3.5" />
                  <span>تبلت</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone className="size-3.5" />
                  <span>موبایل</span>
                </button>
              </div>
            </div>

            {/* Canvas Stage */}
            <div className="flex items-center justify-center p-4 sm:p-8 bg-neutral-950/90 rounded-3xl min-h-[480px] overflow-hidden border border-border/40">
              {image ? (
                <div
                  ref={canvasRef}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleStopInteraction}
                  onMouseLeave={handleStopInteraction}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleStopInteraction}
                  className={`relative overflow-hidden transition-all duration-300 select-none bg-neutral-900 flex items-center justify-center ${getCanvasDeviceStyle()}`}
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Subtle ambient overlay */}
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                  {/* Overlaid Draggable & Border-Resizable Text Elements */}
                  {texts.map((item) => {
                    const isSelected = item.id === selectedTextId;
                    const posX = item.position?.x ?? 50;
                    const posY = item.position?.y ?? 50;
                    const isCurrentlyResizing = resizing?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        onMouseDown={(e) => handleStartDrag(e, item.id)}
                        onTouchStart={(e) => handleStartDrag(e, item.id)}
                        className={`absolute select-none transition-shadow duration-75 ${
                          isSelected
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-black/60 bg-black/40 backdrop-blur-xs rounded-xl p-2.5 z-20 cursor-grab active:cursor-grabbing'
                            : 'hover:ring-1 hover:ring-white/40 p-2.5 rounded-xl z-10 cursor-pointer'
                        }`}
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                          transform: `translate(-50%, -50%) scale(${item.scaleX ?? 1}, ${item.scaleY ?? 1})`,
                          transformOrigin: 'center center',
                          width: 'max-content',
                          maxWidth: 'none',
                          fontFamily:
                            item.fontFamily === 'inherit'
                              ? 'var(--font-vazirmatn), sans-serif'
                              : item.fontFamily,
                          fontSize: `${item.fontSize}px`,
                          fontWeight: item.fontWeight || 'normal',
                          color: item.color || '#FFFFFF',
                          textAlign: item.textAlign || 'center',
                          lineHeight: item.lineHeight || 1.3,
                          letterSpacing: item.letterSpacing
                            ? `${item.letterSpacing}px`
                            : undefined,
                          textShadow:
                            item.textShadow || '0 2px 10px rgba(0,0,0,0.7)',
                          whiteSpace: 'pre',
                        }}
                      >
                        {/* Status badge when selected */}
                        {isSelected && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none whitespace-nowrap z-30">
                            {isCurrentlyResizing ? (
                              <span>
                                {resizing?.direction === 't' || resizing?.direction === 'b'
                                  ? `ارتفاع: ${Math.round((item.scaleY ?? 1) * 100)}%`
                                  : resizing?.direction === 'r' || resizing?.direction === 'l'
                                  ? `عرض: ${Math.round((item.scaleX ?? 1) * 100)}%`
                                  : `مقیاس: ${Math.round((item.scaleX ?? 1) * 100)}%`}
                              </span>
                            ) : (
                              <>
                                <Move className="size-2.5" />
                                <span>
                                  X: {posX}% | Y: {posY}%
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Interactive Border Handles (Top, Right, Bottom, Left & Corners) */}
                        {isSelected && (
                          <>
                            {/* Top Border Handle */}
                            <div
                              onMouseDown={(e) => handleStartResize(e, item.id, 't')}
                              onTouchStart={(e) => handleStartResize(e, item.id, 't')}
                              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-2 bg-primary hover:bg-primary/80 border-2 border-white rounded-full cursor-ns-resize shadow-md hover:scale-125 transition-transform z-30"
                              title="کشیدن لبه بالا برای تغییر اندازه"
                            />

                            {/* Right Border Handle */}
                            <div
                              onMouseDown={(e) => handleStartResize(e, item.id, 'r')}
                              onTouchStart={(e) => handleStartResize(e, item.id, 'r')}
                              className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-6 bg-primary hover:bg-primary/80 border-2 border-white rounded-full cursor-ew-resize shadow-md hover:scale-125 transition-transform z-30"
                              title="کشیدن لبه راست برای تغییر اندازه"
                            />

                            {/* Bottom Border Handle */}
                            <div
                              onMouseDown={(e) => handleStartResize(e, item.id, 'b')}
                              onTouchStart={(e) => handleStartResize(e, item.id, 'b')}
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-2 bg-primary hover:bg-primary/80 border-2 border-white rounded-full cursor-ns-resize shadow-md hover:scale-125 transition-transform z-30"
                              title="کشیدن لبه پایین برای تغییر اندازه"
                            />

                            {/* Left Border Handle */}
                            <div
                              onMouseDown={(e) => handleStartResize(e, item.id, 'l')}
                              onTouchStart={(e) => handleStartResize(e, item.id, 'l')}
                              className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-6 bg-primary hover:bg-primary/80 border-2 border-white rounded-full cursor-ew-resize shadow-md hover:scale-125 transition-transform z-30"
                              title="کشیدن لبه چپ برای تغییر اندازه"
                            />

                            {/* Top-Right Corner Handle */}
                            <div
                              onMouseDown={(e) => handleStartResize(e, item.id, 'tr')}
                              onTouchStart={(e) => handleStartResize(e, item.id, 'tr')}
                              className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 size-3.5 bg-white border-2 border-primary rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-30"
                              title="کشیدن گوشه بالا-راست"
                            />

                            {/* Top-Left Corner Handle */}
                            <div
                              onMouseDown={(e) => handleStartResize(e, item.id, 'tl')}
                              onTouchStart={(e) => handleStartResize(e, item.id, 'tl')}
                              className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 size-3.5 bg-white border-2 border-primary rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-30"
                              title="کشیدن گوشه بالا-چپ"
                            />

                            {/* Bottom-Right Corner Handle */}
                            <div
                              onMouseDown={(e) => handleStartResize(e, item.id, 'br')}
                              onTouchStart={(e) => handleStartResize(e, item.id, 'br')}
                              className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 size-3.5 bg-white border-2 border-primary rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-30"
                              title="کشیدن گوشه پایین-راست"
                            />

                            {/* Bottom-Left Corner Handle */}
                            <div
                              onMouseDown={(e) => handleStartResize(e, item.id, 'bl')}
                              onTouchStart={(e) => handleStartResize(e, item.id, 'bl')}
                              className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 size-3.5 bg-white border-2 border-primary rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-30"
                              title="کشیدن گوشه پایین-چپ"
                            />
                          </>
                        )}

                        {item.text}
                      </div>
                    );
                  })}

                  {texts.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs font-bold pointer-events-none">
                      تصویر بارگذاری شد. از بخش «لایه‌های متنی» روی دکمه افزودن متن کلیک کنید.
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-80 border-2 border-dashed border-border/80 hover:border-primary/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-muted/10 hover:bg-muted/20 group"
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2 text-primary font-bold text-xs">
                      <Loader2 className="size-8 animate-spin" />
                      <span>در حال بارگذاری تصویر در Vercel Blob...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="size-7" />
                      </div>
                      <span className="text-sm font-black text-foreground">
                        ابتدا تصویر پس‌زمینه بنر را انتخاب یا بارگذاری کنید
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">
                        فرمت‌های مجاز: JPG, PNG, WebP (تا ۱۰ مگابایت)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1 font-semibold">
              <span>💡 برای جابجایی، روی متن کلیک کرده و بکشید (اندازه ثابت می‌ماند). برای تغییر اندازه، دستگیره‌های لبه‌ها (بالا، راست و گوشه‌ها) را بکشید.</span>
              <span>تعداد لایه‌های متنی: {texts.length}</span>
            </div>
          </div>

          {/* Typography & Element Styling Panel */}
          {selectedElement && (
            <div className="bg-card rounded-3xl border border-border/60 p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Type className="size-4 text-primary" />
                  <span className="text-sm font-black text-foreground">
                    تنظیمات فونت و ظاهر لایه انتخابی ({selectedElement.text.slice(0, 15)}...)
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteText(selectedElement.id)}
                  className="text-destructive hover:bg-destructive/10 rounded-xl text-xs font-bold gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>حذف این لایه</span>
                </Button>
              </div>

              {/* Text String Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">متن نمایش‌داده‌شده</Label>
                <textarea
                  value={selectedElement.text}
                  onChange={(e) => updateSelectedText({ text: e.target.value })}
                  placeholder="متن خود را اینجا تایپ کنید (برای سطر جدید Enter بزنید)..."
                  rows={2}
                  className="w-full rounded-2xl text-xs p-3 font-bold bg-background border border-input focus:ring-1 focus:ring-primary outline-hidden resize-y min-h-[44px]"
                />
              </div>

              {/* Font Family & Weight Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">نوع قلم (Font Family)</Label>
                  <select
                    value={selectedElement.fontFamily}
                    onChange={(e) => updateSelectedText({ fontFamily: e.target.value })}
                    className="w-full h-10 rounded-2xl border border-input bg-background px-3 text-xs font-bold text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">وزن قلم (Font Weight)</Label>
                  <select
                    value={selectedElement.fontWeight}
                    onChange={(e) => updateSelectedText({ fontWeight: e.target.value })}
                    className="w-full h-10 rounded-2xl border border-input bg-background px-3 text-xs font-bold text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
                  >
                    {FONT_WEIGHTS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Font Size & Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5 bg-muted/20 p-3 rounded-2xl border border-border/50">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>اندازه قلم (Font Size)</span>
                    <span className="text-primary font-black">{selectedElement.fontSize} پیکسل</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={140}
                    value={selectedElement.fontSize}
                    onChange={(e) => updateSelectedText({ fontSize: Number(e.target.value) })}
                    className="w-full accent-primary cursor-pointer mt-1"
                  />
                  <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-between">
                    <span>یا دستگیره‌های لبه کادر را روی بوم بکشید</span>
                    <span>۱۰ تا ۱۴۰ پیکسل</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">تراز متن (Text Align)</Label>
                  <div className="flex items-center gap-1.5 bg-background p-1 rounded-2xl border border-input h-11">
                    <button
                      type="button"
                      onClick={() => updateSelectedText({ textAlign: 'right' })}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                        selectedElement.textAlign === 'right'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <AlignRight className="size-4 ml-1" />
                      <span>راست</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedText({ textAlign: 'center' })}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                        selectedElement.textAlign === 'center'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <AlignCenter className="size-4 ml-1" />
                      <span>وسط</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedText({ textAlign: 'left' })}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                        selectedElement.textAlign === 'left'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <AlignLeft className="size-4 ml-1" />
                      <span>چپ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Picker & Preset Swatches */}
              <div className="space-y-2 bg-muted/20 p-3.5 rounded-2xl border border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">انتخاب رنگ متن</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.color.startsWith('#') ? selectedElement.color : '#FFFFFF'}
                      onChange={(e) => updateSelectedText({ color: e.target.value })}
                      className="size-7 rounded-lg cursor-pointer border border-border"
                    />
                    <span className="text-xs font-mono text-muted-foreground font-bold" dir="ltr">
                      {selectedElement.color}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => updateSelectedText({ color: c.hex })}
                      className={`size-7 rounded-xl border transition-all cursor-pointer hover:scale-110 flex items-center justify-center ${
                        selectedElement.color === c.hex
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'border-border/60'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Text Shadow & Fine Tuning Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">سایه و افکت متن (Shadow)</Label>
                  <select
                    value={selectedElement.textShadow || 'none'}
                    onChange={(e) =>
                      updateSelectedText({
                        textShadow: e.target.value === 'none' ? null : e.target.value,
                      })
                    }
                    className="w-full h-10 rounded-2xl border border-input bg-background px-3 text-xs font-bold text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
                  >
                    {PRESET_SHADOWS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Coordinate Sliders */}
                <div className="p-3 bg-muted/20 rounded-2xl border border-border/50 space-y-2">
                  <span className="text-[11px] font-extrabold text-muted-foreground block">
                    موقعیت دقیق لایه روی بوم
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>افقی (X)</span>
                        <span className="text-primary">{selectedElement.position.x}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.5}
                        value={selectedElement.position.x}
                        onChange={(e) =>
                          updateSelectedText({
                            position: { ...selectedElement.position, x: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>عمودی (Y)</span>
                        <span className="text-primary">{selectedElement.position.y}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.5}
                        value={selectedElement.position.y}
                        onChange={(e) =>
                          updateSelectedText({
                            position: { ...selectedElement.position, y: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Independent Width & Height Stretch Controls */}
                <div className="p-3 bg-muted/20 rounded-2xl border border-border/50 space-y-2 col-span-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-muted-foreground block">
                      کشیدگی مستقل عرض و ارتفاع (Stretch Width & Height)
                    </span>
                    {((selectedElement.scaleX && selectedElement.scaleX !== 1) ||
                      (selectedElement.scaleY && selectedElement.scaleY !== 1)) && (
                      <button
                        type="button"
                        onClick={() => updateSelectedText({ scaleX: 1.0, scaleY: 1.0 })}
                        className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                      >
                        بازنشانی به حالت استاندارد (۱۰۰٪)
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>کشیدگی عرض (افقی)</span>
                        <span className="text-primary font-black">
                          {Math.round((selectedElement.scaleX ?? 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.3}
                        max={3.0}
                        step={0.05}
                        value={selectedElement.scaleX ?? 1.0}
                        onChange={(e) =>
                          updateSelectedText({ scaleX: Number(e.target.value) })
                        }
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>کشیدگی ارتفاع (عمودی)</span>
                        <span className="text-primary font-black">
                          {Math.round((selectedElement.scaleY ?? 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.3}
                        max={3.0}
                        step={0.05}
                        value={selectedElement.scaleY ?? 1.0}
                        onChange={(e) =>
                          updateSelectedText({ scaleY: Number(e.target.value) })
                        }
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Banner Info & Layers Manager): lg:col-span-4 */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Banner Settings Card */}
          <div className="bg-card rounded-3xl border border-border/60 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
              <Sliders className="size-4 text-primary" />
              <span className="text-sm font-black text-foreground">اطلاعات کلی بنر</span>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                عنوان بنر <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: تخفیف ویژه بهاره آثار هنری"
                className="rounded-2xl text-xs h-10 font-bold bg-background"
                disabled={isSubmitting}
              />
            </div>

            {/* Link URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">آدرس لینک کلیک (اختیاری)</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/products یا https://..."
                className="rounded-2xl text-xs h-10 font-medium bg-background"
                dir="ltr"
                disabled={isSubmitting}
              />
            </div>

            {/* Open in New Tab & Active Status */}
            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={linkOpenInNewTab}
                  onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                  className="rounded text-primary focus:ring-primary size-4"
                />
                <span className="text-xs font-bold text-foreground">باز شدن لینک در تب جدید</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-primary focus:ring-primary size-4"
                />
                <span className="text-xs font-bold text-emerald-600">انتشار و فعال در اسلایدر سایت</span>
              </label>
            </div>

            {/* Display Order */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-bold">ترتیب نمایش (اولویت کمتر، اول)</Label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="rounded-2xl text-xs h-10 font-bold text-center bg-background"
                disabled={isSubmitting}
                min={0}
              />
            </div>

            {/* Image Uploader & Preview in Sidebar */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-1.5">
                  <Upload className="size-3.5 text-primary" />
                  <span>تصویر بنر (Vercel Blob) <span className="text-destructive">*</span></span>
                </Label>
                {image && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    تغییر تصویر
                  </button>
                )}
              </div>

              {uploadError && (
                <p className="text-xs font-bold text-destructive">{uploadError}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileSelect}
                className="hidden"
              />

              {image ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-muted/40 border border-border/60 group">
                  <img src={image} alt="بنر" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-destructive text-white p-1.5 rounded-full transition-colors cursor-pointer"
                    title="حذف تصویر"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full rounded-2xl text-xs font-bold gap-2 h-11 cursor-pointer"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>در حال بارگذاری...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      <span>انتخاب و آپلود تصویر</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Text Layers Manager Card */}
          <div className="bg-card rounded-3xl border border-border/60 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <span className="text-sm font-black text-foreground">لایه‌های متنی</span>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleAddText}
                className="rounded-xl text-xs font-bold gap-1 cursor-pointer h-8 shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>افزودن متن</span>
              </Button>
            </div>

            {texts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-xs font-semibold bg-muted/20 rounded-2xl border border-dashed border-border/60">
                هیچ لایه متنی روی بنر قرار ندارد.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {texts.map((item, idx) => {
                  const isSelected = item.id === selectedTextId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTextId(item.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-foreground shadow-xs'
                          : 'bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="size-6 rounded-lg bg-background text-foreground text-[10px] font-black flex items-center justify-center border border-border">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate text-foreground">
                            {item.text || 'بدون متن'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {item.fontSize}px • {item.position.x}% / {item.position.y}%
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteText(item.id);
                        }}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="حذف لایه"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
