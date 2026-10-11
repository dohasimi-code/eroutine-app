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

## Lista e kontrollit: pjesa 3 (recetat dhe menuja javore)

| # | Provo këtë | Duhet të ndodhë |
|---|---|---|
| 1 | Hap skedën **Menuja** | 7 ditë (nga e hëna), secila me mëngjes, drekë dhe darkë; dita e sotme shënohet "Sot" |
| 2 | Hap skedën **Sot** | Shfaqen 3 vaktet e sotme |
| 3 | Prek emrin e një gatimi | Hapet receta: kohët e ndara (përgatitja, gatimi, njomja kur ka), përbërësit për numrin e personave të tu, hapat dhe "Përmban: …" |
| 4 | Te Menuja, prek ⇄ te një vakt | Dalin deri në 3 gatime të tjera; zgjidh një: ndryshon vetëm ai vakt |
| 5 | Te ⇄ i një darke | Ka edhe zgjedhjen "Mbetjet e drekës" |
| 6 | Prek 🔓 te një vakt, pastaj "Krijo javë të re" | Vakti i bllokuar 🔒 mbetet; të tjerat ndryshojnë |
| 7 | Ndërro "Darka këtë javë": Të lehta / Si dreka / Nga mbetjet / Të përziera | Darkat ndryshojnë sipas zgjedhjes |
| 8 | Cilësimet → Profili → zgjidh p.sh. "Gluten" dhe "Mish pule" → Përfundo | Menuja e re nuk ka asnjë gatim me gluten ose pulë |
| 9 | Profili → koha "deri në 30 min" | Nuk del jani me fasule apo byrek me peta shtëpie |
| 10 | Buxheti "I kursyer" | Nuk dalin tavë kosi, qofte, peshk, fërgesë ose gjellët me viç |
| 11 | Mbyll dhe hap aplikacionin | Menuja mbetet e njëjta |
| 12 | Lexo recetat | A janë sasitë, kohët dhe hapat realiste? Shëno çfarë duhet ndrequr |

## Lista e kontrollit: pjesa 5 (lista e blerjeve)

| # | Provo këtë | Duhet të ndodhë |
|---|---|---|
| 1 | Hap skedën **Lista** | Përbërësit e gjithë javës, të ndarë sipas reparteve (perime, bulmet, mish, furrë, ushqime të thata), me sasitë për numrin e personave të tu |
| 2 | Shiko kutinë "Kosto e përafërt" | Pa çmime thotë "Shto çmimet që di…". Aplikacioni nuk ka asnjë çmim të gatshëm |
| 3 | Prek "+ Shto çmim" te vezët dhe shkruaj p.sh. 20 (për copë), dyqani sipas dëshirës | Poshtë emrit del "20 lekë/copë · dyqani · data e sotme"; kosto shfaq "rreth … lekë" dhe "për 1 nga N artikuj" |
| 4 | Shkruaj diçka që s'është numër | Del "Shkruaj një numër, p.sh. 180." dhe nuk ruhet |
| 5 | Prek ☐ te një artikull | Shënohet ✓ dhe vizatohet me vijë (e bleve) |
| 6 | Prek 🏠 te një artikull | Kalon te "I ke në shtëpi" dhe nuk llogaritet më në kosto; "Kthe në listë" e kthen |
| 7 | Shiko "Kontrollo nëse i ke" | Kripa dhe erëzat që duhen me lugë, pa çmim |
| 8 | Te Menuja ndërro një vakt | Lista ndryshon menjëherë; shenjat ✓ dhe 🏠 mbeten |
| 9 | "Krijo javë të re" | Lista e re fillon pa shenja ✓ dhe 🏠, por çmimet mbeten |
| 10 | Mbyll dhe hap aplikacionin | Shenjat dhe çmimet mbeten |
| 11 | Cilësimet → "Fshi të gjitha të dhënat" | Fshihen edhe çmimet dhe lista |

## Lista e kontrollit: pjesa 6 (Momenti im)

