import { MilikanTrialRow } from "@/labs/milikan/sim/types";

export function trialsToCsv(rows: MilikanTrialRow[]) {
  if (rows.length === 0) {
    return "";
  }
  const headers = Object.keys(rows[0]) as Array<keyof MilikanTrialRow>;
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = headers.map((key) => {
      const value = row[key];
      if (value === null || value === undefined) {
        return "";
      }
      const text = String(value);
      return text.includes(",") ? `"${text.replace(/"/g, '""')}"` : text;
    });
    lines.push(values.join(","));
  }
  return lines.join("\n");
}
