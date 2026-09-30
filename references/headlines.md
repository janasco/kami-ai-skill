# Headline & caption copy library

Proven formulas for App Store / Play screenshot copy. The editor's
**Copy ideas** menu serves these patterns; agents should fill the `{slot}`
and adapt to the app's voice. Rules first:

- Headline ≤ **40 chars** (aim 20–32), caption ≤ **90 chars**.
- One idea per slide. Benefit, not feature: "Your money, one tap away" beats
  "Multi-account aggregation engine".
- No punctuation-heavy strings (`?!!`), no ALL CAPS sentences (title case or
  sentence case), no emoji walls — at most one emoji per slide, never in
  kicker + headline together.
- Numbers beat adjectives: "Save 3 hours a week" > "Incredibly fast".
- Google Play adds: no CTAs ("Download now"), no rank/price claims
  ("Best", "#1", "Free", "Sale") — these violate Play policy on listing
  assets. Apple is more lenient on marketing tone but the same rules keep
  one copy deck reusable on both stores.

## The 12 formulas

1. **Outcome** — "{Verb} {object} in {time}." · caption: what used to take
   how long. e.g. "Invoiced in 30 seconds."
2. **Before/After** — "{Old painful way} is over." · caption: the new way in
   six words. e.g. "Screenshot chaos is over."
3. **Question hook** — "Still {painful habit}?" · caption: "There's a
   faster way." (Question marks sparingly — max one per deck.)
4. **Number proof** — "{N}+ {thing} for {audience}." · caption: breadth
   proof. e.g. "200+ templates for indie devs."
5. **Secretly simple** — "Everything. {One word}." · caption: the one word
   expanded. e.g. "Everything. Synced."
6. **Insider** — "The {tool} pros don't share." · caption: credibility line.
7. **Time machine** — "{Verb} yesterday's {thing} today." for capture/backlog
   apps. e.g. "Scan last year's receipts today."
8. **Underdog** — "{Big-player task}, without {big-player pain}." e.g.
   "Pro editing, without the subscription."
9. **Direct benefit** — "{Verb} more, {verb} less." · caption: the trade
   spelled out. e.g. "Create more, type less."
10. **Social-proof** — "Loved by {audience}." · caption: a short real quote
    (only if it exists — never invent testimonials).
11. **Feature spotlight** — "{Feature name}, meet {moment}." · caption: the
    moment described. e.g. "Widgets, meet your lock screen."
12. **Clarity** — "Finally, {category} that makes sense." · caption: the one
    difference.

## Deck pacing

- Screen 1: hook (formula 1/3/12) + hero device. This is the thumbnail most
  users see — headline huge, frame centered.
- Screens 2–3: highest-intent features (4/9/11).
- Screens 4–n: secondary features, alternatives, social proof (2/5/8/10).
- Last screen: soft closer (5/8) — no CTA per Play policy.
- Vary the formula across screens; never repeat a formula twice in one deck.

## Kicker lines (34px token above headline)

"NEW" · "FEATURED" · "{N} STARS" (only with a real rating) · category word ·
app name. Kickers are the first place localization breaks — keep them ≤ 12
chars and swap, don't translate mechanically.

## RTL and CJK notes

- Arabic/Hebrew headlines read right-to-left; keep them as single units,
  avoid mixing Latin words mid-headline (numbers are fine).
- CJK: character budget is roughly halved — a 24-char Latin headline maps to
  ~12 CJK chars; increase headline size token by +8px for CJK-only decks.
- Store per-locale copy in the screen's `locales` map; the fallback locale
  inherits when a translation is missing.
