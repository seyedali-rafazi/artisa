"use client"

import React, { createContext, useContext } from "react"

type LanguageContextType = {
  dir: "rtl"
  t: (key: string) => string
}

const translations: Record<string, string> = {
  // Header
  brandName: "آرتیسا",
  brandSubtitle: "گالری آنلاین تابلو و هنر دیواری",
  searchPlaceholder: "جستجوی تابلو، هنر دیواری...",
  loginSignup: "ورود | ثبت نام",
  cart: "سبد خرید",
  trackOrder: "پیگیری سفارش",
  home: "خانه",
  categories: "دسته‌بندی آثار",
  amazingOffers: "پیشنهادات ویژه",
  bestSellers: "پرفروش‌ترین‌ها",
  newArrivals: "جدیدترین آثار",
  blog: "مجله هنر",
  contactUs: "تماس با ما",
  aboutUs: "درباره ما",

  // Banner / Slider
  sliderTitle1: "هنر را به دیوارت بیاور",
  sliderDesc1: "مجموعه‌ای از تابلوهای نقاشی اورجینال با تخفیف ویژه تا ۴۰٪",
  sliderTitle2: "سبک خانه‌ات را تعریف کن",
  sliderDesc2: "آثار هنری دیواری منحصربه‌فرد از هنرمندان ایرانی",
  sliderBtn: "مشاهده آثار",

  // Services
  serviceDelivery: "ارسال مطمئن آثار هنری",
  serviceDeliveryDesc: "بسته‌بندی تخصصی و تحویل درب منزل",
  serviceSupport: "پشتیبانی ۲۴/۷",
  serviceSupportDesc: "مشاوره هنری آنلاین در تمام روزهای هفته",
  serviceGuarantee: "ضمانت اصالت اثر",
  serviceGuaranteeDesc: "گواهی اصالت برای تمام آثار اورجینال",
  servicePayment: "پرداخت در محل",
  servicePaymentDesc: "امکان پرداخت وجه پس از تحویل اثر",

  // Specials
  specialOffersTitle: "آثار ویژه با قیمت استثنایی",
  specialOffersSubtitle: "فرصت محدود برای تهیه آثار هنری اورجینال",
  viewAll: "مشاهده همه",
  timeLeft: "زمان باقی‌مانده:",

  // Categories
  categoriesTitle: "دسته‌بندی آثار هنری",
  categoryPainting: "تابلو نقاشی",
  categoryWallArt: "هنر دیواری",
  categorySculpture: "مجسمه و دکوری",
  categoryFrame: "قاب و فریم",
  categoryModernArt: "هنر مدرن",
  categoryGift: "هدایای هنری",

  // Best Sellers
  bestSellersTitle: "پرفروش‌ترین آثار آرتیسا",
  bestSellersSubtitle: "انتخاب‌های محبوب هنردوستان در این ماه",

  // Blog
  blogTitle: "مجله هنر آرتیسا",
  blogSubtitle: "مقالات، ایده‌ها و راهنمای چیدمان هنری برای خانه شما",
  readMore: "ادامه مطلب",

  // Product details
  productDetails: "جزئیات اثر",
  addToCart: "افزودن به سبد خرید",
  addedToCart: "به سبد خرید اضافه شد",
  installment: "خرید اقساطی",
  installmentDesc: "امکان خرید در اقساط ۳ تا ۱۲ ماه بدون ضامن",
  vendor: "هنرمند / گالری:",
  rating: "امتیاز:",
  comments: "نظرات خریداران",
  addComment: "ثبت نظر",

  // Cart & Checkout
  cartTitle: "سبد خرید شما",
  emptyCart: "سبد خرید شما خالی است!",
  totalPrice: "مبلغ کل:",
  checkoutBtn: "ادامه جهت ثبت سفارش",
  addressInfo: "اطلاعات ارسال",
  fullName: "نام و نام خانوادگی",
  phoneNumber: "شماره تماس",
  postalCode: "کد پستی",
  address: "آدرس دقیق پستی",
  paymentMethod: "روش پرداخت",
  onlinePayment: "پرداخت آنلاین بانکی",
  cardPayment: "کارت به کارت",
  completeOrder: "ثبت و پرداخت نهایی",
  orderSuccess: "سفارش شما با موفقیت ثبت شد!",
  orderId: "کد سفارش:",
  trackBtn: "رهگیری سفارش",

  clearAll: "پاک کردن همه",

  // FAQ
  faqTitle: "سوالات متداول",
  faqSubtitle: "پاسخ به رایج‌ترین سوالات شما درباره خرید آثار هنری",

  // Track Order
  trackOrderTitle: "رهگیری وضعیت سفارش",
  trackInputPlaceholder: "شماره سفارش خود را وارد کنید...",
  trackSubmit: "بررسی وضعیت",
  orderStatus: "وضعیت سفارش:",
  statusReceived: "سفارش ثبت شده",
  statusProcessing: "در حال آماده‌سازی و بسته‌بندی",
  statusShipped: "تحویل به پست/پیک",
  statusDelivered: "تحویل داده شده",

  // Footer
  newsletterTitle: "عضویت در خبرنامه آرتیسا",
  newsletterDesc: "از جدیدترین آثار و رویدادهای هنری باخبر شوید",
  subscribeBtn: "عضویت",
  footerAbout: "گالری آنلاین آرتیسا از سال ۱۴۰۵ با هدف در دسترس قرار دادن آثار هنری اورجینال برای علاقه‌مندان هنر فعالیت می‌کند. ما پل ارتباطی بین هنرمندان ایرانی و هنردوستان سراسر کشور هستیم.",
  quickLinks: "دسترسی سریع",
  customerService: "خدمات مشتریان",
  copyright: "© ۱۴۰۵ کلیه حقوق برای گالری آرتیسا محفوظ است.",

  // Profile
  profileTitle: "پروفایل کاربری",
  profileInfo: "اطلاعات حساب",
  editProfile: "ویرایش پروفایل",
  changePassword: "تغییر رمز عبور",
  savedAddresses: "آدرس‌های من",
  orderHistory: "تاریخچه سفارش‌ها",
  profileCart: "سبد خرید",
  wishlist: "علاقه‌مندی‌ها",
  accountSettings: "تنظیمات حساب",
  logout: "خروج از حساب",
  deleteAccount: "حذف حساب کاربری",
  memberSince: "عضو از:",
  userRole: "نقش کاربری:",
  defaultRole: "مشتری",
  saveChanges: "ذخیره تغییرات",
  cancel: "انصراف",
  currentPassword: "رمز عبور فعلی",
  newPassword: "رمز عبور جدید",
  confirmNewPassword: "تأیید رمز عبور جدید",
  passwordMismatch: "رمز عبور جدید و تأییدیه مطابقت ندارند.",
  passwordTooShort: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
  profileUpdateSuccess: "اطلاعات پروفایل با موفقیت بروزرسانی شد.",
  passwordUpdateSuccess: "رمز عبور با موفقیت تغییر کرد.",
  addAddress: "افزودن آدرس جدید",
  editAddress: "ویرایش آدرس",
  deleteAddress: "حذف آدرس",
  setDefaultAddress: "تعیین به عنوان پیش‌فرض",
  defaultAddress: "پیش‌فرض",
  addressTitle: "عنوان آدرس (مثال: خانه، محل کار)",
  province: "استان",
  city: "شهر",
  noAddresses: "هنوز آدرسی ثبت نشده است.",
  noOrders: "هنوز سفارشی ثبت نشده است.",
  noWishlist: "لیست علاقه‌مندی‌ها خالی است.",
  orderDetails: "جزئیات سفارش",
  orderDate: "تاریخ سفارش:",
  orderStatusLabel: "وضعیت:",
  orderTotal: "مبلغ کل:",
  paymentStatusLabel: "وضعیت پرداخت:",
  statusPending: "در انتظار تأیید",
  statusCancelled: "لغو شده",
  paymentPaid: "پرداخت شده",
  paymentUnpaid: "پرداخت نشده",
  paymentRefunded: "بازگشت وجه",
  addToCartFromWishlist: "افزودن به سبد",
  removeFromWishlist: "حذف از علاقه‌مندی",
  confirmDeleteAccount: "آیا مطمئن هستید که می‌خواهید حساب کاربری خود را حذف کنید؟ این عمل غیرقابل بازگشت است.",
  confirmDeleteAddress: "آیا می‌خواهید این آدرس را حذف کنید؟",
  confirm: "تأیید",
  loginToViewProfile: "برای مشاهده پروفایل ابتدا وارد شوید.",
  goToLogin: "ورود به حساب",
  profileSidebar: "منوی پروفایل",
  items: "قلم",
}

const LanguageContext = createContext<LanguageContextType>({
  dir: "rtl",
  t: (key: string) => translations[key] ?? key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const t = (key: string): string => translations[key] ?? key

  return (
    <LanguageContext.Provider value={{ dir: "rtl", t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
