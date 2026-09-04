'use client';

import React, { useState, useEffect } from 'react';
import {
  FAQItem,
  useCreateFAQ,
  useUpdateFAQ,
} from '@/hooks/useFaqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  HelpCircle,
  Save,
  Loader2,
  AlertCircle,
  Hash,
  X,
  CheckCircle2,
  Power,
} from 'lucide-react';
import { toast } from 'sonner';

interface FaqDialogProps {
  isOpen: boolean;
  onClose: () => void;
  faqToEdit?: FAQItem | null;
  nextOrder?: number;
}

export default function FaqDialog({
  isOpen,
  onClose,
  faqToEdit,
  nextOrder = 1,
}: FaqDialogProps) {
  const isEditing = Boolean(faqToEdit);
  const createMutation = useCreateFAQ();
  const updateMutation = useUpdateFAQ();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [order, setOrder] = useState<number>(nextOrder);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form values whenever modal opens or faqToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (faqToEdit) {
        setQuestion(faqToEdit.question || faqToEdit.q || '');
        setAnswer(faqToEdit.answer || faqToEdit.a || '');
        setOrder(faqToEdit.order !== undefined ? faqToEdit.order : nextOrder);
        setIsActive(faqToEdit.is_active !== undefined ? faqToEdit.is_active : true);
      } else {
        setQuestion('');
        setAnswer('');
        setOrder(nextOrder);
        setIsActive(true);
      }
      setFormError(null);
    }
  }, [isOpen, faqToEdit, nextOrder]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();

    if (!trimmedQuestion) {
      setFormError('لطفاً صورت سوال را وارد نمایید.');
      return;
    }
    if (trimmedQuestion.length < 3) {
      setFormError('متن سوال باید حداقل ۳ کاراکتر باشد.');
      return;
    }
    if (!trimmedAnswer) {
      setFormError('لطفاً پاسخ سوال را وارد نمایید.');
      return;
    }
    if (trimmedAnswer.length < 3) {
      setFormError('متن پاسخ باید حداقل ۳ کاراکتر باشد.');
      return;
    }

    const payload = {
      question: trimmedQuestion,
      answer: trimmedAnswer,
      order: Number(order) || 0,
      is_active: isActive,
    };

    if (isEditing && faqToEdit?.id) {
      updateMutation.mutate(
        { id: faqToEdit.id, ...payload },
        {
          onSuccess: () => {
            toast.success('سوال متداول با موفقیت بروزرسانی شد');
            onClose();
          },
          onError: (err: any) => {
            const msg = err?.message || 'خطا در بروزرسانی سوال متداول';
            setFormError(msg);
            toast.error(msg);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('سوال متداول جدید با موفقیت ایجاد شد');
          onClose();
        },
        onError: (err: any) => {
          const msg = err?.message || 'خطا در ایجاد سوال متداول';
          setFormError(msg);
          toast.error(msg);
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] p-0 rounded-3xl overflow-hidden flex flex-col gap-0 border border-border/80 shadow-2xl bg-background"
        dir="rtl"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="p-6 border-b border-border/60 bg-muted/20 shrink-0 flex flex-row items-center justify-between gap-4">
          <DialogTitle className="text-base sm:text-lg font-black text-foreground flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HelpCircle className="size-5" />
            </div>
            <div className="flex flex-col text-start">
              <span>{isEditing ? 'ویرایش سوال متداول' : 'افزودن سوال متداول جدید'}</span>
              <span className="text-xs font-normal text-muted-foreground mt-0.5">
                {isEditing
                  ? 'تغییرات مورد نظر را در پرسش، پاسخ یا اولویت نمایش اعمال نمایید.'
                  : 'پرسش و پاسخ جدید برای نمایش در صفحه سوالات متداول کاربران ایجاد کنید.'}
              </span>
            </div>
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="بستن"
          >
            <X className="size-5" />
          </button>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
            {/* Error banner */}
            {formError && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20 animate-in fade-in">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Question Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>
                  پرسش / عنوان سوال <span className="text-destructive">*</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  {question.length} / ۵۰۰ کاراکتر
                </span>
              </label>
              <Input
                type="text"
                placeholder="مثلاً: نحوه ارسال و بسته‌بندی تابلوها چگونه است؟"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={500}
                className="rounded-2xl text-xs sm:text-sm h-12 px-4 bg-background"
                required
              />
            </div>

            {/* Answer Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-foreground">
                پاسخ تفصیلی <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="پاسخ کامل و شفاف به سوال کاربر را بنویسید..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="p-4 rounded-2xl border border-input bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full resize-none leading-relaxed"
                required
              />
            </div>

            {/* Order and Status Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Display Order */}
              <div className="flex flex-col justify-between p-4 rounded-2xl bg-muted/20 border border-border/60 gap-2.5">
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <Hash className="size-4 text-primary" />
                    <span>ترتیب نمایش (اولویت)</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    اعداد کوچکتر در بالای لیست قرار می‌گیرند.
                  </span>
                </div>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  className="rounded-xl text-xs h-10 px-3 bg-background"
                />
              </div>

              {/* Status Segmented Selector */}
              <div className="flex flex-col justify-between p-4 rounded-2xl bg-muted/20 border border-border/60 gap-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black text-foreground">وضعیت انتشار</span>
                  <span className="text-[11px] text-muted-foreground">
                    نمایش عمومی در صفحه سوالات متداول
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs'
                        : 'bg-background text-muted-foreground border-border/60 hover:bg-muted/40'
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'
                      }`}
                    />
                    <span>فعال</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                      !isActive
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs'
                        : 'bg-background text-muted-foreground border-border/60 hover:bg-muted/40'
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        !isActive ? 'bg-amber-500' : 'bg-muted-foreground/30'
                      }`}
                    />
                    <span>غیرفعال</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="p-5 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-2xl text-xs font-bold px-5 h-10 cursor-pointer"
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              className="rounded-2xl text-xs font-extrabold gap-2 px-6 h-10 cursor-pointer shadow-md shadow-primary/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>{isEditing ? 'ذخیره تغییرات' : 'ایجاد سوال متداول'}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
