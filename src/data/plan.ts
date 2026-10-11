// "Mjafton për sot": the first 30-day reading plan (strategy A, decision V18).
// The plan holds only references to Bible passages; reflections and prayers are our own
// writing. Drafts: to be reviewed by a believer (Donald, a pastor or a women's group leader)
// before launch.
import type { Localized } from './types';

export const BOOKS = {
  psalms: { sq: 'Psalmi', en: 'Psalm', index: 18 },
  proverbs: { sq: 'Fjalët e urta', en: 'Proverbs', index: 19 },
  ecclesiastes: { sq: 'Predikuesi', en: 'Ecclesiastes', index: 20 },
  isaiah: { sq: 'Isaia', en: 'Isaiah', index: 22 },
  lamentations: { sq: 'Vajtimet', en: 'Lamentations', index: 24 },
  zephaniah: { sq: 'Sofonia', en: 'Zephaniah', index: 35 },
  matthew: { sq: 'Mateu', en: 'Matthew', index: 39 },
  mark: { sq: 'Marku', en: 'Mark', index: 40 },
  luke: { sq: 'Luka', en: 'Luke', index: 41 },
  john: { sq: 'Gjoni', en: 'John', index: 42 },
  romans: { sq: 'Romakëve', en: 'Romans', index: 44 },
  '2corinthians': { sq: '2 Korintasve', en: '2 Corinthians', index: 46 },
  galatians: { sq: 'Galatasve', en: 'Galatians', index: 47 },
  philippians: { sq: 'Filipianëve', en: 'Philippians', index: 49 },
  colossians: { sq: 'Kolosianëve', en: 'Colossians', index: 50 },
  hebrews: { sq: 'Hebrenjve', en: 'Hebrews', index: 57 },
  james: { sq: 'Jakobi', en: 'James', index: 58 },
  '1peter': { sq: '1 Pjetrit', en: '1 Peter', index: 59 },
} as const;

export type BookId = keyof typeof BOOKS;

export type Passage = { book: BookId; chapter: number; from: number; to: number };

export type PlanDay = {
  passage: Passage;
  theme: Localized;
  reflection: Localized;
  prayer: Localized;
};

export const PLAN_TITLE: Localized = { sq: 'Mjafton për sot', en: 'Enough for today' };

const p = (book: BookId, chapter: number, from: number, to: number): Passage => ({ book, chapter, from, to });

