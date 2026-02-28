import { Language } from "@/types";

export const LANGUAGES: Language[] = [
  { code: "ko", name: "한국어", englishName: "Korean" },
  { code: "en", name: "영어", englishName: "English" },
  { code: "te", name: "텔루구어", englishName: "Telugu" },
  { code: "hi", name: "힌디어", englishName: "Hindi" },
  { code: "ja", name: "일본어", englishName: "Japanese" },
  { code: "zh-CN", name: "중국어 간체", englishName: "Chinese Simplified" },
  { code: "kn", name: "칸나다어", englishName: "Kannada" },
  { code: "bn", name: "벵골어", englishName: "Bengali" },
  { code: "ml", name: "말라얄람어", englishName: "Malayalam" },
];

export const LANGUAGE_MAP: Record<string, Language> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l])
);

export const DEFAULT_INPUT_LANG = "ko";
export const DEFAULT_OUTPUT_LANGS = ["en", "te"];
