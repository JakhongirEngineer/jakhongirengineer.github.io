// method.js — the "How to Study" page (#/method, 04 §4.5): the lone learner's manual.
// Uzbek-PRIMARY meta-instruction (02 §6, §9) with the English mirror shown via the global
// UZ|EN toggle — the shell re-renders on toggle (app.js setLang → render()), so this module
// is re-invoked and simply renders the ACTIVE language: L(uz,en) picks the text and the
// node's lang attribute follows it, while English demo lines stay lang="en" (immersion —
// English content never translates, 02 §9). Code-split like lesson.js (app.js shows a
// screenSkeleton() then dynamic-imports this and calls renderMethod under an alive() guard).
// All 13 blocks of prose live INLINE here (not in the shell i18n dict) so the always-loaded
// dictionary stays lean and this page's content only downloads on the #/method route.
// Zero deps beyond core.js.

import { el, icon, t, lang } from "./core.js";

// ---- Active-language helpers -------------------------------------------------
const L = (uz, en) => (lang() === "en" ? en : uz);
// A paragraph in the ACTIVE language (lang attr follows the content — a11y §8).
const P = (uz, en, cls) => el("p", { class: cls || "m-p", lang: lang() }, L(uz, en));
// An English demo/example line — stays English in both modes (immersion, 02 §9).
const EG = (text) => el("p", { class: "m-eg", lang: "en" }, text);
const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

// ---- The 13 blocks (id + bilingual title) — single source for the mini-TOC ----
const BLOCKS = [
  { id: "m-work",     uz: "Bu kurs qanday ishlaydi",            en: "How this course works" },
  { id: "m-rules",    uz: "7 ta qoida",                          en: "The 7 rules" },
  { id: "m-golden",   uz: "Oltin qoida",                         en: "The golden rule" },
  { id: "m-habit",    uz: "Kunlik odat (7 kunlik tsikl)",        en: "The daily habit (7-day cycle)" },
  { id: "m-pace",     uz: "Surʼatingizni tanlang",              en: "Choose your pace" },
  { id: "m-alone",    uz: "Yolgʻiz gapirish mashqlari",         en: "Speaking techniques you can do ALONE" },
  { id: "m-listen",   uz: "Chuqur tinglash",                     en: "Deep listening" },
  { id: "m-peak",     uz: "Kuchli holat",                        en: "Peak state" },
  { id: "m-vocab",    uz: "Soʻz boyligini oshirish",            en: "How to learn vocabulary" },
  { id: "m-pron",     uz: "Talaffuzni oʻzingiz tekshirish",     en: "Pronunciation self-check" },
  { id: "m-mistakes", uz: "Oʻzbeklar eng koʻp qiladigan xatolar", en: "Top mistakes for Uzbek speakers" },
  { id: "m-stuck",    uz: "Qiynalsangiz nima qilish kerak",      en: "What to do when you struggle" },
  { id: "m-faq",      uz: "Savol-javob (FAQ)",                   en: "FAQ" },
];

// ---- Sticky mini-TOC — numbered jump links (04 §4.5). Buttons, NOT #hash anchors,
// so the hash router is never disturbed (mirrors lesson.js sectionStrip). ----------
function buildToc() {
  const list = el("div", { class: "m-toc__list" });
  BLOCKS.forEach((b, i) => {
    list.append(el("button", {
      class: "m-toc__btn", type: "button", "data-goto": b.id,
      "aria-label": (i + 1) + ". " + L(b.uz, b.en),
    }, String(i + 1)));
  });
  const nav = el("nav", { class: "m-toc", "aria-label": L("Ichidagilar", "Contents") },
    el("span", { class: "m-toc__label", lang: lang() }, L("Ichidagilar", "Contents")),
    list);
  list.addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]"); if (!b) return;
    const target = document.getElementById(b.dataset.goto);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY - (56 + nav.offsetHeight + 8);
    window.scrollTo({ top: y, behavior: reduceMotion() ? "auto" : "smooth" });
  });
  return nav;
}

// ---- Section shell (numbered, one h2 each; the page keeps a single h1) ----------
function msec(idx) {
  const b = BLOCKS[idx];
  const n = idx + 1;
  const sec = el("section", { class: "msec", id: b.id, "aria-labelledby": "mh-" + n });
  sec.append(el("h2", { class: "msec__h", id: "mh-" + n },
    el("span", { class: "msec__num", "aria-hidden": "true" }, String(n)),
    el("span", { lang: lang() }, L(b.uz, b.en))));
  return sec;
}

// A small reusable "tips" list in the active language.
function tips(items) {
  const ul = el("ul", { class: "m-tips", lang: lang() });
  items.forEach(([uz, en]) => ul.append(el("li", null, L(uz, en))));
  return ul;
}

// A deep-link button to a lesson (#/lesson/core-NN — a real hash-router link).
function lessonLink(id, labelUz, labelEn) {
  return el("a", { class: "m-lesson-link", href: "#/lesson/" + id },
    el("span", { lang: lang() }, L(labelUz, labelEn)),
    el("span", { class: "m-lesson-link__go", "aria-hidden": "true", html: icon("back") }));
}