| # | Provo këtë | Duhet të ndodhë |
|---|---|---|
| 1 | Hap skedën **Momenti im** | "Mjafton për sot · Dita 1 nga 30": tema, referenca (p.sh. Psalmi 23:1-6), mendimi për sot dhe lutja |
| 2 | Në shqip | Nuk ka tekst biblik; shkruan "Lexoje në Biblën tënde." |
| 3 | Kalo gjuhën në anglisht (Cilësimet) dhe shtyp **Read** | Hapet teksti KJV i pasazhit me numrat e vargjeve. Në një telefon me rajon Mbretëria e Bashkuar butoni nuk del |
| 4 | Shtyp "E bëra për sot" | Del "Mjafton për sot…"; "Lexo edhe ditën tjetër" të tregon ditën 2 nëse do |
| 5 | Mos e hap disa ditë, pastaj ktheu | Del "Je kthyer. Kjo mjafton." dhe vazhdon aty ku e le, pa ditë "të humbura" |
| 6 | "Shkruaj një lutje ose mendim" | Hapet ditari: shkruaj, ruaje, shënimi del me datë; "Fshije" pyet para se ta fshijë |
| 7 | Skeda **Sot** | Ka "Lutje para ngrënies" (ndryshon sipas ditës së javës) dhe lidhjen "Momenti im sot: …" |
| 8 | Profili: fik "momentin me Zotin" | Te Sot nuk dalin më lutja dhe lidhja |
| 9 | Cilësimet → "Fshi të gjitha të dhënat" | Fshihen edhe ditari dhe ecuria e planit |
| 10 | Lexo reflektimet dhe lutjet | A janë të sakta dhe të ngrohta? Shëno çfarë duhet ndryshuar. Duhet t'i rishikojë një besimtar (ti, një pastor ose një udhëheqëse) |

## Lista e kontrollit: pjesa 7 (rutinat dhe kujtesat)

| # | Provo këtë | Duhet të ndodhë |
|---|---|---|
| 1 | **Momenti im** → "Rutinat e mia" pa asnjë rutinë | Dalin 3 shembuj (p.sh. "+ Lutja e mëngjesit") dhe "+ Shto rutinë" |
| 2 | Prek një shembull | Hapet rutina me emrin e plotësuar, "Çdo ditë" dhe "Pa kujtesë" të zgjedhura |
| 3 | Ruaje pa kujtesë | Rutina del në listë: "Çdo ditë · pa kujtesë", me çelësin ndezur. Telefoni nuk kërkon leje |
| 4 | Hape, zgjidh "Me kujtesë", vendos orën 2 minuta nga tani dhe ruaje | Vetëm tani telefoni kërkon leje për njoftime. Pas pak del njoftimi me emrin e rutinës dhe frazën e butë |
| 5 | Refuzo lejen e njoftimeve | Rutina ruhet dhe del mesazhi i butë që mund t'i lejosh te cilësimet e telefonit |
| 6 | "Ditë të caktuara" → zgjidh Hë dhe En | Lista tregon "Hë, En · 07:30" |
| 7 | "Kur të dua" | Nuk ka kujtesë; shkruan "Për 'Kur të dua' nuk ka kujtesë." |
| 8 | Fik çelësin e një rutine | Rutina zbehet dhe kujtesa e saj nuk vjen më |
| 9 | Ndrysho gjuhën në anglisht | Kujtesat e reja vijnë në anglisht |
| 10 | Hape rutinën → "Fshije rutinën" | Pyet para se ta fshijë; kujtesa hiqet |
| 11 | Cilësimet → "Fshi të gjitha të dhënat" | Fshihen rutinat dhe të gjitha kujtesat |

## Lista e kontrollit: pjesa 8 (cilësimet, privatësia, "çfarë kam në shtëpi")

| # | Provo këtë | Duhet të ndodhë |
|---|---|---|
| 1 | Skeda **Menuja** → "Çfarë kam në shtëpi" | Hapet lista e përbërësve sipas reparteve (pa kripën dhe erëzat) |
| 2 | Shëno p.sh. Fasule të thata dhe Thjerrëza, pastaj "Krijo javë të re" | Menuja e re ka jahninë e fasuleve dhe thjerrëzat |
| 3 | Kthehu te Menuja | Kutia shkruan "2 përbërës të shënuar…" |
| 4 | Te ⇄ i një vakti | Gatimet me atë që ke në shtëpi dalin të parat |
| 5 | **Cilësimet** → Kujtesat → "Hap cilësimet e telefonit" | Hapen cilësimet e telefonit për këtë aplikacion |
| 6 | **Cilësimet** → Privatësia | Lista e qartë e asaj që ruhet në telefon dhe "Nuk kemi llogari…" |
| 7 | "Fshi të gjitha të dhënat" | Fshihet edhe lista "Çfarë kam në shtëpi" |
