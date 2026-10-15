import { t, concept, action, keyed, reply } from '../helpers.js';

export default {
  slug: 'breaking-bad-news-colon-cancer',
  title: t('Breaking Bad News: Biopsy Results', 'إبلاغ الأخبار السيئة: نتيجة الخزعة'),
  specialty: 'Oncology / Surgery',
  difficulty: 'hard',
  isPublished: true,
  estimatedMinutes: 20,

  triageBrief: t(
    'Mr. Khaled Mansour, 58, had a colonoscopy last week for 3 months of rectal bleeding, change in bowel habit, weight loss and iron-deficiency anaemia. A biopsy of a sigmoid mass was taken. He is back in the surgical outpatient clinic today for his results. Commit to a working differential from the referral picture before reviewing the reports, then discuss the result with the patient using a structured approach.',
    'السيد خالد منصور، ٥٨ عاماً، أجرى منظاراً للقولون الأسبوع الماضي بسبب نزيف شرجي وتغير في عادات الإخراج ونقص وزن وفقر دم بنقص الحديد منذ ٣ أشهر. أُخذت خزعة من كتلة في القولون السيني. عاد اليوم إلى العيادة لمعرفة النتيجة. التزم بتشخيص تفريقي مبدئي قبل مراجعة التقارير، ثم ناقش النتيجة مع المريض بأسلوب منظّم.',
  ),
  patient: {
    name: t('Khaled Mansour', 'خالد منصور'),
    age: 58,
    sex: 'male',
    setting: t('Surgical Outpatient Clinic — results consultation', 'العيادة الجراحية الخارجية — موعد النتائج'),
  },

  patientPersona: `You are Khaled Mansour, a 58-year-old accountant, married with two adult children. Your wife Huda is in the waiting room.

Background you know:
- For about 3 months you had blood in your stool, looser stools than usual, and you lost about 6 kg without trying. Your GP found you were anaemic and sent you for a camera test (colonoscopy) last week.
- The doctor doing the camera test said they "found something and took a sample". You have come today to get the result. You have not been told anything else.
- Your father died of "bowel cancer" at 70; you are privately terrified it is the same.
- No other medical problems. You take iron tablets since last month.

How you behave:
- At first you are polite but tense, fidgeting. If the doctor asks what you understand so far, explain the above in lay terms and admit you are scared it might be cancer like your father.
- If asked how much detail you want, say you want to know everything honestly, but "please go slowly".
- When the doctor tells you the result is cancer, go quiet for a moment, then react with shock: "Cancer... I knew it. Like my father." If the doctor acknowledges your emotions, you gradually calm down and start asking questions: "Can it be cured?", "Will I need chemotherapy?", "What do I tell my wife and children?"
- If the doctor delivers the news abruptly with no warning, react with distress and become harder to talk to.
- If the doctor uses jargon (e.g. "adenocarcinoma", "staging", "MDT"), ask what it means.
- You would like your wife Huda to join if the doctor offers.
- Never state the diagnosis yourself before the doctor tells you; you do not know the result.`,

  scriptedReplies: [
    reply('spikes_setting', 'Thank you, doctor. Yes, this is fine. My wife is outside if needed.', 'شكراً يا دكتور، نعم المكان مناسب. زوجتي في الخارج إن احتجنا.'),
    reply('spikes_perception', 'They found something during the camera test and took a sample... My father had bowel cancer. I am scared it is the same.', 'وجدوا شيئاً أثناء المنظار وأخذوا عينة... والدي توفي بسرطان الأمعاء، وأخاف أن يكون الأمر نفسه.'),
    reply('spikes_invitation', 'Please tell me everything, honestly. But slowly, please.', 'أرجوك أخبرني بكل شيء بصراحة، لكن ببطء.'),
    reply('spikes_knowledge', '...Cancer. I knew it. Like my father.', '...سرطان. كنت أعرف. مثل والدي.'),
    reply('spikes_emotions', "Sorry... it's a lot to take in. Thank you for giving me a moment.", 'آسف... الأمر صعب. شكراً لأنك أعطيتني لحظة.'),
    reply('spikes_strategy', 'So what happens now? Can it be cured? Will I need chemotherapy?', 'وماذا سيحدث الآن؟ هل يمكن علاجه؟ هل سأحتاج إلى علاج كيميائي؟'),
    reply('support_system', 'My wife Huda is in the waiting room. I would like her here.', 'زوجتي هدى في غرفة الانتظار. أود أن تكون معي.'),
    reply('invite_questions', 'What do I tell my children?', 'ماذا أقول لأولادي؟'),
  ],
  defaultReply: t('Sorry doctor, I am a bit lost. Can you explain that again?', 'آسف يا دكتور، أنا مشوش قليلاً. هل يمكنك أن تشرح مجدداً؟'),

  goldStandardDiagnosis: keyed(
    'colorectal_cancer',
    t('Adenocarcinoma of the sigmoid colon (colorectal cancer)', 'سرطان غدي في القولون السيني (سرطان القولون والمستقيم)'),
    ['adenocarcinoma', 'colon cancer', 'colorectal cancer', 'bowel cancer', 'colorectal carcinoma', 'colon carcinoma', 'sigmoid cancer', 'sigmoid carcinoma'],
    ['سرطان القولون', 'سرطان القولون والمستقيم', 'سرطان الأمعاء', 'سرطان غدي', 'ورم خبيث في القولون'],
  ),
  acceptedDifferentials: [
    keyed('colorectal_cancer', t('Colorectal cancer'), ['colorectal cancer', 'colon cancer', 'bowel cancer', 'adenocarcinoma', 'malignancy', 'carcinoma', 'tumour', 'tumor'], ['سرطان القولون', 'سرطان الأمعاء', 'ورم', 'خبيث']),
    keyed('ibd', t('Inflammatory bowel disease'), ['inflammatory bowel disease', 'ibd', 'ulcerative colitis', 'crohn', "crohn's"], ['التهاب الأمعاء', 'التهاب القولون التقرحي', 'كرون']),
    keyed('diverticular', t('Diverticular disease'), ['diverticular', 'diverticulosis', 'diverticulitis'], ['الرتوج', 'رتج']),
    keyed('polyp', t('Adenomatous polyp'), ['polyp', 'adenoma'], ['سليلة', 'زوائد']),
    keyed('angiodysplasia', t('Angiodysplasia'), ['angiodysplasia'], ['خلل التنسج الوعائي']),
    keyed('haemorrhoids', t('Haemorrhoids'), ['hemorrhoids', 'haemorrhoids', 'piles'], ['البواسير', 'بواسير']),
  ],
  requiredDifferentialCount: 2,

  requiredProtocol: 'SPIKES',
  protocolSteps: [
    { stepCode: 'SPIKES_S_SETTING', order: 1, conceptId: 'spikes_setting' },
    { stepCode: 'SPIKES_P_PERCEPTION', order: 2, conceptId: 'spikes_perception' },
    { stepCode: 'SPIKES_I_INVITATION', order: 3, conceptId: 'spikes_invitation' },
    { stepCode: 'SPIKES_K_KNOWLEDGE', order: 4, conceptId: 'spikes_knowledge' },
    { stepCode: 'SPIKES_E_EMOTIONS', order: 5, conceptId: 'spikes_emotions' },
    { stepCode: 'SPIKES_S_STRATEGY', order: 6, conceptId: 'spikes_strategy' },
  ],

  conceptDictionary: [
    // SPIKES protocol steps (Communication)
    concept('spikes_setting', 'Communication', t('S — Setting up (privacy, seating, introductions)', 'S — تهيئة المكان (الخصوصية، الجلوس، التعارف)'),
      ['private', 'privacy', 'take a seat', 'have a seat', 'sit down', 'comfortable', 'my name is', 'introduce', 'is it ok if we talk', 'anyone with you', 'someone with you'],
      ['خصوصية', 'تفضل اجلس', 'اجلس', 'مرتاح', 'اسمي', 'أعرفك بنفسي', 'أحد معك', 'هل معك أحد']),
    concept('spikes_perception', 'Communication', t('P — Perception (what the patient already knows)', 'P — الإدراك (ما يعرفه المريض)'),
      ['what do you understand', 'what do you know', 'what have you been told', 'what is your understanding', 'what were you told', 'tell me what you know', 'what do you think'],
      ['ماذا تعرف', 'ما الذي تعرفه', 'ماذا فهمت', 'ماذا قيل لك', 'ما فهمك', 'ماذا تعتقد']),
    concept('spikes_invitation', 'Communication', t('I — Invitation (how much the patient wants to know)', 'I — الدعوة (كم يريد المريض أن يعرف)'),
      ['how much would you like to know', 'how much detail', 'would you like me to explain', 'would you like to know', 'do you want me to go through', 'how much information', 'shall i go through'],
      ['كم تريد أن تعرف', 'هل تريد أن أشرح', 'هل تريد أن تعرف', 'كم من التفاصيل', 'هل أشرح لك']),
    concept('spikes_knowledge', 'Communication', t('K — Knowledge (warning shot, then clear disclosure)', 'K — المعرفة (تمهيد ثم إفصاح واضح)'),
      ["i'm afraid", 'i am afraid', 'unfortunately', 'bad news', 'not good news', 'the results show', 'the biopsy showed', 'the biopsy shows', 'i am sorry to tell you', 'cancer'],
      ['للأسف', 'مع الأسف', 'أخبار غير سارة', 'أخبار سيئة', 'النتيجة تظهر', 'الخزعة أظهرت', 'يؤسفني', 'سرطان']),
    concept('spikes_emotions', 'Communication', t('E — Emotions (acknowledging with empathy)', 'E — المشاعر (الاعتراف بها بتعاطف)'),
      ['i can see', 'this must be', 'difficult', 'a lot to take in', 'how are you feeling', 'how do you feel', 'take your time', 'understandable', "it's okay to", 'i am sorry', "i'm sorry", 'shock'],
      ['أتفهم', 'أفهم شعورك', 'صعب', 'خذ وقتك', 'كيف تشعر', 'بماذا تشعر', 'مفهوم', 'أنا آسف', 'صدمة']),
    concept('spikes_strategy', 'Communication', t('S — Strategy & summary (plan, next steps)', 'S — الاستراتيجية والتلخيص (الخطة والخطوات التالية)'),
      ['next step', 'next steps', 'plan', 'treatment', 'options', 'team', 'specialist', 'oncologist', 'surgeon', 'surgery', 'scan', 'to summarise', 'to summarize', 'we will', 'together'],
      ['الخطوة التالية', 'الخطة', 'العلاج', 'خيارات', 'الفريق', 'أخصائي', 'جراحة', 'الأورام', 'للتلخيص', 'سوف نقوم', 'معاً']),

    // Other communication/history items
    concept('identity_check', 'History', t('Confirms patient identity', 'التأكد من هوية المريض'),
      ['your name', 'date of birth', 'confirm your', 'can you tell me your name'],
      ['اسمك', 'تاريخ ميلادك', 'تأكيد']),
    concept('support_system', 'History', t('Explores support system / offers to include family', 'استكشاف الدعم الأسري'),
      ['wife', 'family', 'support', 'someone with you', 'anyone with you', 'children', 'would you like someone'],
      ['زوجتك', 'العائلة', 'الأسرة', 'دعم', 'أحد معك', 'أولادك']),
    concept('invite_questions', 'History', t('Invites questions & checks understanding', 'دعوة الأسئلة والتأكد من الفهم'),
      ['any questions', 'do you have questions', 'anything you would like to ask', 'does that make sense', 'is that clear', 'can you tell me what you understood'],
      ['أي أسئلة', 'هل لديك أسئلة', 'هل هذا واضح', 'هل تريد أن تسأل']),

    // Handoff / documentation
    concept('hand_mdt', 'Handoff', t('Colorectal MDT / oncology referral', 'الإحالة إلى الفريق متعدد التخصصات / الأورام'),
      ['mdt', 'multidisciplinary', 'oncology', 'oncologist', 'colorectal team', 'tumour board', 'tumor board', 'staging'],
      ['الفريق متعدد التخصصات', 'الأورام', 'طبيب الأورام', 'فريق القولون', 'التصنيف المرحلي']),
    concept('hand_emotional', 'Handoff', t("Documents patient's emotional state", 'توثيق الحالة النفسية للمريض'),
      ['upset', 'distressed', 'shocked', 'anxious', 'tearful', 'emotional', 'coping', 'scared'],
      ['منزعج', 'قلق', 'مصدوم', 'خائف', 'متأثر', 'حزين']),
    concept('hand_follow_up', 'Handoff', t('Follow-up appointment arranged', 'تحديد موعد متابعة'),
      ['follow up', 'follow-up', 'appointment', 'review', 'see him again'],
      ['متابعة', 'موعد', 'مراجعة']),
    concept('hand_contact', 'Handoff', t('Safety-net / key-worker contact given', 'توفير وسيلة تواصل'),
      ['contact', 'phone number', 'call', 'nurse specialist', 'key worker', 'cancer nurse'],
      ['تواصل', 'رقم الهاتف', 'اتصال', 'الممرضة المختصة']),
  ],

  panelActions: [
    action('HISTORY_REFERRAL', 'History', t('Review GP referral & colonoscopy note', 'مراجعة الإحالة وتقرير المنظار'),
      t('Colonoscopy: friable, ulcerated, partially obstructing mass in the sigmoid colon at 25 cm. Biopsies taken. No other lesions to caecum.', 'المنظار: كتلة متقرحة هشة تسد جزئياً القولون السيني على بعد ٢٥ سم. أُخذت خزعات.'),
      { relevant: true }),
    action('EXAM_GENERAL', 'PhysicalExam', t('General appearance & vitals', 'المظهر العام والعلامات الحيوية'),
      t('Anxious, mildly pale. BP 128/80, HR 88, afebrile.', 'قلق، شاحب قليلاً. الضغط ١٢٨/٨٠، النبض ٨٨، لا حرارة.'),
      { relevant: true }),
    action('EXAM_ABDOMEN', 'PhysicalExam', t('Abdominal examination', 'فحص البطن'),
      t('Soft, mild left iliac fossa fullness, no hepatomegaly, no ascites.', 'لين، امتلاء خفيف في الحفرة الحرقفية اليسرى، لا تضخم كبد، لا استسقاء.'),
      { relevant: true }),
    action('EXAM_DRE', 'PhysicalExam', t('Repeat digital rectal examination', 'إعادة الفحص الشرجي'),
      t('Unnecessary repeat intimate examination — already documented at colonoscopy.', 'فحص حميمي غير ضروري — موثق سابقاً.'),
      { harmful: true, penalty: 1 }),
    action('LAB_HISTOLOGY', 'Investigation', t('Histopathology report', 'تقرير الأنسجة'),
      t('Moderately differentiated adenocarcinoma of the sigmoid colon. MMR proteins retained.', 'سرطان غدي متوسط التمايز في القولون السيني.'),
      { relevant: true }),
    action('IMG_CT_STAGING', 'Investigation', t('CT chest/abdomen/pelvis (staging)', 'أشعة مقطعية للصدر والبطن والحوض (للتصنيف)'),
      t('Sigmoid wall thickening with 2 enlarged pericolic nodes. No liver or lung metastases. Provisional T3 N1 M0.', 'سماكة في جدار القولون السيني مع عقدتين لمفاويتين متضخمتين. لا انتقالات للكبد أو الرئة.'),
      { relevant: true }),
    action('LAB_CBC', 'Investigation', t('Full blood count', 'صورة دم كاملة'),
      t('Hb 98 g/L, MCV 72 fL (microcytic).', 'الهيموغلوبين ٩٨، MCV ‏٧٢ (صغير الكريات).'), { relevant: true }),
    action('LAB_CEA', 'Investigation', t('CEA tumour marker', 'دلالة الورم CEA'),
      t('CEA 8.2 ng/mL (raised) — baseline for follow-up.', 'CEA ‏٨.٢ (مرتفع) — قيمة مرجعية للمتابعة.'), { relevant: true }),
    action('IMG_PET', 'Investigation', t('Urgent PET-CT', 'PET-CT عاجل'),
      t('Not routinely indicated at this stage; MDT to decide.', 'غير مستطب روتينياً في هذه المرحلة.')),
    action('REF_MDT', 'Intervention', t('Refer to colorectal MDT', 'إحالة إلى فريق القولون متعدد التخصصات'),
      t('Referral sent; MDT discussion next Tuesday.', 'تم إرسال الإحالة؛ النقاش الثلاثاء القادم.'), { relevant: true }),
    action('REF_CNS', 'Intervention', t('Introduce colorectal cancer nurse specialist', 'التعريف بممرضة الأورام المختصة'),
      t('Nurse specialist joins, provides contact card and written information.', 'انضمت الممرضة المختصة وقدمت بطاقة تواصل ومعلومات مكتوبة.'), { relevant: true }),
    action('MED_MORPHINE', 'Intervention', t('Prescribe oral morphine', 'وصف مورفين فموي'),
      t('Opioid prescribed without pain indication — risk of constipation/obstruction with a partially obstructing tumour.', 'وصف أفيوني دون ألم — خطر الإمساك والانسداد.'),
      { harmful: true, penalty: 2 }),
  ],

  disposition: {
    options: [
      { key: 'mdt_outpatient', label: t('Outpatient — MDT referral, nurse specialist & follow-up within 1 week', 'متابعة خارجية — إحالة للفريق، ممرضة مختصة، ومتابعة خلال أسبوع') },
      { key: 'admit_surgery', label: t('Emergency admission for surgery today', 'إدخال طارئ للجراحة اليوم') },
      { key: 'gp_discharge', label: t('Discharge to GP with no specialist follow-up', 'تحويل للطبيب العام دون متابعة تخصصية') },
      { key: 'palliative_only', label: t('Refer to palliative care only', 'إحالة للرعاية التلطيفية فقط') },
    ],
    correctKey: 'mdt_outpatient',
  },

  guidelineReferences: [
    { title: 'Baile WF et al. SPIKES — A six-step protocol for delivering bad news. The Oncologist 2000;5:302–311', url: 'https://doi.org/10.1634/theoncologist.5-4-302' },
    { title: 'NICE NG151 — Colorectal cancer', url: 'https://www.nice.org.uk/guidance/ng151' },
  ],
};