// =====================================================================================
// BLOCK 1 — How this course works
// =====================================================================================
function blockWork() {
  const s = msec(0);
  s.append(el("div", { class: "card m-promise" },
    el("p", { class: "m-promise__k" }, el("span", { "aria-hidden": "true" }, "📌 "),
      el("span", { lang: lang() }, L("Vaʼda", "The promise"))),
    P("Siz ingliz tilida GAPIRISHNI oʻrganasiz — grammatika testini topshirishni emas.",
      "You will learn to SPEAK English — not to pass a grammar test.", "m-promise__body")));

  s.append(P(
    "Bu kurs AJ Hogeʼning “Effortless English” usuliga asoslangan. Gʻoya sodda: tilni maktabdagidek yodlab emas, balki chaqaloq oʻrgangandek — koʻp eshitib, keyin gapirib oʻrganasiz. Toʻrtta ustun bor:",
    "This course is built on AJ Hoge's “Effortless English” method. The idea is simple: you learn a language not by memorising it like at school, but the way a child does — by hearing a lot, then speaking. There are four pillars:"));

  const pillars = [
    ["🎧", "Koʻp tinglash", "Deep listening",
      "Koʻzingiz bilan emas, qulogʻingiz bilan oʻrganing. Tinglagan daqiqalaringiz — bu kursning eng muhim raqami.",
      "Learn with your ears, not your eyes. Your listening minutes are the single most important number on this site."],
    ["❤️", "Hissiyot bilan", "With emotion",
      "Turib, jilmayib, ovozni baland qilib mashq qiling. Hissiyot xotirani mustahkamlaydi.",
      "Practise standing up, smiling, with a big voice. Emotion locks memory in."],
    ["🗣️", "Ovoz chiqarib javob berish", "Answering out loud",
      "Savolni eshitasiz — va ovoz chiqarib, tez, tarjimasiz javob berasiz. Butun kurs shu bitta odat uchun qurilgan.",
      "You hear a question — and answer out loud, fast, without translating. The whole course is engineered for this one habit."],
    ["🔁", "Takrorlash", "Repetition",
      "Bitta dars siz bilan bir hafta yashaydi — uni koʻp marta eshitasiz. Chuqur, sekin va bu ishlaydi.",
      "One lesson lives with you for a whole week — you hear it many times. Deep, slow, and it works."],
  ];
  const grid = el("div", { class: "m-pillars" });
  pillars.forEach(([emoji, uzT, enT, uzB, enB]) => {
    grid.append(el("div", { class: "card m-pillar" },
      el("p", { class: "m-pillar__ic", "aria-hidden": "true" }, emoji),
      el("h3", { class: "m-pillar__t", lang: lang() }, L(uzT, enT)),
      P(uzB, enB, "m-pillar__b")));
  });
  s.append(grid);
  s.append(P(
    "Muhim: darsni tugatishga shoshilmang. Bir haftada bitta dars — bu kamlik emas, bu chuqurlik. Tez oʻtib ketgandan koʻra, sekin va har kuni yaxshiroq.",
    "Important: don't rush to finish lessons. One lesson a week is not “too little” — it is depth. Slow and daily beats fast and forgotten.", "m-note"));
  return s;
}

// =====================================================================================
// BLOCK 2 — The 7 rules
// =====================================================================================
function blockRules() {
  const s = msec(1);
  s.append(P(
    "AJ Hogeʼning yettita ishchi qoidasi. Har birining tagida — nega shundayligining bir qatorlik izohi.",
    "AJ Hoge's seven working rules. Under each — a one-line reason why."));

  const rules = [
    ["Soʻz emas, IBORA oʻrganing", "Learn phrases, not words",
      "Yakka soʻzlar bir-biriga qovushmaydi; iboralar esa ogʻizdan tayyor holda chiqadi.",
      "Single words don't fit together; chunks come out of your mouth ready-made."],
    ["Grammatika — tushunish uchun, mashq uchun emas", "Grammar is for comprehension, not drilling",
      "Qoida matnni tushunishga yordam beradi; ravonlik esa qoidani testdan emas, tinglash va gapirishdan keladi.",
      "A rule helps you understand; fluency comes from input and speaking, not from testing the rule."],
    ["Koʻz bilan emas, QULOQ bilan oʻrganing", "Learn with your ears, not your eyes",
      "Qanday eshitsangiz, shunday gapirasiz. Tinglash hajmi — asosiy koʻrsatkich.",
      "You speak the way you hear. Listening volume is the headline metric."],
    ["CHUQUR oʻrganing — bitta dars bilan bir hafta yashang", "Learn deeply — live with one lesson for a week",
      "Chuqurlik kenglikdan afzal; takror avtomatik nutqni quradi.",
      "Depth beats breadth; repetition builds automatic speech."],
    ["POV hikoyalar grammatikani sezdirib oʻrgatadi", "POV stories teach grammar intuitively",
      "Bir hikoya turli zamonlarda aytiladi — grammatika qoidasiz, oʻz-oʻzidan oʻrnashadi.",
      "The same story is told in different tenses — grammar installs itself, with no rules."],
    ["HAQIQIY ingliz tilidan foydalaning", "Use real English",
      "AJ Hoge, EnglishPod, BBC — hammasi tabiiy nutq; darslik tili odamlar gapiradigan til emas.",
      "AJ Hoge, EnglishPod, BBC are all authentic; textbook English is not how people talk."],
    ["Tinglang va JAVOB BERING (takrorlamang)", "Listen and ANSWER (don't repeat)",
      "Ovoz chiqarib javob berish — bu “esdan chiqarib olish” (retrieval); gapirishni aynan shu quradi.",
      "Answering out loud is retrieval — that is the very thing that builds speaking."],
  ];
  const grid = el("div", { class: "m-rules" });
  rules.forEach(([uzT, enT, uzW, enW], i) => {
    grid.append(el("div", { class: "card m-rule" },
      el("span", { class: "m-rule__n", "aria-hidden": "true" }, String(i + 1)),
      el("div", { class: "m-rule__body" },
        el("h3", { class: "m-rule__t", lang: lang() }, L(uzT, enT)),
        el("p", { class: "m-rule__why", lang: lang() },
          el("span", { class: "m-rule__why-k" }, L("Nega", "Why") + ": "), L(uzW, enW)))));
  });
  s.append(grid);
  s.append(el("div", { class: "callout callout--contrast", lang: lang() },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, "💪"),
    el("div", null,
      el("strong", null, L("Psixologiya qatlami", "The psychology layer")),
      el("p", null, L(
        "Yuqoridagi 7 qoidaga AJ Hoge bittasini qoʻshadi: kuchli hissiy va jismoniy holatda mashq qiling — turib, harakatlanib, jilmayib. Muvaffaqiyatning ~80% i — psixologiya (8-boʻlimga qarang).",
        "AJ Hoge adds one more to the 7: practise in a peak emotional and physical state — stand, move, smile. About 80% of success is psychology (see block 8).")))));
  return s;
}

