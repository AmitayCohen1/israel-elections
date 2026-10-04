// Writes the share cards public/og/<lang>.png (1200×630) by screenshotting /<lang>/dev-preview/og in headless Chrome.
// A real browser, because the cards are Hebrew, Arabic and Ge'ez, which next/og cannot lay out right-to-left or shape.
// Needs the dev server running (npm run dev). Run: node scripts/og.mjs [base-url]
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const locales = ["he", "en", "ar", "ru", "am"];

mkdirSync("public/og", { recursive: true });
for (const l of locales) {
  execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1200,630", "--virtual-time-budget=8000", `--screenshot=public/og/${l}.png`, `${base}/${l}/dev-preview/og`], { stdio: "ignore" });
  console.log(`public/og/${l}.png`);
}
