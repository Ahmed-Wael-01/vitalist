import { t, concept, action, keyed, reply } from '../helpers.js';

export default {
  slug: 'fatigue-young-woman',
  title: t('Tiredness and Breathlessness in a Young Woman', 'إرهاق وضيق نفس لدى شابة'),
  specialty: 'Internal Medicine / Haematology',
  difficulty: 'easy',
  isPublished: true,
  estimatedMinutes: 15,

  triageBrief: t(
    'Ms. Nour Adel, 29, attends the internal medicine clinic with 4 months of tiredness and getting breathless on stairs. Triage: HR 102, BP 110/70, looks pale. Take a history, commit to a differential, examine and investigate, and agree a management and follow-up plan.',
    'الآنسة نور عادل، ٢٩ عاماً، حضرت إلى عيادة الباطنة بإرهاق منذ ٤ أشهر وضيق نفس عند صعود الدرج. الفرز: النبض ١٠٢، الضغط ١١٠/٧٠، تبدو شاحبة. خذ التاريخ المرضي، والتزم بتشخيص تفريقي، وافحص واطلب الفحوصات، واتفق على خطة علاج ومتابعة.',
  ),
  patient: {
    name: t('Nour Adel', 'نور عادل'),
    age: 29,
    sex: 'female',
    setting: t('Internal Medicine Outpatient Clinic', 'عيادة الباطنة الخارجية'),
  },

  patientPersona: `You are Nour Adel, a 29-year-old graphic designer. You are polite, a bit embarrassed to talk about your periods, and you think you are "just stressed".

Your story (reveal only what is asked):
- For about 4 months you have felt tired all the time, even after sleeping well. It has slowly got worse.
- You get breathless and your heart races when you climb two flights of stairs; before, this was easy.
- You get headaches in the afternoon. Your hair seems to be falling out more than usual.
- You have a strange craving to chew ice cubes all day.
- Periods: they have always been heavy, and over the past year they have become heavier. They last 7–8 days; on the 3 heaviest days you change a pad every 1–2 hours, sometimes have to use two at once, pass clots "the size of a coin", and have leaked onto the sheets at night. Cycles are regular, every 28 days. Last period ended 10 days ago. No bleeding between periods or after sex.
- You are not pregnant (you use condoms reliably) and have never been pregnant.
- Diet: mostly vegetarian for 3 years; you rarely eat red meat. You drink a lot of tea with meals.
- Bowels: normal. No black or tarry stools, no blood in the stool, no change in bowel habit, no diarrhoea or bloating, no abdominal pain, no heartburn or difficulty swallowing.
- No weight loss, no fevers, no night sweats. No nosebleeds or easy bruising. You don't donate blood.
- Mood is okay; you sleep well; you're not low.
- No medical problems. Medications: occasional paracetamol for headaches; you don't take ibuprofen or aspirin. No supplements.
- Family: your mother had fibroids and a hysterectomy at 45. No family history of bowel cancer, coeliac disease, or blood disorders such as thalassaemia.
- You don't smoke or drink alcohol.
- You ask: "Is this serious? Do I need a blood transfusion?"`,

  scriptedReplies: [
    reply('fatigue', "I'm tired all the time, even after a good night's sleep. It's been about four months and getting worse.", 'أشعر بالتعب طوال الوقت حتى بعد نوم جيد. منذ حوالي أربعة أشهر ويزداد.'),
    reply('exertional_symptoms', 'I get breathless and my heart races when I climb two flights of stairs.', 'ينقطع نفسي ويتسارع قلبي عندما أصعد طابقين.'),
    reply('menstrual_history', 'My periods are heavy, 7 to 8 days. On heavy days I change a pad every hour or two and pass clots.', 'دورتي غزيرة، ٧ إلى ٨ أيام. في الأيام الغزيرة أغير الفوطة كل ساعة أو ساعتين وتنزل جلطات.'),
    reply('pregnancy', "No, I'm not pregnant. We always use condoms.", 'لا، لست حاملاً. نستخدم الواقي دائماً.'),
    reply('diet', "I'm mostly vegetarian, I rarely eat red meat, and I drink a lot of tea.", 'أنا نباتية تقريباً، نادراً ما آكل اللحم الأحمر، وأشرب الكثير من الشاي.'),
    reply('ruleout_gi_bleed', 'No, my stools are normal — no black stools and no blood.', 'لا، البراز طبيعي — لا براز أسود ولا دم.'),
    reply('ruleout_coeliac_gi', 'No diarrhoea, no bloating, no tummy pain, no trouble swallowing.', 'لا إسهال، لا انتفاخ، لا ألم في البطن، ولا صعوبة في البلع.'),
    reply('ruleout_systemic', 'No weight loss, no fevers, no night sweats.', 'لا نقص في الوزن، لا حرارة، لا تعرق ليلي.'),
    reply('pica_other', 'Funny you ask — I keep craving ice cubes. And my hair is falling out more.', 'غريب أنك تسأل — أشتهي مضغ الثلج باستمرار. وشعري يتساقط أكثر.'),
    reply('medications', 'Just paracetamol sometimes for headaches. No ibuprofen or aspirin.', 'فقط باراسيتامول أحياناً للصداع. لا إيبوبروفين ولا أسبرين.'),
    reply('family_history', 'My mother had fibroids and a hysterectomy. No bowel cancer or blood disorders in the family.', 'والدتي كان لديها أورام ليفية واستئصال رحم. لا سرطان قولون ولا أمراض دم في العائلة.'),
    reply('bleeding_other', 'No nosebleeds, no easy bruising, and I have never donated blood.', 'لا نزيف من الأنف، لا كدمات بسهولة، ولم أتبرع بالدم أبداً.'),
  ],
  defaultReply: t("I'm not sure, doctor. I just feel exhausted.", 'لست متأكدة يا دكتور، أشعر بالإرهاق فقط.'),

  goldStandardDiagnosis: keyed(
    'ida',
    t('Iron deficiency anaemia secondary to heavy menstrual bleeding (and low dietary iron)', 'فقر الدم بعوز الحديد بسبب غزارة الطمث (ونقص الحديد في الغذاء)'),
    ['iron deficiency anaemia', 'iron deficiency anemia', 'ida', 'iron deficiency', 'iron deficient anaemia', 'iron deficient anemia'],
    ['فقر الدم بعوز الحديد', 'فقر الدم بنقص الحديد', 'فقر الدم الناتج عن نقص الحديد', 'أنيميا نقص الحديد', 'نقص الحديد', 'عوز الحديد'],
  ),
  acceptedDifferentials: [
    keyed('ida', t('Iron deficiency anaemia'), ['iron deficiency', 'ida', 'iron deficiency anaemia', 'iron deficiency anemia'], ['نقص الحديد', 'عوز الحديد', 'أنيميا نقص الحديد']),
    keyed('thalassaemia', t('Thalassaemia trait'), ['thalassaemia', 'thalassemia', 'thal trait'], ['الثلاسيميا', 'التلاسيميا', 'أنيميا البحر المتوسط']),
    keyed('chronic_disease', t('Anaemia of chronic disease'), ['anaemia of chronic disease', 'anemia of chronic disease', 'chronic disease', 'anaemia of inflammation'], ['فقر الدم الناتج عن مرض مزمن', 'أمراض مزمنة']),
    keyed('b12_folate', t('B12 / folate deficiency'), ['b12', 'folate', 'megaloblastic', 'pernicious'], ['فيتامين ب12', 'الفولات', 'حمض الفوليك']),
    keyed('hypothyroidism', t('Hypothyroidism'), ['hypothyroidism', 'hypothyroid', 'thyroid'], ['قصور الغدة الدرقية', 'الغدة الدرقية']),
    keyed('coeliac', t('Coeliac disease'), ['coeliac', 'celiac', 'gluten'], ['السيلياك', 'الداء البطني', 'حساسية القمح']),
    keyed('depression', t('Depression'), ['depression', 'low mood'], ['اكتئاب', 'الاكتئاب']),
    keyed('pregnancy', t('Pregnancy'), ['pregnancy', 'pregnant'], ['حمل', 'الحمل']),
  ],
  requiredDifferentialCount: 2,

  requiredProtocol: 'NONE',
  protocolSteps: [],

  conceptDictionary: [
    concept('fatigue', 'History', t('Characterises fatigue (onset, progression)', 'وصف الإرهاق (البداية، التطور)'),
      ['tired', 'tiredness', 'fatigue', 'energy', 'exhausted', 'when did', 'how long'],
      ['تعب', 'التعب', 'إرهاق', 'طاقة', 'منذ متى', 'من متى']),
    concept('exertional_symptoms', 'History', t('Exertional breathlessness / palpitations', 'ضيق التنفس / الخفقان مع الجهد'),
      ['breath', 'breathless', 'stairs', 'palpitations', 'heart racing', 'chest pain', 'dizzy', 'faint'],
      ['ضيق تنفس', 'نفسك', 'الدرج', 'خفقان', 'قلبك', 'دوخة', 'إغماء']),
    concept('menstrual_history', 'History', t('Menstrual history (heavy bleeding, clots, flooding)', 'تاريخ الدورة (غزارة، جلطات)'),
      ['period', 'periods', 'menstrual', 'menstruation', 'bleeding', 'pads', 'tampons', 'clots', 'heavy', 'cycle'],
      ['الدورة', 'دورتك', 'الحيض', 'الطمث', 'الفوط', 'جلطات', 'غزيرة', 'نزيف']),
    concept('pregnancy', 'History', t('Pregnancy / contraception', 'الحمل / وسائل منع الحمل'),
      ['pregnant', 'pregnancy', 'contraception', 'last period'],
      ['حامل', 'الحمل', 'منع الحمل', 'آخر دورة']),
    concept('diet', 'History', t('Dietary iron intake', 'الحديد في الغذاء'),
      ['diet', 'eat', 'eating', 'meat', 'vegetarian', 'vegan', 'food', 'tea'],
      ['النظام الغذائي', 'تأكلين', 'الأكل', 'اللحم', 'نباتية', 'الطعام', 'الشاي']),
    concept('ruleout_gi_bleed', 'History', t('GI blood loss (melaena, rectal bleeding)', 'فقدان الدم الهضمي (براز أسود، نزيف شرجي)'),
      ['black stool', 'black stools', 'tarry', 'blood in your stool', 'blood in the stool', 'rectal bleeding', 'stool', 'stools', 'bowel'],
      ['براز أسود', 'البراز', 'دم في البراز', 'نزيف شرجي', 'الإخراج']),
    concept('ruleout_coeliac_gi', 'History', t('Malabsorption / upper GI symptoms (coeliac, diarrhoea, dysphagia)', 'أعراض سوء الامتصاص / الجهاز الهضمي العلوي'),
      ['diarrhoea', 'diarrhea', 'bloating', 'abdominal pain', 'tummy', 'stomach', 'swallowing', 'heartburn', 'indigestion'],
      ['إسهال', 'انتفاخ', 'ألم في البطن', 'المعدة', 'البلع', 'حرقة']),
    concept('ruleout_systemic', 'History', t('Red flags: weight loss, fever, night sweats', 'علامات الخطر: نقص الوزن، الحرارة، التعرق الليلي'),
      ['weight loss', 'lost weight', 'weight', 'fever', 'night sweats', 'sweating'],
      ['نقص الوزن', 'الوزن', 'وزنك', 'حرارة', 'تعرق ليلي', 'تعرق']),
    concept('pica_other', 'History', t('Other iron-deficiency features (pica, hair loss)', 'أعراض أخرى لنقص الحديد (الوحم، تساقط الشعر)'),
      ['ice', 'craving', 'cravings', 'pica', 'hair', 'nails', 'mouth', 'tongue'],
      ['الثلج', 'تشتهين', 'رغبة', 'الشعر', 'الأظافر', 'الفم', 'اللسان']),
    concept('medications', 'History', t('Medications (NSAIDs, aspirin, supplements)', 'الأدوية (مضادات الالتهاب، الأسبرين، المكملات)'),
      ['medication', 'medicine', 'tablets', 'ibuprofen', 'aspirin', 'nsaid', 'painkillers', 'supplements'],
      ['أدوية', 'دواء', 'حبوب', 'إيبوبروفين', 'أسبرين', 'مسكنات', 'مكملات']),
    concept('family_history', 'History', t('Family history (bowel cancer, thalassaemia, fibroids)', 'التاريخ العائلي (سرطان القولون، الثلاسيميا، الأورام الليفية)'),
      ['family history', 'family', 'mother', 'relatives', 'runs in'],
      ['العائلة', 'تاريخ عائلي', 'والدتك', 'أقارب']),
    concept('bleeding_other', 'History', t('Other blood loss (nosebleeds, bruising, blood donation)', 'فقدان دم آخر (رعاف، كدمات، تبرع بالدم)'),
      ['nosebleed', 'nosebleeds', 'bruise', 'bruising', 'donate blood', 'blood donation', 'blood donor'],
      ['رعاف', 'نزيف الأنف', 'كدمات', 'التبرع بالدم', 'تبرعت']),

    // Plan / handoff
    concept('hand_oral_iron', 'Handoff', t('Oral iron with counselling (side effects, timing)', 'الحديد الفموي مع الإرشاد (الأعراض الجانبية، التوقيت)'),
      ['ferrous', 'oral iron', 'iron tablets', 'constipation', 'black stools', 'empty stomach', 'vitamin c', 'side effects'],
      ['كبريتات الحديد', 'حبوب الحديد', 'الحديد الفموي', 'إمساك', 'براز أسود', 'معدة فارغة', 'فيتامين سي', 'الأعراض الجانبية']),
    concept('hand_recheck_hb', 'Handoff', t('Recheck Hb in 2–4 weeks', 'إعادة فحص الهيموغلوبين بعد ٢–٤ أسابيع'),
      ['recheck', 'repeat', 'follow up', 'follow-up', '2 weeks', '4 weeks', 'two weeks', 'four weeks', 'response'],
      ['إعادة الفحص', 'إعادة التحليل', 'متابعة', 'أسبوعين', '٤ أسابيع', 'أربعة أسابيع']),
    concept('hand_gynae', 'Handoff', t('Address heavy menstrual bleeding (gynaecology / treatment)', 'معالجة غزارة الطمث (النساء والولادة)'),
      ['gynaecology', 'gynecology', 'gynae', 'heavy menstrual bleeding', 'heavy periods', 'tranexamic', 'mirena', 'ius'],
      ['النساء والولادة', 'أمراض النساء', 'غزارة الطمث', 'الدورة الغزيرة', 'ترانيكساميك', 'اللولب الهرموني']),
    concept('hand_replete_stores', 'Handoff', t('Continue iron ~3 months after Hb normalises', 'الاستمرار على الحديد ٣ أشهر بعد تحسن الهيموغلوبين'),
      ['3 months', 'three months', 'replenish', 'stores', 'ferritin'],
      ['٣ أشهر', 'ثلاثة أشهر', 'المخزون', 'الفيريتين']),
  ],

  panelActions: [
    action('HISTORY_RECORDS', 'History', t('Review previous records', 'مراجعة السجلات السابقة'),
      t('No previous blood tests on file. No chronic conditions recorded.', 'لا تحاليل دم سابقة. لا أمراض مزمنة مسجلة.'),
      { relevant: true }),
    action('EXAM_VITALS', 'PhysicalExam', t('Vital signs', 'العلامات الحيوية'),
      t('HR 102 regular, BP 110/70, RR 16, SpO₂ 99%, Temp 36.6 °C.', 'النبض ١٠٢ منتظم، الضغط ١١٠/٧٠، التنفس ١٦، الأكسجين ٩٩٪، الحرارة ٣٦.٦'),
      { relevant: true }),
    action('EXAM_GENERAL', 'PhysicalExam', t('General & hands examination', 'الفحص العام وفحص اليدين'),
      t('Conjunctival pallor. Angular cheilitis. Early koilonychia. No jaundice, no lymphadenopathy.', 'شحوب الملتحمة. التهاب زوايا الفم. بداية تقعر الأظافر. لا يرقان ولا تضخم عقد لمفاوية.'),
      { relevant: true }),
    action('EXAM_CVS', 'PhysicalExam', t('Cardiovascular examination', 'فحص القلب والأوعية'),
      t('Tachycardic. Soft ejection systolic flow murmur at the left sternal edge. No signs of heart failure.', 'تسرع قلب. نفخة انقباضية جريانية خفيفة. لا علامات قصور قلب.'),
      { relevant: true }),
    action('EXAM_ABDOMEN', 'PhysicalExam', t('Abdominal examination', 'فحص البطن'),
      t('Soft, non-tender. No hepatosplenomegaly, no masses, no palpable uterus.', 'لين، غير مؤلم. لا تضخم كبد أو طحال، لا كتل.'),
      { relevant: true }),
    action('LAB_FBC', 'Investigation', t('Full blood count & blood film', 'صورة دم كاملة ولطاخة'),
      t('Hb 86 g/L, MCV 68 fL, MCH 21 pg, RDW 19% (high), platelets 420. Film: microcytic hypochromic cells, pencil cells.', 'الهيموغلوبين ٨٦، MCV ‏٦٨، MCH ‏٢١، RDW ‏١٩٪ (مرتفع)، الصفائح ٤٢٠. اللطاخة: خلايا صغيرة ناقصة الصباغ، خلايا قلمية.'),
      { relevant: true }),
    action('LAB_FERRITIN', 'Investigation', t('Ferritin & iron studies', 'الفيريتين ودراسة الحديد'),
      t('Ferritin 4 µg/L (low). Serum iron low, TIBC high, transferrin saturation 5%.', 'الفيريتين ٤ (منخفض). حديد المصل منخفض، السعة الكلية مرتفعة، تشبع الترانسفيرين ٥٪.'),
      { relevant: true }),
    action('LAB_COELIAC', 'Investigation', t('Coeliac serology (tTG-IgA + total IgA)', 'تحليل السيلياك (tTG-IgA + IgA الكلي)'),
      t('tTG-IgA negative, total IgA normal.', 'سلبي، IgA الكلي طبيعي.'), { relevant: true }),
    action('LAB_HCG', 'Investigation', t('Urine pregnancy test', 'اختبار حمل في البول'),
      t('Negative.', 'سلبي.'), { relevant: true }),
    action('LAB_TSH', 'Investigation', t('Thyroid function', 'وظائف الغدة الدرقية'),
      t('TSH 1.8 mIU/L (normal).', 'TSH ‏١.٨ (طبيعي).'), { relevant: true }),
    action('LAB_HB_ELECTROPHORESIS', 'Investigation', t('Haemoglobin electrophoresis', 'الرحلان الكهربائي للهيموغلوبين'),
      t('Not needed when ferritin confirms iron deficiency — repeat only if microcytosis persists after iron repletion.', 'غير ضروري مع تأكيد نقص الحديد بالفيريتين.')),
    action('IMG_PELVIC_US', 'Investigation', t('Pelvic ultrasound', 'سونار الحوض'),
      t('Normal-sized uterus with a 2 cm intramural fibroid. Normal ovaries.', 'رحم طبيعي الحجم مع ورم ليفي داخل الجدار ٢ سم. المبيضان طبيعيان.'),
      { relevant: true }),
    action('PROC_ENDOSCOPY', 'Investigation', t('Upper & lower GI endoscopy', 'منظار علوي وسفلي'),
      t('Not indicated: premenopausal, under 50, clear menstrual cause, no GI symptoms or family history, coeliac negative.', 'غير مستطب: قبل سن اليأس، تحت ٥٠، سبب واضح من الطمث، لا أعراض هضمية.'),
      { harmful: true, penalty: 2 }),
    action('PROC_BONE_MARROW', 'Investigation', t('Bone marrow biopsy', 'خزعة نخاع العظم'),
      t('Invasive and unnecessary — diagnosis established by ferritin.', 'تداخلي وغير ضروري — التشخيص ثابت بالفيريتين.'),
      { harmful: true, penalty: 3 }),
    action('TX_ORAL_IRON', 'Intervention', t('Oral ferrous sulfate 200 mg once daily', 'كبريتات الحديد ٢٠٠ ملغ مرة يومياً'),
      t('Prescribed with counselling: take on an empty stomach or with vitamin C, avoid tea with doses; dark stools and constipation are common.', 'وُصفت مع الإرشاد: على معدة فارغة أو مع فيتامين سي، وتجنب الشاي مع الجرعة؛ البراز الداكن والإمساك شائعان.'),
      { relevant: true }),
    action('TX_TRANEXAMIC', 'Intervention', t('Tranexamic acid during heavy periods / discuss LNG-IUS', 'حمض الترانيكساميك أثناء الدورة / مناقشة اللولب الهرموني'),
      t('Started tranexamic acid 1 g three times daily for up to 4 days per period; LNG-IUS discussed; gynaecology referral made.', 'بدء حمض الترانيكساميك ١ غ ثلاث مرات يومياً حتى ٤ أيام في كل دورة؛ نوقش اللولب الهرموني؛ إحالة للنساء.'),
      { relevant: true }),
    action('TX_DIET', 'Intervention', t('Dietary advice (iron-rich foods)', 'إرشاد غذائي (أطعمة غنية بالحديد)'),
      t('Advice on iron-rich foods (legumes, leafy greens, fortified cereals) and separating tea from meals.', 'نصائح حول الأطعمة الغنية بالحديد وفصل الشاي عن الوجبات.'),
      { relevant: true }),
    action('TX_TRANSFUSION', 'Intervention', t('Blood transfusion (2 units)', 'نقل دم (وحدتان)'),
      t('Not indicated in a haemodynamically stable patient with chronic IDA — exposes her to transfusion risks.', 'غير مستطب لمريضة مستقرة بفقر دم مزمن بعوز الحديد — يعرضها لمخاطر نقل الدم.'),
      { harmful: true, penalty: 3 }),
  ],

  disposition: {
    options: [
      { key: 'home_oral_iron', label: t('Home — oral iron, treat heavy periods / gynaecology referral, recheck Hb in 2–4 weeks', 'المنزل — حديد فموي، علاج غزارة الدورة / إحالة للنساء، إعادة الهيموغلوبين بعد ٢–٤ أسابيع') },
      { key: 'admit_transfusion', label: t('Admit for blood transfusion', 'إدخال لنقل الدم') },
      { key: 'urgent_endoscopy', label: t('Urgent 2-week-wait referral for GI endoscopy', 'إحالة عاجلة خلال أسبوعين لمنظار الجهاز الهضمي') },
      { key: 'reassure_discharge', label: t('Reassure as stress-related, no follow-up', 'طمأنة بأنه إجهاد، دون متابعة') },
    ],
    correctKey: 'home_oral_iron',
  },

  guidelineReferences: [
    { title: 'Snook J et al. British Society of Gastroenterology guidelines for the management of iron deficiency anaemia in adults. Gut 2021;70:2030–2051', url: 'https://doi.org/10.1136/gutjnl-2021-325210' },
    { title: 'NICE NG88 — Heavy menstrual bleeding: assessment and management', url: 'https://www.nice.org.uk/guidance/ng88' },
    { title: 'NICE CKS — Anaemia: iron deficiency', url: 'https://cks.nice.org.uk/topics/anaemia-iron-deficiency/' },
  ],
};