// =====================================================================================
// BLOCK 3 — The golden rule
// =====================================================================================
function blockGolden() {
  const s = msec(2);
  s.append(el("div", { class: "card m-golden" },
    el("p", { class: "m-golden__k" }, el("span", { "aria-hidden": "true" }, "⭐ "),
      el("span", { lang: lang() }, L("OLTIN QOIDA", "THE GOLDEN RULE"))),
    el("p", { class: "m-golden__body", lang: lang() },
      L("Har kuni OVOZ CHIQARIB gapiring.", "Speak aloud every day."))));

  s.append(P(
    "Nega ovoz chiqarib? Chunki miya tilni ikki narsadan quradi: (1) tushunarli kirish — koʻp eshitib, maʼnosini tushunish; va (2) esdan chiqarib olish mashqi (retrieval) — javobni ovoz chiqarib, xotiradan tortib chiqarish. Bu ikkisi birga avtomatik nutqni beradi. Jim oʻqib yoki jim yodlab, siz hech qachon ravon gapira olmaysiz — bu boshqa koʻnikma.",
    "Why out loud? Because the brain builds language from two things: (1) comprehensible input — hearing a lot and understanding the meaning; and (2) retrieval practice — pulling the answer out of memory and saying it aloud. Together they produce automatic speech. Reading silently or memorising silently will never make you fluent — that is a different skill."));

  s.append(el("div", { class: "callout callout--error", lang: lang() },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, "🏫"),
    el("div", null,
      el("strong", null, L("Maktab usuli nega ishlamadi", "Why the school method failed you")),
      el("p", null, L(
        "Siz allaqachon grammatika-tarjima usulini sinab koʻrgansiz: qoidalar, tarjimalar, testlar. Natija — oʻqiy olasiz, lekin gapira olmaysiz. Chunki u ogʻzaki mashqni umuman oʻrgatmagan. Biz aksini qilamiz: tez tushuntiramiz (oʻzbekcha), sekin oʻzlashtiramiz (ingliz tilida, ovoz chiqarib).",
        "You have already tried the grammar-translation method: rules, translations, tests. The result — you can read, but you can't speak. Because it never trained speaking at all. We do the opposite: explain fast (in Uzbek), acquire slowly (in English, out loud).")))));

  s.append(P(
    "IELTS ham buni oʻlchaydi: “Fluency & Coherence” (ravonlik) va “Pronunciation” (talaffuz) — jami bahoning yarmi. Bu ikkisini jim oʻtirib topshirib boʻlmaydi. Shuning uchun kunlik ovozli mashq — muzokara emas, majburiyat.",
    "IELTS measures this too: “Fluency & Coherence” and “Pronunciation” make up half the score. You cannot pass those two sitting in silence. So daily out-loud practice is not optional — it's the deal.", "m-note"));
  return s;
}

// =====================================================================================
// BLOCK 4 — The daily habit (7-day cycle)
// =====================================================================================
function blockHabit() {
  const s = msec(3);
  s.append(P(
    "Bir dars — bir hafta. Har kuni bir xil AJ dars ustida ishlaysiz, lekin diqqat markazi har kuni oʻzgaradi, shuning uchun zerikmaysiz. Quyida tavsiya etilgan 7 kunlik ritm (kuniga ~30–45 daqiqa, Effortless surʼatida). Bu — taklif, majburiyat emas.",
    "One lesson — one week. Every day you work on the same AJ lesson, but the focus changes daily so it never gets boring. Below is the suggested 7-day rhythm (~30–45 min/day on the Effortless track). It's a suggestion, never a rule."));

  const days = [
    ["1", "Boshlash", "Kick-off",
      "Maqsad + kuchli holat rituali → soʻzlar → birinchi MAIN tinglash → Grammatika A + mashqlar.",
      "Can-do goal + peak-state ritual → vocab → first MAIN listen → Grammar A + drills.",
      "0", "0 (kirish)", "0 (input)"],
    ["2", "Chuqur tinglash", "Deep Listen",
      "MAIN ×2 (matn bilan) → soʻzlarni takror → Grammatika A ni yakunlash (“oʻzim haqimda rost gap” — ovoz chiqarib).",
      "MAIN ×2 (with transcript) → review vocab → finish Grammar A (“a true sentence about myself”, aloud).",
      "few", "bir nechta", "a few"],
    ["3", "Gapirish", "Speaking",
      "MAIN ×1 → Mini-hikoya ×1 (ovoz chiqarib javob) → Grammatika B + mashqlar.",
      "MAIN ×1 → Mini-Story ×1 (answer aloud) → Grammar B + drills.",
      "15", "~15", "~15"],
    ["4", "Gapirish kuni ⭐", "Speaking Day ⭐",
      "Mini-hikoya ×2 (tez, ovoz chiqarib) → POV ×1 → Grammatika B “rost gap ayting”.",
      "Mini-Story ×2 (fast, aloud) → POV ×1 → Grammar B “say a true sentence”.",
      "30", "~30", "~30"],
    ["5", "Suhbat", "EnglishPod Day",
      "POV ×1 → MAIN ×1 → EnglishPod: dialog (dg) → kalit soʻzlar → izoh (pr) → soya qilish + rol oʻyin (A, keyin B).",
      "POV ×1 → MAIN ×1 → EnglishPod: dialogue (dg) → Key Vocab → explanation (pr) → shadow + role-play (A then B).",
      "15", "rol + ~15", "role-play + ~15"],
    ["6", "6 Minute kuni", "6 Minute Day",
      "6 Minute English: taxmin → tinglash → savol (MCQ) → 6 soʻz → matn bilan qayta → Zavq bilan → Speak-It: 60 soniya yozib olish.",
      "6 Minute English: predict → listen → MCQ → 6-word pack → re-listen with transcript → Fun English → Speak-It: record 60 sec.",
      "1", "1 yozuv", "1 recording"],
    ["7", "Yakun + Mukofot", "Review + Reward",
      "Mini-hikoyani yoddan → ikkala grammatikaning “Xato tuzatish” kartalari → EnglishPod (rv) yoki 6ME qayta → Darsni yakunlash: yulduzlar, daqiqalar, streak.",
      "Mini-Story from memory → both grammar “Xato tuzatish” cards → EnglishPod (rv) or 6ME re-listen → Lesson Check: stars, minutes, streak.",
      "15", "~15 + oʻz-tekshiruv", "~15 + self-review"],
  ];
  const list = el("ol", { class: "m-cycle" });
  days.forEach(([num, uzN, enN, uzF, enF, , uzR, enR]) => {
    const star = num === "4" || num === "6";
    list.append(el("li", { class: "m-day" + (star ? " m-day--star" : "") },
      el("span", { class: "m-day__box", "aria-hidden": "true" }),
      el("div", { class: "m-day__body" },
        el("p", { class: "m-day__head" },
          el("span", { class: "m-day__n" }, L(num + "-kun", "Day " + num)),
          el("span", { class: "m-day__name", lang: lang() }, L(uzN, enN))),
        el("p", { class: "m-day__focus", lang: lang() }, L(uzF, enF)),
        el("span", { class: "chip m-day__reps", lang: lang() },
          el("span", { "aria-hidden": "true" }, "🗣️ "), L(uzR, enR)))));
  });
  s.append(list);

  s.append(el("div", { class: "callout callout--contrast", lang: lang() },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, "⏱️"),
    el("div", null,
      el("strong", null, L("Faol vaqt va passiv vaqt", "Active time vs passive time")),
      el("p", null, L(
        "MAIN suhbat ~15 daqiqa. Uni yuklab oling va yoʻlda, ovqat pishirayotganda, yurganda passiv tinglang — bu soatlaringizni koʻpaytiradi va 45 daqiqalik faol vaqtingizni yemaydi. Tinglagan daqiqalar — asosiy raqam.",
        "The MAIN talk is ~15 min. Download it and listen passively on your commute, while cooking, while walking — this multiplies your hours without eating your 45-minute active budget. Listening minutes are the headline number.")))));
  return s;
}

