"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useLanguage } from "../LanguageContext";
import { useApp } from "../AppContext";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  ChevronLeft,
  AlertCircle,
  CreditCard,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Lock,
  Loader2,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCreateOrder, useSubmitPaymentReceipt } from "@/hooks/useOrders";

const BANK_INFO = {
  bankName: "بلو بانک",
  cardNumber: "6219-8618-3853-2686",
  cardNumberRaw: "6219861838532686",
  accountHolder: "پریسا بابایی",
};

// Zod Schema for Receiver Address & Shipping Info (Step 1)
const addressFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "لطفاً نام و نام خانوادگی خود را کامل وارد کنید (حداقل ۲ حرف)"),
  phone: z.string().min(10, "شماره موبایل معتبر (۱۰ یا ۱۱ رقمی) وارد کنید"),
  postalCode: z.string().optional(),
  address: z
    .string()
    .min(
      5,
      "لطفاً نشانی کامل تحویل گیرنده را وارد کنید (استان، شهر، خیابان، پلاک)",
    ),
  paymentMethod: z.string(),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

export default function CheckoutView() {
  const router = useRouter();
  const { t } = useLanguage();
  const { cart, clearCart, user, showToast } = useApp();

  const createOrderMutation = useCreateOrder();
  const submitReceiptMutation = useSubmitPaymentReceipt();

  // 2-Step Checkout State: 1 = Address & Info, 2 = Payment & Receipt Upload, 3 = Success
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [submittedAddressData, setSubmittedAddressData] =
    useState<AddressFormData | null>(null);

  // Receipt upload & validation state for Step 2
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // React Hook Form for Step 1
  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: user?.name || "",
      phone: user?.phone || "",
      postalCode: "",
      address: "",
      paymentMethod: "card",
    },
  });

  // Auto-fill user information when user query resolves
  useEffect(() => {
    if (user?.name) setValue("fullName", user.name);
    if (user?.phone) setValue("phone", user.phone);
  }, [user, setValue]);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fa-IR")} تومان`;
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(BANK_INFO.cardNumberRaw);
    setCopiedCard(true);
    showToast("شماره کارت با موفقیت کپی شد", "success");
    setTimeout(() => setCopiedCard(false), 2000);
  };

  // Handle Step 1 Submission: Validate address & Create Order on Backend
  const onStep1Submit = async (data: AddressFormData) => {
    setGeneralError(null);

    if (!user) {
      showToast("برای ثبت سفارش، ابتدا وارد حساب کاربری شوید", "info");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (cart.length === 0) {
      showToast("سبد خرید شما خالی است", "error");
      return;
    }

    try {
      // Create Order on Backend (server calculates prices & checks stock)
      const newOrder = await createOrderMutation.mutateAsync({
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        postalCode: data.postalCode?.trim() || undefined,
        address: data.address.trim(),
        paymentMethod: "card",
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      });

      setCreatedOrderId(newOrder.id);
      setSubmittedAddressData(data);
      setCheckoutStep(2); // Move to Step 2: Payment & Receipt Upload
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast(
        "فاکتور سفارش ثبت شد. لطفاً فیش واریزی را بارگذاری کنید.",
        "success",
      );
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "خطا در ایجاد فاکتور سفارش. لطفاً مجدداً تلاش کنید.";
      setGeneralError(msg);
      showToast(msg, "error");
    }
  };

  // Handle Receipt Selection & File Validation
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptError(null);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      const err = "فرمت فایل باید JPG, JPEG یا PNG باشد.";
      setReceiptError(err);
      showToast(err, "error");
      return;
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const err = "حجم فایل نباید بیشتر از ۵ مگابایت باشد.";
      setReceiptError(err);
      showToast(err, "error");
      return;
    }

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setReceiptError(null);
  };

  // Handle Step 2 Submission: Validate Receipt Photo presence & Upload via API
  const onStep2PaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReceiptError(null);
    setGeneralError(null);

    // Strict validation: User MUST upload receipt image
    if (!receiptFile) {
      const errMsg =
        "لطفاً تصویر فیش واریز کارت به کارت را انتخاب/بارگذاری نمایید.";
      setReceiptError(errMsg);
      showToast(errMsg, "error");
      return;
    }

    try {
      // Upload payment receipt image to API
      await submitReceiptMutation.mutateAsync({
        orderId: createdOrderId,
        file: receiptFile,
      });

      setCheckoutStep(3); // Move to Success state
      clearCart();
      showToast("فیش واریز با موفقیت ارسال شد", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "خطا در ارسال تصویر فیش واریز.";
      setReceiptError(msg);
      showToast(msg, "error");
    }
  };

  // Unauthenticated Guard
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-6">
          <Lock className="size-8" />
        </div>
        <h2 className="text-lg font-black text-foreground mb-2">
          ورود به حساب کاربری الزامی است
        </h2>
        <p className="text-xs text-muted-foreground mb-6 leading-6">
          جهت ثبت سفارش و نهایی کردن خرید خود، ابتدا باید وارد حساب کاربری خود
          شوید یا ثبت‌نام کنید.
        </p>
        <Button
          onClick={() => router.push("/login?redirect=/checkout")}
          className="rounded-xl font-bold cursor-pointer px-6"
        >
          ورود یا ثبت‌نام
        </Button>
      </div>
    );
  }

  // Step 3: Success Screen
  if (checkoutStep === 3) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
          <CheckCircle2 className="size-12 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-2">
          {t("orderSuccess")}
        </h2>
        <p className="text-xs text-muted-foreground mb-6 leading-6">
          سفارش شما با کد پیگیری اختصاصی ثبت گردید. فیش واریزی شما هم‌اکنون در
          انتظار بررسی و تایید مدیریت است.
        </p>

        <div className="w-full bg-muted/20 border border-border/40 rounded-2xl p-5 mb-8 flex flex-col gap-3 text-xs md:text-sm">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">{t("orderId")}</span>
            <span className="font-extrabold text-primary tracking-wider dir-ltr">
              {createdOrderId}
            </span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">نام خریدار:</span>
            <span className="text-foreground">
              {submittedAddressData?.fullName}
            </span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">مبلغ کل پرداختی:</span>
            <span className="text-primary font-black">
              {formatPrice(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between font-semibold pt-2 border-t border-border/40">
            <span className="text-muted-foreground">وضعیت پرداخت:</span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center gap-1">
              <Clock className="size-3" />
              در انتظار بررسی مدیریت
            </span>
          </div>
        </div>

        <div className="flex w-full gap-4">
          <Button
            variant="outline"
            className="flex-1 rounded-xl cursor-pointer"
          >
            <Link href="/">بازگشت به خانه</Link>
          </Button>
          <Button className="flex-1 rounded-xl cursor-pointer">
            <Link href="/profile">پیگیری سفارشات</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Empty Cart Guard
  if (cart.length === 0 && checkoutStep === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <h2 className="text-base font-bold text-foreground mb-4">
          سبد خرید شما خالی است!
        </h2>
        <Button className="rounded-xl">
          <Link href="/">بازگشت به خانه</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 font-semibold">
        <Link href="/" className="hover:text-primary cursor-pointer">
          {t("home")}
        </Link>
        <ChevronLeft className="size-3" />
        <Link href="/cart" className="hover:text-primary cursor-pointer">
          {t("cart")}
        </Link>
        <ChevronLeft className="size-3" />
        <span className="text-foreground font-bold">تسویه حساب و پرداخت</span>
      </div>

      {/* ─── 2-STEP PROGRESS BAR ─── */}
      <div className="w-full bg-background border border-border/60 rounded-2xl p-4 mb-8 shadow-sm">
        <div className="flex items-center justify-around max-w-xl mx-auto">
          {/* Step 1 Indicator */}
          <div
            className={`flex items-center gap-2 ${checkoutStep === 1 ? "text-primary font-black" : "text-emerald-500 font-bold"}`}
          >
            <div
              className={`size-8 rounded-full flex items-center justify-center text-xs font-black ${checkoutStep === 1 ? "bg-primary text-white" : "bg-emerald-500 text-white"}`}
            >
              {checkoutStep > 1 ? <Check className="size-4" /> : "۱"}
            </div>
            <span className="text-xs sm:text-sm">نشانی و مشخصات</span>
          </div>

          <div
            className={`h-0.5 w-16 sm:w-24 ${checkoutStep > 1 ? "bg-emerald-500" : "bg-border"}`}
          />

          {/* Step 2 Indicator */}
          <div
            className={`flex items-center gap-2 ${checkoutStep === 2 ? "text-primary font-black" : "text-muted-foreground font-bold"}`}
          >
            <div
              className={`size-8 rounded-full flex items-center justify-center text-xs font-black ${checkoutStep === 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
            >
              ۲
            </div>
            <span className="text-xs sm:text-sm">واریز و بارگذاری فیش</span>
          </div>
        </div>
      </div>

      {/* Global Error Notice */}
      {generalError && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-xs font-bold mb-6 border border-destructive/30">
          <AlertCircle className="size-5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* ─────────────────── STEP 1: ADDRESS & SHIPPING FORM ─────────────────── */}
      {checkoutStep === 1 && (
        <form
          onSubmit={handleFormSubmit(onStep1Submit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in"
        >
          {/* Receiver Information & Payment Method (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Address Form Card */}
            <div className="border border-border/40 rounded-2xl p-6 bg-background shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-black text-foreground border-b border-border/40 pb-3 mb-2 flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <span>گام اول: ثبت نشانی تحویل گیرنده</span>
              </h3>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  {t("fullName")} *
                </label>
                <Input
                  type="text"
                  placeholder="مثال: علیرضا محمدی"
                  {...register("fullName")}
                  className={`rounded-xl text-xs sm:text-sm ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  dir="rtl"
                />
                {errors.fullName && (
                  <span className="text-[11px] text-destructive font-bold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="size-3" />
                    {errors.fullName.message}
                  </span>
                )}
              </div>

              {/* Phone & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
                    {t("phoneNumber")} *
                  </label>
                  <Input
                    type="tel"
                    placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                    {...register("phone")}
                    className={`rounded-xl text-xs sm:text-sm ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    dir="ltr"
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-destructive font-bold flex items-center gap-1 mt-0.5">
                      <AlertCircle className="size-3" />
                      {errors.phone.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
                    {t("postalCode")}
                  </label>
                  <Input
                    type="text"
                    placeholder="کد پستی ۱۰ رقمی (اختیاری)"
                    {...register("postalCode")}
                    className="rounded-xl text-xs sm:text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  {t("address")} *
                </label>
                <textarea
                  placeholder="استان، شهر، خیابان اصلی و فرعی، پلاک، واحد..."
                  {...register("address")}
                  rows={3}
                  className={`w-full p-4 rounded-xl border ${errors.address ? "border-destructive" : "border-border/40"} focus:outline-none focus:border-primary/50 text-xs sm:text-sm bg-background`}
                  dir="rtl"
                />
                {errors.address && (
                  <span className="text-[11px] text-destructive font-bold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="size-3" />
                    {errors.address.message}
                  </span>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="border border-border/40 rounded-2xl p-6 bg-background shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-black text-foreground border-b border-border/40 pb-3 mb-2 flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <span>انتخاب روش پرداخت</span>
              </h3>

              <div className="flex flex-col gap-3">
                {/* Online Payment Option (Disabled cleanly) */}
                <div className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-muted/20 opacity-70">
                  <label className="flex items-center gap-3 cursor-not-allowed">
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      disabled
                      checked={false}
                      className="accent-primary"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold text-muted-foreground line-through">
                        پرداخت آنلاین درگاه پورتال
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        پرداخت مستقیم با تمامی کارت‌های عضو شتاب
                      </span>
                    </div>
                  </label>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold">
                    در حال حاضر غیرفعال می‌باشد
                  </span>
                </div>

                {/* Card-to-Card Payment Option (Active) */}
                <label className="flex items-center justify-between p-4 border-2 border-primary/60 rounded-xl cursor-pointer bg-primary/5 transition-all">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      checked={true}
                      readOnly
                      className="accent-primary"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-black text-foreground">
                        کارت به کارت (کارت به کارت و بارگذاری فیش واریز)
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        انتقال وجه به شماره کارت گالری و ارسال عکس فیش در گام
                        بعدی
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    فعال
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Invoice Summary (1 Col) */}
          <div className="flex flex-col">
            <div className="border border-border/40 bg-muted/10 rounded-2xl p-6 flex flex-col gap-6 sticky top-24">
              <h3 className="text-sm font-black text-foreground border-b border-border/60 pb-3">
                پیش‌فاکتور سفارش
              </h3>

              {/* List items brief */}
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs font-semibold text-muted-foreground"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[170px]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-8 rounded-lg object-cover shrink-0"
                      />
                      <span className="truncate">
                        {item.name} (×{item.quantity})
                      </span>
                    </div>
                    <span className="shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-border/60" />

              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>هزینه ارسال :</span>
                <span className="text-emerald-500 font-bold">بر عهده خریدار</span>
              </div>

              <div className="flex items-center justify-between text-sm font-black text-foreground">
                <span>{t("totalPrice")}</span>
                <span className="text-primary text-base">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full py-3.5 rounded-xl font-extrabold cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 gap-2"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>در حال ایجاد فاکتور...</span>
                  </>
                ) : (
                  <>
                    <span>ادامه به گام دوم (اطلاعات کارت و فیش)</span>
                    <ArrowRight className="size-4 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ─────────────────── STEP 2: PAYMENT & RECEIPT UPLOAD ─────────────────── */}
      {checkoutStep === 2 && (
        <form
          onSubmit={onStep2PaymentSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in"
        >
          {/* Card Info & Receipt Upload (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Order Brief Notification */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-primary shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-foreground">
                    فاکتور شما با موفقیت صادر شد
                  </span>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    کد پیگیری سفارش:{" "}
                    <strong className="text-primary font-black dir-ltr inline-block">
                      {createdOrderId}
                    </strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutStep(1)}
                className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer underline"
              >
                ویرایش آدرس
              </button>
            </div>

            {/* Bank Card Details Box */}
            <div className="border border-border/60 bg-card rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-black text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <span>اطلاعات شماره کارت جهت کارت به کارت</span>
              </h3>

              <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">
                    نام بانک مقصد:
                  </span>
                  <span className="font-bold text-foreground">
                    {BANK_INFO.bankName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">
                    نام صاحب حساب:
                  </span>
                  <span className="font-bold text-foreground">
                    {BANK_INFO.accountHolder}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-border/40 pt-2.5">
                  <span className="text-muted-foreground font-semibold">
                    شماره کارت:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-primary text-base dir-ltr tracking-wider">
                      {BANK_INFO.cardNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="کپی شماره کارت"
                    >
                      {copiedCard ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-primary/10 p-3 rounded-lg border border-primary/20 mt-1">
                  <span className="font-extrabold text-foreground">
                    مبلغ دقیق واریزی:
                  </span>
                  <span className="font-black text-primary text-base">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Receipt Upload Card */}
            <div className="border border-border/60 bg-card rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Upload className="size-4 text-primary" />
                  <span>بارگذاری تصویر فیش واریز (الزامی) *</span>
                </h3>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  فرمت‌های مجاز: JPG, PNG (حداکثر ۵ مگابایت)
                </span>
              </div>

              {/* Receipt File Validation Error Message Box */}
              {receiptError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{receiptError}</span>
                </div>
              )}

              {!receiptPreview ? (
                <label
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-muted/10 transition-all text-center ${receiptError ? "border-destructive bg-destructive/5" : "border-border/80 hover:border-primary"}`}
                >
                  <Upload className="size-10 text-primary mb-3 animate-bounce" />
                  <span className="text-xs font-black text-foreground mb-1">
                    کلیک کنید تا عکس فیش واریزی را انتخاب نمایید
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    یا فایل عکس فیش را در این کادر رها کنید
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleReceiptChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-border/60 rounded-2xl bg-muted/20">
                  <div className="relative size-28 rounded-xl overflow-hidden border border-border/60 shrink-0 bg-background">
                    <img
                      src={receiptPreview}
                      alt="فیش واریزی"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-right">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1">
                      <ImageIcon className="size-4" />
                      <span className="truncate">{receiptFile?.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block mb-3">
                      حجم فایل:{" "}
                      {((receiptFile?.size || 0) / 1024 / 1024).toFixed(2)}{" "}
                      مگابایت
                    </span>
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="text-xs font-bold text-destructive hover:underline cursor-pointer"
                    >
                      حذف تصویر و انتخاب عکس دیگر
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Summary & Final Confirm Button (1 Col) */}
          <div className="flex flex-col">
            <div className="border border-border/40 bg-muted/10 rounded-2xl p-6 flex flex-col gap-6 sticky top-24">
              <h3 className="text-sm font-black text-foreground border-b border-border/60 pb-3">
                خلاصه پرداخت
              </h3>

              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>کد سفارش:</span>
                <span className="font-extrabold text-foreground dir-ltr">
                  {createdOrderId}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>روش پرداخت:</span>
                <span className="font-bold text-foreground">کارت به کارت</span>
              </div>

              <hr className="border-border/60" />

              <div className="flex items-center justify-between text-sm font-black text-foreground">
                <span>مبلغ پرداختی:</span>
                <span className="text-primary text-base">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={submitReceiptMutation.isPending}
                className="w-full py-3.5 rounded-xl font-extrabold cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitReceiptMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>در حال ارسال فیش واریزی...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>تایید و ارسال نهایی فیش واریز</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