export const PLAN: PlanDay[] = [
  {
    passage: p('psalms', 23, 1, 6),
    theme: { sq: 'Bariu', en: 'The shepherd' },
    reflection: {
      sq: 'Nuk je ti ajo që duhet të mbajë gjithçka. Ka një Bari që të çon te kullotat e njoma dhe te ujërat e qeta, edhe në një ditë të zakonshme me enë dhe detyra.',
      en: "You are not the one who has to hold everything together. There is a Shepherd who leads you to green pastures and still waters, even on an ordinary day of dishes and errands.",
    },
    prayer: {
      sq: 'Zot, Ti je Bariu im. Më trego sot një vend të qetë, qoftë edhe për një minutë. Amen.',
      en: 'Lord, You are my shepherd. Show me one quiet place today, even for a minute. Amen.',
    },
  },
  {
    passage: p('matthew', 11, 28, 30),
    theme: { sq: 'Eja e çlodhu', en: 'Come and rest' },
    reflection: {
      sq: 'Jezusi nuk të kërkon të përpiqesh më shumë. Ai i fton pranë vetes pikërisht ata që janë të lodhur. Lodhja jote nuk të largon prej Tij. Është pikërisht ftesa.',
      en: 'Jesus does not say "try harder". He says "come unto me, all ye that labour". Your tiredness does not keep you away from Him. It is the invitation.',
    },
    prayer: {
      sq: 'Jezus, vij tek Ti siç jam, e lodhur. Më jep pushimin që premtove. Amen.',
      en: 'Jesus, I come to You as I am, tired. Give me the rest You promised. Amen.',
    },
  },
  {
    passage: p('lamentations', 3, 22, 24),
    theme: { sq: 'E re çdo mëngjes', en: 'New every morning' },
    reflection: {
      sq: 'Dje mund të ketë qenë e rëndë. Mëshira e Zotit nuk mbaroi dje. Ajo është e re sot në mëngjes, para kafes, para listës së punëve.',
      en: "Yesterday may have been heavy. God's mercy did not run out yesterday. It is new this morning, before the coffee and before the to-do list.",
    },
    prayer: {
      sq: 'Faleminderit, Zot, që më fal një fillim të ri sot. Ndihmomë ta pres me paqe. Amen.',
      en: 'Thank You, Lord, for a fresh start today. Help me receive it in peace. Amen.',
    },
  },
  {
    passage: p('matthew', 6, 25, 34),
    theme: { sq: 'Mjafton për sot', en: 'Enough for today' },
    reflection: {
      sq: 'Shqetësimi për nesër na merr forcën e sotme. Zoti ushqen zogjtë dhe vesh zambakët. Sot mjafton vetëm dita e sotme.',
      en: "Worry about tomorrow takes away today's strength. God feeds the birds and clothes the lilies. Today only needs today.",
    },
    prayer: {
      sq: 'Zot, të jap shqetësimet e nesërme. Më ndihmo të jetoj vetëm këtë ditë me Ty. Amen.',
      en: "Lord, I give You tomorrow's worries. Help me live just this day with You. Amen.",
    },
  },
  {
    passage: p('psalms', 46, 1, 11),
    theme: { sq: 'Ndalo pak', en: 'Be still' },
    reflection: {
      sq: 'Ky psalm na fton të ndalemi dhe të kujtojmë se Ai është Perëndia. Edhe në mes të zhurmës së shtëpisë mund të ndalosh për një frymëmarrje. Ai është strehë, edhe kur gjithçka lëviz.',
      en: '"Be still, and know that I am God." Even in a noisy home you can pause for one breath. He is a refuge even when everything is moving.',
    },
    prayer: {
      sq: 'Zot, në këtë çast ndalem. Ti je streha ime dhe forca ime. Amen.',
      en: 'Lord, in this moment I stop. You are my refuge and my strength. Amen.',
    },
  },
  {
    passage: p('isaiah', 40, 28, 31),
    theme: { sq: 'Forcë e re', en: 'Renewed strength' },
    reflection: {
      sq: 'Edhe të rinjtë lodhen. Kjo nuk është dështim, është të qenit njeri. Forca e re vjen nga pritja te Zoti, jo nga shtrydhja e vetes.',
      en: 'Even the young grow weary. That is not failure, it is being human. New strength comes from waiting on the Lord, not from squeezing yourself harder.',
    },
    prayer: {
      sq: 'Zot, nuk kam më forcë sot. Të pres Ty. Përtërije forcën time. Amen.',
      en: 'Lord, I have no strength left today. I wait on You. Renew my strength. Amen.',
    },
  },
  {
    passage: p('philippians', 4, 4, 7),
    theme: { sq: 'Paqja', en: 'Peace' },
    reflection: {
      sq: 'Mund t\'i thuash Zotit gjithçka: faturat, fëmijët, lodhjen. Paqja e Tij nuk vjen kur zgjidhen të gjitha. Vjen kur ia lëmë Atij.',
      en: 'You can tell God everything: the bills, the children, the tiredness. His peace does not come once everything is solved. It comes when we hand it to Him.',
    },
    prayer: {
      sq: 'Zot, ja çfarë më rëndon sot: … Ta lë Ty. Ruaje zemrën time në paqen Tënde. Amen.',
      en: 'Lord, here is what weighs on me today: … I leave it with You. Guard my heart in Your peace. Amen.',
    },
  },
  {
    passage: p('psalms', 121, 1, 8),
    theme: { sq: 'Ndihma ime', en: 'My help' },
    reflection: {
      sq: 'Ai që të ruan nuk dremit. Ti mund të flesh, të pushosh, të mos jesh vigjilente çdo minutë. Dikush tjetër rri zgjuar.',
      en: 'He who keeps you does not slumber. You may sleep, rest, and not be on guard every minute. Someone else is keeping watch.',
    },
    prayer: {
      sq: 'Zot, ruaje familjen time sot, në hyrje dhe në dalje. Më ndihmo të pushoj tek Ti. Amen.',
      en: 'Lord, keep my family today, in our going out and coming in. Help me rest in You. Amen.',
    },
  },
  {
    passage: p('luke', 10, 38, 42),
    theme: { sq: 'Marta dhe Maria', en: 'Martha and Mary' },
    reflection: {
      sq: 'Jezusi e do Martën, edhe kur ajo është e mbingarkuar. Ai e fton me butësi të ulet pak. Puna mund të presë pesë minuta.',
      en: 'Jesus loves Martha, even when she is overwhelmed. He gently invites her to sit for a while. The work can wait five minutes.',
    },
    prayer: {
      sq: 'Jezus, jam shpesh si Marta. Më mëso të ulem pranë Teje, qoftë edhe pak. Amen.',
      en: 'Jesus, I am often like Martha. Teach me to sit with You, even briefly. Amen.',
    },
  },
  {
    passage: p('2corinthians', 12, 9, 10),
    theme: { sq: 'Hiri mjafton', en: 'Grace is enough' },
    reflection: {
      sq: 'Dobësia nuk është diçka që duhet fshehur. Fuqia e Zotit shihet më qartë pikërisht atje ku ne nuk mjaftojmë.',
      en: 'Weakness is not something to hide. God\'s power shows most clearly exactly where we are not enough.',
    },
    prayer: {
      sq: 'Zot, hiri Yt më mjafton. Ku nuk mundem unë, bëj Ti. Amen.',
      en: 'Lord, Your grace is sufficient for me. Where I cannot, You can. Amen.',
    },
  },
  {
    passage: p('proverbs', 31, 25, 26),
    theme: { sq: 'Forca dhe dinjiteti', en: 'Strength and honour' },
    reflection: {
      sq: 'Ky nuk është një provim që duhet ta kalosh. Është një kujtesë: forca dhe dinjiteti janë veshja jote, edhe në ditët e lodhura. Mund të qeshësh pa frikë nga e ardhmja.',
      en: 'This is not an exam to pass. It is a reminder: strength and honour are your clothing, even on tired days. You can face the time to come with joy.',
    },
    prayer: {
      sq: 'Zot, më vish me forcë dhe dinjitet sot. Më jep fjalë të buta për ata që dua. Amen.',
      en: 'Lord, clothe me with strength and honour today. Give me kind words for those I love. Amen.',
    },
  },
  {
    passage: p('john', 6, 5, 13),
    theme: { sq: 'Pesë bukë', en: 'Five loaves' },
    reflection: {
      sq: 'Një djalë solli pak: pesë bukë dhe dy peshq. Jezusi e shumëfishoi. Ajo pak që ke sot në kuzhinë, në xhep dhe në zemër, në duart e Tij mjafton.',
      en: 'A boy brought a little: five loaves and two fishes. Jesus multiplied it. The little you have today in your kitchen, your purse and your heart is enough in His hands.',
    },
    prayer: {
      sq: 'Jezus, ta jap këtë pak që kam. Bekoje dhe bëje të mjaftojë. Amen.',
      en: 'Jesus, I give You the little I have. Bless it and make it enough. Amen.',
    },
  },
  {
    passage: p('psalms', 34, 1, 8),
    theme: { sq: 'Shijoni dhe shikoni', en: 'Taste and see' },
    reflection: {
      sq: 'Mirësia e Zotit nuk është vetëm ide. Mund ta shijosh në gjëra të vogla: një vakt i ngrohtë, një fëmijë që qesh, një fqinje që pyet si je.',
      en: "God's goodness is not only an idea. You can taste it in small things: a warm meal, a laughing child, a neighbour who asks how you are.",
    },
    prayer: {
      sq: 'Zot, hapi sytë e mi për mirësinë Tënde sot, në gjërat e vogla. Amen.',
      en: 'Lord, open my eyes to Your goodness today, in the small things. Amen.',
    },
  },
  {
    passage: p('1peter', 5, 6, 7),
    theme: { sq: 'Hidhe barrën', en: 'Cast your care' },
    reflection: {
      sq: 'Ai kujdeset për ty. Jo vetëm për familjen tënde, jo vetëm për punën që bën. Për ty.',
      en: 'He cares for you. Not only for your family, not only for the work you do. For you.',
    },
    prayer: {
      sq: 'Zot, ta lë barrën time sot, sepse Ti kujdesesh për mua. Amen.',
      en: 'Lord, I cast my burden on You today, because You care for me. Amen.',
    },
  },
  {
    passage: p('isaiah', 41, 10, 10),
    theme: { sq: 'Mos ki frikë', en: 'Fear not' },
    reflection: {
      sq: 'Zoti premton se është me ty, prandaj nuk ke pse të kesh frikë. Nuk thotë që nuk do të ketë vështirësi. Thotë që nuk do të jesh vetëm në to.',
      en: '"Fear thou not; for I am with thee." It does not say there will be no hard things. It says you will not be alone in them.',
    },
    prayer: {
      sq: 'Zot, kur kam frikë, më mbaj me dorën Tënde. Amen.',
      en: 'Lord, when I am afraid, hold me with Your hand. Amen.',
    },
  },
  {
    passage: p('romans', 8, 26, 28),
    theme: { sq: 'Kur nuk di si të lutem', en: 'When I cannot pray' },
    reflection: {
      sq: 'Ka ditë kur nuk gjen fjalë. Fryma e Shenjtë lutet për ty edhe atëherë. Mjafton një psherëtimë e kthyer nga Zoti.',
      en: 'Some days you cannot find the words. The Holy Spirit prays for you even then. A sigh turned toward God is enough.',
    },
    prayer: {
      sq: 'Zot, sot nuk kam fjalë. Ti e di çfarë ka në zemrën time. Amen.',
      en: 'Lord, today I have no words. You know what is in my heart. Amen.',
    },
  },
  {
    passage: p('psalms', 127, 1, 2),
    theme: { sq: 'Gjumi është dhuratë', en: 'Sleep is a gift' },
    reflection: {
      sq: 'Nuk është besnikëri të rrish zgjuar deri vonë për të mbaruar gjithçka. Zoti u jep gjumë atyre që do. Pushimi yt është në duart e Tij.',
      en: 'Staying up late to finish everything is not faithfulness. God gives His beloved sleep. Your rest is in His hands.',
    },
    prayer: {
      sq: 'Zot, ndërto Ti shtëpinë time. Sonte më jep gjumë të qetë. Amen.',
      en: 'Lord, You build my house. Tonight, give me peaceful sleep. Amen.',
    },
  },
  {
    passage: p('mark', 6, 30, 32),
    theme: { sq: 'Ejani mënjanë', en: 'Come apart' },
    reflection: {
      sq: 'Dishepujt nuk kishin kohë as të hanin. Jezusi i thirri të pushonin. Edhe ti ke leje të pushosh pak, pa u ndier fajtore.',
      en: 'The disciples had no leisure even to eat. Jesus called them to rest. You too are allowed to rest a little, without guilt.',
    },
    prayer: {
      sq: 'Jezus, më trego ku mund të pushoj pak sot. Amen.',
      en: 'Jesus, show me where I can rest a little today. Amen.',
    },
  },
  {
    passage: p('colossians', 3, 12, 15),
    theme: { sq: 'Butësia', en: 'Kindness' },
    reflection: {
      sq: 'Dhembshuria, butësia dhe durimi janë veshje që i vesh çdo ditë, jo një nivel që arrin njëherë e përgjithmonë. Vishe sot butësinë edhe për veten tënde.',
      en: 'Compassion, kindness and patience are clothes you put on each day, not a level you reach once and for all. Today, wear kindness toward yourself too.',
    },
    prayer: {
      sq: 'Zot, më vish me butësi sot, për familjen time dhe për veten. Amen.',
      en: 'Lord, clothe me with kindness today, for my family and for myself. Amen.',
    },
  },
  {
    passage: p('psalms', 103, 1, 5),
    theme: { sq: 'Mos harro', en: 'Forget not' },
    reflection: {
      sq: 'Kur je e lodhur, është e lehtë të shohësh vetëm atë që mungon. Ky psalm na fton të kujtojmë mirësitë e Zotit, një nga një.',
      en: 'When you are tired it is easy to see only what is missing. This psalm invites us to remember God\'s benefits, one by one.',
    },
    prayer: {
      sq: 'Zot, të falënderoj për tri gjëra sot: … Amen.',
      en: 'Lord, I thank You for three things today: … Amen.',
    },
  },
  {
    passage: p('hebrews', 13, 5, 6),
    theme: { sq: 'Nuk do të të lë', en: 'I will never leave thee' },
    reflection: {
      sq: 'Ka ditë kur ndihesh e vetme në shtëpi plot njerëz. Zoti premton se nuk do të të lërë dhe nuk do të të braktisë kurrë.',
      en: 'Some days you feel alone in a house full of people. God promises: "I will never leave thee, nor forsake thee."',
    },
    prayer: {
      sq: 'Zot, faleminderit që je me mua edhe kur ndihem e vetme. Amen.',
      en: 'Lord, thank You for being with me even when I feel alone. Amen.',
    },
  },
  {
    passage: p('galatians', 6, 2, 10),
    theme: { sq: 'Barrat e njëri-tjetrit', en: "One another's burdens" },
    reflection: {
      sq: 'Nuk je krijuar ta mbash çdo gjë vetëm. Lejo dikë të të ndihmojë sot. Edhe kjo është pjesë e ligjit të Krishtit.',
      en: "You were not made to carry everything alone. Let someone help you today. That too is part of the law of Christ.",
    },
    prayer: {
      sq: 'Zot, më jep guxim të kërkoj ndihmë dhe zemër të ndihmoj të tjerët. Amen.',
      en: 'Lord, give me courage to ask for help and a heart to help others. Amen.',
    },
  },
  {
    passage: p('james', 1, 2, 5),
    theme: { sq: 'Urtësia', en: 'Wisdom' },
    reflection: {
      sq: 'Nuk duhet t\'i dish të gjitha përgjigjet për fëmijët, për paratë, për ditën. Zoti jep urtësi bujarisht dhe pa qortuar.',
      en: 'You do not have to know all the answers about the children, the money or the day. God gives wisdom generously, without reproach.',
    },
    prayer: {
      sq: 'Zot, më jep urtësi për këtë vendim: … Amen.',
      en: 'Lord, give me wisdom for this decision: … Amen.',
    },
  },
  {
    passage: p('psalms', 139, 1, 14),
    theme: { sq: 'Më njeh', en: 'You know me' },
    reflection: {
      sq: 'Zoti të njeh plotësisht, edhe mendimet që nuk ia thua askujt, dhe nuk largohet. Je bërë në mënyrë të mrekullueshme.',
      en: 'God knows you completely, even the thoughts you tell no one, and He does not turn away. You are wonderfully made.',
    },
    prayer: {
      sq: 'Zot, Ti më njeh dhe më do. Më ndihmo ta besoj këtë sot. Amen.',
      en: 'Lord, You know me and You love me. Help me believe it today. Amen.',
    },
  },
  {
    passage: p('zephaniah', 3, 17, 17),
    theme: { sq: 'Ai gëzohet për ty', en: 'He rejoices over you' },
    reflection: {
      sq: 'Imagjino një nënë që i këndon fëmijës së saj. Kështu Zoti gëzohet për ty, me këngë, edhe në ditët kur ti nuk e ndien.',
      en: 'Picture a mother singing over her child. That is how God rejoices over you, with singing, even on days you do not feel it.',
    },
    prayer: {
      sq: 'Zot, më ndihmo të dëgjoj këngën Tënde mbi jetën time. Amen.',
      en: 'Lord, help me hear Your song over my life. Amen.',
    },
  },
  {
    passage: p('ecclesiastes', 3, 1, 8),
    theme: { sq: 'Çdo gjë ka kohën e vet', en: 'A time for everything' },
    reflection: {
      sq: 'Kjo periudhë e jetës tënde, me fëmijë të vegjël, me punë apo me shqetësime, është një stinë. Nuk zgjat përgjithmonë dhe ka bukurinë e vet.',
      en: 'This season of your life, with little ones, work or worries, is a season. It does not last for ever, and it has its own beauty.',
    },
    prayer: {
      sq: 'Zot, më ndihmo ta jetoj këtë stinë me Ty, pa nxitim. Amen.',
      en: 'Lord, help me live this season with You, without rushing. Amen.',
    },
  },
  {
    passage: p('john', 14, 25, 27),
    theme: { sq: 'Paqen time ju jap', en: 'My peace I give you' },
    reflection: {
      sq: 'Paqja që jep Jezusi nuk varet nga një shtëpi e rregulluar apo nga një ditë pa probleme. Është paqja e Tij, e dhënë ty.',
      en: 'The peace Jesus gives does not depend on a tidy house or a day without problems. It is His peace, given to you.',
    },
    prayer: {
      sq: 'Jezus, merr frikën time dhe më jep paqen Tënde. Amen.',
      en: 'Jesus, take my fear and give me Your peace. Amen.',
    },
  },
  {
    passage: p('psalms', 131, 1, 3),
    theme: { sq: 'Si fëmijë pranë nënës', en: 'Like a child with its mother' },
    reflection: {
      sq: 'Ky psalm i shkurtër flet për një shpirt të qetë, si fëmijë në prehrin e nënës. Ti që mban të tjerët, mund të pushosh edhe vetë në prehrin e Zotit.',
      en: 'This short psalm speaks of a quieted soul, like a child on its mother\'s lap. You who hold others may also rest on God\'s lap.',
    },
    prayer: {
      sq: 'Zot, qetësoje shpirtin tim si një fëmijë pranë nënës. Amen.',
      en: 'Lord, quiet my soul like a child with its mother. Amen.',
    },
  },
  {
    passage: p('matthew', 6, 9, 13),
    theme: { sq: 'Bukën e përditshme', en: 'Daily bread' },
    reflection: {
      sq: 'Jezusi na mëson të kërkojmë bukën e sotme, jo rezervat e gjithë vitit. Çdo ditë mund t\'i kërkojmë Atij atë që na duhet.',
      en: 'Jesus teaches us to ask for this day\'s bread, not a year\'s supply. Each day we can ask Him for what we need.',
    },
    prayer: {
      sq: 'Ati ynë, na jep sot bukën tonë të përditshme dhe forcën për këtë ditë. Amen.',
      en: 'Our Father, give us this day our daily bread and strength for this day. Amen.',
    },
  },
  {
    passage: p('romans', 15, 13, 13),
    theme: { sq: 'Shpresa', en: 'Hope' },
    reflection: {
      sq: 'Ke arritur këtu, ditë pas dite, pa pasur nevojë të jesh e përsosur. Zoti i shpresës të mbushë me gëzim dhe paqe, që të vazhdosh me shpresë.',
      en: 'You have come this far, day by day, without needing to be perfect. May the God of hope fill you with joy and peace, so you keep going in hope.',
    },
    prayer: {
      sq: 'Zot i shpresës, faleminderit për këto ditë me Ty. Më mbush me gëzim dhe paqe. Amen.',
      en: 'God of hope, thank You for these days with You. Fill me with joy and peace. Amen.',
    },
  },
];