// =====================================================================================
// BLOCK 5 — Choose your pace
// =====================================================================================
function blockPace() {
  const s = msec(4);
  s.append(P(
    "Uchta surʼat bor. Istagan paytda almashtira olasiz (Sozlamalardan). Halol savdo: “Sekin, lekin har kuni” hamisha “Tez, lekin tashlab ketish”dan yaxshiroq.",
    "There are three pace tracks. You can switch anytime (in Settings). Honest deal: “slow but daily” always beats “fast but quitting”."));

  const paces = [
    ["Effortless", "Tavsiya etiladi", "Recommended",
      ["1 dars / hafta", "1 lesson / week"], ["30–45 daqiqa/kun", "30–45 min/day"], ["~7–8 oy", "~7–8 months"],
      "Koʻpchilik uchun. AJ Hogeʼning oʻz usuli; eng chuqur oʻzlashtirish.",
      "For most learners. AJ Hoge's own method; deepest retention."],
    ["Sprint", "", "",
      ["1 dars / 3–4 kun", "1 lesson / 3–4 days"], ["45–60 daqiqa/kun", "45–60 min/day"], ["~4 oy", "~4 months"],
      "Muddat bor / motivatsiya baland / B1 allaqachon mustahkam boʻlsa. 1–2 va 3–4 va 5–6-kunlarni birlashtiring.",
      "A deadline / high motivation / already solid B1. Combine days 1–2, 3–4, 5–6."],
    ["Gentle", "", "",
      ["1 dars / 10–14 kun", "1 lesson / 10–14 days"], ["~20 daqiqa/kun", "~20 min/day"], ["~10–12 oy", "~10–12 months"],
      "Juda band boʻlsangiz; qoʻshimcha takror istaganlar uchun.",
      "Very busy; for those who want extra repetition."],
  ];
  const grid = el("div", { class: "m-paces" });
  paces.forEach(([name, uzTag, enTag, freq, time, total, uzWho, enWho], i) => {
    const card = el("div", { class: "card m-pace" + (i === 0 ? " m-pace--rec" : "") },
      el("div", { class: "m-pace__head" },
        el("h3", { class: "m-pace__name", lang: "en" }, name),
        uzTag ? el("span", { class: "chip m-pace__tag", lang: lang() }, L(uzTag, enTag)) : null));
    const meta = el("dl", { class: "m-pace__meta" });
    [[L("Surʼat", "Pace"), L(freq[0], freq[1])],
     [L("Vaqt", "Time"), L(time[0], time[1])],
     [L("Toʻliq kurs", "Full course"), L(total[0], total[1])]].forEach(([k, v]) => {
      meta.append(el("dt", { lang: lang() }, k), el("dd", { lang: lang() }, v));
    });
    card.append(meta, P(uzWho, enWho, "m-pace__who"));
    grid.append(card);
  });
  s.append(grid);

  // Backward-planning-from-exam-date table (02 §6.5).
  s.append(el("h3", { class: "m-subh", lang: lang() },
    L("Imtihon sanasidan orqaga rejalashtirish", "Backward-planning from your exam date")));
  const rows = [
    [["40+ hafta", "40+ weeks"], ["Effortless yoki Gentle — chuqur va shoshmasdan", "Effortless or Gentle — deep, unhurried"]],
    [["30–40 hafta", "30–40 weeks"], ["Effortless (eng yaxshi tanlov)", "Effortless (the best choice)"]],
    [["16–30 hafta", "16–30 weeks"], ["Sprint", "Sprint"]],
    [["16 haftadan kam", "under 16 weeks"], ["Sprint — lekin halol boʻling: kurs poydevor quradi, imtihonga alohida (vaqt, format) tayyorgarlik ham kerak", "Sprint — but be honest: the course builds the foundation; add exam-specific practice (timing, format) too"]],
  ];
  const wrap = el("div", { class: "m-tablewrap" });
  const table = el("table", { class: "m-table" });
  table.append(el("thead", null, el("tr", null,
    el("th", { scope: "col", lang: lang() }, L("Imtihongacha", "Weeks to exam")),
    el("th", { scope: "col", lang: lang() }, L("Tavsiya", "Recommendation")))));
  const tb = el("tbody");
  rows.forEach(([w, r]) => tb.append(el("tr", null,
    el("th", { scope: "row", lang: lang() }, L(w[0], w[1])),
    el("td", { lang: lang() }, L(r[0], r[1])))));
  table.append(tb); wrap.append(table); s.append(wrap);

  s.append(el("div", { class: "callout callout--error", lang: lang() },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, "🚦"),
    el("div", null,
      el("strong", null, L("Oltin qoida (surʼat haqida)", "The golden rule (about pace)")),
      el("p", null, L(
        "Mini-hikoya savollariga avtomatik javob bera olmaguningizcha keyingi darsga oʻtmang. Tezlik — maqsad emas; avtomatizm — maqsad.",
        "Never advance until you can answer the mini-story questions automatically. Speed is not the goal; automaticity is.")))));
  return s;
}

