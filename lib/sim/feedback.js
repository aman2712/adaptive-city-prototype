import { makeId } from "../utils";
import { sources, locations, issues, impact, arabicSnippets, officialNotes } from "./seeds";

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function generateFeedbackItem() {
  const source = pick(sources);
  const location = pick(locations);
  const issue = pick(issues);
  const impactLine = pick(impact);
  const includeArabic = Math.random() < 0.12;
  const arabic = includeArabic ? ` ${pick(arabicSnippets)}` : "";

  let text = `Reports of ${issue} near ${location}. ${impactLine}.${arabic}`;
  if (source === "official") {
    text = `${pick(officialNotes)} in ${location}. ${impactLine}.${arabic}`;
  }
  if (source === "news") {
    text = `Local outlet flagged ${issue} around ${location}; ${impactLine}.${arabic}`;
  }

  return {
    id: makeId("fb"),
    text,
    source,
    timestamp: new Date().toISOString(),
    language: "en",
  };
}

export function generateFeedbackBatch(count = 5) {
  return Array.from({ length: count }, () => generateFeedbackItem());
}
