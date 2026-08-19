# دليل ضبط فروع Git لمشروع eng-ai

## الهيكل المقترح

- `main`: نسخة الإنتاج فقط.
- `develop`: تجميع التغييرات قبل الإصدار.
- `feature/<name>`: ميزة جديدة.
- `fix/<name>`: إصلاح خطأ.
- `hotfix/<name>`: إصلاح عاجل للإنتاج.

## بدء إصلاح جديد

```bash
git fetch origin
git switch develop
git pull --ff-only origin develop
git switch -c fix/repair-app-errors
```

نفّذ التعديلات ثم تحقق محلياً:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
git status
git diff --check
```

## حفظ التغييرات ورفع الفرع

```bash
git add src docs
git commit -m "fix: repair application lint errors"
git push -u origin fix/repair-app-errors
```

بعدها افتح Pull Request من `fix/repair-app-errors` إلى `develop`. لا ترفع مباشرة إلى `main`.

## تحديث فرعك من المصدر

قبل متابعة العمل:

```bash
git fetch origin
git switch fix/repair-app-errors
git rebase origin/develop
```

إذا ظهرت تعارضات، أصلح الملفات ثم:

```bash
git add <files>
git rebase --continue
```

ولإلغاء عملية الدمج:

```bash
git rebase --abort
```

## إصدار إلى الإنتاج

بعد اعتماد Pull Request على `develop`:

```bash
git switch main
git pull --ff-only origin main
git merge --no-ff origin/develop
git push origin main
```

يفضل تنفيذ خطوة الإنتاج من خلال Pull Request ومراجعة CI، مع حماية فرع `main` ومنع force-push.

## قواعد مهمة

1. فرع واحد لكل ميزة أو إصلاح.
2. لا تخلط إعادة تنسيق كبيرة مع إصلاح منطقي.
3. اجعل رسائل الالتزام بصيغة واضحة مثل `fix:`, `feat:`, `docs:`, `refactor:`.
4. لا تضع الأسرار في Git؛ استخدم متغيرات البيئة في Vercel.
5. لا تستخدم `git push --force` على `main` أو `develop`.
6. افحص `git status` قبل وبعد كل عملية pull أو rebase.
7. استخدم `git diff --check` قبل إنشاء Pull Request.

## ملاحظة عن فرع v0

إذا كان فرع v0 هو مصدر التغييرات الحالي، اسحب آخر نسخة أولاً ثم أنشئ فرع عمل مستقل:

```bash
git fetch origin
git switch -c fix/repair-from-v0 origin/v0/admin-alazab-e97bdd58
```

ثم ارفع فرع الإصلاح وافتح Pull Request إلى الفرع المتفق عليه، غالباً `develop` وليس `main`.