// =====================================================================================
// BLOCK 6 — Speaking techniques you can do ALONE (the heart of the page)
// =====================================================================================
function blockAlone() {
  const s = msec(5);
  s.append(el("p", { class: "m-lead", lang: lang() },
    L("Bu sahifaning yuragi. Hech bir sherik kerak emas — bularning hammasini yolgʻiz qilasiz.",
      "This is the heart of the page. You need no partner — you do all of these alone.")));

  const techs = [
    ["🗣️", "Mini-hikoya savoliga ovoz chiqarib javob berish", "Answering mini-story questions aloud",
      "Eng muhim mashq. Javob ochilishidan OLDIN javobni baqiring — bitta soʻz boʻlsa ham. Tezlik mukammallikdan muhimroq.",
      "The #1 technique. Shout the answer BEFORE the reveal — even one word. Speed matters more than perfection.", null],
    ["👥", "Soya qilish (shadowing)", "Shadowing",
      "Audioni qoʻyib, taxminan yarim soniya orqada, u bilan birga gapiring. Soʻzlarni emas, ohangni koʻchiring. EnglishPod dialogi (dg) va AJ MAIN buning uchun ideal.",
      "Play the audio and speak with it, about half a second behind. Copy the melody, not the words. EnglishPod's dialogue (dg) and the AJ MAIN are ideal for this.", null],
    ["🎙️", "Oʻzingni yozib olish", "Self-recording",
      "Yozing → eshiting → namuna bilan solishtiring → bitta tuzatishni belgilang → qaytaring. Brauzer mikrofoni yetarli; hech narsa internetga yuklanmaydi.",
      "Record → play back → compare to the model → note one fix → repeat. The browser mic is enough; nothing is uploaded.",
      ["1-darsdagi yozuvingizni SAQLAB qoʻying va 30-darsda oʻsha savolni qayta yozing — oʻsishingizni quloq bilan eshitasiz.",
       "KEEP your Lesson-1 recording and re-record the same prompt at Lesson 30 — you'll hear your growth with your own ears."]],
    ["🔄", "POV hikoyani qayta aytish", "POV retelling",
      "Hikoyani oʻzingiz qayta ayting — avval oʻtgan zamonda, keyin kelasi zamonda. Grammatika shu tarzda avtomatlashadi.",
      "Retell the story yourself — first in the past, then in the future. This is how grammar becomes automatic.", null],
    ["🎭", "Rol oʻyin", "Role-play",
      "Shu haftaning EnglishPod dialogining A rolini, keyin B rolini ovoz chiqarib oʻqing. Bir rolni yashirib, oʻzingiz toʻldiring.",
      "Read Role A, then Role B, of the week's EnglishPod dialogue aloud. Hide one role and fill it in yourself.", null],
    ["💬", "Oʻz-oʻzi bilan gaplashish", "Self-talk / narration",
      "Kuningizni ingliz tilida gapirib bering — shu haftaning ikki grammatik mavzusidan foydalanib. “I have been…”, “I'm going to…”.",
      "Narrate your day in English — using the week's two grammar topics. “I have been…”, “I'm going to…”.", null],
  ];
  const grid = el("div", { class: "m-techs" });
  techs.forEach(([emoji, uzT, enT, uzB, enB, hook]) => {
    const card = el("div", { class: "card m-tech" },
      el("h3", { class: "m-tech__t" },
        el("span", { class: "m-tech__ic", "aria-hidden": "true" }, emoji),
        el("span", { lang: lang() }, L(uzT, enT))),
      P(uzB, enB, "m-tech__b"));
    if (hook) card.append(el("p", { class: "m-tech__hook", lang: lang() },
      el("span", { "aria-hidden": "true" }, "💡 "), L(hook[0], hook[1])));
    grid.append(card);
  });
  s.append(grid);
  return s;
}

// =====================================================================================
// BLOCK 7 — Deep listening
// =====================================================================================
function blockListen() {
  const s = msec(6);
  s.append(P(
    "Tinglash — kirishning asosiy manbai. Uni toʻgʻri qiling:",
    "Listening is your main source of input. Do it the right way:"));
  s.append(tips([
    ["Matnni oʻqishdan OLDIN koʻp marta tinglang — quloq avval ishlasin.",
     "Listen many times BEFORE reading — let the ears work first."],
    ["Matndan faqat keyingi tinglashlarda foydalaning, tekshirish uchun.",
     "Use the transcript only on later passes, to check yourself."],
    ["Soʻzma-soʻz tarjima qilmang. Umumiy maʼnoni tuting; notaniq joylarga chidang.",
     "Don't translate word-by-word. Get the gist; tolerate the parts you don't catch."],
    ["Bir xil darsni qayta-qayta tinglash zerikarli emas — aynan shu avtomatizmni quradi.",
     "Re-listening to the same lesson is not a waste — it is exactly what builds automaticity."],
  ]));
  s.append(el("div", { class: "callout callout--contrast", lang: lang() },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, "⭐"),
    el("div", null,
      el("strong", null, L("6 Minute Englishʼdagi INSERT boʻlaklari", "The INSERT clips in 6 Minute English")),
      el("p", null, L(
        "Koʻchadagi odamlarning ovozlari (INSERT) — eng qiyin, eng foydali qism. Bu haqiqiy, tez, turli aksentli nutq — IELTS Listeningʼning eng yaqin bepul oʻxshashi. Ularga alohida eʼtibor bering.",
        "The vox-pops of people on the street (INSERT) are the hardest, most useful part. This is real, fast, varied-accent speech — the closest free analogue to IELTS Listening. Pay special attention to them.")))));
  return s;
}

