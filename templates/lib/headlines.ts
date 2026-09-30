// Copy formulas for the editor's Copy ideas menu. Full doc:
// references/headlines.md

export interface HeadlineFormula {
  id: string;
  name: string;
  headline: string; // {slot} placeholders
  caption: string;
  example: string;
}

export const HEADLINE_FORMULAS: HeadlineFormula[] = [
  { id: "outcome", name: "Outcome", headline: "{Verb} {object} in {time}.", caption: "What used to take {old time}.", example: "Invoiced in 30 seconds." },
  { id: "before-after", name: "Before / After", headline: "{Old painful way} is over.", caption: "The new way, in six words.", example: "Screenshot chaos is over." },
  { id: "question", name: "Question hook", headline: "Still {painful habit}?", caption: "There's a faster way.", example: "Still exporting by hand?" },
  { id: "number-proof", name: "Number proof", headline: "{N}+ {thing} for {audience}.", caption: "Breadth, proven.", example: "200+ templates for indie devs." },
  { id: "secretly-simple", name: "Secretly simple", headline: "Everything. {One word}.", caption: "The one word, expanded.", example: "Everything. Synced." },
  { id: "insider", name: "Insider", headline: "The {tool} pros don't share.", caption: "Credibility line.", example: "The export trick pros don't share." },
  { id: "time-machine", name: "Time machine", headline: "{Verb} yesterday's {thing} today.", caption: "For capture / backlog apps.", example: "Scan last year's receipts today." },
  { id: "underdog", name: "Underdog", headline: "{Big task}, without {big pain}.", caption: "The trade, spelled out.", example: "Pro editing, without the subscription." },
  { id: "direct-benefit", name: "Direct benefit", headline: "{Verb} more, {verb} less.", caption: "The trade, spelled out.", example: "Create more, type less." },
  { id: "social-proof", name: "Social proof", headline: "Loved by {audience}.", caption: "A short real quote \u2014 only if it exists.", example: "Loved by 40,000 creators." },
  { id: "feature-spotlight", name: "Feature spotlight", headline: "{Feature}, meet {moment}.", caption: "The moment described.", example: "Widgets, meet your lock screen." },
  { id: "clarity", name: "Clarity", headline: "Finally, {category} that makes sense.", caption: "The one difference.", example: "Finally, notes that make sense." },
];

export const LIMITS = { headline: 40, caption: 90, kicker: 12 } as const;

export interface DeckPacing {
  screen1: string;
  screen23: string;
  screenRest: string;
  last: string;
}

export const DECK_PACING: DeckPacing = {
  screen1: "Hook \u2014 Outcome / Question / Clarity + hero device, headline huge",
  screen23: "Highest-intent features \u2014 Number proof / Direct benefit / Feature spotlight",
  screenRest: "Secondary features, alternatives \u2014 Before-After / Secretly simple / Insider",
  last: "Soft closer \u2014 Underdog / Social proof. No CTA (Play policy).",
};

/** Fill a formula string with values; empty slots are dropped. */
export function fillFormula(template: string, values: Record<string, string>): string {
  return template
    .replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}
