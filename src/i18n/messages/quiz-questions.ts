import { defineMessages } from "@/i18n/messages";

/**
 * The quiz's wording of the position map's questions, asked to the voter. The map's own wording (data/axes) is a coding
 * rubric about the parties; here each question is asked straight, and each answer is something a person would say.
 * `answers` and `shorts` follow the axis's scale, level 1 first.
 */
export const qm = defineMessages(
  {
    "security-territory": {
      topic: "יהודה ושומרון",
      question: "מה צריך לקרות ביהודה ושומרון?",
      answers: [
        "להגיע להסדר שבסופו מדינה פלסטינית לצד ישראל",
        "היפרדות חלקית: ישות פלסטינית מפורזת, וריבונות ישראלית באזורים מוגדרים",
        "בלי מדינה פלסטינית ובלי פינוי יישובים, אבל גם בלי לספח עכשיו",
        "להחיל ריבונות ישראלית ולא לוותר על שום שטח",
      ],
      shorts: ["מדינה פלסטינית", "היפרדות חלקית", "המצב הקיים", "ריבונות"],
    },
    "security-gaza": {
      topic: "עזה",
      question: "מה צריך לקרות ברצועת עזה אחרי המלחמה?",
      answers: [
        "לשקם את הרצועה, בתנאי שתהיה מפורזת",
        "להעביר את האחריות על הרצועה לגורם בינלאומי ולהתנתק ממנה",
        "לעודד את תושבי עזה להגר מרצון",
        "להחיל ריבונות ישראלית על הרצועה",
      ],
      shorts: ["שיקום", "גורם בינלאומי", "הגירה מרצון", "ריבונות"],
    },
    "religion-draft": {
      topic: "גיוס",
      question: "האם תלמידי ישיבות צריכים להתגייס?",
      answers: [
        "לא. מי שלומד תורה צריך להמשיך ללמוד, בלי חוק גיוס בכפייה",
        "כן, כולם צריכים לשרת, במסלולים מותאמים או במכסות, בלי סנקציות",
        "כן, ומי שלא משרת צריך לשלם על זה בסנקציות",
      ],
      shorts: ["לא", "כן, בלי סנקציות", "כן, עם סנקציות"],
    },
    "governance-oct7": {
      topic: "7 באוקטובר",
      question: "צריך להקים ועדת חקירה ממלכתית לאירועי 7 באוקטובר?",
      answers: ["כן, ועדת חקירה ממלכתית", "צריך לחקור, אבל בוועדה מסוג אחר", "לא, אני נגד ועדה ממלכתית"],
      shorts: ["ממלכתית", "ועדה אחרת", "לא"],
    },
    "judiciary-review": {
      topic: "מערכת המשפט",
      question: "האם להגביל את הכוח של בית המשפט לבטל חוקים והחלטות ממשלה?",
      answers: [
        "לא. בית המשפט צריך להישאר עצמאי, עם ביקורת שיפוטית מלאה",
        "אפשר לשנות, אבל רק בהסכמה רחבה ובחוק יסוד",
        "כן, לצמצם את הביקורת השיפוטית ואת כוחו של היועץ המשפטי לממשלה",
        "כן, עם פסקת התגברות, או בלי אפשרות לבטל חוקים בכלל",
      ],
      shorts: ["לא להגביל", "רק בהסכמה", "להגביל", "פסקת התגברות"],
    },
    "economy-state": {
      topic: "כלכלה",
      question: "כמה המדינה צריכה להתערב בכלכלה?",
      answers: [
        "הרבה: לעצור הפרטות, והמדינה עצמה צריכה לפעול בשוק",
        "שוק עם פיקוח חזק: להעלות את שכר המינימום, להשקיע יותר בשירותים ציבוריים ולפרק ריכוזיות",
        "בעיקר להגביר תחרות ולשבור מונופולים, בלי לשנות את גודל המדינה או את המסים",
        "מעט: להוריד מסים, לצמצם רגולציה ולהקטין את המגזר הציבורי",
      ],
      shorts: ["הרבה", "פיקוח חזק", "תחרות", "מעט"],
    },
  },
  {
    en: {
      "security-territory": {
        topic: "Judea and Samaria (West Bank)",
        question: "What should happen in Judea and Samaria (the West Bank)?",
        answers: [
          "Reach an agreement that ends with a Palestinian state alongside Israel",
          "Partial separation: a demilitarized Palestinian entity, with Israeli sovereignty in defined areas",
          "No Palestinian state and no evacuating settlements, but no annexation now either",
          "Apply Israeli sovereignty and give up no territory",
        ],
        shorts: ["Palestinian state", "Partial separation", "Status quo", "Sovereignty"],
      },
      "security-gaza": {
        topic: "Gaza",
        question: "What should happen in the Gaza Strip after the war?",
        answers: [
          "Rebuild the Strip, on condition that it is demilitarized",
          "Hand responsibility for the Strip to an international body and disengage from it",
          "Encourage Gaza's residents to emigrate voluntarily",
          "Apply Israeli sovereignty to the Strip",
        ],
        shorts: ["Rebuild", "International body", "Voluntary emigration", "Sovereignty"],
      },
      "religion-draft": {
        topic: "The draft",
        question: "Should yeshiva students be drafted into the army?",
        answers: [
          "No. Those who study Torah should keep studying, with no forced draft law",
          "Yes, everyone should serve, through tailored tracks or quotas, without sanctions",
          "Yes, and those who don't serve should face sanctions",
        ],
        shorts: ["No", "Yes, no sanctions", "Yes, with sanctions"],
      },
      "governance-oct7": {
        topic: "October 7",
        question: "Should a state commission of inquiry into October 7 be set up?",
        answers: ["Yes, a state commission of inquiry", "There should be an inquiry, but a different kind of committee", "No, I oppose a state commission"],
        shorts: ["State commission", "Another committee", "No"],
      },
      "judiciary-review": {
        topic: "The courts",
        question: "Should the court's power to strike down laws and government decisions be limited?",
        answers: [
          "No. The court should stay independent, with full judicial review",
          "Changes are possible, but only by broad agreement and in a Basic Law",
          "Yes, narrow judicial review and the Attorney General's power",
          "Yes, with an override clause, or no power to strike down laws at all",
        ],
        shorts: ["Don't limit", "Only by agreement", "Limit", "Override clause"],
      },
      "economy-state": {
        topic: "Economy",
        question: "How much should the state intervene in the economy?",
        answers: [
          "A lot: stop privatization, and the state itself should act in the market",
          "A market with strong oversight: raise the minimum wage, invest more in public services, break up concentration",
          "Mainly more competition and breaking monopolies, without changing the size of the state or taxes",
          "Little: cut taxes, reduce regulation and shrink the public sector",
        ],
        shorts: ["A lot", "Strong oversight", "Competition", "Little"],
      },
    },
    ar: {
      "security-territory": {
        topic: "الضفة الغربية",
        question: "ماذا يجب أن يحدث في الضفة الغربية (يهودا والسامرة)؟",
        answers: [
          "التوصل إلى تسوية تنتهي بدولة فلسطينية إلى جانب إسرائيل",
          "انفصال جزئي: كيان فلسطيني منزوع السلاح، وسيادة إسرائيلية في مناطق محددة",
          "لا دولة فلسطينية ولا إخلاء مستوطنات، ولكن أيضًا بلا ضم الآن",
          "فرض السيادة الإسرائيلية وعدم التنازل عن أي أرض",
        ],
        shorts: ["دولة فلسطينية", "انفصال جزئي", "الوضع القائم", "سيادة"],
      },
      "security-gaza": {
        topic: "غزة",
        question: "ماذا يجب أن يحدث في قطاع غزة بعد الحرب؟",
        answers: [
          "إعادة إعمار القطاع، بشرط أن يكون منزوع السلاح",
          "نقل المسؤولية عن القطاع إلى جهة دولية والانفصال عنه",
          "تشجيع سكان غزة على الهجرة الطوعية",
          "فرض السيادة الإسرائيلية على القطاع",
        ],
        shorts: ["إعادة إعمار", "جهة دولية", "هجرة طوعية", "سيادة"],
      },
      "religion-draft": {
        topic: "التجنيد",
        question: "هل يجب تجنيد طلاب المدارس الدينية (اليشيفوت) في الجيش؟",
        answers: [
          "لا. من يدرس التوراة يجب أن يواصل الدراسة، بلا قانون تجنيد إجباري",
          "نعم، على الجميع أن يخدموا، في مسارات ملائمة أو بحصص، بلا عقوبات",
          "نعم، ومن لا يخدم يجب أن تُفرض عليه عقوبات",
        ],
        shorts: ["لا", "نعم، بلا عقوبات", "نعم، مع عقوبات"],
      },
      "governance-oct7": {
        topic: "7 أكتوبر",
        question: "هل يجب تشكيل لجنة تحقيق رسمية في أحداث 7 أكتوبر؟",
        answers: ["نعم، لجنة تحقيق رسمية", "يجب التحقيق، ولكن بلجنة من نوع آخر", "لا، أنا ضد لجنة رسمية"],
        shorts: ["لجنة رسمية", "لجنة أخرى", "لا"],
      },
      "judiciary-review": {
        topic: "القضاء",
        question: "هل يجب تقييد صلاحية المحكمة في إلغاء القوانين وقرارات الحكومة؟",
        answers: [
          "لا. يجب أن تبقى المحكمة مستقلة، مع رقابة قضائية كاملة",
          "يمكن التغيير، ولكن فقط بتوافق واسع وبقانون أساس",
          "نعم، تقليص الرقابة القضائية وصلاحيات المستشار القضائي للحكومة",
          "نعم، مع فقرة التغلب، أو بلا إمكانية لإلغاء القوانين إطلاقًا",
        ],
        shorts: ["بلا تقييد", "بالتوافق فقط", "تقييد", "فقرة التغلب"],
      },
      "economy-state": {
        topic: "الاقتصاد",
        question: "إلى أي حد يجب أن تتدخل الدولة في الاقتصاد؟",
        answers: [
          "كثيرًا: وقف الخصخصة، وأن تعمل الدولة نفسها في السوق",
          "سوق مع رقابة قوية: رفع الحد الأدنى للأجور، استثمار أكبر في الخدمات العامة وتفكيك المركزية",
          "أساسًا زيادة المنافسة وكسر الاحتكارات، دون تغيير حجم الدولة أو الضرائب",
          "قليلًا: خفض الضرائب، تقليص التنظيم وتصغير القطاع العام",
        ],
        shorts: ["كثيرًا", "رقابة قوية", "منافسة", "قليلًا"],
      },
    },
    ru: {
      "security-territory": {
        topic: "Иудея и Самария",
        question: "Что должно произойти в Иудее и Самарии?",
        answers: [
          "Прийти к соглашению, в итоге которого рядом с Израилем будет палестинское государство",
          "Частичное разделение: демилитаризованное палестинское образование и израильский суверенитет в определённых районах",
          "Без палестинского государства и без эвакуации поселений, но и без аннексии сейчас",
          "Распространить израильский суверенитет и не уступать никакой территории",
        ],
        shorts: ["Палестинское государство", "Частичное разделение", "Статус-кво", "Суверенитет"],
      },
      "security-gaza": {
        topic: "Газа",
        question: "Что должно произойти в секторе Газа после войны?",
        answers: [
          "Восстановить сектор при условии его демилитаризации",
          "Передать ответственность за сектор международной структуре и отделиться от него",
          "Поощрять добровольную эмиграцию жителей Газы",
          "Распространить на сектор израильский суверенитет",
        ],
        shorts: ["Восстановление", "Международная структура", "Добровольная эмиграция", "Суверенитет"],
      },
      "religion-draft": {
        topic: "Призыв",
        question: "Должны ли учащиеся ешив призываться в армию?",
        answers: [
          "Нет. Те, кто учит Тору, должны продолжать учиться, без принудительного закона о призыве",
          "Да, служить должны все, по особым программам или квотам, без санкций",
          "Да, а против тех, кто не служит, нужны санкции",
        ],
        shorts: ["Нет", "Да, без санкций", "Да, с санкциями"],
      },
      "governance-oct7": {
        topic: "7 октября",
        question: "Нужно ли создать государственную комиссию по расследованию событий 7 октября?",
        answers: ["Да, государственную комиссию", "Расследовать нужно, но комиссией другого типа", "Нет, я против государственной комиссии"],
        shorts: ["Государственная", "Другая комиссия", "Нет"],
      },
      "judiciary-review": {
        topic: "Суды",
        question: "Нужно ли ограничить право суда отменять законы и решения правительства?",
        answers: [
          "Нет. Суд должен оставаться независимым, с полным судебным контролем",
          "Менять можно, но только при широком согласии и через Основной закон",
          "Да, сократить судебный контроль и полномочия юридического советника правительства",
          "Да, с пунктом о преодолении или вообще без права отменять законы",
        ],
        shorts: ["Не ограничивать", "Только по согласию", "Ограничить", "Преодоление"],
      },
      "economy-state": {
        topic: "Экономика",
        question: "Насколько государство должно вмешиваться в экономику?",
        answers: [
          "Сильно: остановить приватизацию, государство само должно действовать на рынке",
          "Рынок с сильным регулированием: поднять минимальную зарплату, больше вкладывать в общественные услуги, бороться с концентрацией",
          "В основном усилить конкуренцию и разбить монополии, не меняя размер государства и налоги",
          "Мало: снизить налоги, сократить регулирование и госсектор",
        ],
        shorts: ["Сильно", "Сильное регулирование", "Конкуренция", "Мало"],
      },
    },
    am: {
      "security-territory": {
        topic: "ይሁዳና ሰማርያ",
        question: "በይሁዳና ሰማርያ ምን መሆን አለበት?",
        answers: [
          "ከእስራኤል ጎን የፍልስጤም መንግሥት የሚያስገኝ ስምምነት ላይ መድረስ",
          "ከፊል መለያየት፦ ከጦር መሳሪያ የጸዳ የፍልስጤም አካል፣ በተወሰኑ አካባቢዎች የእስራኤል ሉዓላዊነት",
          "የፍልስጤም መንግሥት የለም፣ ሰፈራዎችም አይነሱም፣ ግን አሁን መጠቅለልም የለም",
          "የእስራኤልን ሉዓላዊነት ማስፈን እና ምንም መሬት አለመልቀቅ",
        ],
        shorts: ["የፍልስጤም መንግሥት", "ከፊል መለያየት", "ያለው ሁኔታ", "ሉዓላዊነት"],
      },
      "security-gaza": {
        topic: "ጋዛ",
        question: "ከጦርነቱ በኋላ በጋዛ ሰርጥ ምን መሆን አለበት?",
        answers: [
          "ሰርጡን መልሶ መገንባት፣ ከጦር መሳሪያ የጸዳ ከሆነ",
          "የሰርጡን ኃላፊነት ለዓለም አቀፍ አካል ማስተላለፍ እና መለየት",
          "የጋዛ ነዋሪዎች በፈቃዳቸው እንዲሰደዱ ማበረታታት",
          "በሰርጡ ላይ የእስራኤልን ሉዓላዊነት ማስፈን",
        ],
        shorts: ["መልሶ ግንባታ", "ዓለም አቀፍ አካል", "በፈቃድ ስደት", "ሉዓላዊነት"],
      },
      "religion-draft": {
        topic: "ምልመላ",
        question: "የየሺቫ ተማሪዎች ወደ ሠራዊቱ መመልመል አለባቸው?",
        answers: [
          "አይ። ቶራ የሚማሩ መማር መቀጠል አለባቸው፣ ያለ አስገዳጅ የምልመላ ሕግ",
          "አዎ፣ ሁሉም ማገልገል አለበት፣ በተስማሚ መንገዶች ወይም በኮታ፣ ያለ ቅጣት",
          "አዎ፣ የማያገለግሉም ቅጣት ሊጣልባቸው ይገባል",
        ],
        shorts: ["አይ", "አዎ፣ ያለ ቅጣት", "አዎ፣ ከቅጣት ጋር"],
      },
      "governance-oct7": {
        topic: "ጥቅምት 7",
        question: "በጥቅምት 7 ክስተቶች ላይ የመንግሥት አጣሪ ኮሚሽን መቋቋም አለበት?",
        answers: ["አዎ፣ የመንግሥት አጣሪ ኮሚሽን", "መጣራት አለበት፣ ግን በሌላ ዓይነት ኮሚቴ", "አይ፣ የመንግሥት ኮሚሽንን እቃወማለሁ"],
        shorts: ["የመንግሥት ኮሚሽን", "ሌላ ኮሚቴ", "አይ"],
      },
      "judiciary-review": {
        topic: "ፍርድ ቤቶች",
        question: "ፍርድ ቤቱ ሕጎችንና የመንግሥት ውሳኔዎችን የመሻር ሥልጣኑ መገደብ አለበት?",
        answers: [
          "አይ። ፍርድ ቤቱ ሙሉ የዳኝነት ቁጥጥር ያለው ነጻ ሆኖ መቆየት አለበት",
          "መለወጥ ይቻላል፣ ግን በሰፊ ስምምነት እና በመሠረታዊ ሕግ ብቻ",
          "አዎ፣ የዳኝነት ቁጥጥርንና የመንግሥት የሕግ አማካሪን ሥልጣን መቀነስ",
          "አዎ፣ በመሻሪያ አንቀጽ፣ ወይም ሕጎችን የመሻር ሥልጣን ጨርሶ ሳይኖር",
        ],
        shorts: ["አይገደብ", "በስምምነት ብቻ", "ይገደብ", "የመሻሪያ አንቀጽ"],
      },
      "economy-state": {
        topic: "ኢኮኖሚ",
        question: "መንግሥት በኢኮኖሚው ውስጥ ምን ያህል ጣልቃ መግባት አለበት?",
        answers: [
          "ብዙ፦ ወደ ግል ማዛወርን ማቆም፣ መንግሥት ራሱ በገበያው መሥራት አለበት",
          "ጠንካራ ቁጥጥር ያለው ገበያ፦ ዝቅተኛ ደመወዝን ማሳደግ፣ በሕዝብ አገልግሎቶች ተጨማሪ ኢንቨስት ማድረግ፣ ማዕከላዊነትን ማፍረስ",
          "በዋናነት ውድድርን ማሳደግ እና ሞኖፖሊዎችን መስበር፣ የመንግሥትን መጠን ወይም ግብርን ሳይቀይሩ",
          "ጥቂት፦ ግብር መቀነስ፣ ደንቦችን መቀነስ እና የሕዝብ ዘርፉን ማሳነስ",
        ],
        shorts: ["ብዙ", "ጠንካራ ቁጥጥር", "ውድድር", "ጥቂት"],
      },
    },
  },
);
