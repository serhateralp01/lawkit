# GitHub'a publish — son adım

Sandbox'ın push yetkisi yok, bu yüzden ben repo'yu hazırladım ve son
adımı senin terminalinden çalıştırman gerekiyor. İki yol var.

## Yol A — hazırlanmış commit'i kullan (önerilen)

LawKit klasörü ve dosyalar yerinde, ama sandbox'ta oluşturduğum `.git`
klasörü izin sorunu yüzünden yarım kaldı. Onu temizleyip baştan kuracağız.

```bash
cd ~/Documents/Claude/Projects/LawKit

# Bozuk .git'i sil
rm -rf .git

# Temiz git başlat
git init -b main
git config user.email "serhateralp01@gmail.com"
git config user.name "Eralp"
git add .
git commit -m "Initial commit: LawKit foundation"

# Repo'yu GitHub'da oluştur (https://github.com/new — 'lawkit' adıyla, README olmadan)
# Sonra:
git remote add origin https://github.com/serhateralp01/lawkit.git
git push -u origin main
```

## Yol B — hazırladığım bundle'ı kullan

Bundle dosyası: `~/Library/Application Support/Claude/.../outputs/lawkit.bundle`
(Cowork çıktı klasöründe).

```bash
# Yeni bir klasörde aç:
git clone /path/to/lawkit.bundle lawkit-fresh
cd lawkit-fresh
git remote add origin https://github.com/serhateralp01/lawkit.git
git push -u origin main
```

Bundle yaklaşık 260 KB ve şu bilgiyi taşıyor:

- 127 dosya
- 1 commit: "Initial commit: LawKit foundation"
- main branch

## Push öncesi: repo'yu GitHub'da oluştur

1. https://github.com/new
2. Repository name: **lawkit**
3. Owner: **serhateralp01**
4. Public veya Private — sen karar ver (ben Private öneririm, içerik üretim
   katmanı stabilleşmeden açık olmamalı; README'de bunu yazdım)
5. **README, .gitignore, license ekleme** — biz zaten bunları gönderiyoruz
6. "Create repository"

Sonra Yol A veya B'deki push komutunu çalıştır.

## Authentication

İlk push'ta GitHub kullanıcı adı + Personal Access Token (PAT) sorabilir.
PAT'ın yoksa: GitHub → Settings → Developer settings → Personal access
tokens → Tokens (classic) → Generate new token (classic) → `repo` scope'u
seç → token'ı kopyala. Push esnasında "Password" alanına bunu yapıştır.

macOS'ta git credential keychain bunu hatırlar, bir kez yapacaksın.

## Sonra ne olur

Push başarılı olunca https://github.com/serhateralp01/lawkit canlı olur.
Buradan:

- README repo açılış sayfası olur (Türkçe + teknik özet)
- `docs/02_tasarim_ve_mimari_cercevesi.md` 7 katmanlı mimariyi anlatır
- `app/` klasörü çalışan TanStack Start uygulamasıdır
- `app/src/lib/case-engine/` saf reducer modülü
- `app/src/routes/vaka.$caseId.tsx` tam vaka ekranı

İlerleyen aşamalarda repo'yu private/public dengelerken, içerik
üretiminde insan onayı süreci stabilleşince public'e geçmek mantıklı.
