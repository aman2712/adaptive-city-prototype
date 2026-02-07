import { makeId } from "../utils";
import { sources, locations, issues, impact, officialNotes } from "./seeds";

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function generateFeedbackItem() {
  const source = pick(sources);
  const location = pick(locations);
  const issue = pick(issues);
  const impactLine = pick(impact);
  let text = `Reports of ${issue} near ${location}. ${impactLine}.`;
  if (source === "official") {
    text = `${pick(officialNotes)} in ${location}. ${impactLine}.`;
  }
  if (source === "news") {
    text = `Local outlet flagged ${issue} around ${location}; ${impactLine}.`;
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
