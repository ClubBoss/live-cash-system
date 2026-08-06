import type { LocaleCode } from "../../lib/model";
import { applyGeometryLocale as applyBaseLocale } from "./geometry-gold";
import { applyGeometryRuGold } from "./geometry-ru-gold";

export function applyGeometryLocale(locale: LocaleCode) {
  applyBaseLocale(locale);
  if (locale === "ru") applyGeometryRuGold();
}
