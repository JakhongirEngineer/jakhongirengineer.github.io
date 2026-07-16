# 6 Minute English — Content Inventory

Source: `content/6_minute_english/` (READ-ONLY)

## Summary counts

- **292 files total**: 146 `.pdf` + 146 `.mp3` (one PDF + one MP3 per episode).
- **143 unique episodes.** 3 episodes are duplicated with a ` (1)` suffix (identical content):
  `161215_circadian_rhythms`, `180322_microadventures`, `181220_buttons`. Dedupe on ingest.
- Date range: **2016-07-28 → 2019-04-25** (weekly, Thursdays/Fridays). Filename prefix is a reliable `YYMMDD`.
- Each episode = **~6-minute audio + 4-5 page PDF transcript**.

## Filename parsing notes

Prefix `YYMMDD` is 100% consistent and the best primary key. The middle segment is
**inconsistent** and must be parsed loosely:
- Series token varies: `6min`, `6_min`, `6_minute`, `6min_english`, `6min_eng`, and typos
  `6min_englsh`, `6min_engl`.
- Some slugs drop the `english` token entirely (`170316_6min_lunch`, `170323_6min_emoji`,
  `181122_6min_coffee`).
- Typos in slugs: `hanger` (mp3) vs `hangry` (pdf); `learn_a_language` (mp3) vs
  `learning_a_language` (pdf); occasional space instead of underscore
  (`170302 life expectancy`, `180607 talking_to machines`).
- MP3 suffix is usually `_download.mp3` but varies: `_DOWNLOAD.mp3`, `_download1.mp3`, none.
- **Recommendation:** key episodes by `YYMMDD`, derive a clean topic slug from the PDF title
  line (page 1), not the filename. Pair PDF+MP3 by date prefix, not by exact stem.

## Transcript structure (from reading 2 samples: `food_exercise` 2016, `coffee` 2017)

Highly consistent, **excellent for extraction** — clean text layer, no OCR needed:

1. **Header block**: `BBC LEARNING ENGLISH / 6 Minute English / <episode title as a question>`
   + disclaimer "This is not a word-for-word transcript".
2. **Two-presenter scripted dialogue**, speaker name on its own line (bold) then their lines.
   Presenter pairs rotate over the years (Alice/Neil, Catherine/Rob, etc.).
3. **A quiz question** early on with 3 options `a) / b) / c)`; **answer revealed near the end**.
   Great ready-made comprehension MCQ.
4. **6 target vocabulary items**, bolded inline on first use and defined in the flow.
5. **`INSERT` segments**: authentic clips / vox pops (real accents, faster speech).
6. **Vocabulary recap**: either a dedicated final "Vocabulary" page (word + short definition,
   e.g. 2016 episodes) or an in-dialogue recap with example sentences (e.g. 2017 episodes).
   Both are cleanly extractable into a term/definition list.

**Level:** CEFR **B1-B2**. Harder than AJ Hoge / EnglishPod for A2 learners: idioms and phrasal
verbs (`burn off`, `think twice`, `hog`, `squatter`), some abstract nouns. The scripted
main dialogue is followable at A2+; the `INSERT` clips are the hardest part. Best used as
**supplementary listening** with the built-in vocab + quiz, not as the A2 core.

## Thematic clusters (10)

1. **Health & Fitness** — body, exercise, diet, medical
2. **Food & Drink**
3. **Technology & Internet**
4. **Environment & Animals**
5. **Society & Culture** — customs, etiquette, identity, generations
6. **Language & Communication**
7. **Psychology & Emotions**
8. **Lifestyle & Everyday** — home, transport, shopping, leisure, travel
9. **Work & Money**
10. **People & History**

## Recommendation legend

- **Yes** = core recommendation for elementary+ Uzbek learners heading to IELTS: concrete,
  everyday, overlaps IELTS Speaking Part 1/2 themes (family, food, home, transport, work,
  study, hobbies, sport, clothes, technology, travel). Target ~20 episodes.
- **2nd** = good secondary pick (relevant but slightly harder, niche, or a duplicate topic).
- **No** = too abstract / academic / culturally specific for this audience (flagged below table).

## Episode table