// =====================================================================================
// BLOCK 8 — Peak state
// =====================================================================================
function blockPeak() {
  const s = msec(7);
  s.append(P(
    "AJ Hoge aytadi: muvaffaqiyatning ~80% i — psixologiya, faqat 20% i — “metod”. Sababi oddiy: hissiyot bilan oʻrgangan narsa xotirada kuchli qoladi. Jim, charchagan, qoʻrqqan holatda oʻrganish sekin ketadi.",
    "AJ Hoge says: about 80% of success is psychology, only 20% is “method”. The reason is simple: what you learn with emotion stays strong in memory. Learning while quiet, tired or anxious is slow."));
  s.append(el("h3", { class: "m-subh", lang: lang() }, L("Kuchli holat rituali", "The peak-state ritual")));
  s.append(tips([
    ["TURING — oʻtirmang. Tanangiz tik boʻlsa, ovozingiz ham kuchli chiqadi.",
     "STAND UP — don't sit. When your body is upright, your voice is stronger too."],
    ["HARAKATLANING — yuring, qoʻl siltang. Harakat energiya beradi.",
     "MOVE — walk, gesture. Movement gives you energy."],
    ["JILMAYING — hatto majburan boʻlsa ham; miya buni “yaxshi holat” deb qabul qiladi.",
     "SMILE — even if you force it; the brain reads it as “a good state”."],
    ["OVOZNI BALAND qiling — pichirlab emas, dadil gapiring.",
     "Use a BIG VOICE — don't whisper; speak boldly."],
  ]));
  s.append(P(
    "Har darsni shu ritual bilan boshlang. Bu bolalarcha emas — bu isbotlangan oʻrganish texnikasi.",
    "Start every lesson with this ritual. It's not childish — it's a proven learning technique.", "m-note"));
  return s;
}

// =====================================================================================
// BLOCK 9 — How to learn vocabulary
// =====================================================================================
function blockVocab() {
  const s = msec(8);
  s.append(P(
    "Soʻzlarni yakka emas, IBORA (chunk) sifatida oʻrganing. Miya iboralarni bir boʻlak qilib saqlaydi va ular ogʻizdan tayyor chiqadi.",
    "Learn words as CHUNKS, not one by one. The brain stores chunks as single units, and they come out of your mouth ready-made."));
  s.append(el("div", { class: "m-vs" },
    el("div", { class: "m-vs__col m-vs__col--bad" },
      el("p", { class: "m-vs__lab", lang: lang() }, "✗ " + L("Yakka soʻz", "Single word")),
      EG("hand"), EG("staff")),
    el("div", { class: "m-vs__col m-vs__col--good" },
      el("p", { class: "m-vs__lab", lang: lang() }, "✓ " + L("Ibora", "Chunk")),
      EG("give me a hand"), EG("we're understaffed today"))));
  s.append(tips([
    ["Oʻzbekcha izohni BIR MARTA oʻqing — maʼnoni tushunish uchun.",
     "Read the Uzbek gloss ONCE — just to get the meaning."],
    ["Keyin izohni tashlang va ingliz tilidagi misol bilan oʻylang.",
     "Then drop the gloss and think with the English example."],
    ["Har bir yangi iborani oʻzingiz haqingizda bitta rost gapda ishlating (ovoz chiqarib).",
     "Use each new chunk in one true sentence about yourself (aloud)."],
  ]));
  return s;
}

// =====================================================================================
// BLOCK 10 — Pronunciation self-check
// =====================================================================================
function blockPron() {
  const s = msec(9);
  s.append(P(
    "Talaffuzni yolgʻiz tekshirish oson: oʻzingizni yozib oling, namuna bilan solishtiring, bitta tovushni tuzating. Oʻzbek tilida soʻzlashuvchilar koʻpincha quyidagi tovushlarda qiynaladi:",
    "Checking pronunciation alone is easy: record yourself, compare to the model, fix one sound. Uzbek speakers usually struggle with these sounds:"));
  const sounds = [
    ["/v/ va /w/", "/v/ vs /w/",
      "Lab tishga tegsa — /v/; lablar dumaloq boʻlsa — /w/.",
      "Teeth touch the lip for /v/; lips round for /w/.",
      ["vest — west", "vine — wine"]],
    ["/θ/ va /s/", "/θ/ vs /s/",
      "Til tishlar orasidan chiqsa — /θ/ (th); yashiringan boʻlsa — /s/.",
      "Tongue comes between the teeth for /θ/ (th); hidden for /s/.",
      ["think — sink", "three — see"]],
    ["Soʻz oxiridagi jarangli undoshlar", "Final voiced consonants",
      "Oʻzbekcha odat: oxirni jarangsiz aytish. Ingliz tilida jarangli qoldiring.",
      "Uzbek habit: devoicing the end. In English keep it voiced.",
      ["dog (not “dok”)", "is — ice"]],
    ["Unli choʻziqligi", "Vowel length",
      "Qisqa va choʻziq unli maʼnoni oʻzgartiradi.",
      "Short vs long vowels change the meaning.",
      ["ship — sheep", "bit — beat"]],
    ["Soʻz urgʻusi", "Word stress",
      "Notoʻgʻri urgʻu soʻzni tanib boʻlmas qiladi. Bir boʻgʻinni kuchliroq ayting.",
      "Wrong stress makes a word unrecognisable. Say one syllable stronger.",
      ["PHOtograph — phoTOgraphy", "REcord (n) — reCORD (v)"]],
  ];
  const grid = el("div", { class: "m-sounds" });
  sounds.forEach(([uzT, enT, uzB, enB, pairs]) => {
    const card = el("div", { class: "card m-sound" },
      el("h3", { class: "m-sound__t", lang: lang() }, L(uzT, enT)),
      P(uzB, enB, "m-sound__b"));
    const ex = el("div", { class: "m-sound__pairs", lang: "en" });
    pairs.forEach((p) => ex.append(el("span", { class: "m-sound__pair" }, p)));
    card.append(ex);
    grid.append(card);
  });
  s.append(grid);
  return s;
}

