'use client';

import React, { useState, useMemo } from 'react';
import {
  SpecificationSetting,
  useSpecificationSettings,
  useCreateSpecificationSetting,
  useUpdateSpecificationSetting,
  useDeleteSpecificationSetting,
} from '@/hooks/useSpecificationSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SlidersHorizontal,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  CheckSquare,
  Square,
  X,
  Loader2,
  Tag,
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface ProductSpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecs?: (specsToAdd: { key: string; value: string }[]) => void;
  currentSpecs?: { key: string; value: string }[];
  defaultTab?: 'select' | 'manage';
}

export default function ProductSpecificationModal({
  isOpen,
  onClose,
  onSelectSpecs,
  currentSpecs = [],
  defaultTab = 'select',
}: ProductSpecificationModalProps) {
  const isSelectMode = Boolean(onSelectSpecs);
  const [activeTab, setActiveTab] = useState<'select' | 'manage'>(
    isSelectMode ? defaultTab : 'manage'
  );

  // Search & category filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Multi-selection state (keys of presets)
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<string>>(new Set());

  // Preset Form (New)
  const [newTitle, setNewTitle] = useState('');
  const [newDefaultValue, setNewDefaultValue] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Preset Form (Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDefaultValue, setEditDefaultValue] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
  });

  // Mutations
  const { data: presets = [], isLoading } = useSpecificationSettings();
  const createMutation = useCreateSpecificationSetting();
  const updateMutation = useUpdateSpecificationSetting();
  const deleteMutation = useDeleteSpecificationSetting();

  // Set of keys currently in product
  const existingSpecKeys = useMemo(() => {
    return new Set(
      currentSpecs
        .map((s) => s.key.trim().toLowerCase())
        .filter((k) => k.length > 0)
    );
  }, [currentSpecs]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    presets.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [presets]);

  // Filtered presets
  const filteredPresets = useMemo(() => {
    return presets.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (item.default_value &&
          item.default_value.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (item.category &&
          item.category.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      const matchCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'عمومی' && (!item.category || item.category === 'عمومی')) ||
        item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [presets, searchTerm, selectedCategory]);

  // Handle single preset toggle
  const togglePreset = (id: string) => {
    setSelectedPresetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (selectedPresetIds.size === filteredPresets.length && filteredPresets.length > 0) {
      setSelectedPresetIds(new Set());
    } else {
      setSelectedPresetIds(new Set(filteredPresets.map((p) => p.id)));
    }
  };

  // Add selected items to product
  const handleApplySelected = () => {
    if (!onSelectSpecs) return;

    const selectedItems = presets.filter((p) => selectedPresetIds.has(p.id));
    if (selectedItems.length === 0) {
      toast.warning('لطفاً حداقل یک مشخصه فنی را انتخاب کنید.');
      return;
    }

    const formattedSpecs = selectedItems.map((item) => ({
      key: item.title,
      value: item.default_value || '',
    }));

    onSelectSpecs(formattedSpecs);
    toast.success(`${formattedSpecs.length} مشخصه فنی با موفقیت به محصول افزوده شد.`);
    setSelectedPresetIds(new Set());
    onClose();
  };

  // Quick single add to product
  const handleQuickAdd = (preset: SpecificationSetting) => {
    if (!onSelectSpecs) return;
    onSelectSpecs([{ key: preset.title, value: preset.default_value || '' }]);
    toast.success(`«${preset.title}» به مشخصات محصول افزوده شد.`);
  };

  // Create new setting
  const handleCreateSetting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('عنوان مشخصه فنی الزامی است.');
      return;
    }

    createMutation.mutate(
      {
        title: newTitle.trim(),
        default_value: newDefaultValue.trim(),
        category: newCategory.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('مشخصه فنی جدید با موفقیت ذخیره شد.');
          setNewTitle('');
          setNewDefaultValue('');
          setNewCategory('');
        },
        onError: () => {
          toast.error('خطا در ثبت مشخصه فنی جدید.');
        },
      }
    );
  };

  // Start editing
  const startEditing = (preset: SpecificationSetting) => {
    setEditingId(preset.id);
    setEditTitle(preset.title);
    setEditDefaultValue(preset.default_value || '');
    setEditCategory(preset.category || '');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDefaultValue('');
    setEditCategory('');
  };

  // Save edited setting
  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) {
      toast.error('عنوان نمی‌تواند خالی باشد.');
      return;
    }

    updateMutation.mutate(
      {
        id,
        title: editTitle.trim(),
        default_value: editDefaultValue.trim(),
        category: editCategory.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('مشخصه فنی با موفقیت بروزرسانی شد.');
          cancelEditing();
        },
        onError: () => {
          toast.error('خطا در ویرایش مشخصه فنی.');
        },
      }
    );
  };

  // Trigger delete modal
  const handleDeleteSetting = (id: string, title: string) => {
    setDeleteConfirm({
      isOpen: true,
      id,
      title,
    });
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    if (!deleteConfirm.id) return;

    deleteMutation.mutate(deleteConfirm.id, {
      onSuccess: () => {
        toast.success(`«${deleteConfirm.title}» با موفقیت حذف شد.`);
        setSelectedPresetIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteConfirm.id);
          return next;
        });
        setDeleteConfirm({ isOpen: false, id: '', title: '' });
      },
      onError: () => {
        toast.error('خطا در حذف مشخصه فنی.');
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[92vh] p-0 rounded-3xl overflow-hidden flex flex-col gap-0 border border-border/70 shadow-2xl bg-background"
        dir="rtl"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 border-b border-border/60 bg-muted/20 shrink-0 flex flex-row items-center justify-between gap-4">
          <DialogTitle className="text-base sm:text-lg font-black text-foreground flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <SlidersHorizontal className="size-5" />
            </div>
            <div className="flex flex-col text-start">
              <span>تنظیمات و مشخصات فنی پیش‌فرض</span>
              <span className="text-xs font-normal text-muted-foreground mt-0.5">
                {isSelectMode
                  ? 'انتخاب مشخصات فنی ذخیره‌شده جهت افزودن به محصول یا تعریف تنظیمات جدید'
                  : 'مدیریت و تعریف ویژگی‌های فنی استاندارد برای استفاده در محصولات'}
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-border/40 bg-muted/10 shrink-0">
          {isSelectMode && (
            <button
              type="button"
              onClick={() => setActiveTab('select')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'select'
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <CheckSquare className="size-4" />
              <span>انتخاب و افزودن به محصول</span>
              {selectedPresetIds.size > 0 && (
                <span className="bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded-full text-[10px] font-black">
                  {selectedPresetIds.size}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Layers className="size-4" />
            <span>مدیریت تنظیمات مشخصات ({presets.length})</span>
          </button>
        </div>

        {/* Tab 1: Selection View */}
        {activeTab === 'select' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Category Filter Toolbar */}
            <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 bg-background shrink-0">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="جستجو در ویژگی‌ها یا مقادیر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl pr-9 text-xs h-9"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills & Select All */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      selectedCategory === 'all'
                        ? 'bg-foreground text-background'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    همه
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-foreground text-background'
                          : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground shrink-0 cursor-pointer h-8 px-2.5"
                >
                  {selectedPresetIds.size === filteredPresets.length && filteredPresets.length > 0 ? (
                    <span>لغو انتخاب همه</span>
                  ) : (
                    <span>انتخاب همه ({filteredPresets.length})</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Presets List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <span className="text-xs">در حال دریافت تنظیمات مشخصات فنی...</span>
                </div>
              ) : filteredPresets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                  <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-1">
                    <Tag className="size-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">مشخصه‌ای یافت نشد</p>
                  <p className="text-xs text-muted-foreground">
                    موردی مطابق با جستجوی شما وجود ندارد. می‌توانید از تب «مدیریت تنظیمات» ویژگی جدید اضافه کنید.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredPresets.map((preset) => {
                    const isSelected = selectedPresetIds.has(preset.id);
                    const isAlreadyInProduct = existingSpecKeys.has(preset.title.toLowerCase().trim());

                    return (
                      <div
                        key={preset.id}
                        onClick={() => togglePreset(preset.id)}
                        className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 select-none ${
                          isSelected
                            ? 'border-primary/60 bg-primary/[0.04] shadow-sm shadow-primary/10 ring-1 ring-primary/20'
                            : 'border-border/60 bg-card hover:border-border hover:bg-muted/20'
                        }`}
                      >
                        {/* Top: Selection & Title */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`size-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-border/80 bg-background group-hover:border-primary/40'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="size-3.5 stroke-[3]" />
                              ) : (
                                <Square className="size-3 text-transparent" />
                              )}
                            </div>
                            <span className="text-xs font-black text-foreground truncate">
                              {preset.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isAlreadyInProduct && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                در محصول موجود است
                              </span>
                            )}
                            {preset.category && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                {preset.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Default Value preview */}
                        <div className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-xl border border-border/30 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-muted-foreground/70 shrink-0 font-medium">
                            مقدار پیشنهادی:
                          </span>
                          <span className="font-semibold text-foreground truncate text-left dir-auto">
                            {preset.default_value || '— (بدون مقدار اولیه)'}
                          </span>
                        </div>

                        {/* Bottom quick actions */}
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[10px] text-muted-foreground/60">
                            {preset.description || 'مشخصه استاندارد'}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAdd(preset);
                            }}
                            className="h-6 px-2 text-[10px] font-extrabold text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                          >
                            <Plus className="size-3 ml-1" />
                            <span>افزودن تکی</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-muted-foreground font-medium">
                {selectedPresetIds.size > 0 ? (
                  <span className="font-bold text-foreground">
                    {selectedPresetIds.size} مشخصه برای افزودن انتخاب شده است.
                  </span>
                ) : (
                  <span>برای افزودن چندگانه، ویژگی‌های مورد نظر را تیک بزنید.</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl text-xs font-bold flex-1 sm:flex-none cursor-pointer"
                >
                  انصراف
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectedPresetIds.size === 0}
                  onClick={handleApplySelected}
                  className="rounded-xl text-xs font-black gap-2 flex-1 sm:flex-none cursor-pointer shadow-lg shadow-primary/25"
                >
                  <CheckCircle2 className="size-4" />
                  <span>افزودن به مشخصات محصول ({selectedPresetIds.size})</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manage & Add New Presets */}
        {activeTab === 'manage' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Form: Add New Preset */}
            <form
              onSubmit={handleCreateSetting}
              className="p-5 border-b border-border/60 bg-muted/15 flex flex-col gap-3 shrink-0"
            >
              <div className="flex items-center gap-2 text-xs font-black text-foreground">
                <Sparkles className="size-4 text-primary" />
                <span>تعریف مشخصه فنی جدید</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    عنوان ویژگی * (مثال: تکنیک)
                  </label>
                  <Input
                    type="text"
                    placeholder="عنوان مشخصه..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rounded-xl text-xs h-9"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    مقدار پیش‌فرض پیشنهادی
                  </label>
                  <Input
                    type="text"
                    placeholder="مثال: رنگ‌روغن روی بوم..."
                    value={newDefaultValue}
                    onChange={(e) => setNewDefaultValue(e.target.value)}
                    className="rounded-xl text-xs h-9"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    دسته‌بندی (اختیاری)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="مثال: تابلو نقاشی..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="rounded-xl text-xs h-9 flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="rounded-xl text-xs font-extrabold h-9 px-4 gap-1.5 cursor-pointer shrink-0 shadow-sm"
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Plus className="size-3.5" />
                      )}
                      <span>ثبت</span>
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Presets Management Table/List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-border/40 text-[11px] font-bold text-muted-foreground px-2">
                <span>لیست مشخصات فنی ذخیره‌شده ({presets.length})</span>
                <span>عملیات</span>
              </div>

              {presets.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  هیچ مشخصه فنی ذخیره نشده است. از فرم بالا برای ایجاد ویژگی جدید استفاده نمایید.
                </div>
              ) : (
                presets.map((preset) => {
                  const isEditingThis = editingId === preset.id;

                  if (isEditingThis) {
                    return (
                      <div
                        key={preset.id}
                        className="p-3.5 rounded-2xl border border-primary/40 bg-primary/[0.03] flex flex-col sm:flex-row items-center gap-2.5 animate-in fade-in"
                      >
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="عنوان ویژگی"
                          className="rounded-xl text-xs h-8 flex-1"
                        />
                        <Input
                          value={editDefaultValue}
                          onChange={(e) => setEditDefaultValue(e.target.value)}
                          placeholder="مقدار پیش‌فرض"
                          className="rounded-xl text-xs h-8 flex-1"
                        />
                        <Input
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          placeholder="دسته‌بندی"
                          className="rounded-xl text-xs h-8 w-full sm:w-36"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            disabled={updateMutation.isPending}
                            onClick={() => handleSaveEdit(preset.id)}
                            className="rounded-xl text-[11px] font-bold h-8 px-2.5 gap-1 cursor-pointer"
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Save className="size-3" />
                            )}
                            <span>ذخیره</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditing}
                            className="rounded-xl text-[11px] font-bold h-8 px-2 text-muted-foreground cursor-pointer"
                          >
                            انصراف
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={preset.id}
                      className="p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/20 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                          {preset.title.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground">
                              {preset.title}
                            </span>
                            {preset.category && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                {preset.category}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                            پیش‌فرض: {preset.default_value || '—'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelectMode && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAdd(preset)}
                            className="h-7 text-[10px] font-bold rounded-lg gap-1 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                          >
                            <Plus className="size-3" />
                            <span>افزودن به محصول</span>
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => startEditing(preset)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                          title="ویرایش"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSetting(preset.id, preset.title)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom footer */}
            <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-end shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl text-xs font-bold cursor-pointer"
              >
                بستن
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Confirmation Modal for Deleting Specification Setting */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={handleConfirmDelete}
        title="حذف مشخصه فنی"
        description={
          <span>
            آیا از حذف مشخصه فنی پیش‌فرض <strong className="text-foreground font-black">«{deleteConfirm.title}»</strong> اطمینان دارید؟ این مشخصه از لیست تنظیمات حذف خواهد شد.
          </span>
        }
        confirmText="حذف مشخصه"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </Dialog>
  );
}

