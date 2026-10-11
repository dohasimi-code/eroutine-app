// Shqip: gjuha kryesore e aplikacionit.
export const sq = {
  'tabs.today': 'Sot',
  'tabs.menu': 'Menuja',
  'tabs.list': 'Lista',
  'tabs.moment': 'Momenti im',

  'today.greeting.morning': 'Mirëmëngjes',
  'today.greeting.day': 'Mirëdita',
  'today.greeting.evening': 'Mirëmbrëma',
  'today.subtitle': 'Ja dita jote, pa nxitim.',
  'today.placeholder': 'Këtu do të shfaqen vaktet e sotme dhe momenti yt i qetë.',

  'menu.title': 'Menuja e javës',
  'menu.placeholder': 'Menuja javore vjen në hapin tjetër të ndërtimit.',

  'list.title': 'Lista e blerjeve',
  'list.placeholder': 'Lista e blerjeve krijohet nga menuja e javës.',

  'moment.title': 'Momenti im',
  'moment.placeholder': 'Një moment i shkurtër me Zotin, kur të jesh gati.',
  'moment.private': 'Shënimet e tua ruhen vetëm në këtë telefon.',

  'settings.title': 'Cilësimet',
  'settings.language': 'Gjuha',
  'settings.privacy.title': 'Privatësia',
  'settings.privacy.body': 'Të gjitha të dhënat e tua ruhen vetëm në këtë telefon. Nuk ka llogari dhe asgjë nuk dërgohet jashtë.',
  'settings.delete': 'Fshi të gjitha të dhënat e mia',
  'settings.delete.confirmTitle': 'Të fshihen të gjitha të dhënat?',
  'settings.delete.confirmBody': 'Kjo fshin profilin, menutë, listat dhe shënimet e tua nga ky telefon. Nuk mund të kthehet mbrapsht.',
  'settings.delete.cancel': 'Anulo',
  'settings.delete.confirm': 'Po, fshiji',
  'settings.delete.done': 'U fshinë. Mund të fillosh nga e para kur të duash.',
  'settings.disclaimer': 'Ky aplikacion nuk jep këshilla mjekësore ose ushqimore profesionale. Kontrollo gjithmonë etiketat e produkteve për alergjenë.',
} as const;

export type TranslationKey = keyof typeof sq;
