# Vowsnap _(emër pune)_

Aplikacion "kamerë njëpërdorimshe" për dasma: çifti krijon një album, printon një QR, të ftuarit fotografojnë (me limit fotosh si kamerat e vërteta) dhe të gjitha fotot mblidhen në një album të përbashkët.

## Statusi: prototip lokal (v0.1)

Funksionon: krijim dasme, QR + link ftese, kamerë me limit për të ftuar, album, shfaqje e fotove "pas dasmës", fshirje.

**Nuk funksionon ende (e domosdoshme para shitjes):** album i përbashkët mes telefonave të ndryshëm. Sot gjithçka ruhet vetëm në këtë telefon. `src/lib/repository.ts` është kufiri me backend-in; duhet implementim Supabase/Firebase + faqe web për të ftuarit pas skanimit të QR-së (`JOIN_BASE_URL` në `src/lib/config.ts`).

## Zhvillim

```
npm install
npx expo start      # Expo Go / web
npm test
npm run typecheck
```
