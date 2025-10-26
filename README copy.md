# Snapchat Story Downloader 📸

أداة قوية وفعالة لتحميل قصص Snapchat العامة باستخدام Node.js.

## ✨ المميزات

- ✅ تحميل القصص العامة من Snapchat
- 📁 تنظيم تلقائي للملفات حسب التاريخ واسم المستخدم
- 🎨 واجهة سطر أوامر ملونة وسهلة الاستخدام
- ⚡ معالجة غير متزامنة (Async/Await) للأداء الأمثل
- 🏗️ معماري modular يتبع أفضل الممارسات
- 🔒 معالجة متقدمة للأخطاء
- 📊 إحصائيات مفصلة عن عملية التحميل

## 📋 المتطلبات

- Node.js v18 أو أحدث
- npm أو yarn

## 🚀 التثبيت

### 1. استنساخ المشروع أو تحميله

```bash
# إذا كان لديك git
git clone <repository-url>
cd snapchat-downloader

# أو فك ضغط ملف ZIP
unzip snapchat-downloader.zip
cd snapchat-downloader
```

### 2. تثبيت المكتبات

```bash
npm install
```

## 📖 طريقة الاستخدام

### الطريقة الأولى: تمرير اسم المستخدم مباشرة

```bash
npm start -- username
```

أو

```bash
node src/index.js username
```

### الطريقة الثانية: إدخال اسم المستخدم عند التشغيل

```bash
npm start
# سيطلب منك إدخال username
```

## 🏗️ هيكل المشروع

```
snapchat-downloader/
├── src/
│   ├── config/
│   │   └── constants.js         # الإعدادات والثوابت
│   ├── services/
│   │   ├── snapchat.service.js  # خدمة Snapchat API
│   │   ├── download.service.js  # خدمة التحميل
│   │   └── file.service.js      # خدمة إدارة الملفات
│   ├── utils/
│   │   ├── logger.js            # أداة Logging
│   │   └── input.js             # معالجة المدخلات
│   └── index.js                 # نقطة الدخول الرئيسية
├── package.json
├── .env                         # المتغيرات البيئية
├── .gitignore
└── README.md
```

## 🎯 المبادئ المطبقة

### ✅ Single Responsibility Principle
كل Class/Module له مسؤولية واحدة واضحة:
- `SnapchatService`: التعامل مع API فقط
- `DownloadService`: معالجة التحميل فقط
- `FileService`: إدارة الملفات فقط
- `Logger`: معالجة الـ Logging فقط

### ✅ Better Scaling
- هيكل modular يسمح بإضافة features جديدة بسهولة
- فصل الـ Business Logic عن الـ Infrastructure
- استخدام Dependency Injection pattern

### ✅ Easier Testing
- كل service مستقل ويمكن اختباره بشكل منفصل
- Pure functions قابلة للاختبار
- Mock-friendly architecture

### ✅ Independent Deployment
- يمكن استخدام أي service بشكل مستقل في مشاريع أخرى
- Services لا تعتمد على بعضها بشكل مباشر
- واجهات واضحة لكل service

## ⚙️ الإعدادات

يمكنك تخصيص الإعدادات من خلال ملف `.env`:

```env
DEFAULT_USERNAME=essamsoft
DOWNLOAD_DELAY=300
REQUEST_TIMEOUT=30000
```

## 📦 المكتبات المستخدمة

- **axios**: لإجراء HTTP requests
- **cheerio**: لـ parsing HTML
- **chalk**: لتلوين النصوص في Terminal
- **dotenv**: لإدارة المتغيرات البيئية

## 🔧 البيئة التطويرية

للتطوير مع auto-reload:

```bash
npm run dev
```

## 📝 ملاحظات مهمة

1. ⚠️ هذه الأداة تعمل فقط مع الحسابات **العامة**
2. ⚠️ القصص المتاحة هي فقط آخر 24 ساعة
3. ⚠️ يجب احترام خصوصية المستخدمين
4. ⚠️ استخدم الأداة بمسؤولية ووفقاً لشروط استخدام Snapchat

## 🐛 حل المشاكل الشائعة

### "Oh Snap! No connection with Snap!"
- تأكد من اتصالك بالإنترنت
- تحقق من أن username صحيح

### "This user is private"
- الحساب خاص ولا يمكن تحميل قصصه

### "No user stories found"
- لا توجد قصص نشطة في آخر 24 ساعة

## 📄 الترخيص

MIT License

## 👨‍💻 المطور

**Essam Salah**
- الموقع: [essamsoft.com](https://essamsoft.com)

## 🤝 المساهمة

المساهمات مرحب بها! يرجى فتح Issue أو Pull Request.

---

Made with ❤️ using Node.js