// Short prayers before a meal, one per weekday (Monday first). Our own writing.
export const MEAL_PRAYERS: Localized[] = [
  { sq: 'Faleminderit, Zot, për këtë ushqim dhe për duart që e përgatitën. Bekoje tryezën tonë. Amen.', en: 'Thank You, Lord, for this food and for the hands that prepared it. Bless our table. Amen.' },
  { sq: 'Zot, Ti na jep bukën e përditshme. Na mëso ta ndajmë me mirënjohje. Amen.', en: 'Lord, You give us our daily bread. Teach us to share it with gratitude. Amen.' },
  { sq: 'Bekoje, Zot, këtë vakt dhe këtë familje. Kujto ata që sot nuk kanë mjaftueshëm. Amen.', en: 'Bless this meal and this family, Lord. Remember those who do not have enough today. Amen.' },
  { sq: 'Faleminderit për këtë tryezë, të thjeshtë dhe të mjaftueshme. Je me ne. Amen.', en: 'Thank You for this table, simple and enough. You are with us. Amen.' },
  { sq: 'Zot, siç na ushqen trupin, ushqeje edhe zemrën tonë me paqe. Amen.', en: 'Lord, as You feed our bodies, feed our hearts with peace. Amen.' },
  { sq: 'Faleminderit për çdo kafshatë dhe për çdo person rreth kësaj tryeze. Amen.', en: 'Thank You for every bite and for everyone around this table. Amen.' },
  { sq: 'Zot, në këtë ditë pushimi, të falënderojmë për javën dhe për këtë vakt bashkë. Amen.', en: 'Lord, on this day of rest, we thank You for the week and for this meal together. Amen.' },
];