// =====================================================================================
// BLOCK 11 — Top mistakes for Uzbek speakers (deep-links into the fixing lessons)
// =====================================================================================
function blockMistakes() {
  const s = msec(10);
  s.append(P(
    "Oʻzbek tilidan ingliz tiliga oʻtganda takrorlanadigan 10 ta xato guruhi. Har biri qaysi darsda tuzatilishini koʻrsatdik. (Hozircha faqat 9-dars tayyor; qolgan havolalar darslar yozilgani sari ishga tushadi.)",
    "The 10 clusters of mistakes that recur when moving from Uzbek to English. For each, we show which lesson fixes it. (Only Lesson 9 is authored today; the other links light up as lessons are written.)"));

  s.append(el("div", { class: "callout callout--error", lang: lang() },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, "ℹ️"),
    el("div", null,
      el("strong", null, L("Halol izoh", "An honest note")),
      el("p", null, L(
        "Ulardan toʻrttasi — tushib qolgan “to be”, 3-shaxs -s, he/she/it jinsi, va have/have got — bu kursning B1 darajasidan pastda. Shuning uchun ular alohida mavzu emas, balki darslar ichida takrorlanadigan “Xato tuzatish” mikro-kartalari sifatida beriladi (oʻrgatilmaydi — eslatib turiladi).",
        "Four of them — dropped “to be”, 3rd-person -s, he/she/it gender, and have/have got — are below this course's B1 floor. So they are not standalone topics but recurring “Xato tuzatish” micro-cards inside lessons (spaced, not taught).")))));

  // [uz name, en name, uz desc, en desc, lessonId, uz link label, en link label, spaced?]
  const items = [
    ["Artikllar (a/an/the)", "Articles (a/an/the)",
      "Oʻzbekchada artikl yoʻq, shuning uchun tez-tez tushirib qoʻyiladi yoki notoʻgʻri ishlatiladi.",
      "Uzbek has no articles, so they are dropped or misused constantly.",
      "core-04", "4-dars — a/an va the", "Lesson 4 — a/an vs the", false, "4·13·24"],
    ["“To be” tushib qolishi", "Dropped “to be” (am/is/are)",
      "“I student” deb aytiladi — “I am a student” oʻrniga.",
      "Learners say “I student” instead of “I am a student”.",
      "core-01", "1-dars (takroriy karta)", "Lesson 1 (recurring card)", true, null],
    ["3-shaxs -s", "Third-person -s",
      "“He go” deyiladi — “He goes” oʻrniga; -s tez gapirganda tushib qoladi.",
      "“He go” instead of “He goes”; the -s drops at speed.",
      "core-01", "1-dars (takroriy karta)", "Lesson 1 (recurring card)", true, null],
    ["do/does — savol va inkor", "do/does — questions & negatives",
      "“You like tea?” yoki “I no like” — do/does yordamchisi tushirib qoʻyiladi.",
      "“You like tea?” or “I no like” — the do/does auxiliary is dropped.",
      "core-23", "23-dars — savollar", "Lesson 23 — questions", false, "1·23"],
    ["Present perfect (tugallangan hozirgi)", "Present perfect",
      "Oʻzbekchaning “-gan”i ingliz tilidagi present perfect bilan aynan mos kelmaydi — eng qiyin “devor”.",
      "Uzbek's “-gan” does not map cleanly to the English present perfect — the hardest wall.",
      "core-09", "9-dars — present perfect", "Lesson 9 — present perfect", false, "9·18·19·20·21·22"],
    ["Predloglar (in/on/at…)", "Prepositions (in/on/at…)",
      "Oʻzbekcha qoʻshimchalar ingliz predloglariga bir-birga toʻgʻri kelmaydi; ularni ibora sifatida yodlang.",
      "Uzbek case-endings don't line up with English prepositions; learn them as chunks.",
      "core-02", "2-dars — bogʻliq predloglar", "Lesson 2 — dependent prepositions", false, "2·7·12"],
    ["he/she/it — jinsi", "he/she/it — gender",
      "Oʻzbekchada “u” jinssiz, shuning uchun he/she/it aralashtiriladi.",
      "Uzbek “u” has no gender, so he/she/it get mixed up.",
      "core-01", "1-dars (takroriy karta)", "Lesson 1 (recurring card)", true, null],
    ["Soʻz tartibi (SOV→SVO)", "Word order (SOV→SVO)",
      "Oʻzbekcha “Men choy ichaman” → feʼl oxirida; ingliz tilida feʼl oʻrtada: “I drink tea”.",
      "Uzbek puts the verb last; English puts it in the middle: “I drink tea”.",
      "core-01", "1-dars — ravish tartibi", "Lesson 1 — adverb order", false, "1·23"],
    ["have / have got", "have / have got",
      "“I have got” va “I have” ni chalkashtirish; oʻzbekchada egalik boshqacha ifodalanadi.",
      "Confusing “I have got” and “I have”; possession is expressed differently in Uzbek.",
      "core-12", "12-dars (takroriy karta)", "Lesson 12 (recurring card)", true, null],
    ["Koʻplik / sanaladigan otlar", "Plurals / countability",
      "“much/many” aralashadi, sanalmaydigan otlar koʻplikda ishlatiladi (“informations”).",
      "“much/many” get mixed up; uncountable nouns are pluralised (“informations”).",
      "core-10", "10-dars — much/many", "Lesson 10 — much/many", false, "10·17"],
  ];

  const list = el("ol", { class: "m-mistakes" });
  items.forEach(([uzN, enN, uzD, enD, id, uzLab, enLab, spaced, spiral]) => {
    const row = el("li", { class: "m-mistake" + (spaced ? " m-mistake--spaced" : "") },
      el("div", { class: "m-mistake__head" },
        el("h3", { class: "m-mistake__t", lang: lang() }, L(uzN, enN)),
        spaced ? el("span", { class: "chip m-mistake__badge", lang: lang() },
          el("span", { "aria-hidden": "true" }, "⚠️ "), L("Xato tuzatish", "Error-fix card")) : null,
        spiral ? el("span", { class: "m-mistake__spiral", "aria-label": L("Takrorlanadigan darslar", "Spiral lessons") + ": " + spiral },
          el("span", { "aria-hidden": "true" }, "🔁 " + spiral)) : null),
      P(uzD, enD, "m-mistake__d"),
      lessonLink(id, uzLab, enLab));
    list.append(row);
  });
  s.append(list);
  return s;
}

