"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useLanguage } from "../LanguageContext"
import { useApp } from "../AppContext"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { CheckCircle2, ChevronLeft, AlertCircle } from "lucide-react"
import { useCreateOrder } from "@/hooks/useOrders"

export default function CheckoutView() {
  const { t } = useLanguage()
  const { cart, clearCart } = useApp()
  const createOrderMutation = useCreateOrder()
  
  // Forms state
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [address, setAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("online")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Success view state
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fa-IR")} تومان`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!fullName || !phone || !address) {
      setErrorMessage("لطفا فیلدهای اجباری را پر کنید")
      return
    }

    createOrderMutation.mutate(
      {
        fullName,
        phone,
        postalCode,
        address,
        paymentMethod,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      },
      {
        onSuccess: (data) => {
          setOrderNumber(data.id)
          setOrderSuccess(true)
          clearCart()
        },
        onError: (err: any) => {
          setErrorMessage(err?.message || "خطا در ثبت سفارش")
        },
      }
    )
  }

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
          <CheckCircle2 className="size-12 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-3">{t("orderSuccess")}</h2>
        <p className="text-xs text-muted-foreground mb-6 leading-6">
          سفارش شما با موفقیت در سیستم ثبت گردید و هم‌اکنون در حال پردازش می‌باشد. از اعتماد شما سپاسگزاریم.
        </p>

        <div className="w-full bg-muted/20 border border-border/40 rounded-2xl p-5 mb-8 flex flex-col gap-3 text-xs md:text-sm">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">{t("orderId")}</span>
            <span className="font-extrabold text-foreground tracking-widest">{orderNumber}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">نام خریدار:</span>
            <span className="text-foreground">{fullName}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">مبلغ نهایی:</span>
            <span className="text-primary font-black">{formatPrice(subtotal)}</span>
          </div>
        </div>

        <div className="flex w-full gap-4">
          <Button variant="outline" className="flex-1 rounded-xl cursor-pointer">
            <Link href="/">بازگشت به خانه</Link>
          </Button>
          <Button className="flex-1 rounded-xl cursor-pointer">
            <Link href="/track-order">{t("trackBtn")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <h2 className="text-base font-bold text-foreground mb-4">سبد خرید شما خالی است!</h2>
        <Button className="rounded-xl">
          <Link href="/">بازگشت به خانه</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8 font-semibold">
        <Link href="/" className="hover:text-primary cursor-pointer">
          {t("home")}
        </Link>
        <ChevronLeft className="size-3" />
        <Link href="/cart" className="hover:text-primary cursor-pointer">
          {t("cart")}
        </Link>
        <ChevronLeft className="size-3" />
        <span className="text-foreground font-bold">{t("addressInfo")}</span>
      </div>

      <h1 className="text-xl md:text-2xl font-black text-foreground mb-8">{t("addressInfo")}</h1>

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-xs font-bold mb-6">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Address and Shipping details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="border border-border/40 rounded-2xl p-6 bg-background shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-black text-foreground border-b border-border/40 pb-3 mb-2">
              نشانی گیرنده سفارش
            </h3>

            {/* Row 1: Full name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground">{t("fullName")} *</label>
              <Input
                type="text"
                placeholder="مثال: علیرضا محمدی"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-xl text-xs sm:text-sm"
                dir="rtl"
              />
            </div>

            {/* Row 2: Phone & Postal code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground">{t("phoneNumber")} *</label>
                <Input
                  type="tel"
                  placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="rounded-xl text-xs sm:text-sm"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground">{t("postalCode")}</label>
                <Input
                  type="text"
                  placeholder="کد پستی ۱۰ رقمی"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="rounded-xl text-xs sm:text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Row 3: Full Address */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground">{t("address")} *</label>
              <textarea
                placeholder="استان، شهر، خیابان اصلی و فرعی، پلاک، واحد..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                className="w-full p-4 rounded-xl border border-border/40 focus:outline-none focus:border-primary/50 text-xs sm:text-sm bg-background"
                dir="rtl"
              />
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="border border-border/40 rounded-2xl p-6 bg-background shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-black text-foreground border-b border-border/40 pb-3 mb-2">
              {t("paymentMethod")}
            </h3>

            <div className="flex flex-col gap-3">
              {/* Online payment */}
              <label className="flex items-center gap-3 p-4 border border-border/60 rounded-xl cursor-pointer hover:bg-muted/10 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="accent-primary"
                />
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-foreground">{t("onlinePayment")}</span>
                  <span className="text-[10px] text-muted-foreground">پرداخت با تمامی کارت‌های عضو شتاب</span>
                </div>
              </label>

              {/* Card to card */}
              <label className="flex items-center gap-3 p-4 border border-border/60 rounded-xl cursor-pointer hover:bg-muted/10 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="accent-primary"
                />
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-foreground">{t("cardPayment")}</span>
                  <span className="text-[10px] text-muted-foreground">انتقال وجه کارت به کارت و ثبت فیش</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="flex flex-col">
          <div className="border border-border/40 bg-muted/10 rounded-2xl p-6 flex flex-col gap-6">
            <h3 className="text-sm font-black text-foreground border-b border-border/60 pb-3">
              فاکتور نهایی پرداخت
            </h3>

            {/* List items brief */}
            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span className="truncate max-w-[150px]">{item.name} (×{item.quantity})</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <hr className="border-border/60" />

            <div className="flex items-center justify-between text-sm font-black text-foreground">
              <span>{t("totalPrice")}</span>
              <span className="text-primary">{formatPrice(subtotal)}</span>
            </div>

            <Button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="w-full py-3 rounded-xl font-extrabold cursor-pointer hover:scale-[1.02] transition-transform"
            >
              {createOrderMutation.isPending ? "در حال ثبت سفارش..." : t("completeOrder")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
