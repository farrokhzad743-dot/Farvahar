# فروهر | اپلیکیشن خبری اندروید

این مخزن شامل رابط فارسی راست‌چین فروهر، PWA و پوسته اندروید مبتنی بر Capacitor است. گردش‌کار GitHub Actions برای بررسی پروژه و ساخت APK آزمایشی و AAB انتشار اضافه شده است.

## فایل‌ها و خروجی‌ها
- `index.html`, `app.js`, `styles.css`: رابط اپلیکیشن
- `android/`: پروژه native اندروید تولیدشده با Capacitor
- `.github/workflows/android.yml`: ساخت APK با هر Push و AAB هنگام اجرای دستی/تگ
- `functions/api/`: endpointهای Cloudflare Pages Functions برای ترجمه و نرخ ارز
- `assets/faravahar.svg`: نشان فروهر

## نکته شفاف درباره خبرها
خبرهای فعلی نمونه‌اند و خبر زنده نیستند. تا وقتی منابع خبری مجاز، پایگاه داده، زمان‌بندی واکشی، حذف خبر تکراری و تأخیر پنج‌دقیقه‌ای راه‌اندازی نشوند، برنامه را به‌عنوان رسانه زنده منتشر نکنید. قیمت ارز و ترجمه نیز تا پیکربندی secrets/bindings فعال نخواهند بود.

## ساخت Android
پروژه Android با Capacitor آماده شده است. در GitHub:
1. یک repository جدید بسازید و کل محتویات این پروژه را commit کنید.
2. در تب Actions، workflow با نام **Android Build** اجرا می‌شود.
3. APK آزمایشی از بخش Artifacts همان اجرا قابل دریافت است.
4. برای انتشار در Google Play، workflow را دستی اجرا کنید و `release_bundle` را فعال کنید تا AAB ساخته شود.

برای امضای نسخه انتشار، secrets زیر را در GitHub Repository → Settings → Secrets and variables → Actions اضافه کنید:
- `ANDROID_KEYSTORE_BASE64`: محتوای فایل keystore به صورت Base64
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

بدون secrets امضا، APK آزمایشی قابل نصب برای تست ساخته می‌شود، اما برای انتشار رسمی باید AAB امضاشده داشته باشید. هرگز keystore یا رمز آن را داخل مخزن commit نکنید.

## نام بسته
شناسه فعلی اندروید `ir.faravahar.news` است. پیش از اولین انتشار عمومی آن را نهایی کنید؛ تغییر package id پس از انتشار باعث ایجاد برنامه‌ای جداگانه می‌شود.

## Cloudflare
برای نسخه اندروید، بعد از استقرار API، در تنظیمات برنامه نشانی HTTPS سرور را وارد کنید. روی سایت وب، API به‌صورت same-origin فراخوانی می‌شود. برای درخواست‌های بین‌مبدأ، مقدار `ALLOWED_ORIGINS` را به فهرستی از originهای دقیق و مجاز محدود کنید؛ از `*` استفاده نکنید.

برای endpoint ترجمه، در Pages Functions binding با نام `AI` و متغیر `TRANSLATION_MODEL` تنظیم شود. مدل را بر اساس دسترس‌پذیری حساب و آزمون کیفیت فارسی انتخاب کنید. برای نرخ ارز، `EXCHANGE_RATE_ENDPOINT` باید یک adapter امن ارائه کند که خروجی آن صریحاً `currency: "IRR"` و `usdIrr` معتبر داشته باشد. اگر منبع اصلی تومان یا ریال جدید/قدیم را مبهم گزارش کند، تبدیل را در adapter انجام دهید و واحد را مستند کنید.

## تست محلی رابط
برای پیش‌نمایش استاتیک، پوشه را با یک static server اجرا کنید. endpointهای `/api/*` فقط روی Cloudflare Pages Functions یا محیط سازگار کار می‌کنند.