// =====================================================================================
// BLOCK 12 — What to do when you struggle
// =====================================================================================
function blockStuck() {
  const s = msec(11);
  s.append(P(
    "Qiynalish — normal holat. Har bir oʻrganuvchi platoga (toʻxtab qolgandek his) duch keladi. Bu — muvaffaqiyatsizlik emas, jarayonning bir qismi.",
    "Struggling is normal. Every learner hits a plateau (a feeling of being stuck). It is not failure — it is part of the process."));
  s.append(tips([
    ["Eski darsni qayta tinglang — u endi OSON tuyuladi. Bu — oʻsganingizning isboti.",
     "Re-listen to an old lesson — it will now feel EASY. That is the proof that you have improved."],
    ["Zanjirni uzmang. Kuniga atigi 10 daqiqa boʻlsa ham — davomiylik hajmdan muhimroq.",
     "Don't break the chain. Even 10 minutes a day — consistency matters more than volume."],
    ["Hayot xalaqit bersa — haftalik “muzlatish”ni ishlating; bir kunni oʻtkazib yuborish streakni buzmaydi.",
     "If life gets in the way — use your weekly freeze; missing one day won't break your streak."],
    ["Bitta darsda oʻtirib qoling — oldinga otilmang. Avtomatizm sekin, lekin barqaror keladi.",
     "Stay on one lesson — don't jump ahead. Automaticity comes slowly but steadily."],
  ]));
  s.append(P(
    "Plato haqida 25-dars (“Plateaus”) alohida gapiradi — unga yetganingizda bu his tanish boʻladi.",
    "Lesson 25 (“Plateaus”) speaks about this directly — by the time you reach it, the feeling will be familiar.", "m-note"));
  return s;
}

// =====================================================================================
// BLOCK 13 — FAQ
// =====================================================================================
function blockFaq() {
  const s = msec(12);
  const qas = [
    ["Rostdan ham bitta darsni butun hafta oʻrganamanmi?", "Do I really study one lesson a whole week?",
     "Ha. AJ Hogeʼning butun usuli shunga qurilgan: chuqurlik kenglikdan afzal. Bir darsni koʻp marta eshitib, uni oʻzingizniki qilasiz. Tez oʻtib ketish — tez unutish demakdir.",
     "Yes. AJ Hoge's whole method is built on this: depth beats breadth. By hearing one lesson many times, you make it your own. Rushing through means forgetting fast."],
    ["Nega hamma narsani tarjima qilmaymiz?", "Why don't we translate everything?",
     "Chunki soʻzma-soʻz tarjima gapirishni sekinlashtiradi — har gap oldidan miyada tarjima qilib oʻtirasiz. Oʻzbekcha faqat maʼnoni tez tushunish uchun; keyin ingliz tilida oʻylashga oʻtasiz. Ingliz tilidagi matnlar hech qachon tarjima qilinmaydi — bu ataylab.",
     "Because word-by-word translation slows speaking — you'd translate in your head before every sentence. Uzbek is only for grasping meaning fast; then you switch to thinking in English. The English transcripts are never translated — that's deliberate."],
    ["Menga sherik kerakmi?", "Do I need a partner?",
     "Yoʻq. Mini-hikoyaga javob berish, soya qilish, oʻzini yozish, rol oʻyin, oʻz-oʻzi bilan gaplashish — hammasini yolgʻiz qilasiz (6-boʻlimga qarang). Sherik foydali, lekin shart emas.",
     "No. Answering the mini-story, shadowing, self-recording, role-play, self-talk — you do all of them alone (see block 6). A partner helps, but is not required."],
    ["Bu IELTS uchun yetarlimi?", "Is this enough for IELTS?",
     "Bu kurs IELTS oʻlchaydigan asosiy koʻnikmani — ravonlik, talaffuz, tinglash, soʻz boyligi va grammatikani — quradi. Lekin bu “IELTS cram” kursi emas. B1 darajadan keyin format, vaqt va toʻliq mock testlar bilan alohida shugʻullaning. IELTS sahifasi buni batafsil tushuntiradi.",
     "This course builds the underlying competence IELTS measures — fluency, pronunciation, listening, vocabulary and grammar. But it is not an “IELTS cram” course. After B1, add separate work on format, timing and full mock tests. The IELTS page explains this in detail."],
    ["Qachon mock testga tayyor boʻlaman?", "When am I ready for a mock test?",
     "3-bosqichni (21–30-darslar) tugatganingizda va L27–L30ʼdagi “Interview Skills” suhbatlarini bemalol olib bora olganingizda. Shundan keyin haqiqiy (yoki pullik) mock test — mantiqiy keyingi qadam.",
     "When you finish Phase 3 (lessons 21–30) and can comfortably handle the “Interview Skills” conversations woven into L27–L30. After that, a real (or paid) mock test is the logical next step."],
  ];
  const wrap = el("div", { class: "m-faq" });
  qas.forEach(([uzQ, enQ, uzA, enA]) => {
    const d = el("details", { class: "m-faq__item" });
    d.append(el("summary", { class: "m-faq__q", lang: lang() },
      el("span", { class: "m-faq__q-txt" }, L(uzQ, enQ)),
      el("span", { class: "m-faq__chev", "aria-hidden": "true", html: icon("expand") })));
    d.append(P(uzA, enA, "m-faq__a"));
    wrap.append(d);
  });
  s.append(wrap);
  return s;
}

// ---- Public entry: render #/method ------------------------------------------
export async function renderMethod(main, seq, alive) {
  // Content is inline (no fetch); app.js already painted a screenSkeleton() before the
  // dynamic import, so we build and swap in one pass. The alive() guard drops the result
  // if the learner navigated away (or flipped the UZ|EN toggle → a newer render) meanwhile.
  if (alive && !alive()) return;

  const sec = el("section", { class: "screen method" });
  // Exactly ONE <h1> per screen (a11y §8); mirrors the top-bar context (t is bilingual).
  sec.append(el("h1", { class: "screen__title", lang: lang() }, t("route.method.title")));
  sec.append(el("p", { class: "method__promise", lang: lang() },
    el("span", { "aria-hidden": "true" }, "📌 "),
    L("Vaʼda: siz GAPIRISHNI oʻrganasiz.", "The promise: you will learn to SPEAK.")));

  sec.append(buildToc());

  sec.append(
    blockWork(), blockRules(), blockGolden(), blockHabit(), blockPace(),
    blockAlone(), blockListen(), blockPeak(), blockVocab(), blockPron(),
    blockMistakes(), blockStuck(), blockFaq(),
  );

  if (alive && !alive()) return;
  main.replaceChildren(sec);
  const ctx = document.getElementById("ctx");
  if (ctx) ctx.textContent = t("route.method.title");
}
