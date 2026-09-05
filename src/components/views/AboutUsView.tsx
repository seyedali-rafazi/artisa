import React from "react"

export default function AboutUsView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-xl md:text-2xl font-black text-foreground mb-2">
          درباره گالری آنلاین آرتیسا
        </h1>
        <div className="h-1 w-16 bg-primary rounded-full mx-auto" />
      </div>

      <div className="border border-border/40 rounded-3xl p-6 md:p-8 bg-background shadow-sm flex flex-col gap-6 text-xs sm:text-sm text-muted-foreground leading-7">
        <p className="font-semibold text-foreground/80 text-center text-sm md:text-base mb-4">
          آرتیسا، پل ارتباطی میان هنرمندان ایرانی و هنردوستان سراسر کشور.
        </p>

        <p>
          گالری آنلاین آرتیسا از سال 1405 با هدف در دسترس قرار دادن آثار هنری اورجینال برای همه علاقه‌مندان هنر شروع به فعالیت کرد. ما باور داریم که هنر باید در زندگی روزمره حضور داشته باشد و هر خانه‌ای لایق زیباترین آثار است.
        </p>

        <p>
          در آرتیسا با هنرمندان نقاشی، گرافیک، سرامیک و هنر دیجیتال ایرانی همکاری می‌کنیم و آثارشان را با گواهی اصالت، بسته‌بندی تخصصی و ارسال مطمئن به دست شما می‌رسانیم.
        </p>

        <p>
          تیم مشاوره هنری آرتیسا آماده است تا در انتخاب بهترین اثر برای فضای خانه یا محل کار شما، با توجه به سبک دکوراسیون و بودجه‌تان راهنمایی کند.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-5 border border-border/60 bg-muted/10 rounded-2xl text-center">
            <h3 className="font-extrabold text-foreground text-sm mb-1">+۵۰۰ اثر هنری</h3>
            <span className="text-[10px] text-muted-foreground">از هنرمندان ایرانی</span>
          </div>
          <div className="p-5 border border-border/60 bg-muted/10 rounded-2xl text-center">
            <h3 className="font-extrabold text-foreground text-sm mb-1">۱۰۰٪ اصالت‌ضمانت</h3>
            <span className="text-[10px] text-muted-foreground">گواهی اصالت برای آثار اورجینال</span>
          </div>
          <div className="p-5 border border-border/60 bg-muted/10 rounded-2xl text-center">
            <h3 className="font-extrabold text-foreground text-sm mb-1">۷ روز ضمانت</h3>
            <span className="text-[10px] text-muted-foreground">مرجوعی بدون قید و شرط</span>
          </div>
        </div>
      </div>
    </div>
  )
}
