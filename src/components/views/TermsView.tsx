'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  PackageCheck,
  RotateCcw,
  Lock,
  FileText,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Palette,
  Truck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Section {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export default function TermsView() {
  const [activeSection, setActiveSection] = useState<string>('general');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const sections: Section[] = [
    {
      id: 'general',
      number: 'ماده ۱',
      title: 'تعاریف و کلیات قرارداد',
      icon: Scale,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            ورود کاربران به وب‌سایت گالری آنلاین آرتیسا، ثبت‌نام در سامانه، مرور آثار هنری و ثبت هرگونه سفارش به منزله آگاهی کامل و پذیرش بی‌قید و شرط کلیه قوانین، مقررات و رویه‌های مندرج در این صفحه تلقی می‌گردد.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1">
              <span className="font-bold text-foreground text-xs">گالری آرتیسا:</span>
              <span className="text-[11px] text-muted-foreground">
                پلتفرم تخصصی عرضه، نمایش و فروش آثار هنری اصیل، تابلوهای نقاشی اورجینال، هنر دیواری و مجسمه‌های دست‌ساز.
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1">
              <span className="font-bold text-foreground text-xs">کاربر / خریدار:</span>
              <span className="text-[11px] text-muted-foreground">
                هر شخص حقیقی یا حقوقی که با تکمیل اطلاعات هویتی به مرور، انتخاب یا خرید اثر در آرتیسا مبادرت می‌ورزد.
              </span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-foreground flex items-start gap-3">
            <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">
              کلیه اصول و فرآیندهای گالری آرتیسا منطبق با قوانین تجارت الکترونیک، قانون حمایت از حقوق مصرف‌کنندگان و قوانین جاری جمهوری اسلامی ایران است. هرگونه تغییر در قوانین آتی از طریق همین صفحه اطلاع‌رسانی می‌شود.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'account',
      number: 'ماده ۲',
      title: 'حساب کاربری و تعهدات هویتی',
      icon: Lock,
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            جهت تسهیل پیگیری سفارش‌ها، صدور فاکتور رسمی و اختصاص گواهی اصالت به نام خریدار، ایجاد حساب کاربری الزامی است:
          </p>
          <ul className="space-y-2.5 pr-4 list-disc marker:text-primary">
            <li>
              کاربر موظف است اطلاعات هویتی، شماره تماس فعال و نشانی پستی دقیق خود را به صورت صحیح وارد کند. هرگونه تاخیر یا عدم تحویل مرسوله ناشی از ثبت نشانی نادقیق بر عهده خریدار خواهد بود.
            </li>
            <li>
              مسئولیت حفظ محرمانگی نام کاربری و رمز عبور بر عهده کاربر است. کلیه فعالیت‌هایی که تحت حساب کاربری انجام می‌پذیرد، متوجه صاحب حساب است.
            </li>
            <li>
              ثبت سفارش توسط افراد زیر ۱۸ سال مستلزم نظارت و تایید والدین یا سرپرست قانونی جهت انجام تراکنش بانکی می‌باشد.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'ordering',
      number: 'ماده ۳',
      title: 'ثبت سفارش، قیمت‌گذاری و پرداخت',
      icon: FileText,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            با توجه به ماهیت منحصربه‌فرد آثار هنری دست‌ساز و تابلوهای نقاشی اورجینال، فرآیند سفارش‌گذاری دارای ویژگی‌های زیر است:
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-background border border-border/70 shadow-2xs space-y-2">
              <h5 className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                <Palette className="size-4 text-primary" />
                آثار تک‌نسخه‌ای (Original Unique Artworks)
              </h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                تابلوهایی که با عنوان «اورجینال» عرضه می‌شوند، اثری یکتا و بی‌تکرار از هنرمند هستند. در صورت تقارن ثبت سفارش دو کاربر برای یک اثر تک‌نسخه، اولویت نهایی با کاربری است که پرداخت را با موفقیت زودتر تکمیل نموده است و وجه سفارش دوم بلافاصله عودت می‌گردد.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-background border border-border/70 shadow-2xs space-y-2">
              <h5 className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                سفارش‌های اختصاصی و ابعاد سفارشی (Custom Orders)
              </h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                در آثاری که بر اساس ابعاد، پالت رنگی یا تصویر ارسالی خریدار نقاشی می‌شوند، پس از اتمام خلق اثر، تصاویر و ویدیوهایی با کیفیت بالا جهت تایید خریدار ارسال می‌گردد. پس از تایید نهایی خریدار، فرایند قاب‌گیری و ارسال آغاز می‌شود.
              </p>
            </div>
          </div>
          <p>
            کلیه قیمت‌های مندرج در سایت قطعی بوده و شامل هزینه‌های بسته‌بندی پایه و صدور گواهی اصالت می‌گردد. پرداخت تنها از طریق درگاه‌های امن شتاب و روش‌های رسمی معتبر سایت انجام می‌شود.
          </p>
        </div>
      ),
    },
    {
      id: 'authenticity',
      number: 'ماده ۴',
      title: 'تضمین اصالت اثر و شناسنامه هنری',
      icon: ShieldCheck,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            گالری آرتیسا اصالت ۱۰۰٪ تمامی آثار مندرج با نشان اورجینال را تضمین می‌نماید و با هر اثر مدارک زیر به صورت رسمی ارائه می‌گردد:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <CheckCircle2 className="size-4" />
                شناسنامه فیزیکی هولوگرام‌دار
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                شامل نام کامل هنرمند، عنوان اثر، سال خلق، تکنیک اجرای اثر، متریال مصرفی و ابعاد دقیق همراه با هولوگرام یکتای گالری آرتیسا.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <CheckCircle2 className="size-4" />
                امضای اصیل هنرمند
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                کلیه تابلوها دارای امضای اختصاصی هنرمند بر روی بوم یا پشت اثر همراه با تاریخ اجرای اثر می‌باشند.
              </p>
            </div>
          </div>
          <p className="text-xs">
            در صورت هرگونه اثبات کارشناسی مبنی بر عدم اصالت یک اثر اورجینال، آرتیسا متعهد به بازپرداخت کامل وجه بعلاوه جبران خسارت بر اساس آیین‌نامه‌های گالری خواهد بود.
          </p>
        </div>
      ),
    },
    {
      id: 'shipping',
      number: 'ماده ۵',
      title: 'بسته‌بندی تخصصی و رویه ارسال',
      icon: Truck,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            به دلیل حساسیت فوق‌العاده آثار نقاشی و هنرهای تجسمی، بسته‌بندی در آرتیسا مطابق با استانداردهای گالری‌های بین‌المللی انجام می‌گیرد:
          </p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <PackageCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>بسته‌بندی ۵ لایه ضدضربه:</strong> استفاده از کاغذ ضداسید گلاسین برای سطح رنگ، محافظ‌های زاویه‌دار فومی ضخیم، ضربه‌گیر حباب‌دار متراکم و جعبه‌های چوبی/کارتن سخت مقاوم.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <PackageCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>بیمه کامل حمل‌ونقل:</strong> تمام محموله‌ها در تمام طول مسیر تحت پوشش بیمه کامل آسیب‌دیدگی و شکستگی باربری قرار دارند.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <PackageCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>زمان‌بندی تحویل:</strong> سفارش‌های آماده در تهران ظرف ۲۴ تا ۷۲ ساعت کاری و در سایر استان‌ها بین ۳ تا ۵ روز کاری با هماهنگی تلفنی قبلی تحویل می‌گردند.
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-foreground flex items-start gap-3">
            <AlertTriangle className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">نکته بسیار مهم در زمان تحویل:</strong> خریدار محترم موظف است در هنگام تحویل اثر از مامور ارسال، سلامت ظاهری بسته‌بندی را بررسی نماید. در صورت وجود هرگونه ضربه‌دیدگی شدید یا شکستگی بیرونی، مراتب را بلافاصله در حضور مامور قید کرده و با پشتیبانی آرتیسا تماس حاصل فرمایید.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'returns',
      number: 'ماده ۶',
      title: 'ضمانت بازگشت کالا و انصراف از خرید',
      icon: RotateCcw,
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            گالری آرتیسا جهت رفاه خاطر خریداران محترم، مهلت ۷ روزه بازگشت کالا را در چارچوب ضوابط زیر ارائه می‌دهد:
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-background border border-border/70 space-y-2">
              <h5 className="font-bold text-foreground text-xs sm:text-sm">موارد مشمول ضمانت مرجوعی</h5>
              <ul className="space-y-1.5 pr-4 list-disc marker:text-emerald-500 text-xs">
                <li>وجود هرگونه آسیب‌دیدگی، خراشیدگی یا شکستگی بوم و قاب در هنگام تحویل.</li>
                <li>مغایرت فاحش میان مشخصات فنی اثر (نظیر ابعاد، تکنیک، رنگ یا قاب) با مشخصات مندرج در سایت.</li>
                <li>عدم تایید اصالت اثر توسط مراجع ذی‌صلاح هنری.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-background border border-border/70 space-y-2">
              <h5 className="font-bold text-foreground text-xs sm:text-sm">شرایط الزامی برای بازگشت</h5>
              <ul className="space-y-1.5 pr-4 list-disc marker:text-primary text-xs">
                <li>اثر باید کاملاً دست‌نخورده، بدون هرگونه لکه، بریدگی یا آسیب ناشی از استفاده نادرست باشد.</li>
                <li>شناسنامه اصالت فیزیکی، هولوگرام و فاکتور اصلی باید به همراه اثر ارسال گردند.</li>
                <li>بسته‌بندی ایمن اولیه باید به طور کامل رعایت گردد تا اثر در مسیر برگشت آسیبی نبیند.</li>
              </ul>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-xs leading-relaxed">
            <strong className="text-foreground">استثنائات:</strong> آثاری که به صورت انحصاری و بر اساس سفارش و عکس شخصی مشتری (Customized Portraits / Commissioned Works) خلق شده‌اند، با توجه به اختصاصی بودن اثر، تنها در صورت وجود عیب کیفی یا فنی مشمول بازگشت خواهند بود.
          </div>
          <p className="text-xs">
            پس از دریافت مرسوله در انبار گالری و بررسی کارشناس، وجه پرداختی ظرف ۲۴ تا ۷۲ ساعت کاری مستقیماً به شماره شبا یا کارت بانکی پرداخت‌کننده واریز خواهد شد.
          </p>
        </div>
      ),
    },
    {
      id: 'copyright',
      number: 'ماده ۷',
      title: 'حقوق مالکیت معنوی و کپی‌رایت',
      icon: Palette,
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            کلیه حقوق مادی و معنوی محتوای وب‌سایت آرتیسا (شامل تصاویر باکیفیت، متون، مقالات مجله هنر، هویت بصری و لوگو) متعلق به گالری آرتیسا می‌باشد:
          </p>
          <ul className="space-y-2 pr-4 list-disc marker:text-primary">
            <li>
              خرید فیزیکی یک اثر هنری به منزله خرید حق تکثیر یا استفاده تجاری از طرح آن اثر نیست. تمامی حقوق معنوی اثر متعلق به هنرمند خالق آن باقی می‌ماند.
            </li>
            <li>
              هرگونه کپی‌برداری، چاپ پوستر، تولید تجاری، بازنشر تصاویر بدون اجازه کتبی و ذکر منبع، نقض قانون حمایت از حقوق پدیدآورندگان و مصنفان بوده و موجب پیگرد قانونی خواهد بود.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'privacy',
      number: 'ماده ۸',
      title: 'حریم خصوصی و امنیت اطلاعات',
      icon: Lock,
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            گالری آنلاین آرتیسا خود را متعهد به حفظ بالاترین سطح امنیت و محرمانگی برای اطلاعات کاربران می‌داند:
          </p>
          <ul className="space-y-2 pr-4 list-disc marker:text-primary">
            <li>
              اطلاعات شخصی، شماره تلفن و نشانی پستی کاربران صرفاً جهت پردازش سفارش، صدور فاکتور و اطلاع‌رسانی ارسال مرسوله استفاده خواهد شد و در اختیار هیچ نهاد یا شخص ثالثی قرار نخواهد گرفت.
            </li>
            <li>
              ارتباطات اینترنتی وب‌سایت از پروتکل‌های امن رمزنگاری SSL/TLS بهره می‌برد و هیچ‌گونه اطلاعات بانکی یا رمز کارت روی سرورهای آرتیسا ذخیره نمی‌شود.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'dispute',
      number: 'ماده ۹',
      title: 'پشتیبانی، حل اختلاف و فورس‌ماژور',
      icon: HelpCircle,
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            در صورت بروز هرگونه اختلاف نظر در تفسیر یا اجرای مفاد این سند، اولویت نخست با گفت‌وگو، مذاکره دوستانه و رسیدگی کارشناسانه توسط امور مشتریان گالری آرتیسا است.
          </p>
          <p>
            در شرایط بروز حوادث غیرمترقبه و فورس‌ماژور (نظیر شرایط نامساعد جوی شدید، تعطیلات رسمی اضطراری، اختلال در شبکه حمل‌ونقل کشوری)، گالری آرتیسا مسئولیتی در قبال تاخیرهای ناشی از این موارد خارج از کنترل نداشته اما تمام تلاش خود را جهت پیگیری و تسریع تحویل کالا به کار خواهد بست.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-primary">
            <span>شماره مستقیم واحد حقوقی و امور مشتریان:</span>
            <span dir="ltr" className="font-mono text-sm">۰۹۱۹-۴۴۴-۰۸۳۹</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-14" dir="rtl">
      {/* ─── Hero Header ─── */}
      <div className="text-center mb-10 md:mb-14">
        <div className="inline-flex items-center justify-center size-14 rounded-3xl bg-primary/10 text-primary mb-4 shadow-sm ring-1 ring-primary/20">
          <Scale className="size-7" />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground mb-3.5 tracking-tight">
          شرایط و قوانین گالری آنلاین آرتیسا
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          شفافیت، اصالت و پاسداری از حقوق هنردوستان و خریداران آثار هنری؛ کلیه ضوابط مربوط به سفارش، اصالت اثر، بسته‌بندی تخصصی و ضمانت بازگشت.
        </p>
        <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-muted/60 border border-border/60 text-[11px] font-bold text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>آخرین به‌روزرسانی: شهریور ۱۴۰۵ (نسخه رسمی ۲.۴)</span>
        </div>
      </div>

      {/* ─── 4 Pillars Cards (Key Highlights) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="p-5 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm shadow-xs flex flex-col gap-2.5">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="size-5" />
          </div>
          <h2 className="text-xs sm:text-sm font-extrabold text-foreground">
            تضمین ۱۰۰٪ اصالت آثار
          </h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            صدور شناسنامه فیزیکی هولوگرام‌دار و امضای دست‌نویس هنرمند برای کلیه تابلوهای اورجینال.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm shadow-xs flex flex-col gap-2.5">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <PackageCheck className="size-5" />
          </div>
          <h2 className="text-xs sm:text-sm font-extrabold text-foreground">
            بسته‌بندی تخصصی و بیمه
          </h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            محافظ فوم چندلایه و کارتن سخت چوبی همراه با بیمه کامل شکستگی در سراسر ایران.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm shadow-xs flex flex-col gap-2.5">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <RotateCcw className="size-5" />
          </div>
          <h2 className="text-xs sm:text-sm font-extrabold text-foreground">
            ضمانت ۷ روزه بازگشت
          </h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            امکان مرجوعی بی‌قید و شرط در صورت هرگونه آسیب‌دیدگی حین ارسال یا عدم تطابق با مشخصات.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm shadow-xs flex flex-col gap-2.5">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Lock className="size-5" />
          </div>
          <h2 className="text-xs sm:text-sm font-extrabold text-foreground">
            امنیت و حفظ حریم خصوصی
          </h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            پروتکل‌های پیشرفته رمزنگاری SSL و عدم افشای اطلاعات خریداران به هر نهاد ثالث.
          </p>
        </div>
      </div>

      {/* ─── Main Content Layout with Navigation ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Desktop Table of Contents */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 hidden lg:flex flex-col gap-3 p-4 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-border/50 px-2">
            <FileText className="size-4 text-primary" />
            <h3 className="text-xs font-black text-foreground">فهرست مواد و بندها</h3>
          </div>
          <nav className="flex flex-col gap-1 text-xs">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-start transition-all cursor-pointer font-bold ${isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {sec.number}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Sections Stream */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <article
                key={sec.id}
                id={sec.id}
                className="scroll-mt-24 p-6 sm:p-7 rounded-3xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-xs transition-all hover:border-border"
              >
                <header className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold text-primary block leading-tight">
                        {sec.number}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-foreground">
                        {sec.title}
                      </h3>
                    </div>
                  </div>
                </header>

                <div>{sec.content}</div>
              </article>
            );
          })}
        </main>
      </div>

      {/* ─── Bottom Support & CTA Banner ─── */}
      <div className="mt-14 p-6 sm:p-8 rounded-3xl border border-border/70 bg-gradient-to-br from-muted/40 via-background to-muted/20 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
          <div className="size-13 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <PhoneCall className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-sm sm:text-base font-black text-foreground">
              سوالی درباره شرایط خرید یا حقوق خود دارید؟
            </h2>
            <p className="text-xs text-muted-foreground font-medium max-w-md leading-relaxed">
              مشاوران و کارشناسان حقوقی گالری آرتیسا در تمامی روزهای هفته آماده پاسخگویی و ارائه راهنمایی کامل به شما هستند.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <Link href="/faq" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="rounded-2xl font-bold text-xs px-5 h-11 w-full sm:w-auto cursor-pointer"
            >
              <HelpCircle className="size-3.5 ml-1.5" />
              سوالات متداول
            </Button>
          </Link>
          <Link href="/contact-us" className="w-full sm:w-auto">
            <Button className="rounded-2xl font-black text-xs px-5 h-11 w-full sm:w-auto cursor-pointer shadow-md shadow-primary/20">
              تماس با امور مشتریان
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