| Date | Topic | Cluster | Rec |
|------|-------|---------|-----|
| 160728 | heritage sites | Society & Culture | No |
| 160804 | future of English | Language & Communication | No |
| 160811 | writer's block | Language & Communication | No |
| 160818 | food & exercise (calories) | Health & Fitness | **Yes** |
| 160825 | domestic chores | Lifestyle & Everyday | **Yes** |
| 160901 | slang | Language & Communication | No |
| 160908 | old tech | Technology & Internet | 2nd |
| 160915 | climate change | Environment & Animals | 2nd |
| 160922 | antibiotics | Health & Fitness | No |
| 160929 | punctuation | Language & Communication | No |
| 161006 | identity | Society & Culture | No |
| 161013 | loneliness | Psychology & Emotions | No |
| 161020 | attraction | Psychology & Emotions | No |
| 161027 | newspapers | Society & Culture | 2nd |
| 161103 | online persona | Technology & Internet | 2nd |
| 161110 | bicycles | Lifestyle & Everyday (transport) | **Yes** |
| 161117 | trainers (shoes) | Lifestyle & Everyday (clothes) | 2nd |
| 161124 | suffragism | People & History | No |
| 161201 | animal phobias | Psychology & Emotions | No |
| 161208 | Cleopatra | People & History | No |
| 161215 | circadian rhythms | Health & Fitness | No |
| 161222 | crazes (fads) | Society & Culture | No |
| 161229 | introverts | Psychology & Emotions | No |
| 170105 | driving | Lifestyle & Everyday (transport) | **Yes** |
| 170112 | superheroes | Society & Culture (film) | No |
| 170119 | extremophiles | Environment & Animals | No |
| 170126 | family history | People & History (family) | **Yes** |
| 170202 | rudeness | Society & Culture | 2nd |
| 170209 | eyewitness | Psychology & Emotions | No |
| 170216 | romanticism | People & History | No |
| 170223 | gun control | Society & Culture | No |
| 170302 | life expectancy | Health & Fitness | No |
| 170309 | mermaids | Society & Culture (myth) | No |
| 170316 | lunch | Food & Drink | **Yes** |
| 170323 | emoji | Technology & Internet | 2nd |
| 170330 | dog detectors | Environment & Animals | No |
| 170406 | food & mood | Food & Drink / Health | 2nd |
| 170413 | multiple careers | Work & Money | **Yes** |
| 170420 | sighing | Health & Fitness | No |
| 170427 | miraculous survival | People & History | No |
| 170504 | the super rich | Work & Money | No |
| 170511 | food waste | Food & Drink / Environment | 2nd |
| 170518 | attention span | Psychology & Emotions | No |
| 170525 | veganism | Food & Drink | **Yes** |
| 170601 | water burial | Society & Culture | No |
| 170608 | happiness | Psychology & Emotions | No |
| 170615 | mindfulness | Psychology & Emotions | No |
| 170622 | built to fail | Technology & Internet | No |
| 170629 | first impressions | Psychology & Emotions | 2nd |
| 170706 | self-help | Psychology & Emotions | No |
| 170713 | pets navigate | Environment & Animals | No |
| 170720 | invisibility | Environment & Animals (science) | No |
| 170727 | honesty | Psychology & Emotions | No |
| 170803 | small talk | Language & Communication | 2nd |
| 170810 | fancy-dress funerals | Society & Culture | No |
| 170817 | viral videos | Technology & Internet | 2nd |
| 170824 | time | Society & Culture (concept) | No |
| 170831 | laughing | Psychology & Emotions | 2nd |
| 170907 | uniforms | Lifestyle & Everyday (clothes/school) | **Yes** |
| 170914 | cultural differences | Society & Culture | 2nd |
| 170921 | hair | Lifestyle & Everyday (appearance) | **Yes** |
| 170928 | computers | Technology & Internet | **Yes** |
| 171005 | adult exercise | Health & Fitness | **Yes** |
| 171012 | bottled water | Environment & Animals | 2nd |
| 171019 | wetiquette | Society & Culture | No |
| 171026 | sugar | Food & Drink / Health | **Yes** |
| 171102 | pedestrians | Lifestyle & Everyday (transport) | 2nd |
| 171116 | coffee | Food & Drink | **Yes** |
| 171123 | getting fitter | Health & Fitness | 2nd |
| 171130 | phone upgrade | Technology & Internet | 2nd |
| 171207 | buy when sad | Lifestyle & Everyday (shopping) | 2nd |
| 171214 | should schoolchildren have jobs | Work & Money / Education | 2nd |
| 171221 | perfect Santa | Society & Culture | No |
| 171228 | man flu | Health & Fitness | 2nd |
| 180104 | bitcoin | Work & Money | No |
| 180111 | ethical coffee | Food & Drink | 2nd |
| 180118 | dry January | Health & Fitness | 2nd |
| 180125 | rise of the machines | Technology & Internet | No |
| 180201 | a man's name | Society & Culture | No |
| 180208 | future transport | Lifestyle & Everyday (transport) | 2nd |
| 180215 | drones | Technology & Internet | 2nd |
| 180222 | mermaiding | Lifestyle & Everyday (hobby) | No |
| 180301 | saying hello (greetings) | Language & Communication | 2nd |
| 180308 | robot therapist | Technology & Internet | No |
| 180315 | learning a language | Language & Communication / Study | **Yes** |
| 180322 | microadventures | Lifestyle & Everyday (travel) | **Yes** |
| 180329 | manbags | Lifestyle & Everyday (fashion) | 2nd |
| 180405 | marriage | Society & Culture (relationships) | 2nd |
| 180412 | foodie | Food & Drink | 2nd |
| 180419 | lying to children | Society & Culture | No |
| 180426 | the internet | Technology & Internet | **Yes** |
| 180503 | perfume | Lifestyle & Everyday | 2nd |
| 180510 | hangry | Food & Drink / Emotions | 2nd |
| 180517 | football songs | Lifestyle & Everyday (sport/music) | 2nd |
| 180524 | women astronauts | People & History | No |
| 180531 | risk | Psychology & Emotions | No |
| 180607 | talking to machines | Technology & Internet | No |
| 180614 | the World Cup | Lifestyle & Everyday (sport) | **Yes** |
| 180621 | gaming | Technology & Internet / Leisure | **Yes** |
| 180628 | broken heart | Psychology & Emotions | No |
| 180705 | surf and turf | Food & Drink | 2nd |
| 180712 | smartphone addiction | Technology & Internet | **Yes** |
| 180719 | technochauvinism | Technology & Internet | No |
| 180726 | not going out | Lifestyle & Everyday | 2nd |
| 180802 | octopus | Environment & Animals | No |
| 180809 | tall people | Health & Fitness | 2nd |
| 180816 | fathers | People & History (family) | 2nd |
| 180823 | cameras | Technology & Internet (hobby) | 2nd |
| 180830 | street food | Food & Drink | **Yes** |
| 180906 | sedentary lifestyle | Health & Fitness | 2nd |
| 180913 | dating apps | Technology & Internet | No |
| 180920 | taking offence | Society & Culture | No |
| 180927 | high-vis fashion | Lifestyle & Everyday (fashion) | No |
| 181004 | Gen Z | Society & Culture | No |
| 181011 | plastic addiction | Environment & Animals | **Yes** |
| 181018 | scumbro (fashion) | Lifestyle & Everyday (fashion) | No |
| 181025 | creativity | Psychology & Emotions | No |
| 181101 | objectification | Society & Culture | No |
| 181108 | loneliness | Psychology & Emotions | No |
| 181115 | hierarchies | Society & Culture | No |
| 181122 | coffee | Food & Drink | 2nd |
| 181129 | photo-friendly food | Food & Drink / Social media | 2nd |
| 181206 | x for kisses | Language & Communication | No |
| 181213 | teenage brain | Psychology & Emotions | No |
| 181220 | buttons | Lifestyle & Everyday | No |
| 181227 | Michelle Obama | People & History | No |
| 190103 | flexitarianism | Food & Drink | 2nd |
| 190110 | schadenfreude | Psychology & Emotions | No |
| 190117 | faster music | Lifestyle & Everyday (music) | 2nd |
| 190124 | happiness | Psychology & Emotions | No |
| 190131 | memory | Psychology & Emotions | No |
| 190207 | high heels | Lifestyle & Everyday (clothes) | 2nd |
| 190214 | dating apps | Technology & Internet | No |
| 190221 | food allergies | Food & Drink / Health | **Yes** |
| 190228 | unicorns (startups) | Work & Money | No |
| 190307 | life admin | Lifestyle & Everyday | 2nd |
| 190314 | debating veganism | Food & Drink | 2nd |
| 190321 | eyes & personality | Psychology & Emotions | No |
| 190328 | side hustles | Work & Money | 2nd |
| 190404 | feeling awkward | Psychology & Emotions | No |
| 190411 | decluttering trend | Lifestyle & Everyday (home) | 2nd |
| 190418 | rabbits (pets) | Environment & Animals | 2nd |
| 190425 | comfy footwear | Lifestyle & Everyday (clothes) | 2nd |

