# Si ta hapësh prototipin në telefon

Këto hapa i bën **një herë** në kompjuter. Pastaj, çdo herë që do ta provosh, mjaftojnë hapat 5 dhe 6.

## Çfarë të duhet
- Një kompjuter (Windows ose Mac) dhe telefoni yt, **në të njëjtin rrjet Wi‑Fi**
- Rreth 20 minuta herën e parë

## Hapi 1: Instalo Node.js në kompjuter
Shko te https://nodejs.org, shkarko versionin **LTS** dhe instaloje si çdo program tjetër (Next, Next, Finish).

## Hapi 2: Instalo Git në kompjuter
- Windows: https://git-scm.com/download/win (lëri të gjitha opsionet siç janë)
- Mac: hap **Terminal** dhe shkruaj `git --version`. Nëse të kërkon të instalosh "Command Line Tools", prano.

## Hapi 3: Instalo Expo Go në telefon
Kërko **Expo Go** në Google Play ose App Store dhe instaloje. Është falas.

## Hapi 4: Shkarko kodin
Hap **Terminal** (Mac) ose **PowerShell** (Windows) dhe shkruaj këto rreshta një nga një, duke shtypur Enter pas secilit:

```
git clone https://github.com/dohasimi-code/eroutine-app.git
cd eroutine-app
npm install
```

Rreshti i fundit zgjat disa minuta. Mesazhet "warn" janë normale.

## Hapi 5: Nise aplikacionin
Në të njëjtin dritare:

```
npx expo start
```

Do të shfaqet një **kod QR** i madh.

## Hapi 6: Hape në telefon
- **Android:** hap Expo Go → "Scan QR code" → skano kodin.
- **iPhone:** hap aplikacionin **Kamera**, drejtoje te kodi QR dhe prek njoftimin që del.

Pas pak sekondash hapet aplikacioni.

## Kur të sjell një version të ri
Në dritaren e Terminal/PowerShell:
```
cd eroutine-app
git pull
npm install
npx expo start
```

## Nëse diçka nuk shkon
- **Telefoni nuk lidhet:** sigurohu që telefoni dhe kompjuteri janë në të njëjtin Wi‑Fi. Nëse prapë nuk lidhet, ndalo me `Ctrl + C` dhe provo `npx expo start --tunnel`.
- **"Project is incompatible with this version of Expo Go":** përditëso Expo Go nga dyqani dhe më shkruaj.
- Për çdo gabim tjetër, bëj një foto të ekranit dhe ma dërgo.

---

## Lista e kontrollit: pjesa 1 (skeleti)

| # | Provo këtë | Duhet të ndodhë |
|---|---|---|
| 1 | Hape aplikacionin | Hapet te skeda **Sot**, me përshëndetje sipas orës ("Mirëmëngjes", "Mirëdita" ose "Mirëmbrëma") |
| 2 | Prek 4 skedat poshtë | Sot, Menuja, Lista dhe Momenti im hapen pa gabime |
| 3 | Prek ikonën ⚙️ lart djathtas | Hapen **Cilësimet** |
| 4 | Zgjidh **English** | E gjithë ndërfaqja kalon në anglisht |
| 5 | Mbyll plotësisht aplikacionin dhe hape përsëri | Mbetet në gjuhën që zgjodhe |
| 6 | Cilësimet → "Fshi të gjitha të dhënat e mia" → Po | Del mesazhi i konfirmimit; gjuha kthehet si në fillim |
| 7 | Lexo tekstet | Tingëllojnë të ngrohta? Ka diçka që do ta ndryshoje? |

Më shkruaj çfarë funksionoi dhe çfarë jo, sipas numrave.

## Lista e kontrollit: pjesa 2 (profili i familjes)

| # | Provo këtë | Duhet të ndodhë |
|---|---|---|
| 1 | Hape aplikacionin për herë të parë (ose pas "Fshi të gjitha të dhënat") | Del "Mirë se erdhe" me pyetjen e gjuhës |
| 2 | Kalo nëpër 6 hapat me "Vazhdo" | Çdo hap tregon "Hapi X nga 6"; në fund hapet skeda Sot |
| 3 | Fillo nga e para dhe shtyp vetëm "Kalo" | Arrin në fund pa u detyruar të zgjedhësh asgjë |
| 4 | Te numri i personave shtyp − dhe + | Nuk zbret nën 1 dhe nuk shkon mbi 10+ |
| 5 | Zgjidh disa ushqime për t'i përjashtuar | Mund të zgjedhësh disa njëherësh dhe t'i heqësh përsëri |
| 6 | Cilësimet → Profili i familjes | Hapet me përgjigjet e tua; ndryshoji, shtyp "Përfundo" dhe kthehesh te Cilësimet me përmbledhjen e re |
| 7 | Mbyll dhe hap aplikacionin | Nuk të pyet më; profili mbetet |
| 8 | Lexo pyetjet | A janë të qarta dhe të ngrohta? A mungon ndonjë përjashtim që familjet shqiptare e kanë shpesh? |
