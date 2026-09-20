/* ==========================================================================
   LE MANOIR — Données du menu partagées (combo-ideal · quiz · who-pays)
   --------------------------------------------------------------------------
   Extrait 100% fidèle de la carte principale : noms, prix, sections, vidéos.
   API : window.LM_MENU
   ========================================================================== */
(function () {
    'use strict';

    var MIN_MAIN_PRICE = 30;

var MENU_DATA = [
    { section: "petit-dejeuner", name: "Formule classique", nameEn: "Classic Set",nameAr: "الفورمولا الكلاسيكية",desc: { fr: "Un petit déjeuner riche et varié.", en: "A rich, varied breakfast.", ar: "إفطار غني ومتنوع." },detail: { fr: "La formule complète: 2 oeufs, fromage rouge, tapenade, huile d'olive, hasoua, jus, boisson chaude, verrine, eau.", en: "The full set: 2 eggs, red cheese, tapenade, olive oil, hasoua, juice, hot drink, pot, water.", ar: "الفورمولا الكاملة: بيضتان، جبن أحمر، تابتينة، زيت زيتون، حساء، عصير، مشروب ساخن، طبق صغير، ماء." }, price: 38, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterdej.jpg" },
    { section: "petit-dejeuner", name: "Formule saveur terroir", nameEn: "Terroir Flavor Set",nameAr: "فورمولا النكهة الأصيلة",desc: { fr: "Le meilleur du petit-déjeuner marocain.", en: "The best of the Moroccan breakfast.", ar: "أفضل ما في الإفطار المغربي." },detail: { fr: "Un voyage au Maroc avec harcha, msemen, meloui, baghrir, amlou, jben, miel, olives noires et plus.", en: "A trip to Morocco with harcha, msemen, meloui, baghrir, amlou, jben, honey, black olives and more.", ar: "رحلة إلى المغرب مع الحرشا، المسمن، الملوي، بغرير، أملو، الجبن، العسل، زيتون أسود والمزيد." }, price: 45, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj 2 - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/poster dej2.jpg" },
    { section: "petit-dejeuner", name: "Formule nordique", nameEn: "Nordic Set",nameAr: "الفورمولا الاسكندنافية",desc: { fr: "Un assortiment frais et délicat.", en: "A fresh, delicate selection.", ar: "تشكيلة طازجة وناعمة." },detail: { fr: "Une touche d'élégance avec 2 oeufs, assortiment de charcuterie, tranches de fromage, jben, olives, hasoua et jus.", en: "A touch of elegance with 2 eggs, a cured-meat selection, cheese slices, jben, olives, hasoua and juice.", ar: "لمسة أناقة مع بيضتين، تشكيلة لحوم باردة، شرائح جبن، الجبن، زيتون، حساء وعصير." }, price: 50, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video plates - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterplates.jpg" },
    { section: "petit-dejeuner", name: "Formule express", nameEn: "Express Set",nameAr: "الفورمولا السريعة",desc: { fr: "3 mini-viennoiseries, boisson chaude, jus d'orange ou de carotte, eau, hasoua", en: "3 mini pastries, hot drink, orange or carrot juice, water, hasoua", ar: "3 معجنات مصغرة، مشروب ساخن، عصير برتقال أو جزر، ماء، حساء" }, price: 35, video: null, poster: null },
    { section: "petit-dejeuner", name: "Formule mini kids", nameEn: "Mini Kids Set",nameAr: "فورمولا الأطفال",desc: { fr: "Pancakes au chocolat, corn flakes, lait chaud, eau", en: "Chocolate pancakes, cornflakes, hot milk, water", ar: "بان كيك بالشوكولاتة، كورن فليكس، حليب ساخن، ماء" }, price: 33, video: null, poster: null },
    { section: "petit-dejeuner", name: "Formule continentale", nameEn: "Continental Set",nameAr: "الفورمولا القارية",desc: { fr: "Omelette au choix (champignons, charcuterie ou épinards), tapenade, huile d'olive, hasoua, jus, boisson chaude, verrine, eau", en: "Omelette to choose (mushroom, cured meats or spinach), tapenade, olive oil, hasoua, juice, hot drink, pot, water", ar: "أومليت على اختيارك (فطر، لحوم باردة أو سبانخ)، تابتينة، زيت زيتون، حساء، عصير، مشروب ساخن، طبق صغير، ماء" }, price: 42, video: null, poster: null },
    { section: "petit-dejeuner", name: "Formule Sabah Fès", desc: { fr: "2 oeufs au khlii, tapenade, huile d'olive, hasoua, boisson chaude, jus, verrine, eau", en: "2 eggs khlii, tapenade, olive oil, hasoua, hot drink, juice, pot, water", ar: "بيضتان على طريقة الخليلي، تابتينة، زيت زيتون، حساء، مشروب ساخن، عصير، طبق صغير، ماء" }, price: 48, video: null, poster: null },
    { section: "petit-dejeuner", name: "Formule liège", desc: { fr: "2 croissants farcis (cream cheese, laitue, jambon, fromage, oeuf), hasoua, jus, boisson chaude, verrine, eau", en: "2 filled croissants (cream cheese, lettuce, ham, cheese, egg), hasoua, juice, hot drink, pot, water", ar: "كرواسونان محشو (جبن كريم، خس، هام، جبن، بيضة)، حساء، عصير، مشروب ساخن، طبق صغير، ماء" }, price: 55, video: null, poster: null },
    { section: "petit-dejeuner", name: "Formule Pays-Bas", nameEn: "Dutch Set",nameAr: "فورمولا هولندا",desc: { fr: "Croque-madame ou croque-monsieur, tapenade, huile d'olive, jus, boisson chaude, hasoua, verrine, eau", en: "Croque-madame or croque-monsieur, tapenade, olive oil, juice, hot drink, hasoua, pot, water", ar: "كروك مدام أو كروك مونسيير، تابتينة، زيت زيتون، عصير، مشروب ساخن، حساء، طبق صغير، ماء" }, price: 48, video: null, poster: null },
    { section: "petit-dejeuner", name: "Formule chaoui", desc: { fr: "Omelette berbère (tomate et poivron), tapenade, jben, jus, boisson chaude, hasoua, verrine, eau", en: "Berber omelette (tomato and pepper), tapenade, jben, juice, hot drink, hasoua, pot, water", ar: "أومليت بربرية (طماطم وفلفل)، تابتينة، الجبن، عصير، مشروب ساخن، حساء، طبق صغير، ماء" }, price: 48, video: null, poster: null },
    { section: "brunch", name: "Brunch Le Manoir", desc: { fr: "Le brunch ultime pour les gourmands.", en: "The ultimate brunch for food lovers.", ar: "البرانش المثالي لعشاق الطعام." },detail: { fr: "Pain bagel, fromage blanc, champignons, avocat, charcuterie, oeuf au plat, pommes de terre nouvelles, merguez, petite salade, verrine, croissant sucré, boisson chaude, eau.", en: "Bagel bread, white cheese, mushrooms, avocado, cured meats, fried egg, new potatoes, merguez, small salad, pot, sweet croissant, hot drink, water.", ar: "خبز باغل، جبن أبيض، فطر، أفوكادو، لحوم باردة، بيض مقلي، بطاطا جديدة، مريز، سلطة صغيرة، طبق صغير، كرواسون حلو، مشروب ساخن، ماء." }, price: 82, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "brunch", name: "Brunch norvégien", nameEn: "Norwegian Brunch",nameAr: "برانش النرويجي",desc: { fr: "Frais, sain et délicieux.", en: "Fresh, healthy and delicious.", ar: "طازج، صحي ولذيذ." },detail: { fr: "2 tartines à la purée d'avocat et saumon fumé, 2 oeufs pochés, petite salade, boule de yaourt aux fruits frais et fruits secs, hasoua, boisson chaude, eau.", en: "2 avocado-purée and smoked-salmon toasts, 2 poached eggs, small salad, a bowl of yogurt with fresh fruit and nuts, hasoua, hot drink, water.", ar: "تارتينتان بزبدة الأفوكادو والسلمون المدخن، بيضتان مسلوقتان، سلطة صغيرة، وعاء زبادي بالفواكه الطازجة والمكسرات، حساء، مشروب ساخن، ماء." }, price: 75, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj 2 - Copie (4).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/poster dej2.jpg" },
    { section: "brunch", name: "Brunch English", desc: { fr: "Un repas copieux pour les gourmands.", en: "A hearty meal for food lovers.", ar: "وجبة سخيّة لعشاق الطعام." },detail: { fr: "2 oeufs brouillés, 3 saucisses, pommes de terre nouvelles, petite salade, 2 tranches de jambon, 2 pancakes au chocolat, hasoua, boisson chaude, eau.", en: "2 scrambled eggs, 3 sausages, new potatoes, small salad, 2 slices of ham, 2 chocolate pancakes, hasoua, hot drink, water.", ar: "بيضتان مخفوقتان، 3 سوسيس، بطاطا جديدة، سلطة صغيرة، شريحتا هام، 2 بان كيك بالشوكولاتة، حساء، مشروب ساخن، ماء." }, price: 70, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "brunch", name: "Brunch espagnol", nameEn: "Spanish Brunch",nameAr: "برانش إسباني",desc: { fr: "Pain grillé, thon, tapenade d'olive, purée de tomate, tranche de fromage, mini quesadilla, 2 brochettes de fruits, verrine, hasoua, boisson chaude, eau", en: "Grilled bread, tuna, olive tapenade, tomato purée, slice of cheese, mini quesadilla, 2 fruit skewers, pot, hasoua, hot drink, water", ar: "خبز محمص، تونة، تابتينة زيتون، معجون طماطم، شريحة جبن، كساديا صغيرة، سوسات فواكه، طبق صغير، حساء، مشروب ساخن، ماء" }, price: 68, video: null, poster: null },
    { section: "brunch", name: "Brunch Oslo", desc: { fr: "Tartine fromage blanc et avocat, tartine sucrée, oeufs brouillés, tranche d'Edam, tranche de jambon, poulet crispy, hasoua, boisson chaude, verrine sucrée", en: "White cheese and avocado toast, sweet toast, scrambled eggs, Edam slice, ham slice, crispy chicken, hasoua, hot drink, sweet pot", ar: "تارتين جبن أبيض وأفوكادو، تارتين حلو، بيض مخفوق، شريحة إدام، شريحة هام، دجاج مقرمش، حساء، مشروب ساخن، طبق صغير حلو" }, price: 73, video: null, poster: null },
    { section: "brunch", name: "Brunch Bénédicte", desc: { fr: "2 toasts grillés, cream cheese, champignons, oeuf au plat, sauce fromagère, petite salade, pommes de terre nouvelles, pain brioché au chocolat", en: "2 grilled toasts, cream cheese, mushrooms, fried egg, cheese sauce, small salad, new potatoes, chocolate brioche", ar: "شريحتا توست محمص، جبن كريم، فطر، بيض مقلي، صلصة جبن، سلطة صغيرة، بطاطا جديدة، بريوش بالشوكولاتة" }, price: 73, video: null, poster: null },
    { section: "sandwichs", name: "Le Boss", desc: { fr: "Le sandwich des vrais patrons.", en: "The sandwich for true bosses.", ar: "ساندويتش الرؤساء الحقيقيين." }, price: 55, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video café.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/postercoffe.jpg" },
    { section: "sandwichs", name: "Le Monstre", nameEn: "The Monster",nameAr: "الوحش",desc: { fr: "Pour les très grosses faims.", en: "For the hungriest of them all.", ar: "للأجوع على الإطلاق." }, price: 60, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "sandwichs", name: "Mozzarella sticks", nameAr: "عصا الموزاريلا",desc: { fr: "L'accompagnement parfait.", en: "The perfect side.", ar: "المقبل المثالي." }, price: 30, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "sandwichs", name: "Chicken Royal", price: 50, video: null, poster: null },
    { section: "sandwichs", name: "Urbain Build", price: 55, video: null, poster: null },
    { section: "sandwichs", name: "Onion rings", price: 25, video: null, poster: null },
    { section: "sandwichs", name: "Nuggets", price: 28, video: null, poster: null },
    { section: "sandwichs", name: "Jalapenos", price: 35, video: null, poster: null },
    { section: "sandwichs", name: "Cheesy fries", price: 30, video: null, poster: null },
    { section: "sandwichs", name: "Potatoes", price: 25, video: null, poster: null },
    { section: "sandwichs", name: "Frites", price: 20, video: null, poster: null },
    { section: "specialites", name: "Le Box Maison", price: 85, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video café.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/postercoffe.jpg" },
    { section: "specialites", name: "Mighty Crêpe", price: 65, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterdej.jpg" },
    { section: "specialites", name: "Brioche perdue + caramel", nameEn: "French Toast + Caramel",nameAr: "بريوش محمص بالكراميل", price: 48, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterdej.jpg" },
    { section: "specialites", name: "Mighty Oreo", price: 70, video: null, poster: null },
    { section: "specialites", name: "Mighty Speculoos", price: 75, video: null, poster: null },
    { section: "specialites", name: "Brochette Pancakes", price: 65, video: null, poster: null },
    { section: "specialites", name: "Brioche salée", price: 53, video: null, poster: null },
    { section: "specialites", name: "Brioche fruits de mer", price: 55, video: null, poster: null },
    { section: "specialites", name: "Brioche perdue fruits", price: 53, video: null, poster: null },
    { section: "specialites", name: "Brioche perdue tiramisu", price: 50, video: null, poster: null },
    { section: "crepes", name: "Kuna Crêpe", price: 70, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video café.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/postercoffe.jpg" },
    { section: "crepes", name: "Oreo Fettuccine", price: 65, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "crepes", name: "Marisco", price: 55, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterdej.jpg" },
    { section: "crepes", name: "Poulet & Champignons", nameEn: "Chicken & Mushrooms",nameAr: "دجاج وفطر", price: 45, video: null, poster: null },
    { section: "crepes", name: "Jambon & Fromage", nameEn: "Ham & Cheese",nameAr: "هام وجبن", price: 45, video: null, poster: null },
    { section: "crepes", name: "Quatre Fromages", nameEn: "Four Cheeses",nameAr: "أربعة أجبان", price: 45, video: null, poster: null },
    { section: "crepes", name: "Steak haché", nameEn: "Beef Patty",nameAr: "ستيك مفروم", price: 50, video: null, poster: null },
    { section: "crepes", name: "Triple Chocolat", nameEn: "Triple Chocolate",nameAr: "الشوكولاتة الثلاثية", price: 48, video: null, poster: null },
    { section: "crepes", name: "Lotus Fettuccine", price: 68, video: null, poster: null },
    { section: "crepes", name: "Choco-Banane", nameEn: "Choco-Banana",nameAr: "شوكولاتة وموز", price: 60, video: null, poster: null },
    { section: "crepes", name: "Pistachio", price: 65, video: null, poster: null },
    { section: "desserts", name: "Pistache & Kunafa", price: 70, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "desserts", name: "Gaufre Pistacchio", price: 70, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj - Copie (3).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterdej.jpg" },
    { section: "desserts", name: "Pancake Amlou", price: 63, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj 2.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/poster dej2.jpg" },
    { section: "desserts", name: "Choux Chocolat", price: 65, video: null, poster: null },
    { section: "desserts", name: "Choux Speculoos", price: 68, video: null, poster: null },
    { section: "desserts", name: "Gaufre Triple Chocolat", price: 55, video: null, poster: null },
    { section: "desserts", name: "Gaufre Speculoos", price: 62, video: null, poster: null },
    { section: "desserts", name: "Gaufre Oreo", price: 60, video: null, poster: null },
    { section: "desserts", name: "Pancakes Triple Choco", price: 50, video: null, poster: null },
    { section: "desserts", name: "Pancakes Fruits", price: 60, video: null, poster: null },
    { section: "desserts", name: "Pancakes Oreo", price: 55, video: null, poster: null },
    { section: "desserts", name: "Pancakes Lotus", price: 65, video: null, poster: null },
    { section: "desserts", name: "Pancakes Pistache", price: 65, video: null, poster: null },
    { section: "desserts-maison", name: "San Sebastián classique", price: 40, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "desserts-maison", name: "San Sebastián pistache", price: 55, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj 2.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/poster dej2.jpg" },
    { section: "desserts-maison", name: "Assiette fruits italienne", price: 200, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video café.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/postercoffe.jpg" },
    { section: "desserts-maison", name: "Crème brûlée", nameAr: "كريم بروليه", price: 35, video: null, poster: null },
    { section: "desserts-maison", name: "Brownie chocolat", price: 45, video: null, poster: null },
    { section: "desserts-maison", name: "Brownie pistache", price: 55, video: null, poster: null },
    { section: "desserts-maison", name: "Tiramisu", price: 35, video: null, poster: null },
    { section: "desserts-maison", name: "Fruits (2 prs)", price: 80, video: null, poster: null },
    { section: "desserts-maison", name: "Les Tranches", price: 20, video: null, poster: null },
    { section: "desserts-maison", name: "Cake Américain", price: 25, video: null, poster: null },
    { section: "desserts-maison", name: "Trompe-l'œil", price: 32, video: null, poster: null },
    { section: "glaces", name: "Coupe Le Manoir", price: 70, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video plates - Copie.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterplates.jpg" },
    { section: "glaces", name: "Tartufo Pistacchio", price: 70, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterdej.jpg" },
    { section: "glaces", name: "Tartufo Bianco", price: 65, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj 2.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/poster dej2.jpg" },
    { section: "glaces", name: "L'Italienne", price: 50, video: null, poster: null },
    { section: "glaces", name: "Piccola", price: 35, video: null, poster: null },
    { section: "glaces", name: "1 boule", price: 12, video: null, poster: null },
    { section: "glaces", name: "2 boules", price: 22, video: null, poster: null },
    { section: "glaces", name: "3 boules", price: 33, video: null, poster: null },
    { section: "glaces", name: "Tartufo Nero", price: 58, video: null, poster: null },
    { section: "boissons-chaudes", name: "Café Le Manoir", price: 32, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "boissons-chaudes", name: "Pistachio", price: 28, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj - Copie (3).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterdej.jpg" },
    { section: "boissons-chaudes", name: "Le Manoir Chocolat", price: 38, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj 2.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/poster dej2.jpg" },
    { section: "boissons-chaudes", name: "Espresso", price: 16, video: null, poster: null },
    { section: "boissons-chaudes", name: "Double Espresso", price: 20, video: null, poster: null },
    { section: "boissons-chaudes", name: "Latte", price: 18, video: null, poster: null },
    { section: "boissons-chaudes", name: "Américain", price: 18, video: null, poster: null },
    { section: "boissons-chaudes", name: "Cappuccino", price: 24, video: null, poster: null },
    { section: "boissons-chaudes", name: "Matcha latte", price: 24, video: null, poster: null },
    { section: "boissons-chaudes", name: "Macchiato", price: 22, video: null, poster: null },
    { section: "boissons-chaudes", name: "Affogato", price: 22, video: null, poster: null },
    { section: "boissons-chaudes", name: "Thé", price: 16, video: null, poster: null },
    { section: "boissons-chaudes", name: "Chocolat Fondu", price: 25, video: null, poster: null },
    { section: "boissons-froides", name: "Avocat fruit sec", price: 38, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video café.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/postercoffe.jpg" },
    { section: "boissons-froides", name: "Crunch Gold", price: 38, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video plates - Copie.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterplates.jpg" },
    { section: "boissons-froides", name: "Green Détox", price: 35, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video café.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/postercoffe.jpg" },
    { section: "boissons-froides", name: "Jus Orange", price: 21, video: null, poster: null },
    { section: "boissons-froides", name: "Jus Citron", price: 22, video: null, poster: null },
    { section: "boissons-froides", name: "Jus Avocat", price: 26, video: null, poster: null },
    { section: "boissons-froides", name: "Jus Fraise", price: 26, video: null, poster: null },
    { section: "boissons-froides", name: "Jus Mangue", price: 26, video: null, poster: null },
    { section: "boissons-froides", name: "Sahara", price: 36, video: null, poster: null },
    { section: "boissons-froides", name: "Crunch Rose", price: 38, video: null, poster: null },
    { section: "boissons-froides", name: "Soda", price: 16, video: null, poster: null },
    { section: "boissons-froides", name: "Red Bull", price: 28, video: null, poster: null },
    { section: "ice-coffee", name: "Frappuccino Le Manoir", price: 38, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video plates - Copie.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterplates.jpg" },
    { section: "ice-coffee", name: "Ice Matcha", price: 38, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video déj 2 - Copie (3).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/poster dej2.jpg" },
    { section: "ice-coffee", name: "Ice Spanish", price: 26, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video plates - Copie.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterplates.jpg" },
    { section: "ice-coffee", name: "Ice Basic", price: 22, video: null, poster: null },
    { section: "ice-coffee", name: "Frappé", price: 24, video: null, poster: null },
    { section: "ice-coffee", name: "Ice Tea Citron", price: 18, video: null, poster: null },
    { section: "ice-coffee", name: "Ice Tea Pêche", price: 18, video: null, poster: null },
    { section: "ice-coffee", name: "Ice Tea Rouges", price: 22, video: null, poster: null },
    { section: "milkshakes", name: "Bounty Shake", price: 38, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video café - Copie (3).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/postercoffe.jpg" },
    { section: "milkshakes", name: "Lotus Shake", price: 38, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie (2).webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "milkshakes", name: "Paradise Maracuja", price: 36, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "milkshakes", name: "Milkshake Basic", price: 28, video: null, poster: null },
    { section: "milkshakes", name: "Milkshake Mixte", price: 35, video: null, poster: null },
    { section: "milkshakes", name: "Smoothie Fresh Up", price: 36, video: null, poster: null },
    { section: "milkshakes", name: "Smoothie Oasis", price: 36, video: null, poster: null },
    { section: "milkshakes", name: "Smoothie Florida", price: 36, video: null, poster: null },
    { section: "mocktails", name: "Mocktail Le Manoir", price: 40, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/video pizza - Copie.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterpizza.jpg" },
    { section: "mocktails", name: "Mojito Energy", price: 40, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/videoplates.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterplates.jpg" },
    { section: "mocktails", name: "Pina Colada", price: 35, video: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/videoplates.webm", poster: "https://pub-5dafc5852b4748ea877521d8d93bb224.r2.dev/posterplates.jpg" },
    { section: "mocktails", name: "Blue Hvar", price: 35, video: null, poster: null },
    { section: "mocktails", name: "Grown Tropical", price: 35, video: null, poster: null },
    { section: "mocktails", name: "Virgin Mojito", price: 30, video: null, poster: null },
    { section: "mocktails", name: "Red Mojito", price: 35, video: null, poster: null },
    { section: "mocktails", name: "Passion Mojito", price: 35, video: null, poster: null }
];

var SECTION_META = {
        'petit-dejeuner':   { label: 'Petit Déjeuner',   meals: ['breakfast'] },
        'brunch':           { label: 'Brunch',           meals: ['breakfast', 'lunch'] },
        'sandwichs':        { label: 'Sandwichs',        meals: ['lunch', 'dinner'] },
        'specialites':      { label: 'Spécialités',      meals: ['breakfast', 'lunch', 'dinner'] },
        'crepes':           { label: 'Crêpes',           meals: ['lunch', 'dinner'] },
        'desserts':         { label: 'Desserts',         kind: 'dessert' },
        'desserts-maison':  { label: 'Desserts Maison',  kind: 'dessert' },
        'glaces':           { label: 'Glaces & Tartufo', kind: 'dessert' },
        'boissons-chaudes': { label: 'Boissons Chaudes', kind: 'drink', meals: ['breakfast'] },
        'boissons-froides': { label: 'Boissons Froides', kind: 'drink', meals: ['lunch', 'dinner'] },
        'ice-coffee':       { label: 'Ice Coffee',       kind: 'drink', meals: ['lunch', 'dinner'] },
        'milkshakes':       { label: 'Milkshakes',       kind: 'drink', meals: ['lunch', 'dinner'] },
        'mocktails':        { label: 'Mocktails',        kind: 'drink', meals: ['lunch', 'dinner'] }
    };

var SIDE_WORDS = ['frites', 'fry', 'fries', 'onion rings', 'nuggets', 'mozzarella sticks',
                      'jalapeno', 'cheesy', 'potatoes', 'supplement', 'boule', 'tranche',
                      'topping', 'crouton'];
var SAVORY_WORDS = ['poulet', 'jambon', 'fromage', 'steak', 'marisco', 'de mer', 'salee',
                        'champignon', 'oeuf', 'khlii', 'omelette', 'saumon', 'thon', 'croque',
                        'merguez', 'crispy', 'bagel'];
var SWEET_WORDS = ['chocolat', 'choco', 'oreo', 'speculoos', 'lotus', 'pistache', 'pistachio',
                       'pistacchio', 'banane', 'caramel', 'fruits', 'tiramisu', 'nutella', 'amlou',
                       'kuna', 'kunafa', 'pancake', 'gaufre', 'choux', 'maracuja', 'sucree'];
var MOROCCAN_WORDS = ['terroir', 'sabah', 'chaoui', 'fes', 'maroc', 'khlii', 'amlou', 'harcha', 'msemen', 'nordique'];

    /* ------------------------------------------------------------- Utils --- */
    function normalize(s) { return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(); }
    function hasAny(h, w) { for (var i=0;i<w.length;i++) if (h.indexOf(w[i])!==-1) return true; return false; }
    function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
    function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
    function weightOf(it){ return it.video?2:1; }
    function pickWeighted(list){ var t=0,i; for(i=0;i<list.length;i++)t+=weightOf(list[i]); var r=Math.random()*t; for(i=0;i<list.length;i++){r-=weightOf(list[i]); if(r<=0)return list[i];} return list[list.length-1]; }

    /* ------------------------------------- Classification stricte --- */
    function classify(item, meta){
        var n=normalize(item.name);
        if (meta.kind==='drink') return 'drink';
        if (meta.kind==='dessert') return 'dessert';
        if (hasAny(n,SIDE_WORDS)) return 'side';
        if (item.price!==null && item.price<MIN_MAIN_PRICE) return 'side';
        return 'main';
    }
    function flavor(item){
        var n=normalize(item.name);
        if (hasAny(n,SAVORY_WORDS)) return 'savory';
        if (hasAny(n,SWEET_WORDS)) return 'sweet';
        return 'neutral';
    }
    function isMoroccan(item){ return hasAny(normalize(item.name), MOROCCAN_WORDS); }

    var items = MENU_DATA.map(function (d) {
        var meta = SECTION_META[d.section] || { label: d.section, meals: ['breakfast', 'lunch', 'dinner'] };
        var item = {
            id: d.name + '|' + d.section,
            name: d.name,
            nameAr: d.nameAr || null,
            nameEn: d.nameEn || null,
            price: d.price,
            sectionId: d.section,
            sectionName: meta.label,
            desc: d.desc || null,
            detail: d.detail || null,
            video: d.video || null,
            poster: d.poster || null
        };
        item.kind = classify(item, meta);
        item.flavor = flavor(item);
        item.meals = meta.meals || [];
        return item;
    });

    function bySection(id){ return items.filter(function (i) { return i.sectionId === id; }); }

    /* Filtre multiple : section, kind (main/drink/dessert/side), meal, prix, mots-clés */
    function matches(o){
        o = o || {};
        return items.filter(function (i) {
            if (o.section && i.sectionId !== o.section) return false;
            if (o.kind && i.kind !== o.kind) return false;
            if (o.meal && i.meals.indexOf(o.meal) === -1) return false;
            if (o.minPrice != null && i.price !== null && i.price < o.minPrice) return false;
            if (o.maxPrice != null && i.price !== null && i.price > o.maxPrice) return false;
            if (o.words && !hasAny(normalize(i.name), o.words)) return false;
            return true;
        });
    }

    /* Sélectionne n items (optionnel : pondéré vers les plats vedettes) */
    function pickFrom(o){
        o = o || {};
        var n = Math.max(1, o.count || 1);
        var pool = matches(o).slice();
        var out = [];
        while (out.length < n && pool.length) {
            var it = o.weighted ? pickWeighted(pool) : pool[Math.floor(Math.random() * pool.length)];
            out.push(it);
            pool.splice(pool.indexOf(it), 1);
        }
        if (!out.length && o.fallbackSection) {
            pool = bySection(o.fallbackSection);
            out = shuffle(pool).slice(0, n);
        }
        return out;
    }

    /* ------------------------------------- Localisation (FR/AR/EN) ---
       Les valeurs sont résolues à l'appel selon la langue active (LM_I18N),
       avec repli gracieux sur le français / le nom d'origine. */
    function i18n() { return window.LM_I18N || null; }
    function activeLang() { var i = i18n(); return (i && i.getLang()) || 'fr'; }

    /* Item par (section, nom) — les noms peuvent se répéter entre sections */
    function findBy(sectionId, name) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].sectionId === sectionId && items[i].name === name) return items[i];
        }
        return null;
    }

    function pickField(obj, fallback) {
        if (!obj) return fallback;
        var l = activeLang();
        return obj[l] || obj.fr || fallback;
    }

    /* Nom affiché dans la langue active (repli : nom d'origine) */
    function displayName(item) {
        if (!item) return '';
        var l = activeLang();
        if (l === 'ar' && item.nameAr) return item.nameAr;
        if (l === 'en' && item.nameEn) return item.nameEn;
        return item.name;
    }

    /* Description courte de carte (repli : texte FR) */
    function displayDesc(item) {
        if (!item || !item.desc) return '';
        return pickField(item.desc, '');
    }

    /* Description détaillée (modale) (repli : description courte) */
    function displayDetail(item) {
        if (!item) return '';
        if (item.detail) return pickField(item.detail, displayDesc(item));
        return displayDesc(item);
    }

    /* Nom de section affiché (via les clés sec.* du i18n partagé) */
    function displaySectionName(item) {
        if (!item) return '';
        var i = i18n();
        if (i) {
            var s = i.t('sec.' + item.sectionId);
            if (s && s.indexOf('sec.') !== 0) return s;
        }
        return item.sectionName;
    }

    window.LM_MENU = {
        items: items,
        sections: SECTION_META,
        MIN_MAIN_PRICE: MIN_MAIN_PRICE,
        bySection: bySection,
        findBy: findBy,
        matches: matches,
        pickFrom: pickFrom,
        normalize: normalize,
        hasAny: hasAny,
        shuffle: shuffle,
        pick: pick,
        pickWeighted: pickWeighted,
        isMoroccan: isMoroccan,
        displayName: displayName,
        displayDesc: displayDesc,
        displayDetail: displayDetail,
        displaySectionName: displaySectionName
    };
})();