## The ~20 core recommendations (Yes)

Chosen for concrete, everyday content that maps directly to IELTS Speaking Part 1/2:

1. 160818 **food & exercise** — food + health, calories
2. 160825 **domestic chores** — housework (very common IELTS Part 1)
3. 161110 **bicycles** — transport
4. 170105 **driving** — transport
5. 170126 **family history** — family
6. 170316 **lunch** — food / meals
7. 170413 **multiple careers** — work / jobs
8. 170525 **veganism** — food / diet
9. 170907 **uniforms** — clothes / school
10. 170921 **hair** — appearance
11. 170928 **computers** — technology
12. 171005 **adult exercise** — sport / fitness
13. 171026 **sugar** — food / health
14. 171116 **coffee** — drinks / cafés
15. 180315 **learning a language** — study (directly relevant to the learners themselves)
16. 180322 **microadventures** — travel / holidays
17. 180426 **the internet** — technology
18. 180614 **the World Cup** — sport
19. 180621 **gaming** — hobbies / leisure
20. 180830 **street food** — food + travel

Strong reserves (promote if any core is dropped): 161117 trainers, 180712 smartphone
addiction, 181011 plastic addiction, 190221 food allergies, 171123 getting fitter,
190425 comfy footwear.

## Flagged as too abstract / not suitable (sample)

These rely on abstract nouns, academic framing, loanwords, or narrow UK-culture references and
should be avoided for elementary+ Uzbek learners: schadenfreude, technochauvinism,
objectification, romanticism, suffragism, extremophiles, circadian rhythms, bitcoin, unicorns
(startups), rise of the machines, talking to machines, risk, identity, creativity, hierarchies,
gun control, Gen Z, taking offence, mindfulness, self-help, honesty, time, invisibility.
