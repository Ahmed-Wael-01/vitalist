import { t, concept, action, keyed, reply } from '../helpers.js';

export default {
  slug: 'progressive-memory-loss',
  title: t('Progressive Memory Loss in an Older Adult', 'فقدان ذاكرة تدريجي لدى مسنّة'),
  specialty: 'Neurology',
  difficulty: 'medium',
  isPublished: true,
  estimatedMinutes: 20,

  triageBrief: t(
    'Mrs. Fatima Hassan, 74, is brought to the internal medicine clinic by her daughter Mona, who is worried about her mother becoming increasingly forgetful. Vitals at triage are stable. Take a collateral history, examine, investigate as appropriate, and decide on a plan.',
    'السيدة فاطمة حسن، ٧٤ عاماً، أحضرتها ابنتها منى إلى عيادة الباطنة لأنها قلقة من ازدياد نسيان والدتها. العلامات الحيوية مستقرة عند الفرز. خذ التاريخ المرضي من المرافقة، وافحص، واطلب الفحوصات المناسبة، وضع خطة.',
  ),
  patient: {
    name: t('Fatima Hassan (with daughter Mona)', 'فاطمة حسن (مع ابنتها منى)'),
    age: 74,
    sex: 'female',
    setting: t('Internal Medicine Outpatient Clinic', 'عيادة الباطنة الخارجية'),
  },

  patientPersona: `You are Mona, the 45-year-old daughter of Mrs. Fatima Hassan (74). You are answering the doctor's questions on your mother's behalf; your mother sits beside you, smiling politely, and occasionally says "I'm fine, she worries too much".

What you know (reveal only when asked):
- Over about 18 months your mother has become gradually more forgetful. It has slowly got worse, never suddenly.
- She repeats the same questions within minutes, forgets recent conversations and where she put things. She remembers her childhood very well.
- Three months ago she got lost driving home from the market, a route she has used for 20 years. You took the car keys away after that.
- She used to manage her own bills; she has missed several payments and you now handle her money.
- Twice she left the gas stove on. She still dresses, bathes and feeds herself, though she sometimes wears the same clothes several days.
- Mood: she is a bit quieter, but she still enjoys her grandchildren and her TV shows. No crying spells, sleeps well, eats well.
- No falls, no head injury. No problems with walking or balance, no urinary incontinence. No tremor, no hallucinations.
- Past history: high blood pressure for 10 years, takes amlodipine 5 mg daily. No diabetes, no stroke, no heart problems.
- No alcohol, never smoked. No new medicines, no sleeping pills.
- Her older sister was "senile" in her late 70s.
- She lives alone in a flat; you visit every day after work.
- You are worried it's "something like Alzheimer's" but you don't know medical terms, and you would like advice on how to keep her safe at home.`,

  scriptedReplies: [
    reply('symptom_memory_loss', 'She keeps asking me the same questions again and again, and forgets what we talked about an hour ago.', 'تسألني نفس الأسئلة مراراً وتنسى ما تحدثنا عنه قبل ساعة.'),
    reply('onset_duration', "It started about a year and a half ago, I think. Maybe a bit more.", 'بدأ الأمر قبل سنة ونصف تقريباً، ربما أكثر قليلاً.'),
    reply('progression', "It's been slowly getting worse, month by month. Nothing sudden.", 'يزداد سوءاً ببطء شهراً بعد شهر، لم يحدث شيء فجأة.'),
    reply('adl_impact', 'She got lost driving home from the market and she has missed paying bills. She still washes and dresses herself.', 'تاهت وهي تقود من السوق، وفاتها دفع بعض الفواتير. ما زالت تستحم وتلبس بنفسها.'),
    reply('medication_history', 'Only her blood pressure tablet, amlodipine 5 milligrams. Nothing new.', 'فقط حبة الضغط، أملوديبين ٥ ملغ. لا شيء جديد.'),
    reply('family_history', 'Her older sister became very forgetful in her late seventies.', 'أختها الكبرى أصبحت كثيرة النسيان في أواخر السبعينات.'),
    reply('ruleout_head_trauma', "No, she hasn't fallen or hit her head.", 'لا، لم تسقط ولم تضرب رأسها.'),
    reply('ruleout_mood', 'She is a little quieter but still happy with her grandchildren. No crying.', 'أصبحت أهدأ قليلاً لكنها ما زالت سعيدة مع أحفادها. لا تبكي.'),
    reply('ruleout_gait_urine', 'Her walking is fine and she has no problems with her bladder.', 'مشيها طبيعي وليس لديها مشاكل في التبول.'),
    reply('vascular_risk', 'She has high blood pressure for about ten years. No diabetes or stroke.', 'عندها ضغط منذ عشر سنوات تقريباً. لا سكري ولا جلطات.'),
    reply('safety', 'I took her car keys. She left the gas stove on twice, that scares me.', 'أخذت مفاتيح السيارة منها. تركت الغاز مشتعلاً مرتين وهذا يخيفني.'),
  ],
  defaultReply: t("I'm not sure about that, doctor. Could you ask me another way?", 'لست متأكدة يا دكتور، هل يمكنك أن تسأل بطريقة أخرى؟'),

  goldStandardDiagnosis: keyed(
    'alzheimers',
    t("Alzheimer's disease (major neurocognitive disorder)", 'مرض ألزهايمر (اضطراب عصبي معرفي رئيسي)'),
    ["alzheimer's", 'alzheimer', 'alzheimers disease', 'alzheimer type dementia'],
    ['الزهايمر', 'ألزهايمر', 'خرف الزهايمر'],
  ),
  acceptedDifferentials: [
    keyed('alzheimers', t("Alzheimer's disease"), ['alzheimer', "alzheimer's"], ['الزهايمر', 'ألزهايمر']),
    keyed('vascular_dementia', t('Vascular dementia'), ['vascular dementia', 'multi infarct dementia'], ['الخرف الوعائي']),
    keyed('hypothyroidism', t('Hypothyroidism'), ['hypothyroidism', 'hypothyroid', 'thyroid'], ['قصور الغدة الدرقية', 'الغدة الدرقية']),
    keyed('b12_deficiency', t('Vitamin B12 deficiency'), ['b12', 'b12 deficiency', 'cobalamin'], ['فيتامين ب12', 'نقص فيتامين ب12']),
    keyed('depression', t('Depression (pseudodementia)'), ['depression', 'pseudodementia'], ['اكتئاب', 'الاكتئاب']),
    keyed('nph', t('Normal pressure hydrocephalus'), ['normal pressure hydrocephalus', 'nph', 'hydrocephalus'], ['استسقاء الرأس']),
    keyed('lewy_body', t('Lewy body dementia'), ['lewy body', 'lewy'], ['أجسام ليوي']),
    keyed('frontotemporal', t('Frontotemporal dementia'), ['frontotemporal', 'ftd'], ['الخرف الجبهي الصدغي']),
  ],
  requiredDifferentialCount: 3,

  requiredProtocol: 'NONE',
  protocolSteps: [],

  conceptDictionary: [
    concept('symptom_memory_loss', 'History', t('Characterises memory loss', 'وصف فقدان الذاكرة'),
      ['memory', 'forget', 'forgetful', 'forgetting', 'forgets', 'remember', 'repeat'],
      ['ذاكرة', 'ذاكرتها', 'تنسى', 'نسيان', 'النسيان', 'تتذكر', 'تكرر']),
    concept('onset_duration', 'History', t('Onset & duration', 'البداية والمدة'),
      ['when did', 'how long', 'since when', 'when was', 'started', 'start', 'began', 'duration'],
      ['منذ متى', 'من متى', 'متى بدأ', 'متى بدأت', 'متى لاحظت', 'كم مدة', 'بدأت', 'بدأ']),
    concept('progression', 'History', t('Pattern of progression (gradual vs sudden)', 'نمط التطور (تدريجي أم مفاجئ)'),
      ['getting worse', 'progress', 'progressive', 'gradual', 'gradually', 'sudden', 'suddenly', 'stepwise', 'worsening'],
      ['تدريجي', 'تدريجياً', 'يزداد', 'تزداد', 'أسوأ', 'فجأة', 'مفاجئ', 'تطور']),
    concept('adl_impact', 'History', t('Impact on daily living (ADLs / IADLs)', 'التأثير على الأنشطة اليومية'),
      ['daily activities', 'daily living', 'cook', 'cooking', 'bathe', 'bathing', 'dress', 'dressing', 'bills', 'finances', 'money', 'shopping', 'get lost', 'got lost', 'manage', 'look after herself'],
      ['الأنشطة اليومية', 'الحياة اليومية', 'الطبخ', 'تطبخ', 'تستحم', 'تلبس', 'الفواتير', 'المال', 'فلوس', 'التسوق', 'تاهت', 'تضيع', 'تعتني بنفسها']),
    concept('medication_history', 'History', t('Medication history', 'التاريخ الدوائي'),
      ['medication', 'medicine', 'pills', 'tablets', 'drugs', 'sleeping pills'],
      ['أدوية', 'دواء', 'الأدوية', 'حبوب', 'علاج']),
    concept('family_history', 'History', t('Family history of dementia', 'التاريخ العائلي'),
      ['family history', 'family', 'relatives', 'sister', 'brother', 'parents', 'runs in'],
      ['العائلة', 'تاريخ عائلي', 'أقارب', 'أخت', 'أخ', 'الوالدين']),
    concept('ruleout_head_trauma', 'History', t('Rules out head injury / falls', 'استبعاد إصابة الرأس أو السقوط'),
      ['head injury', 'fall', 'fallen', 'falls', 'hit her head', 'trauma', 'accident'],
      ['إصابة في الرأس', 'سقطت', 'وقعت', 'ضربة', 'حادث']),
    concept('ruleout_mood', 'History', t('Screens mood / depression', 'فحص المزاج والاكتئاب'),
      ['mood', 'sad', 'depressed', 'depression', 'feeling down', 'interest', 'enjoy', 'crying', 'sleep'],
      ['المزاج', 'مزاجها', 'حزينة', 'اكتئاب', 'مكتئبة', 'تستمتع', 'تبكي', 'النوم']),
    concept('ruleout_gait_urine', 'History', t('Screens gait & urinary symptoms (NPH)', 'فحص المشي والتبول'),
      ['walking', 'walk', 'gait', 'balance', 'urine', 'urinary', 'incontinence', 'bladder', 'wet herself'],
      ['المشي', 'مشيها', 'التوازن', 'التبول', 'سلس', 'المثانة', 'البول']),
    concept('vascular_risk', 'History', t('Vascular risk factors', 'عوامل الخطر الوعائية'),
      ['blood pressure', 'hypertension', 'diabetes', 'stroke', 'cholesterol', 'heart'],
      ['الضغط', 'ضغط الدم', 'سكري', 'السكر', 'جلطة', 'الكوليسترول', 'القلب']),
    concept('safety', 'History', t('Safety risks (driving, stove, wandering)', 'مخاطر السلامة (القيادة، الغاز، التيه)'),
      ['driving', 'drive', 'car', 'stove', 'gas', 'cooker', 'wander', 'wandering', 'alone', 'safe', 'safety'],
      ['القيادة', 'تقود', 'السيارة', 'الغاز', 'الموقد', 'تخرج', 'وحدها', 'آمنة', 'الأمان']),
    concept('alcohol', 'History', t('Alcohol use', 'تعاطي الكحول'),
      ['alcohol', 'drink', 'drinking'],
      ['كحول', 'الكحول', 'تشرب']),

    // Handoff / plan
    concept('hand_caregiver', 'Handoff', t('Caregiver support & education', 'دعم وتثقيف مقدم الرعاية'),
      ['caregiver', 'carer', 'support', 'daughter', 'family support', 'social worker', 'education'],
      ['مقدم الرعاية', 'دعم', 'الابنة', 'الأسرة', 'الأخصائي الاجتماعي', 'تثقيف']),
    concept('hand_driving', 'Handoff', t('Driving cessation advised', 'التوقف عن القيادة'),
      ['driving', 'drive', 'car keys'],
      ['القيادة', 'السيارة']),
    concept('hand_home_safety', 'Handoff', t('Home safety (stove, supervision)', 'السلامة في المنزل'),
      ['stove', 'gas', 'home safety', 'supervision', 'live alone', 'lives alone'],
      ['الغاز', 'الموقد', 'السلامة في المنزل', 'إشراف', 'تعيش وحدها']),
    concept('hand_follow_up', 'Handoff', t('Memory clinic follow-up', 'متابعة في عيادة الذاكرة'),
      ['follow up', 'follow-up', 'memory clinic', 'review', 'neurology', 'geriatric'],
      ['متابعة', 'عيادة الذاكرة', 'مراجعة', 'الأعصاب', 'طب المسنين']),
  ],

  panelActions: [
    action('HISTORY_COLLATERAL_RECORDS', 'History', t('Review GP referral letter', 'مراجعة رسالة الإحالة'),
      t('GP letter: 18 months of progressive short-term memory decline. Hypertension on amlodipine. No previous neuro work-up.', 'رسالة الطبيب: تراجع تدريجي في الذاكرة قصيرة المدى منذ ١٨ شهراً. ضغط على أملوديبين. لا تقييم عصبي سابق.'),
      { relevant: true }),
    action('EXAM_VITALS', 'PhysicalExam', t('Vital signs', 'العلامات الحيوية'),
      t('BP 142/84, HR 74 regular, RR 14, SpO₂ 98%, Temp 36.7 °C.', 'الضغط ١٤٢/٨٤، النبض ٧٤ منتظم، التنفس ١٤، الأكسجين ٩٨٪، الحرارة ٣٦.٧'),
      { relevant: true }),
    action('EXAM_MOCA', 'PhysicalExam', t('Cognitive screen (MoCA)', 'تقييم معرفي (MoCA)'),
      t('MoCA 17/30: delayed recall 0/5, orientation 3/6 (wrong date and month), impaired clock drawing. Attention and language relatively preserved.', 'نتيجة MoCA ‏١٧/٣٠: التذكر المؤجل ٠/٥، التوجه ٣/٦، رسم الساعة ضعيف. الانتباه واللغة محفوظان نسبياً.'),
      { relevant: true }),
    action('EXAM_NEURO', 'PhysicalExam', t('Focused neurological exam', 'فحص عصبي مركّز'),
      t('No focal deficits. Normal tone, power and reflexes. No rigidity or tremor. Normal gait and Romberg.', 'لا علامات بؤرية. التوتر والقوة والمنعكسات طبيعية. لا تيبس ولا رعاش. المشي طبيعي.'),
      { relevant: true }),
    action('EXAM_THYROID', 'PhysicalExam', t('Thyroid examination', 'فحص الغدة الدرقية'),
      t('No goitre, no nodules. No signs of hypo- or hyperthyroidism.', 'لا تضخم ولا عقد. لا علامات قصور أو فرط نشاط.'),
      { relevant: true }),
    action('EXAM_ABDOMEN', 'PhysicalExam', t('Abdominal examination', 'فحص البطن'),
      t('Soft, non-tender, no organomegaly.', 'لين، غير مؤلم، لا تضخم أعضاء.')),
    action('LAB_TSH', 'Investigation', t('Thyroid function (TSH)', 'وظائف الغدة الدرقية'),
      t('TSH 2.1 mIU/L (normal).', 'TSH ‏٢.١ (طبيعي).'), { relevant: true }),
    action('LAB_B12_FOLATE', 'Investigation', t('Vitamin B12 & folate', 'فيتامين ب12 والفولات'),
      t('B12 410 pg/mL, folate normal.', 'ب12 ‏٤١٠، الفولات طبيعي.'), { relevant: true }),
    action('LAB_CBC_CMP', 'Investigation', t('CBC, electrolytes, renal & liver function, glucose, calcium', 'صورة دم، أملاح، كلى، كبد، سكر، كالسيوم'),
      t('All within normal limits. Na 139, Ca 2.35, glucose 5.4 mmol/L.', 'جميعها ضمن الطبيعي.'), { relevant: true }),
    action('IMG_MRI_BRAIN', 'Investigation', t('MRI brain', 'رنين مغناطيسي للدماغ'),
      t('Bilateral medial temporal lobe (hippocampal) atrophy, mild generalised atrophy. Minimal small-vessel changes. No infarcts, mass or hydrocephalus.', 'ضمور في الفص الصدغي الإنسي (الحُصين) على الجانبين، ضمور عام خفيف. لا احتشاءات ولا كتل ولا استسقاء.'),
      { relevant: true }),
    action('IMG_CXR', 'Investigation', t('Chest X-ray', 'أشعة صدر'),
      t('Normal.', 'طبيعية.')),
    action('PROC_LUMBAR_PUNCTURE', 'Intervention', t('Lumbar puncture', 'بزل قطني'),
      t('Invasive procedure performed without a clear indication in a typical presentation.', 'إجراء تداخلي دون مؤشر واضح.'),
      { harmful: true, penalty: 2 }),
    action('MED_HALOPERIDOL', 'Intervention', t('Start haloperidol', 'بدء هالوبيريدول'),
      t('Antipsychotic started without behavioural indication — increased stroke and mortality risk in older adults with dementia.', 'مضاد ذهان دون مؤشر سلوكي — يزيد خطر الجلطة والوفاة لدى كبار السن المصابين بالخرف.'),
      { harmful: true, penalty: 3 }),
    action('MED_DONEPEZIL', 'Intervention', t('Start donepezil 5 mg nightly', 'بدء دونيبيزيل ٥ ملغ ليلاً'),
      t('Cholinesterase inhibitor started; counsel on GI side effects and bradycardia.', 'تم بدء مثبط الكولينستيراز مع التوعية بالأعراض الجانبية.'),
      { relevant: true }),
  ],

  disposition: {
    options: [
      { key: 'home_memory_clinic', label: t('Home with daughter — memory clinic follow-up & community support', 'المنزل مع الابنة — متابعة في عيادة الذاكرة ودعم مجتمعي') },
      { key: 'medical_ward', label: t('Admit to medical ward', 'إدخال إلى قسم الباطنة') },
      { key: 'psychiatry_ward', label: t('Admit to psychiatric unit', 'إدخال إلى وحدة الطب النفسي') },
      { key: 'nursing_home_today', label: t('Urgent nursing-home placement today', 'نقل عاجل إلى دار رعاية اليوم') },
    ],
    correctKey: 'home_memory_clinic',
  },

  guidelineReferences: [
    { title: 'NICE NG97 — Dementia: assessment, management and support', url: 'https://www.nice.org.uk/guidance/ng97' },
    { title: 'NIA-AA diagnostic guidelines for Alzheimer’s disease', url: 'https://www.alz.org/research/for_researchers/diagnostic-criteria-guidelines' },
    { title: 'AGS Beers Criteria® for potentially inappropriate medication use in older adults', url: 'https://www.americangeriatrics.org/beers-criteria' },
  ],
};
